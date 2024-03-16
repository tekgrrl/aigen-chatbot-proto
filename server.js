// Load environment variables
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const authRoutes = require("./routes/authRoutes");
const chatInterface = require("./chatInterface");
const errorHandler = require("./middleware/errorHandler");
const inputSanitization = require("./middleware/inputSanitization");
const MongoClient = require('mongodb').MongoClient;
const { isAuthenticated } = require('./middleware/authMiddleware');

if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET || !process.env.CREDENTIALS) {
  logger.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sanitize all incoming request data
app.use(inputSanitization);

// Setting the templating engine to EJS
app.set("view engine", "ejs");

const uri = process.env.MONGODB_URI;
let dbClient;

(async () => {
  try {
    // Initialize MongoDB Client
    dbClient = new MongoClient(uri, { tlsCertificateKeyFile: process.env.CREDENTIALS });
    await dbClient.connect();
    logger.info("Database connected successfully using MongoClient for sessions");

    // Initialize Mongoose connection
    await mongoose.connect(uri);
    logger.info("Database connected successfully using Mongoose");

  } catch (err) {
    logger.error(`MongoClient connection error: ${err.message}`, err.stack);
    process.exit(1);
  }

  try {
    // Configure session store with connected MongoDB Client
    const sessionStore = MongoStore.create({
      client: dbClient,
      collectionName: 'sessions'
    });

    // Session configuration with connect-mongo
    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict'
      }
    }));
  } catch (err) {
    logger.error(`Session store configuration error: ${err.message}`, err.stack);
    process.exit(1);
  }

  // Make session data available in templates
  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });

  // Serve static files
  app.use(express.static("public"));

  // Authentication routes
  app.use('/auth', authRoutes);

  app.get("/chat", isAuthenticated, (req, res) => {
    res.render("chat");
  });
  
  chatInterface(app);

  // Root path response
  app.get("/", (req, res) => {
    res.render("index");
  });

  // If no routes handled the request, it's a 404
  app.use((req, res, next) => {
    res.status(404).send("Page not found.");
  });

  // Centralized error handling
  app.use(errorHandler);

  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
  });
})();