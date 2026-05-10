import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let role = 'user';
    // Check admin invite code
    if (adminCode && adminCode === process.env.ADMIN_INVITE_CODE) {
      role = 'admin';
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      console.log(`[Auth] ✅ Registered user: ${user.email} (role: ${user.role})`);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      console.warn('[Auth] ❌ Invalid user data on register');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('[Auth] ❌ Register error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      console.log(`[Auth] ✅ Login: ${user.email} (role: ${user.role})`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      console.warn(`[Auth] ❌ Failed login attempt for: ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('[Auth] ❌ Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
