const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateData } = require("./utility/validatiors");
const app = express();
const PORT = 7000;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middleware/auth");

app.use(express.json()); // Parse JSON to Javascript objects
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password, gender, age } = req.body;

  try {
    validateData(req);

    const hashedPass = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPass,
      gender,
      age,
    });

    user.save();
    console.log("Hell yeah");
    res.send(`Signed up successfully, Welcome to Dev Bumble ${firstName}`);
  } catch (error) {
    console.error("Something went wrong", error);
    res.status(500).send("Something went wrong");
  }
});

app.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
      // res.sendStatus(401);
    }
    //Create JWT Token

    const token = await jwt.sign({ _id: user._id }, "DEVBUMBLE@utkarsh", {
      expiresIn: "1d",
    });
    console.log("Token : ", token);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
    }); //cookie expires after 24 hrs
    res.status(201).send("Logged in successfull !");
  } catch (error) {
    console.error("Login Error :  ", error.message);
    res.status(400).send("Error : " + error.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);

    res.send(user);
  } catch (error) {
    console.error("Get Profile Error :  ", error.message);
    res.status(400).send("Error : " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`Server successfully listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database has not been connected");
  });
