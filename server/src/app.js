// Express application assembly. Kept separate from index.js so the app can be
// imported by tests without binding a port.
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const env = require('./config/env');
const apiRoutes = require('./routes');
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');

// CORS with credentials so the browser sends the HTTP-only auth cookie.
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api', apiRoutes);

// Unknown route → 404 in the standard error shape.
app.use((req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
});

app.use(errorHandler);

module.exports = app;
