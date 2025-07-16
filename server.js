const express = require('express');
const path = require('path');
const app = express();

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (css, js, favicon, configs)
app.use(express.static(__dirname));

// Helper: Load links and titles from JSON files
const fs = require('fs');
const links = JSON.parse(fs.readFileSync(path.join(__dirname, 'links.json'), 'utf8'));
const headers = JSON.parse(fs.readFileSync(path.join(__dirname, 'titles.json'), 'utf8'));


// Main route
app.get('/', (req, res) => {
  // SFW and Normy can be passed as query params for demo/testing
  const sfw = req.query.sfw === 'true';
  const normy = req.query.normy === 'true';
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
    normy
  });
});

// Start server
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`BROTON Start running at http://localhost:${PORT}`);
});
