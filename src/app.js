require('dotenv').config()
const express = require("express");
const path = require("path");
require("./db/conn");

// require the jwt
const jwt = require("jsonwebtoken")

// it is used for convert the plain text password into hashing value
const bcrypt = require("bcryptjs");

const app = express();

const port = process.env.PORT || 5000;

const hbs = require("hbs");
const dbModel = require("./model/dbSchema");

// it's very useful when we use postman and get data from body
app.use(express.json());

// but when we take the info from the web page we use this also
app.use(express.urlencoded({ extends: false }));

const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

// for use views without partials
app.set("view engine", "hbs");
// for use views with partials
app.set("views", views_path);
hbs.registerPartials(partials_path);

app.use(express.static(static_path));


console.log(process.env.SECRET_KEY);
app.get("/", (req, res) => {
  res.render("index");
});

// get methode for show login page
app.get("/login", (req, res) => {
  res.render("login");
});

// post methode for store the data in database from login page
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userEmail = await dbModel.findOne({ email: email });

    // +++++++
    // for check user Entered password is matched with stored password in DB for this perticuler email.

    const isMatch = await bcrypt.compare(password, userEmail.password);

    // +++++++++++++++

    // Generating Auth Token bahalf of the user login using userEmail which is the instance of dbModel
    const token = await userEmail.generateToken();
    console.log(token);

    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send(
        "Email And Password Combination Is Not Match Please Write Currect Information"
      );
    }
  } catch (e) {
    res
      .status(400)
      .send(
        "Email And Password Combination Is Not Match Please Write Currect Information"
      );
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const conpassword = req.body.confirmpassword;

    if (password === conpassword) {
      const registerInfo = new dbModel({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        gender: req.body.gender,
        email: req.body.email,
        phone: req.body.phoneNumber,
        password: password,
        confirmpassword: conpassword,
      });


      // here we are generating auth token behalf of the user registeration and we are using instance of dbModel
      // we are defining this generateToken() in dbSchema.js
      const token = await registerInfo.generateToken();
      // console.log(token);


      const result = await registerInfo.save();
      res.status(201).render("index");
    } else {
      res.send("password is not matching");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});



app.listen(port, () => {
  console.log(`server is running on ${port} number`);
});
