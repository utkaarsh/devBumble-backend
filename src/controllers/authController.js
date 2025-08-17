const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { validateData } = require("../utility/validatiors");

const nodemailer = require("nodemailer");

// Configure Nodemailer with SendGrid
const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey", // This is literally the string "apikey"
    pass: process.env.SENDGRID_API_KEY, // Replace with your actual API key
  },
});

module.exports.signUpController = async (req, res) => {
  const {
    firstName,
    lastName,
    emailId,
    password,
    gender,
    age,
    skills,
    experience,
    interests,
    about,
  } = req.body;

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
      skills,
      interests,
      experience,
      about,
    });

    user.save();

    const token = await user.getJwt();

    console.log("Token : ", token);

    // Send Welcome Email
    const mailOptions = {
      from: "utkarshdev29@gmail.com", // Use a verified sender email
      to: emailId,
      subject: "Welcome to Dev Bumble!",
      text: `Hi ${firstName},\n\nThank you for signing up for Dev Bumble! We're excited to have you on board.\n\nBest regards,\nDev Bumble Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
    }); //cookie expires after 24 hrs

    console.log("signup sucess");
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
    // Check if required fields are provided
    if (!emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials (user not found)",
      });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials (wrong password)",
      });
    }

    // Create JWT Token
    const token = await user.getJwt();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 72 * 3600000), // 72 hrs
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      data: user,
    });
  } catch (error) {
    console.error("Login Error: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
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
