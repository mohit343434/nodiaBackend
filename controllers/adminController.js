const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Admin Register (only once for setup)
exports.registerAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.create({ email, password });
    res.json({ message: "Admin created", admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({ "status": true, token: generateToken(admin._id) });
  } else {
    res.status(401).json({ "status": false, message: "Invalid credentials" });
  }
};
