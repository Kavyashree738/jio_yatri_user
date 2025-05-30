
// controllers/userController.js
const User = require('../models/userModel');

// Create or get existing user based on uid/email/phone
exports.createOrGetUser = async (req, res) => {
  try {
    const { uid, email, phoneNumber, displayName, photoURL, provider } = req.body;

    if (!uid || !provider) {
      return res.status(400).json({ message: 'uid and provider are required' });
    }

    // Try find existing user by uid first
    let user = await User.findOne({ uid });

    // If not found, try find by email (for Google) or phoneNumber (for phone)
    if (!user) {
      if (provider === 'google' && email) {
        user = await User.findOne({ email });
      } else if (provider === 'phone' && phoneNumber) {
        user = await User.findOne({ phoneNumber });
      }
    }

    // If still no user, create new
    if (!user) {
      user = new User({
        uid,
        email: email || null,
        phoneNumber: phoneNumber || null,
        displayName: displayName || '',
        photoURL: photoURL || '',
        provider,
      });
      await user.save();
    } else {
      // Optionally update info (displayName, photoURL) if changed
      let needsUpdate = false;
      if (displayName && user.displayName !== displayName) {
        user.displayName = displayName;
        needsUpdate = true;
    }
      if (photoURL && user.photoURL !== photoURL) {
        user.photoURL = photoURL;
        needsUpdate = true;
      }
      if (needsUpdate) {
    await user.save();
      }
    }

    // Return user info
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in createOrGetUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
