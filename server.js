const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser');
const filters = require('./lib/filters');
const path = require('path');
const posters = require('./src/data/posters');

//network monitoring & rate limiting
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const staticDirectories = [
  path.join('./src/assets/static')
];

//trust 1 proxy
app.set('trust proxy', 1);

// Enable request logging
app.use(morgan('combined'));

// Enable Gzip compression
app.use(compression());

// Apply rate limiting
app.use(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
}));

//load cookie parser
app.use(cookieParser());

// Configure Nunjucks
const env = nunjucks.configure('src', {
  autoescape: true,
  express: app
});
app.set('view engine', 'njk');

// Add custom filters to Nunjucks environment
Object.keys(filters).forEach(filterName => {
  env.addFilter(filterName, filters[filterName]);
});

// Parse URL encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files
staticDirectories.forEach(staticDir => {
  app.use(express.static(staticDir));
});

//routes
posters.forEach(poster => {
  app.get(poster.slug, (req, res) => {
    res.render(`pages/${poster.page}`, {
      title: poster.title,
      description: poster.description
    });
  });
});

//serve the app
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Isles of Scilly Posters is running at: http://localhost:${server.address().port}`);
});