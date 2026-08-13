// utils/generateToken.js
// Creates a signed JWT for a given user id. Sent back on register/login,
// and expected on every protected request as "Authorization: Bearer <token>".

const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = generateToken;
