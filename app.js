const express = require("express");
require("express-async-errors");
const cors = require('cors')
const csrf = require('host-csrf')
const cookieParser = require('cookie-parser')
const auth = require("./middleware/auth");


const app = express();

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());


require("dotenv").config(); // to load the .env file into the process.env object
const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);


const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});


const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(session(sessionParms));

// let csrf_development_mode = true;
// if (app.get("env") === "production") {
//   csrf_development_mode = false;
//   app.set("trust proxy", 1);
// }
// const csrf_options = {
//   protected_operations: ["PATCH","PUT","POST"],
//   protected_content_types: ["application/json"],
//   development_mode: csrf_development_mode,
// };
// app.use(csrf(csrf_options));


// app.use((req, res, next) => {
//   csrf.refresh(req, res);
//   next();
// })

const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("connect-flash")());

app.use(require("./middleware/storeLocals"));
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

const secretWordRouter = require("./routes/secretWord");

app.use("/secretWord",auth, secretWordRouter);

// 

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
      console.log(err);
  res.status(500).send(err.message);

});


const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();