const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

/* ================= TOKEN HELPERS ================= */

function generateAccessToken(user) {

  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

}

function generateRefreshToken(user) {

  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

}

/* ================= REGISTER ================= */

router.post("/register", async (req,res)=>{

  try{

    const { name,email,password } = req.body;

    if(!name || !email || !password)
      return res.status(400).json({
        message:"All fields are required"
      });

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if(existingUser)
      return res.status(400).json({
        message:"User already exists"
      });

    const hashedPassword = await bcrypt.hash(password,10);

    await User.create({

      name,
      email: email.toLowerCase(),
      password: hashedPassword

    });

    res.status(201).json({
      message:"Registration successful"
    });

  }catch{

    res.status(500).json({
      message:"Registration failed"
    });

  }

});

/* ================= LOGIN ================= */

router.post("/login", async (req,res)=>{

  try{

    const { email,password } = req.body;

    if(!email || !password)
      return res.status(400).json({
        message:"Email and password required"
      });

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if(!user)
      return res.status(400).json({
        message:"Invalid credentials"
      });

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if(!isMatch)
      return res.status(400).json({
        message:"Invalid credentials"
      });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({

      accessToken,
      refreshToken,

      user:{
        id:user._id,
        name:user.name,
        role:user.role
      }

    });

  }catch{

    res.status(500).json({
      message:"Login failed"
    });

  }

});

/* ================= REFRESH TOKEN ================= */

router.post("/refresh", async (req,res)=>{

  try{

    const { refreshToken } = req.body;

    if(!refreshToken)
      return res.status(401).json({
        message:"Refresh token required"
      });

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if(!user)
      return res.status(401).json({
        message:"Invalid token"
      });

    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken:newAccessToken
    });

  }catch{

    res.status(401).json({
      message:"Invalid refresh token"
    });

  }

});

module.exports = router;