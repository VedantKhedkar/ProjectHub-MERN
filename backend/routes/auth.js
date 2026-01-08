import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // ✅ Replaced prisma import with Mongoose Model

const router = express.Router();

// --- REGISTER (SIGN UP) ---
router.post('/register', async (req, res) => {
  const { email, password, contact } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // REPLACE: prisma.user.findUnique -> User.findOne
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // REPLACE: prisma.user.create -> User.create
    const newUser = await User.create({
      email: email,
      password: hashedPassword,
      contact: contact,
    });

    res.status(201).json({
      message: 'User registered successfully. Your account is pending admin approval.',
      user: {
        id: newUser._id, // Mongoose uses _id
        email: newUser.email,
        status: newUser.status,
      },
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // REPLACE: prisma.user.findUnique -> User.findOne
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(404).json({ message: 'Invalid credentials.' });
    }

    if (user.status === 'Pending') {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. Please wait.' 
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;