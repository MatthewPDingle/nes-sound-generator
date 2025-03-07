# NES Sound Generator Development Guide

## Commands
- **Run Locally**: `npx vercel dev` - Starts development server at http://localhost:3000
- **Deploy**: `npx vercel` - Deploys app to Vercel
- **Install Dependencies**: `npm install` - Installs required packages

## Code Style Guidelines
- **JavaScript**: ES6+, modular structure with function-based components
- **CSS**: BEM-like naming conventions, used in external stylesheet
- **HTML**: Semantic markup with appropriate ARIA attributes
- **Error Handling**: Use try/catch blocks around API calls and audio operations
- **Indentation**: 4 spaces

## Project Structure
- `index.html`: Main application entry point
- `script.js`: Main JavaScript functionality
- `styles.css`: CSS styling
- `api/generate-sound.js`: Serverless API endpoint for Claude integration
- `.env`: Stores ANTHROPIC_API_KEY (not committed to repo)

## Coding Patterns
- Keep audio context initialization and cleanup consistent
- Abstract repeated audio generation patterns
- Use Web Audio API for all sound synthesis operations
- Maintain state as module-level variables