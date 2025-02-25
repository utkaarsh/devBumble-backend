const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { validateData } = require("../utility/validatiors");

module.exports.signUpController = async (req, res) => {
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

    const token = await user.getJwt();

    console.log("Token : ", token);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
    }); //cookie expires after 24 hrs

    console.log("Hell yeah");
    res.json({
      message: `Signed up successfully, Welcome to Dev Bumble ${firstName}`,
      data: user,
    });
  } catch (error) {
    console.error("Something went wrong", error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.loginController = async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
      // res.sendStatus(401);
    }
    //Create JWT Token

    const token = await user.getJwt();

    console.log("Token : ", token);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
    }); //cookie expires after 24 hrs
    res.status(201).json({ message: "Logged in successfull !", data: user });
  } catch (error) {
    console.error("Login Error :  ", error.message);
    res.status(400).send("Error : " + error.message);
  }
};

module.exports.logoutController = async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    console.log("Logged out successfully");
    res.send("Logged out successfully!!");
  } catch (error) {
    console.error("Logout Error", error.message);
  }
};
