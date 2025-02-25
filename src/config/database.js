const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://utkarshranpise29:Jamespattrick29@cluster0.p5ihgvr.mongodb.net/DevBumble"
  );
};

module.exports = connectDB;
