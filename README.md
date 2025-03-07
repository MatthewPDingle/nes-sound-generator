# NES Sound Generator with Claude 3.7

Since Sonnet 3.7 Extended Thinking did such a remarkable job on the initial comparison with other models, I fleshed it out into this. 

NES Sound Generator creates authentic 8-bit NES-style sound effects and music using Claude 3.7 Sonnet. This web app generates sound parameters for the Nintendo Entertainment System's audio processing unit (APU) and plays them back in your browser.

## Features

- **Sound Effects**: Generate authentic NES-style sound effects from text descriptions
- **Multi-segment Sound Effects**: Create complex sequential sounds with multiple parts that play in sequence
- **Theme Songs**: Compose short chiptune music tracks with multiple channels
- **Audio Visualization**: See real-time visualization of audio channels during playback
- **Save & Download**: Save your creations and download them as WAV files
- **AI-Powered**: Claude 3.7 Sonnet creates audio parameters that accurately mimic the NES sound capabilities

## Screenshot
![screenshot.png](screenshot.png)

## Requirements

- Node.js 18.x or later
- An Anthropic API key (Claude 3.7 access)
- Vercel account (for deployment) or can be run locally

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/MatthewPDingle/nes-sound-generator.git
cd nes-sound-generator
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up your API key**

Rename `.env.template` to `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=<paste your Anthropic API Key here>
```

You can get an API key from the [Anthropic Console](https://console.anthropic.com/).

4. **Run locally**

Using Vercel CLI:
```bash
npx vercel dev
```

The app should now be running at http://localhost:3000

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

This will deploy your app to a Vercel URL and set up the necessary serverless functions.

## How to Use

### Sound Effects

1. Select the "Sound Effects" tab
2. Enter a description of the sound you want (e.g., "spaceship landing", "treasure chest opening")
3. For complex sequential effects, describe the sequence (e.g., "thunder clap followed by rolling thunder") 
4. Click "Generate"
5. The sound will automatically play and be saved to your history
6. Use the "Show" toggle to view the generated parameters
7. Replay sounds from history or download them as WAV files

#### Multi-segment Sound Effects

The system now supports complex sound effects with multiple sequential parts. Try descriptions like:

- "multifaceted powerup with 3 notes: mid, low, and then high" ([listen to example](powerup.wav))
- "bells ringing three times" ([listen to example](bells.wav)) 
- "three quiet fading thumping footsteps down stone stairs" ([listen to example](footsteps.wav))
- "thunder clap followed by rolling thunder"
- "spaceship starting up, hovering, then blasting off"

Multi-segment effects are played in sequence, with each segment starting after the previous one finishes.

### Theme Songs

1. Select the "Theme Songs" tab
2. Enter a description of the music you want (e.g., "heroic adventure theme", "underwater level")
3. Click "Compose"
4. The theme will automatically play and be saved to your history
5. Use the "Show" toggle to view the generated musical score
6. Play/download theme songs from the history section

## Technical Details

This project uses:

- **Web Audio API**: For sound synthesis and playback
- **Claude 3.7**: To generate parameters for NES-style audio
- **Vercel**: For serverless API endpoints and hosting

The app simulates the NES Audio Processing Unit's four channels:

1. **Square Wave 1 & 2**: For melodies, harmonies, and effects
2. **Triangle Wave**: For bass lines and deeper tones
3. **Noise Channel**: For percussion and textured effects

### JSON Structure

Sound effects now use a segments-based structure:

```json
{
  "segments": [
    {
      "name": "first_part",
      "duration": 0.5,
      "channels": [
        { "type": "square1", ... },
        { "type": "noise", ... }
      ]
    },
    {
      "name": "second_part",
      "duration": 0.8,
      "channels": [
        { "type": "square2", ... },
        { "type": "triangle", ... }
      ]
    }
  ]
}
```

Each segment plays sequentially, with its channels played simultaneously.

## File Structure

```
nes-sound-generator/
├── index.html            # Main web interface
├── package.json          # Project dependencies
├── vercel.json           # Vercel configuration
├── .env                  # API keys (create this from .env.template)
├── .env.template         # Template for API configuration
└── api/
    └── generate-sound.js # Serverless API endpoint
```

## Models

The application offers two models:
- **Claude 3.7 Sonnet**: Default model, faster and cheaper generation
- **Claude 3.7 Sonnet with Extended Thinking**: Slower and more expensive, possibly better results

## Limitations

- Sound generation is limited by the browser's Web Audio API capabilities
- Theme songs use a simplified representation of NES music capabilities
- Generation may take 5-60 seconds depending on complexity and the selected model
- The best sound effects seem to be common ones. An uncommon sound effect like "a duck quacking" often doesn't produce results that sound much like the description.
- Theme songs aren't setup to loop

## Recent Updates

### Multi-segment Sound Effects (March 2025)
- Added support for complex sequential sound effects with multiple segments
- Each segment plays after the previous one finishes
- Improved Claude prompting to encourage multi-part sound design
- Updated playback and rendering systems to handle sequential segments
- Added compatibility layer for legacy single-segment sounds

## Methodology

Vibe coding with Claude 3.7 Sonnet Exteneded Thinking

## License

MIT

---

Have fun creating authentic NES sounds and music! Feedback and contributions welcome.