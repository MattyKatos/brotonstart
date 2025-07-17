const express = require('express');
const path = require('path');
const app = express();

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (css, js, favicon, configs)
app.use(express.static(__dirname));

// Helper: Load links, titles, and search engines from JSON files
const fs = require('fs');
const links = JSON.parse(fs.readFileSync(path.join(__dirname, 'links.json'), 'utf8'));
const headers = JSON.parse(fs.readFileSync(path.join(__dirname, 'titles.json'), 'utf8'));
const searchEngines = JSON.parse(fs.readFileSync(path.join(__dirname, 'search_engines.json'), 'utf8'));


// Generate config files for client-side use
// Links config
fs.writeFileSync(
  path.join(__dirname, 'links.config.js'),
  `// This file is generated from links.json by the server\nwindow.BROTON_LINKS = ${JSON.stringify(links, null, 2)};`
);

// Titles config
fs.writeFileSync(
  path.join(__dirname, 'title.config.js'),
  `// This file is generated from titles.json by the server\nwindow.BROTON_HEADERS = ${JSON.stringify(headers, null, 2)};`
);

// Search engines config
fs.writeFileSync(
  path.join(__dirname, 'search_engines.config.js'),
  `// This file is generated from search_engines.json by the server\nwindow.BROTON_SEARCH_ENGINES = ${JSON.stringify(searchEngines, null, 2)};`
);

// Main route
app.get('/', (req, res) => {
  // SFW can be passed as query param for demo/testing
  const sfw = req.query.sfw === 'true';
  let filtered = headers;
  if (sfw) {
    filtered = headers.filter(h => h.sfw);
  }
  const header = filtered.length
    ? filtered[Math.floor(Math.random() * filtered.length)].title
    : 'search.broton';
  res.render('index', {
    header,
    links,
    sfw,
    searchEngines
  });
});

// Start server
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`BROTON Start running at http://localhost:${PORT}`);
});
