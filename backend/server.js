// Express
const express = require("express");
const session = require("express-session");
const cors = require("cors");
// .env File
require("dotenv").config();
// Passport
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local");
const bodyParser = require("body-parser");
// Postgres
const pg = require("pg");
const pgSession = require("connect-pg-simple")(session);

// App initialization
const app = express();
const PORT = process.env.backendPort;
// const allowedIps = ["localhost", "127.0.0.1"];

// Frontend Backend Connection and Body Parser
app.use(express.static("../frontend"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Cors
app.use(cors({
    origin: "http://localhost:9801",
    methods: ["POST","PUT","GET","OPTIONS","HEAD","DELETE"],
    credentials: true
}));

// Database connection
const pgPool = new pg.Pool({
    host: process.env.pgHost,
    port: process.env.pgPort,
    user: process.env.pgUser,
    password: process.env.pgPassword,
    database: process.env.pgDB,
});

// Database Handlers
const {getUserByUUID, getUserByEmail} = require("./api/database/dbHandler");

// Session Setup
app.use(session({
    secret: "R560P",
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
        pool: pgPool,
        tableName: process.env.pgUserSessions
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 // 60 minutes ---- CHANGE!!!!!
    }
}));

// Passport Initilization
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new LocalStrategy({usernameField:"email",passwordField:"password"}, (email, password, done) => {
    getUserByEmail(email).then(user => {
        bcrypt.compare(password, user.password).then(result => {
            if (result) {
                return done(null, user);
            } else {
                return done(null, false, {message: "Incorrect Password"});
            }
        }, err => {
            return done(err);
        });
    }, err => {
        return done(err);
    });
}));

// Password User Handling
passport.serializeUser((user, done) => {
    done(null, {uuid: user.uuid});
});

passport.deserializeUser((user, done) => {
    getUserByUUID(user.uuid).then(response => {
        done(null, user);
    }, err => {
        done(err);
    });
});

// Users
const userRouter = require("./api/users");
app.use("/users", userRouter);

// Notes
const noteRouter = require("./api/notes");
app.use("/notes", noteRouter);

// App Start and Port Listening
app.listen(PORT, () => {
    console.info(`Server listening on port ${PORT}`);
});