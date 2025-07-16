# BROTON Start (EJS Version)

A customizable, mobile-friendly start page with dynamic headers, configurable links, SFW (Safe For Work) and Normy Mode toggles, and Docker support. Now powered by Express and EJS for server-side rendering!

## Features
- Dynamic header (randomized, or fixed in SFW mode)
- Configurable quick links with favicons
- SFW Mode (censors header)
- Normy Mode (switches search engine)
- Per-user toggle persistence (JS/localStorage)
- Responsive, modern UI
- Dockerized for easy deployment
- EJS templating via Express

## Usage
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run locally:**
   ```bash
   npm start
   # Visit http://localhost:6969
   ```
3. **Run with Docker:**
   ```bash
   docker build -t brotonstart .
   docker run -p 6969:6969 brotonstart
   ```

## Project Structure
- `server.js` — Express server
- `views/index.ejs` — Main EJS template
- `main.js`, `links.config.js`, `title.config.js` — Frontend logic/config
- `style.css` — Styles

## Customization
- Edit `links.config.js` for your quick links
- Edit `title.config.js` for header options
- Update EJS template as needed

## License
MIT
