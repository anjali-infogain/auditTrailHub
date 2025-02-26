const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./db');
const { configureAuthentication } = require('./config/auth');
const isAuthenticated = require('./middleware/auth');
const routes = require('./routes');

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure authentication
configureAuthentication(app);

// Routes
app.use('/api', routes);

app.get('/', (req, res) => res.send('Welcome to auditCycleHub!'));
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`Hello, ${req.user.firstName}!`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
