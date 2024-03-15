// Load environment variables
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose'); // Added for Mongoose
const { MongoClient } = require('mongodb');
const authRoutes = require("./routes/authRoutes");

if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET || !process.env.CREDENTIALS) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

const uri = process.env.MONGODB_URI;
let dbClient;

// New MongoDB connection using MongoClient for sessions
async function connectDB() {
  try {
    dbClient = new MongoClient(uri, {
      tlsCAFile: process.env.CREDENTIALS
    });

    await dbClient.connect();
    console.log("Database connected successfully using MongoClient for sessions");

    // Connect to MongoDB using Mongoose
    await mongoose.connect(uri, {
      tlsCAFile: process.env.CREDENTIALS,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully using Mongoose");

    const sessionStore = MongoStore.create({
      mongoUrl: uri,
      collectionName: 'sessions',
      clientPromise: Promise.resolve(dbClient) // Use the existing MongoClient connection
    });

    // Session configuration with connect-mongo using the new MongoClient connection
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // Session cookies now expire after 30 days
      }),
    );
  } catch (err) {
    console.error(`Database connection error: ${err}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// Make session data available in templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Serve static files
app.use(express.static("public"));

// Authentication Routes
app.use(authRoutes);

// Root path response
app.get("/", (req, res) => {
  res.render("index");
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  try {
    await connectDB();
    console.log("Session database connection established after server start");
  } catch (err) {
    console.error("Failed to connect to MongoDB for sessions", err);
    console.error(err.stack);
  }
});