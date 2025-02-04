const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./db");
const auditTrailRoutes = require("./routes/auditCycle");
// const { configureAuthentication, isAuthenticated } = require('./config/auth');

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure authentication
// configureAuthentication(app);

// Routes
app.use("/audit", auditTrailRoutes);

app.get("/", (req, res) => res.send("Welcome to AuditTrailHub!"));
// app.get('/dashboard', isAuthenticated, (req, res) =>
//   res.send(`Hello, ${req.user.displayName}!`)
// );

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
