// controllers/userController.js
const User = require('../models/User');

exports.createOrUpdateUser = async (req, res) => {
  // console.log('📥 Incoming Data:', req.body);

  const { uid, name = '', email = '', phone = '', photo = '' } = req.body;
  if (!uid) return res.status(400).json({ message: 'uid is required' });

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { name, email, phone, photo } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // console.log('✅ DB User after update:', user);
    return res.json({ user });
  } catch (err) {
    // console.error('❌ Update Error:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.getUserByUid = async (req, res) => {
  const { uid } = req.params;
  // console.log('🔍 getUserByUid:', uid);
  try {
    const user = await User.findOne({ uid });
    if (!user) {
      // console.log('⚠️  User not found:', uid);
      return res.status(404).json({ message: 'User not found' });
    }
    // console.log('✅ User found:', uid);
    return res.json(user);
  } catch (err) {
    // console.error('❌ getUserByUid error:', err);
    return res.status(500).json({ message: err.message });
  }
};
