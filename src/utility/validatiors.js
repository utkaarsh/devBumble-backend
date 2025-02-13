const validator = require("validator");

const validateData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Please write full name");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email not valid");
  } else if (!validator.isStrongPassword(password))
    throw new Error("Please enter a strong password");
};

module.exports = { validateData };
