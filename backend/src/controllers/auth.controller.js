import User from '../models/User.js';
import AdminAccess from '../models/AdminAccess.js';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/env.js';
import { grantAdminEmail, isAdminEmail, normalizeEmail, getDefaultAdminEmails } from '../services/adminAccess.service.js';

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const role = await isAdminEmail(email) ? 'admin' : 'user';

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
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.role !== 'admin' && await isAdminEmail(user.email)) {
        user.role = 'admin';
        await user.save();
      }

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

export const getAdminEmails = async (req, res) => {
  try {
    const records = await AdminAccess.find().select('email -_id');
    const emails = [...new Set([
      ...records.map(r => r.email),
      ...getDefaultAdminEmails()
    ])];
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const makeUserAdmin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password, name } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    await grantAdminEmail(email, req.user?._id);

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'admin';
      if (password) user.password = password;
      await user.save();
    } else if (password && name) {
      user = await User.create({ name, email, password, role: 'admin' });
    }

    console.log(`[Auth] ✅ Admin granted: ${email}`);
    res.json({
      message: user
        ? `${email} can now access the admin dashboard.`
        : `${email} will receive admin access after signing up.`,
      user: user ? { _id: user._id, name: user.name, email: user.email, role: user.role } : null
    });
  } catch (error) {
    console.error('[Auth] ❌ Make admin error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const removeUserAdmin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await AdminAccess.findOneAndDelete({ email });
    await User.findOneAndUpdate({ email }, { role: 'user' });

    console.log(`[Auth] ✅ Admin removed: ${email}`);
    res.json({ message: `${email} admin access revoked.` });
  } catch (error) {
    console.error('[Auth] ❌ Remove admin error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
