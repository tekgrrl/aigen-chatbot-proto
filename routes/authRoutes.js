const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // User model will automatically hash the password using bcrypt
    await User.create({ username, password });
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(error.message);
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      return res.redirect('/');
    } else {
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send(error.message);
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err); // gpt_pilot_debugging_log
      return res.status(500).send('Error logging out');
    }
    res.redirect('/auth/login');
  });
});

router.get('/auth/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('profile', { user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile.');
  }
});

router.post('/auth/updateProfile', isAuthenticated, async (req, res) => {
  try {
    const { name, pronouns, avatar, password } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error('User not found.');
      return res.status(404).send('User not found.');
    }

    const updateData = { name, pronouns, avatar };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await User.findByIdAndUpdate(req.session.userId, updateData, { new: true });
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).send('Error updating profile.');
  }
});

module.exports = router;