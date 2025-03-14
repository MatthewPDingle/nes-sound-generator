// api/generate-sound.js
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Advanced function to fix and complete truncated JSON arrays
function fixIncompleteJson(jsonString, isThemeSong) {
  try {
    // Debug the input JSON string
    console.log("Attempting to parse JSON string:");
    console.log(jsonString.substring(0, 200) + "..."); // Log the first 200 chars to avoid huge logs
    
    // First try to parse as-is
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.log("Initial JSON parsing failed:", parseError.message);
    console.log("Attempting to fix incomplete JSON...");
    
    // Create default structures based on type
    const defaultThemeSong = {
      title: "Theme Song",
      tempo: 120,
      timeSignature: "4/4",
      loopCount: 1,
      sections: [{
        name: "main",
        measures: 4,
        tracks: []
      }]
    };
    
    const defaultSoundEffect = {
      segments: [{
        name: "sound",
        duration: 0.5,
        channels: []
      }]
    };
    
    try {
      // Fix common truncation issues
      
      // 1. Fix unclosed array in sequence
      const sequenceRegex = /"sequence"\s*:\s*\[([\s\S]*?)(\s*\}\s*\]|\s*$)/g;
      let fixedJson = jsonString;
      
      // Find all sequence arrays and check if they're properly closed
      let match;
      while ((match = sequenceRegex.exec(jsonString)) !== null) {
        const sequenceContent = match[1];
        const sequenceEnd = match[2];
        
        // Check if sequence array is not properly closed
        if (!sequenceEnd.trim().endsWith(']')) {
          // Find the last complete note object in the sequence
          let bracketCount = 0;
          let lastCompleteNoteEnd = -1;
          
          for (let i = 0; i < sequenceContent.length; i++) {
            if (sequenceContent[i] === '{') bracketCount++;
            if (sequenceContent[i] === '}') {
              bracketCount--;
              if (bracketCount === 0) lastCompleteNoteEnd = i;
            }
          }
          
          // If we found a complete note, close the sequence array
          if (lastCompleteNoteEnd !== -1) {
            const completeSequence = sequenceContent.substring(0, lastCompleteNoteEnd + 1);
            const replacement = `"sequence": [${completeSequence}]`;
            fixedJson = fixedJson.replace(`"sequence": [${sequenceContent}`, replacement);
          }
        }
      }
      
      // 2. Fix unclosed tracks array
      if (fixedJson.includes('"tracks"') && !fixedJson.includes('"tracks": []')) {
        const tracksStart = fixedJson.indexOf('"tracks"');
        
        if (tracksStart > 0) {
          // Find the tracks array opening bracket
          const tracksArrayStart = fixedJson.indexOf('[', tracksStart);
          
          if (tracksArrayStart > 0) {
            // Count brackets to find the end of complete track objects
            let bracketCount = 1; // Start with 1 for the opening bracket
            let lastValidPos = tracksArrayStart;
            
            for (let i = tracksArrayStart + 1; i < fixedJson.length; i++) {
              if (fixedJson[i] === '[') bracketCount++;
              if (fixedJson[i] === ']') bracketCount--;
              
              if (bracketCount === 0) {
                // We found the properly closing bracket
                lastValidPos = i;
                break;
              } else if (bracketCount === 1 && fixedJson[i] === '}') {
                // We found the end of a complete track object at the top level of the tracks array
                lastValidPos = i;
              }
            }
            
            // If the array is unclosed (we never got to bracketCount 0)
            if (bracketCount > 0) {
              // Close the tracks array and then the main object
              fixedJson = fixedJson.substring(0, lastValidPos + 1) + ']}';
            }
          }
        }
      }
      
      // 3. Fix missing closing braces on the main object with balanced bracket check
      let openBraces = 0;
      let closeBraces = 0;
      
      for (let char of fixedJson) {
        if (char === '{') openBraces++;
        if (char === '}') closeBraces++;
      }
      
      // Add missing closing braces
      if (openBraces > closeBraces) {
        console.log(`Found unbalanced braces: ${openBraces} open vs ${closeBraces} close`);
        // Add the exact number of missing closing braces
        fixedJson = fixedJson + '}'.repeat(openBraces - closeBraces);
      }
      
      // Try parsing the fixed JSON
      try {
        const parsedJson = JSON.parse(fixedJson);
        
        // Fill in any missing fields with defaults
        if (isThemeSong) {
          parsedJson.title = parsedJson.title || defaultThemeSong.title;
          parsedJson.tempo = parsedJson.tempo || defaultThemeSong.tempo;
          parsedJson.timeSignature = parsedJson.timeSignature || defaultThemeSong.timeSignature;
          parsedJson.loopCount = parsedJson.loopCount || defaultThemeSong.loopCount;
          parsedJson.tracks = parsedJson.tracks || defaultThemeSong.tracks;
          
          // Ensure each track has all required fields
          parsedJson.tracks.forEach(track => {
            track.name = track.name || 'Untitled Track';
            track.channel = track.channel || 'square1';
            track.sequence = track.sequence || [];
          });
        }
        
        return parsedJson;
      } catch (e) {
        console.error("Error parsing fixed JSON:", e);
      }
      
      // If we still can't parse the whole object, try to extract partial tracks
      if (isThemeSong) {
        // Extract the title if available
        let title = defaultThemeSong.title;
        const titleMatch = fixedJson.match(/"title"\s*:\s*"([^"]+)"/);
        if (titleMatch) title = titleMatch[1];
        
        // Extract the tempo if available
        let tempo = defaultThemeSong.tempo;
        const tempoMatch = fixedJson.match(/"tempo"\s*:\s*(\d+)/);
        if (tempoMatch) tempo = parseInt(tempoMatch[1]);
        
        // Extract the time signature if available
        let timeSignature = defaultThemeSong.timeSignature;
        const tsMatch = fixedJson.match(/"timeSignature"\s*:\s*"([^"]+)"/);
        if (tsMatch) timeSignature = tsMatch[1];
        
        // Extract the loop count if available
        let loopCount = defaultThemeSong.loopCount;
        const loopMatch = fixedJson.match(/"loopCount"\s*:\s*(\d+)/);
        if (loopMatch) loopCount = parseInt(loopMatch[1]);
        
        // Extract tracks
        const tracks = [];
        
        // Look for track objects
        const trackPattern = /"name"\s*:\s*"([^"]+)"\s*,\s*"channel"\s*:\s*"([^"]+)"\s*,\s*"sequence"/g;
        let trackMatch;
        
        while ((trackMatch = trackPattern.exec(fixedJson)) !== null) {
          const trackName = trackMatch[1];
          const trackChannel = trackMatch[2];
          const trackStart = trackMatch.index;
          
          // Find the beginning of this track object
          let trackObjectStart = fixedJson.lastIndexOf('{', trackStart);
          
          if (trackObjectStart >= 0) {
            // Count brackets to find the end of this track object
            let bracketCount = 1;
            let trackObjectEnd = -1;
            
            for (let i = trackObjectStart + 1; i < fixedJson.length; i++) {
              if (fixedJson[i] === '{') bracketCount++;
              if (fixedJson[i] === '}') {
                bracketCount--;
                if (bracketCount === 0) {
                  trackObjectEnd = i;
                  break;
                }
              }
            }
            
            // If we found a complete track object
            if (trackObjectEnd > 0) {
              const trackJson = fixedJson.substring(trackObjectStart, trackObjectEnd + 1);
              
              try {
                // Try to parse this individual track
                const trackObj = JSON.parse(trackJson);
                tracks.push(trackObj);
              } catch (e) {
                // If we can't parse the track, try to at least extract the sequence
                const sequenceStart = trackJson.indexOf('"sequence"');
                if (sequenceStart > 0) {
                  const sequenceArrayStart = trackJson.indexOf('[', sequenceStart);
                  if (sequenceArrayStart > 0) {
                    try {
                      // Try to extract all complete note objects
                      const notes = [];
                      let noteStart = -1;
                      let bracketCount = 0;
                      
                      for (let i = sequenceArrayStart + 1; i < trackJson.length; i++) {
                        if (trackJson[i] === '{' && bracketCount === 0) {
                          noteStart = i;
                          bracketCount = 1;
                        } else if (noteStart >= 0) {
                          if (trackJson[i] === '{') bracketCount++;
                          if (trackJson[i] === '}') {
                            bracketCount--;
                            if (bracketCount === 0) {
                              // We found a complete note object
                              const noteJson = trackJson.substring(noteStart, i + 1);
                              try {
                                const noteObj = JSON.parse(noteJson);
                                notes.push(noteObj);
                              } catch (e) {
                                // Skip invalid note
                              }
                              noteStart = -1;
                            }
                          }
                        }
                      }
                      
                      // If we found any valid notes, create a track object
                      if (notes.length > 0) {
                        tracks.push({
                          name: trackName,
                          channel: trackChannel,
                          sequence: notes
                        });
                      }
                    } catch (e) {
                      // Unable to extract sequence
                    }
                  }
                }
              }
            }
          }
        }
        
        // If we found any tracks, return a theme song object
        if (tracks.length > 0) {
          return {
            title: title,
            tempo: tempo,
            timeSignature: timeSignature,
            loopCount: loopCount,
            tracks: tracks
          };
        }
      }
      
      // If all else fails, return the default structure
      console.log("Could not extract valid JSON structure, returning default");
      return isThemeSong ? defaultThemeSong : defaultSoundEffect;
    } catch (err) {
      console.log("Fix attempt failed, returning default structure:", err);
      return isThemeSong ? defaultThemeSong : defaultSoundEffect;
    }
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description, mode, model } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Use Claude 3.7 Sonnet (non-extended thinking) as default
    const useModel = model || 'claude-3-7-sonnet-20250219';
    const useExtendedThinking = useModel.endsWith('-et');
    const actualModel = useExtendedThinking ? 
      useModel.replace('-et', '') : 
      useModel;

    // Determine if this is a theme song or sound effect request
    const isThemeSong = mode === 'theme';

    console.log(`Processing ${isThemeSong ? 'theme song' : 'sound effect'} request for "${description}" using model: ${actualModel}, extended thinking: ${useExtendedThinking}`);

    // Base system prompt for sound effects
    let systemPrompt = `You are an expert in NES sound design and 8-bit audio synthesis. Your task is to generate parameters for NES-style sound effects based on text descriptions.

The NES audio processing unit (APU) has the following channels:
1. Square Wave 1 & 2: Pulse waves with duty cycle options (12.5%, 25%, 50%, 75%)
2. Triangle Wave: Fixed triangle waveform primarily used for bass
3. Noise Channel: Pseudo-random noise generator with "regular" and "metallic" modes

For each sound effect, you will analyze the description and generate appropriate parameters that would create the described sound using the Web Audio API in an NES-like fashion.

For complex sound effects with multiple parts, you should use the segments structure to create sequential sound components that play one after another.

Your output must be valid JSON in the following structure:
{
  "segments": [
    {
      "name": "segment_name", // Optional name for this segment of the sound
      "duration": 0.5, // Overall duration of this segment in seconds
      "channels": [
        {
          "type": "square1", // One of: square1, square2, triangle, noise
          "frequency": 440, // Base frequency in Hz
          "duty": 0.5, // For square waves: 0.125, 0.25, 0.5, or 0.75
          "volume": 0.7, // 0.0 to 1.0
          "attack": 0.01, // Attack time in seconds
          "decay": 0.1, // Decay time in seconds
          "sustain": 0.5, // Sustain level (0.0 to 1.0)
          "release": 0.1, // Release time in seconds
          "sweep": { // Optional frequency sweep
            "endFrequency": 880,
            "duration": 0.3
          },
          "metallic": false // Only for noise channel, true/false
        }
        // Add more channels as needed for this segment
      ]
    }
    // Add more segments for sequential sound parts
  ]
}`;

    // Extended system prompt for theme songs with JSON formatting instructions
    if (isThemeSong) {
      systemPrompt = `You are an expert in NES music composition, chiptune music, and 8-bit audio synthesis. Your task is to compose rich, detailed theme songs in authentic NES style based on text descriptions.

The NES audio processing unit (APU) has the following channels:
1. Square Wave 1 & 2: Pulse waves with duty cycle options (12.5%, 25%, 50%, 75%)
   - Used for melody, countermelody, and harmony
   - Duty cycles: 12.5% (thin/tinny), 25% (balanced), 50% (full/square), 75% (hollow)
2. Triangle Wave: Fixed triangle waveform 
   - Used primarily for bass lines and sometimes melodies
   - Always plays at full volume (no volume envelope)
3. Noise Channel: Pseudo-random noise generator with "regular" and "metallic" modes
   - Used for percussion and sound effects
   - Can create drum-like and rhythmic elements

For complex songs with multiple parts (intro, verse, chorus, etc.), use the sections array to create distinct musical sections that will play in sequence.

Your output must be in valid JSON format with no text before or after, following this exact structure:
{
  "title": "Example Theme",
  "tempo": 120, 
  "timeSignature": "4/4",
  "loopCount": 1,
  "sections": [
    {
      "name": "intro",
      "measures": 4,
      "tracks": [
        {
          "name": "Melody",
          "channel": "square1",
          "sequence": [
            {
              "note": "C4",
              "duration": 0.25,
              "duty": 0.5,
              "volume": 0.8,
              "attack": 0.01,
              "decay": 0.1,
              "sustain": 0.7,
              "release": 0.05
            }
          ]
        }
      ]
    },
    {
      "name": "verse",
      "measures": 8,
      "tracks": [
        {
          "name": "Melody",
          "channel": "square1",
          "sequence": [
            {
              "note": "E4",
              "duration": 0.25,
              "duty": 0.5,
              "volume": 0.8,
              "attack": 0.01,
              "decay": 0.1,
              "sustain": 0.7,
              "release": 0.05
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT FORMATTING INSTRUCTIONS:
1. Only include the JSON in your response
2. Ensure all JSON arrays and objects are properly closed
3. Structure each musical pattern as a complete unit
4. Strive for musical authenticity with the NES sound capabilities
5. Create a complete, loopable theme that expresses the requested description`;
    }

    // Call Claude
    let messageOptions = {
      model: actualModel,
      max_tokens: 128000, // Increased to maximum supported by Claude 3.7
      system: systemPrompt,
    };
    
    // Add beta header for extended output capability
    const extraHeaders = {
      "anthropic-beta": "output-128k-2025-02-19" // Enable 128K output tokens
    };
    
    // Configure message content based on request type
    if (isThemeSong) {
      // For theme songs, use simplified JSON format to improve reliability
      messageOptions.messages = [
        {
          role: 'user',
          content: `Compose a comprehensive NES-style theme song for: "${description}". 

IMPORTANT: Output ONLY the complete JSON data structure with NO introduction, explanation, or markdown code blocks.

Create a song with an intro section and at least one other section (verse, chorus, etc.) that play in sequence.

The JSON structure should be exactly:
{
  "title": "${description}",
  "tempo": 120,
  "timeSignature": "4/4",
  "loopCount": 1,
  "sections": [
    {
      "name": "intro",
      "measures": 4,
      "tracks": [
        {
          "name": "Melody",
          "channel": "square1",
          "sequence": [
            {
              "note": "C4",
              "duration": 0.25,
              "duty": 0.5,
              "volume": 0.8,
              "attack": 0.01,
              "decay": 0.1,
              "sustain": 0.7,
              "release": 0.05
            },
            {
              "note": "D4",
              "duration": 0.25,
              "duty": 0.5,
              "volume": 0.8,
              "attack": 0.01,
              "decay": 0.1,
              "sustain": 0.7,
              "release": 0.05
            }
          ]
        }
      ]
    },
    {
      "name": "verse",
      "measures": 8,
      "tracks": [
        {
          "name": "Melody", 
          "channel": "square1",
          "sequence": [
            {
              "note": "E4",
              "duration": 0.25,
              "duty": 0.5,
              "volume": 0.8,
              "attack": 0.01,
              "decay": 0.1,
              "sustain": 0.7,
              "release": 0.05
            }
          ]
        }
      ]
    }
  ]
}

CRITICAL: 
1. Your output MUST be ONLY the JSON, nothing else
2. Ensure all arrays and objects are properly closed 
3. Do not use markdown formatting or code blocks
4. Verify all sections have at least one track, and all tracks have a sequence array`
        }
      ];
    } else {
      // For sound effects, use enhanced approach with examples of multi-part effects
      messageOptions.messages = [
        {
          role: 'user',
          content: `Create NES sound effect parameters for: "${description}"
          
For complex sound effects that have multiple distinct parts that should play in sequence (like "thunder clap followed by rolling thunder"), generate multiple segments that will play one after another.

Example of a multi-part effect with segments:
{
  "segments": [
    {
      "name": "initial_impact",
      "duration": 0.3,
      "channels": [
        {
          "type": "noise",
          "frequency": 800,
          "volume": 0.9,
          "attack": 0.01,
          "decay": 0.05,
          "sustain": 0.2,
          "release": 0.05,
          "duration": 0.3,
          "metallic": false
        },
        {
          "type": "square1",
          "frequency": 120,
          "volume": 0.8,
          "duty": 0.5,
          "attack": 0.01,
          "decay": 0.05,
          "sustain": 0.0,
          "release": 0.05,
          "duration": 0.15
        }
      ]
    },
    {
      "name": "aftermath",
      "duration": 1.0,
      "channels": [
        {
          "type": "noise",
          "frequency": 200,
          "volume": 0.4,
          "attack": 0.05,
          "decay": 0.3,
          "sustain": 0.3,
          "release": 0.5,
          "duration": 1.0,
          "metallic": false
        }
      ]
    }
  ]
}`
        }
      ];
    }
    
    // Add extended thinking if selected
    if (useExtendedThinking) {
      messageOptions.thinking = {
        type: 'enabled',
        budget_tokens: 32000 // Increased thinking budget to 32K
      };
    }
    
    const message = await anthropic.messages.create(messageOptions, {
      headers: extraHeaders
    });
    
    // Extract thinking and parameters
    let thinking = '';
    let responseData = isThemeSong ? { 
      title: 'Default Theme Song', 
      tempo: 120, 
      timeSignature: "4/4",
      loopCount: 1,
      sections: [{
        name: "main",
        measures: 4,
        tracks: []
      }]
    } : { 
      segments: [{
        name: "sound",
        duration: 0.5,
        channels: []
      }]
    };
    
    for (const block of message.content) {
      if (block.type === 'thinking') {
        thinking = block.thinking;
      } else if (block.type === 'text') {
        try {
          // Extract JSON from the text response
          const text = block.text;
          console.log("Raw text response length:", text.length);
          console.log("Response starts with:", text.substring(0, 100));
          console.log("Response ends with:", text.substring(text.length - 100));
          
          // Try to clean up any markdown formatting that might be present
          let cleanedText = text.trim();
          
          // Remove markdown code blocks if present
          cleanedText = cleanedText.replace(/```json\n|\n```|```/g, '');
          
          // Find the first opening brace (start of JSON)
          const firstBrace = cleanedText.indexOf('{');
          if (firstBrace >= 0) {
            cleanedText = cleanedText.substring(firstBrace);
            
            // Find the last closing brace (end of JSON)
            const lastBrace = cleanedText.lastIndexOf('}');
            if (lastBrace >= 0) {
              cleanedText = cleanedText.substring(0, lastBrace + 1);
            }
          }
          
          console.log("Cleaned JSON text length:", cleanedText.length);
          
          // For theme songs, try to parse the entire response as JSON first
          if (isThemeSong) {
            try {
              responseData = JSON.parse(cleanedText);
              console.log("Successfully parsed theme song JSON");
              
              // Validate the structure
              if (!responseData.sections && responseData.tracks) {
                console.log("Converting legacy format to sections format");
                // Convert legacy format to sections format
                responseData = {
                  title: responseData.title || "Theme Song",
                  tempo: responseData.tempo || 120,
                  timeSignature: responseData.timeSignature || "4/4",
                  loopCount: responseData.loopCount || 1,
                  sections: [{
                    name: "main",
                    measures: 16,
                    tracks: responseData.tracks
                  }]
                };
              }
              
              continue; // If successful, skip the rest of the extraction logic
            } catch (err) {
              console.log("Full response JSON parsing failed:", err.message);
              console.log("Trying to extract JSON with regex...");
            }
          }
          
          // Fall back to regex extraction if direct parsing fails
          // First, try to match markdown code blocks
          let jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
          
          // If no markdown code block, try to find a complete JSON object with balance check
          if (!jsonMatch) {
            // Try to find a pair of balanced braces that contains a complete JSON object
            let bracketCount = 0;
            let startPos = -1;
            let endPos = -1;
            
            // Find the first opening brace
            startPos = text.indexOf('{');
            
            if (startPos >= 0) {
              bracketCount = 1;
              for (let i = startPos + 1; i < text.length; i++) {
                if (text[i] === '{') bracketCount++;
                if (text[i] === '}') bracketCount--;
                
                if (bracketCount === 0) {
                  endPos = i;
                  break;
                }
              }
              
              // If we found a complete JSON object
              if (endPos > startPos) {
                jsonMatch = [text.substring(startPos, endPos + 1)];
                console.log("Found complete JSON object with balanced braces");
              }
            }
          }
          
          if (jsonMatch) {
            const jsonString = jsonMatch[0].replace(/```json\n|```/g, '');
            console.log("Extracted JSON with regex, length:", jsonString.length);
            // Use the error handling helper to parse the JSON safely
            responseData = fixIncompleteJson(jsonString, isThemeSong);
          } else {
            console.log("No valid JSON pattern found in the response");
            // This is likely a completely invalid response, return default structure
            responseData = isThemeSong ? { 
              title: "Claude is still learning how to return properly formatted JSON and occasionally makes mistakes. Please try again.",
              tempo: 120,
              timeSignature: "4/4",
              loopCount: 1,
              sections: [{
                name: "error",
                measures: 1,
                tracks: []
              }]
            } : { 
              segments: [{
                name: "Claude is still learning how to return properly formatted JSON. Please try again.",
                duration: 0.5,
                channels: []
              }]
            };
          }
        } catch (err) {
          console.error('Error extracting JSON from response:', err);
        }
      }
    }

    // Process response data for the updated formats
    let processedParameters;
    
    if (isThemeSong) {
      // Handle theme song data
      if (responseData.sections) {
        // New multi-section format
        processedParameters = responseData;
      } else if (responseData.tracks) {
        // Convert legacy format to sections format with a single section
        processedParameters = {
          title: responseData.title || "Theme Song",
          tempo: responseData.tempo || 120,
          timeSignature: responseData.timeSignature || "4/4",
          loopCount: responseData.loopCount || 1,
          sections: [{
            name: "main",
            measures: 16,
            tracks: responseData.tracks
          }]
        };
      } else {
        // Empty default 
        processedParameters = {
          title: "Theme Song",
          tempo: 120,
          timeSignature: "4/4",
          loopCount: 1,
          sections: []
        };
      }
    } else {
      // Handle sound effect data
      if (responseData.segments) {
        processedParameters = responseData.segments;
      } else if (responseData.channels) {
        // Convert legacy format to segments format with a single segment
        processedParameters = [{
          name: "sound",
          duration: Math.max(...(responseData.channels.map(c => c.duration || 0.5))),
          channels: responseData.channels
        }];
      } else {
        processedParameters = [];
      }
    }
    
    return res.status(200).json({
      thinking,
      isThemeSong,
      parameters: processedParameters
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + error.message
    });
  }
};