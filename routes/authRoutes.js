const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { isAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Set the directory where the uploaded files will be stored
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer({ storage: storage });

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
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

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      return res.redirect('/auth/profile');
    } else {
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send(error.message);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/auth/login');
  });
});

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error('User not found.');
      return res.status(404).render('error', { message: 'User not found.' });
    }
    res.render('profile', { user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile.');
  }
});

router.post('/updateProfile', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    const { name, pronouns, password } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error('User not found.');
      return res.status(404).send('User not found.');
    }

    const updateData = { name, pronouns };

    if (req.file) {
      updateData.avatar = req.file.path;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await User.findByIdAndUpdate(req.session.userId, updateData, { new: true }).catch(err => {
      console.error('Error updating user profile:', err);
      throw err;
    });

    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).send('Error updating profile.');
  }
});

module.exports = router;