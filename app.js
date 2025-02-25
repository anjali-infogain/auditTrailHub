const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./db");
const auditTrailRoutes = require("./routes/auditCycle");
const artifactRoutes = require("./routes/artifacts");
const { configureAuthentication } = require("./config/auth");
const isAuthenticated = require("./middleware/auth");

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure authentication
configureAuthentication(app);

// Routes
app.use("/audit", auditTrailRoutes);
app.use("/artifacts", artifactRoutes);

app.get("/", (req, res) => res.send("Welcome to AuditTrailHub!"));
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send(`Hello, ${req.user.firstName}!`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
