// // controllers/userController.js
// const User = require('../models/User');

// exports.createOrUpdateUser = async (req, res) => {
//   // console.log('📥 Incoming Data:', req.body);

//   const { uid, name = '', email = '', phone = '', photo = '' } = req.body;
//   if (!uid) return res.status(400).json({ message: 'uid is required' });

//   try {
//     const user = await User.findOneAndUpdate(
//       { uid },
//       { $set: { name, email, phone, photo } },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     // console.log('✅ DB User after update:', user);
//     return res.json({ user });
//   } catch (err) {
//     // console.error('❌ Update Error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };


// exports.getUserByUid = async (req, res) => {
//   const { uid } = req.params;
//   // console.log('🔍 getUserByUid:', uid);
//   try {
//     const user = await User.findOne({ uid });
//     if (!user) {
//       // console.log('⚠️  User not found:', uid);
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // console.log('✅ User found:', uid);
//     return res.json(user);
//   } catch (err) {
//     // console.error('❌ getUserByUid error:', err);
//     return res.status(500).json({ message: err.message });
//   }
// };

const User = require('../models/User');
const mongoose = require('mongoose');

exports.createOrUpdateUser = async (req, res) => {
  console.log('\n=== STARTING createOrUpdateUser ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  const { uid, name = '', email = '', phone = '', photo = '', referralCodeEntered = null } = req.body;

  if (!uid) {
    console.log('❌ Error: uid is required');
    return res.status(400).json({ message: 'uid is required' });
  }

  console.log(`Processing user with uid: ${uid}`);

  try {
    console.log('Starting MongoDB session...');
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log('Transaction started');

    try {
      // Validate referral code if provided
      let referrer = null;
      if (referralCodeEntered) {
        console.log(`Checking referral code: ${referralCodeEntered}`);
        referrer = await User.findOne({ referralCode: referralCodeEntered }).session(session);

        if (!referrer) {
          console.log('❌ Invalid referral code');
          await session.abortTransaction();
          return res.status(400).json({ message: 'Invalid referral code' });
        }

        // Check if user is trying to use their own code
        if (referrer.uid === uid) {
          console.log('❌ Cannot use own referral code');
          await session.abortTransaction();
          return res.status(400).json({ message: 'Cannot use your own referral code' });
        }

        console.log(`Referral code valid. Referrer: ${referrer.uid}`);
      }

      // Find existing user (do NOT update)
      console.log(`Looking for existing user with uid: ${uid}`);
      const user = await User.findOne({ uid }).session(session);

      if (!user) {
        console.log('No existing user found - creating new user');
        const newUser = new User({
          uid,
          name,
          email,
          phone,
          photo,
          referredBy: referrer ? referralCodeEntered : null,
          referralCode: generateReferralCode()
        });

        console.log('New user object before save:', JSON.stringify(newUser, null, 2));
        await newUser.save({ session });
        console.log('New user created successfully');

        // Add reward to referrer if applicable
        if (referralCodeEntered && referrer) {
          console.log('Adding referral reward to referrer');
          referrer.referralRewards.push({
            amount: 30,
            description: `New user referral: ${name || email || phone}`,
            referredUserId: uid
          });
          await referrer.save({ session });
          console.log('Referral reward added successfully');
        }

        await session.commitTransaction();
        console.log('Transaction committed successfully');
        return res.json({ user: newUser });
      } else {
        console.log('Existing user found:', JSON.stringify(user, null, 2));

        // Prepare updates (only non-empty fields)
        const updates = {};
        if (name && name !== user.name) updates.name = name;
        if (email && email !== user.email) updates.email = email;
        if (phone && phone !== user.phone) updates.phone = phone;  // This will save the phone number
        if (photo && photo !== user.photo) updates.photo = photo;

        if (Object.keys(updates).length > 0) {
          console.log('Updating user with:', updates);
          await User.updateOne(
            { uid },
            { $set: updates },
            { session }
          );
          Object.assign(user, updates); // Update local object
          console.log('User updated successfully');
        }

        await session.commitTransaction();
        console.log('Transaction committed successfully');
        return res.json({ user });
      }
    } catch (err) {
      console.error('❌ Error during transaction:', err);
      await session.abortTransaction();
      console.log('Transaction aborted');
      throw err;
    } finally {
      session.endSession();
      console.log('Session ended');
    }
  } catch (err) {
    console.error('❌ Main catch error:', err);

    if (err.code === 11000) {
      console.log('Duplicate key error detected');
      console.log('Error details:', err);

      try {
        console.log('Attempting retry...');
        const user = await User.findOne({ uid });
        console.log('Retry successful, user found:', user ? user.uid : 'none');
        return res.json({ user });
      } catch (retryErr) {
        console.error('❌ Retry failed:', retryErr);
        return res.status(500).json({ message: retryErr.message });
      }
    }

    console.error('Final error being returned:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

function generateReferralCode() {
  // Always starts with MG followed by 6 random digits
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 6-digit random number
  return `MG${randomPart}`;
}
exports.getUserByUid = async (req, res) => {
  console.log('\n=== STARTING getUserByUid ===');
  const { uid } = req.params;
  console.log(`Requested user uid: ${uid}`);

  try {
    console.log('Searching for user in database...');
    const user = await User.findOne({ uid });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // console.log('User found:', JSON.stringify(user, null, 2));

    // Ensure referral code exists (backward compatibility)
    // Ensure referral code exists (backward compatibility)
    if (!user.referralCode) {
      console.log('No referral code found - generating one');
      user.referralCode = generateReferralCode(); // Use the new function
      await user.save();
      console.log(`Generated referral code: ${user.referralCode}`);
    }

    console.log('Returning user data');
    return res.json(user);
  } catch (err) {
    console.error('❌ Error in getUserByUid:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getReferralCode = async (req, res) => {
  console.log('\n=== STARTING getReferralCode ===');
  const { uid } = req.params;
  console.log(`Requested referral code for uid: ${uid}`);

  try {
    console.log('Searching for user...');
    const user = await User.findOne({ uid });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.uid);

    if (!user.referralCode) {
      console.log('No referral code exists - generating one');
      user.referralCode = generateReferralCode(); // Use the new function
      await user.save();
      console.log(`Generated code: ${user.referralCode}`);
    }

    const shareLink = `https://yourapp.com?ref=${user.referralCode}`;
    console.log(`Returning code: ${user.referralCode} and link: ${shareLink}`);

    return res.json({
      referralCode: user.referralCode,
      shareLink
    });
  } catch (err) {
    console.error('❌ Error in getReferralCode:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getReferralStats = async (req, res) => {
  console.log('\n=== STARTING getReferralStats ===');
  const { uid } = req.params;
  console.log(`Requested referral stats for uid: ${uid}`);

  try {
    console.log('Searching for user...');
    const user = await User.findOne({ uid });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Finding users referred by ${user.referralCode}`);
    const referredUsers = await User.find({ referredBy: user.referralCode });

    const totalEarnings = user.referralRewards.reduce((sum, reward) => sum + reward.amount, 0);
    console.log(`Total earnings: ${totalEarnings}`);
    console.log(`Total referrals: ${referredUsers.length}`);

    return res.json({
      referralCode: user.referralCode,
      totalReferrals: referredUsers.length,
      totalEarnings,
      rewards: user.referralRewards,
      referredUsers: referredUsers.map(u => ({
        uid: u.uid,
        name: u.name,
        joinedAt: u.createdAt
      }))
    });
  } catch (err) {
    console.error('❌ Error in getReferralStats:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getReferralLeaderboard = async (req, res) => {
  console.log('\n=== STARTING getReferralLeaderboard ===');
  console.log('Building leaderboard...');

  try {
    const topReferrers = await User.aggregate([
      { $match: { referralRewards: { $exists: true, $not: { $size: 0 } } } },
      { $addFields: { totalRewards: { $sum: "$referralRewards.amount" } } },
      { $sort: { totalRewards: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          referralCode: 1,
          totalRewards: 1,
          referralsCount: { $size: "$referralRewards" }
        }
      }
    ]);

    console.log('Leaderboard results:', JSON.stringify(topReferrers, null, 2));
    return res.json(topReferrers);
  } catch (err) {
    console.error('❌ Error in getReferralLeaderboard:', err);
    return res.status(500).json({ message: err.message });
  }
};


exports.applyReferral = async (req, res) => {
  try {
    console.log("=== APPLY REFERRAL START ===");

    const { referralCode } = req.body;
    const { uid } = req.user; // From auth middleware
    console.log("Received referral code:", referralCode);
    console.log("Current user UID:", uid);

    if (!referralCode) {
      console.log("❌ No referral code provided");
      return res.status(400).json({ message: 'Referral code is required' });
    }

    const session = await mongoose.startSession();
    console.log("✅ MongoDB session started");

    session.startTransaction();
    console.log("✅ Transaction started");

    try {
      // Find referrer
      console.log("🔍 Looking for referrer with code:", referralCode);
      const referrer = await User.findOne({ referralCode }).session(session);

      if (!referrer) {
        console.log("❌ Referrer not found for code:", referralCode);
        await session.abortTransaction();
        console.log("⚠️ Transaction aborted");
        return res.status(400).json({ message: 'Invalid referral code' });
      }

      console.log("✅ Referrer found:", referrer.uid);

      // Check if user is trying to use their own code
      if (referrer.uid === uid) {
        console.log("❌ User tried to use their own referral code");
        await session.abortTransaction();
        console.log("⚠️ Transaction aborted");
        return res.status(400).json({ message: 'Cannot use your own referral code' });
      }

      // Update referred user
      console.log(`✏️ Updating referred user ${uid} with referredBy: ${referralCode}`);
      await User.updateOne(
        { uid },
        { referredBy: referralCode },
        { session }
      );
      console.log("✅ Referred user updated");

      // Add reward to referrer
      const reward = {
        amount: 30,
        description: `Referral from ${uid}`,
        referredUserId: uid,
        createdAt: new Date()
      };

      console.log(`💰 Adding reward to referrer ${referrer.uid}`, reward);
      await User.updateOne(
        { uid: referrer.uid },
        { $push: { referralRewards: reward } },
        { session }
      );
      console.log("✅ Reward added to referrer");

      await session.commitTransaction();
      console.log("✅ Transaction committed successfully");
      res.json({ success: true, message: 'Referral applied successfully' });

    } catch (error) {
      console.log("❌ Error inside transaction:", error.message);
      await session.abortTransaction();
      console.log("⚠️ Transaction aborted due to error");
      throw error;
    } finally {
      session.endSession();
      console.log("✅ Session ended");
    }
  } catch (error) {
    console.log("❌ Outer error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

