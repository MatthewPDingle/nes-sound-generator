# NES Sound Generator Development Guide

## Commands
- **Run Locally**: `npx vercel dev` - Starts development server at http://localhost:3000
- **Deploy**: `npx vercel` - Deploys app to Vercel
- **Install Dependencies**: `npm install` - Installs required packages
- **Lint**: `npx eslint .` - Checks JavaScript code for errors and style issues
- **Test API**: `curl -X POST http://localhost:3000/api/generate-sound -H "Content-Type: application/json" -d '{"description":"test sound","mode":"effect"}'` - Test API endpoint locally

## Code Style Guidelines
- **JavaScript**: ES6+, functional approach with module-level state variables
- **CSS**: BEM-like naming conventions in external stylesheet
- **HTML**: Semantic markup with appropriate ARIA attributes
- **Error Handling**: Try/catch blocks around API calls and audio operations
- **Indentation**: 4 spaces
- **Naming**: camelCase for variables/functions, descriptive names prefixed by purpose
- **Comments**: JSDoc for functions, inline comments for complex logic
- **Audio Patterns**: Initialize/cleanup audio context consistently, abstract generation patterns
- **Format**: No trailing commas, single quotes preferred, semicolons required

## Project Structure
- `index.html`: Main application entry point with UI components
- `script.js`: Core Web Audio API implementation for sound synthesis
- `styles.css`: BEM-based styling
- `api/generate-sound.js`: Serverless API endpoint for Claude integration
- `.env`: Stores ANTHROPIC_API_KEY (not committed to repo)
- Sample audio files (`.wav`): Example sounds for reference

## Architecture
- **Audio Generation**: Uses Web Audio API with NES-like synthesis techniques
- **UI Components**: Tab-based interface for sound effects and theme songs
- **Data Format**: Structured JSON for sound/music parameters with multi-section support
- **Backend Integration**: Claude 3.7 API for generating sound parameters
- **Error Recovery**: Graceful handling of malformed AI responses with fallbacks