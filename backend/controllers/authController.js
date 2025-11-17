// const admin = require('firebase-admin');
// const crypto = require('crypto');
// const sendSms = require('../services/otpService');

// const sendOtp = async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;
//     console.log('Received OTP request for:', phoneNumber);

//     if (!phoneNumber) {
//       return res.status(400).json({
//         success: false,
//         error: 'missing_phone_number',
//         message: 'Phone number is required',
//       });
//     }

//     // E.164 format validation
//     const phoneRegex = /^\+[1-9]\d{1,14}$/;
//     if (!phoneRegex.test(phoneNumber)) {
//       return res.status(400).json({
//         success: false,
//         error: 'invalid_phone_format',
//         message: 'Please provide phone number in international format (+[country code][number])',
//       });
//     }

//     // Check for recent OTP
//     const recentOtp = await admin.firestore().collection('otps').doc(phoneNumber).get();
//     if (recentOtp.exists && recentOtp.data().expiresAt.toMillis() > Date.now() - 30000) {
//       return res.status(429).json({
//         success: false,
//         error: 'otp_already_sent',
//         message: 'Please wait before requesting a new OTP',
//       });
//     }

//     // Generate and store OTP
//     const otp = crypto.randomInt(100000, 999999);
//     const ttl = 5 * 60 * 1000; // 5 minutes

//     await admin.firestore().collection('otps').doc(phoneNumber).set({
//       otp,
//       expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + ttl),
//       attempts: 0,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//     });

//     // Custom SMS message format
//     const smsMessage = `Hello ${phoneNumber}, Please find your OTP ${otp} for aqua sms. Thanks, AmbaniYatri`;
    
//     // Send SMS
//     await sendSms(phoneNumber, smsMessage);

//     res.status(200).json({
//       success: true,
//       message: 'OTP sent successfully',
//       otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
//     });
//   } catch (error) {
//     console.error('Error in sendOtp:', error);
//     res.status(500).json({
//       success: false,
//       error: 'server_error',
//       message: 'Failed to send OTP. Please try again.',
//     });
//   }
// };

// const verifyOtp = async (req, res) => {
//   try {
//     const { phoneNumber, otp } = req.body;

//     const TEST_PHONE = "+911234567890";
//     const TEST_OTP = "123456";

//     if (!phoneNumber || !otp) {
//       return res.status(400).json({
//         success: false,
//         error: 'missing_fields',
//         message: 'Phone number and OTP are required',
//       });
//     }

//     if (phoneNumber === TEST_PHONE) {
//       if (otp !== TEST_OTP) {
//         return res.status(400).json({
//           success: false,
//           error: 'invalid_otp',
//           message: 'Invalid test OTP entered',
//         });
//       }

//       // Check if test user exists or create new
//       const testUid = `test-${TEST_PHONE}`;
//       let user;
//       try {
//         user = await admin.auth().getUser(testUid);
//       } catch (error) {
//         if (error.code === 'auth/user-not-found') {
//           user = await admin.auth().createUser({
//             uid: testUid,
//             phoneNumber: TEST_PHONE,
//             displayName: 'Test User'
//           });
//         } else {
//           throw error;
//         }
//       }

//       const token = await admin.auth().createCustomToken(user.uid);

//       return res.status(200).json({
//         success: true,
//         token,
//         user: {
//           uid: user.uid,
//           phoneNumber: user.phoneNumber,
//           isTestUser: true
//         },
//       });
//     }

//     const otpDoc = await admin.firestore().collection('otps').doc(phoneNumber).get();

//     if (!otpDoc.exists) {
//       return res.status(400).json({
//         success: false,
//         error: 'invalid_otp',
//         message: 'OTP expired or not requested',
//       });
//     }

//     const { otp: storedOtp, expiresAt, attempts } = otpDoc.data();

//     if (attempts >= 3) {
//       return res.status(400).json({
//         success: false,
//         error: 'too_many_attempts',
//         message: 'Too many attempts. Please request a new OTP.',
//       });
//     }

//     if (expiresAt.toMillis() < Date.now()) {
//       await otpDoc.ref.delete();
//       return res.status(400).json({
//         success: false,
//         error: 'otp_expired',
//         message: 'OTP expired. Please request a new one.',
//       });
//     }

//     if (storedOtp.toString() !== otp.toString()) {
//       await otpDoc.ref.update({ attempts: attempts + 1 });
//       return res.status(400).json({
//         success: false,
//         error: 'invalid_otp',
//         message: 'Invalid OTP entered',
//       });
//     }

//     await otpDoc.ref.delete();

//     let user;
//     try {
//       user = await admin.auth().getUserByPhoneNumber(phoneNumber);
//     } catch (error) {
//       if (error.code === 'auth/user-not-found') {
//         user = await admin.auth().createUser({ phoneNumber });
//       } else {
//         throw error;
//       }
//     }

//     const token = await admin.auth().createCustomToken(user.uid);

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         uid: user.uid,
//         phoneNumber: user.phoneNumber,
//       },
//     });
//   } catch (error) {
//     console.error('Error in verifyOtp:', error);
//     res.status(500).json({
//       success: false,
//       error: 'verification_failed',
//       message: 'OTP verification failed. Please try again.',
//     });
//   }
// };


// module.exports = { sendOtp, verifyOtp };

const admin = require('firebase-admin');
const crypto = require('crypto');
const sendSms = require('../services/otpService');
const { applyReferral } = require('./userController');
const User = require('../models/User'); 
const mongoose = require('mongoose');
const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log('Received OTP request for:', phoneNumber);

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'missing_phone_number',
        message: 'Phone number is required',
      });
    }

    // E.164 format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_phone_format',
        message: 'Please provide phone number in international format (+[country code][number])',
      });
    }

    // Check for recent OTP
     const recentOtp = await admin.firestore().collection('otps').doc(phoneNumber).get();
     const lastSentAt = recentOtp.exists ? recentOtp.data().lastSentAt?.toMillis?.() : 0;
   if (lastSentAt && lastSentAt > Date.now() - 300_000) {
      return res.status(429).json({
        success: false,
        error: 'otp_already_sent',
        message: 'Please wait before requesting a new OTP',
      });
    }

    // Generate and store OTP
     const otp = crypto.randomInt(1000, 10000); // 1000 ≤ otp < 10000 → 4 digits
    const ttl = 5 * 60 * 1000; // 5 minutes

    await admin.firestore().collection('otps').doc(phoneNumber).set({
      otp,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + ttl),
      attempts: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSentAt: admin.firestore.FieldValue.serverTimestamp(), 
    });

    // Custom SMS message format
    const smsMessage = `Hello ${phoneNumber}, Please find your OTP ${otp} for Jioyatri. Thanks, AmbaniYatri`;

    // Send SMS
    await sendSms(phoneNumber, smsMessage);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to send OTP. Please try again.',
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    // console.log('[DEBUG] Starting OTP verification process');
    const { phoneNumber, otp, referralCode } = req.body;
    console.log('[DEBUG] Input parameters:', { 
      phoneNumber: phoneNumber ? `${phoneNumber.substring(0, 3)}...${phoneNumber.substring(phoneNumber.length - 3)}` : 'null',
      otp: otp ? '******' : 'null',
      referralCode: referralCode || 'none provided'
    });

    const TEST_PHONE = "+911234567898";
    const TEST_OTP = "1234";

    // Input validation
    if (!phoneNumber || !otp) {
      console.error('[VALIDATION ERROR] Missing required fields:', {
        hasPhoneNumber: !!phoneNumber,
        hasOtp: !!otp
      });
      return res.status(400).json({
        success: false,
        error: 'missing_fields',
        message: 'Phone number and OTP are required',
      });
    }

    // --- TEST USER LOGIC ---
    if (phoneNumber === TEST_PHONE) {
      console.log('[TEST MODE] Processing test user flow');
      if (otp !== TEST_OTP) {
        console.error('[TEST MODE] Invalid test OTP received:', {
          expected: TEST_OTP,
          received: otp
        });
        return res.status(400).json({
          success: false,
          error: 'invalid_otp',
          message: 'Invalid test OTP entered',
        });
      }

      console.log('[TEST MODE] OTP validation successful');
      const testUid = `test-${TEST_PHONE}`;
      let firebaseUser;

      try {
        console.log('[TEST MODE] Checking for existing Firebase test user');
        firebaseUser = await admin.auth().getUser(testUid);
        console.log('[TEST MODE] Found existing test user:', {
          uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber
        });
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log('[TEST MODE] Creating new Firebase test user');
          firebaseUser = await admin.auth().createUser({
            uid: testUid,
            phoneNumber: TEST_PHONE,
            displayName: 'Test User'
          });
          console.log('[TEST MODE] Created new test user:', firebaseUser.uid);
        } else {
          console.error('[TEST MODE] Firebase error:', error);
          throw error;
        }
      }

      // MongoDB user handling
      let mongoUser = await User.findOne({ uid: firebaseUser.uid });
      if (!mongoUser) {
        console.log('[TEST MODE] Creating MongoDB record for test user');
        mongoUser = await User.create({
          uid: firebaseUser.uid,
          phone: TEST_PHONE,
        });
        console.log('[TEST MODE] Created MongoDB user:', mongoUser._id);
      } else {
        console.log('[TEST MODE] Found existing MongoDB user:', mongoUser._id);
      }

      // Referral code handling
      if (referralCode) {
        console.log('[TEST MODE] Processing referral code:', referralCode);
        try {
          const referrer = await User.findOne({ referralCode });
          if (referrer) {
            console.log('[TEST MODE] Found referrer:', referrer.uid);
            
            // Update referred user
            await User.findOneAndUpdate(
              { uid: firebaseUser.uid },
              { 
                referredBy: referrer.uid,
                referralCodeUsed: referralCode,
                $setOnInsert: { createdAt: new Date() }
              },
              { upsert: true, new: true }
            );

            // Add reward to referrer
            const reward = {
              amount: 10,
              description: `Referral from test user ${firebaseUser.uid}`,
              referredUserId: firebaseUser.uid,
              createdAt: new Date()
            };

            await User.updateOne(
              { uid: referrer.uid },
              { 
                $inc: { referralCount: 1 },
                $push: { referralRewards: reward }
              }
            );
            console.log('[TEST MODE] Referral successfully applied with reward');
          } else {
            console.warn('[TEST MODE] Referral code not found');
          }
        } catch (referralError) {
          console.error('[TEST MODE] Referral processing failed:', referralError);
        }
      }

      const token = await admin.auth().createCustomToken(firebaseUser.uid);
      console.log('[TEST MODE] Generated auth token for test user');

      return res.status(200).json({
        success: true,
        token,
        user: mongoUser,
        isTestUser: true
      });
    }

    // --- NORMAL USER LOGIC ---
    console.log('[PROD] Fetching OTP record for:', phoneNumber);
    const otpDoc = await admin.firestore().collection('otps').doc(phoneNumber).get();
    
    if (!otpDoc.exists) {
      console.error('[PROD] OTP document not found for phone:', phoneNumber);
      return res.status(400).json({
        success: false,
        error: 'invalid_otp',
        message: 'OTP expired or not requested',
      });
    }

    const { otp: storedOtp, expiresAt, attempts } = otpDoc.data();
    console.log('[PROD] Retrieved OTP data:', {
      storedOtp: storedOtp ? '******' : 'null',
      expiresAt: expiresAt.toDate(),
      attempts
    });

    if (attempts >= 3) {
      console.error('[PROD] Too many OTP attempts:', attempts);
      return res.status(400).json({
        success: false,
        error: 'too_many_attempts',
        message: 'Too many attempts. Please request a new OTP.',
      });
    }

    if (expiresAt.toMillis() < Date.now()) {
      console.error('[PROD] OTP expired:', {
        currentTime: new Date(),
        expirationTime: expiresAt.toDate()
      });
      await otpDoc.ref.delete();
      return res.status(400).json({
        success: false,
        error: 'otp_expired',
        message: 'OTP expired. Please request a new one.',
      });
    }

    if (storedOtp.toString() !== otp.toString()) {
      console.error('[PROD] OTP mismatch:', {
        expected: storedOtp,
        received: otp
      });
      await otpDoc.ref.update({ attempts: attempts + 1 });
      return res.status(400).json({
        success: false,
        error: 'invalid_otp',
        message: 'Invalid OTP entered',
      });
    }

    console.log('[PROD] OTP validation successful - deleting OTP record');
    await otpDoc.ref.delete();

    // Firebase user handling
    let firebaseUser;
    try {
      console.log('[PROD] Looking up Firebase user by phone');
      firebaseUser = await admin.auth().getUserByPhoneNumber(phoneNumber);
      console.log('[PROD] Found existing Firebase user:', {
        uid: firebaseUser.uid,
        phone: firebaseUser.phoneNumber,
        email: firebaseUser.email || 'none'
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('[PROD] Creating new Firebase user');
        firebaseUser = await admin.auth().createUser({ phoneNumber });
        console.log('[PROD] Created new Firebase user:', firebaseUser.uid);
      } else {
        console.error('[PROD] Firebase error:', error);
        throw error;
      }
    }

    // MongoDB user handling
    let mongoUser = await User.findOne({ uid: firebaseUser.uid });
    if (!mongoUser) {
      console.log('[PROD] Creating new MongoDB user');
      const userData = {
        uid: firebaseUser.uid,
        phone: phoneNumber,
      };
      
      if (firebaseUser.email && firebaseUser.email.trim() !== '') {
        userData.email = firebaseUser.email;
      }
      
      mongoUser = await User.create(userData);
      console.log('[PROD] Created MongoDB user:', mongoUser._id);
    } else {
      console.log('[PROD] Found existing MongoDB user:', mongoUser._id);
    }

    // Referral code handling with transactions
    if (referralCode) {
      console.log('[PROD] Processing referral code:', referralCode);
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        const referrer = await User.findOne({ referralCode }).session(session);
        
        if (referrer) {
          console.log('[PROD] Found referrer:', {
            uid: referrer.uid,
            referralCode: referrer.referralCode
          });

          // Prevent self-referral
          if (referrer.uid === firebaseUser.uid) {
            console.warn('[PROD] Self-referral attempt blocked');
          } else {
            // Update referred user
            await User.findOneAndUpdate(
              { uid: firebaseUser.uid },
              { 
                referredBy: referrer.uid,
                referralCodeUsed: referralCode,
                referralAppliedAt: new Date()
              },
              { session }
            );

            // Add reward to referrer
            const reward = {
              amount: 10,
              description: `Referral from ${firebaseUser.uid}`,
              referredUserId: firebaseUser.uid,
              createdAt: new Date()
            };

            await User.updateOne(
              { uid: referrer.uid },
              { 
                $inc: { referralCount: 1 },
                $push: { referralRewards: reward }
              },
              { session }
            );

            console.log('[PROD] Referral successfully processed with reward');
          }
        } else {
          console.warn('[PROD] Referral code not found in database');
        }
        
        await session.commitTransaction();
      } catch (referralError) {
        await session.abortTransaction();
        console.error('[PROD] Referral processing failed:', {
          error: referralError.message,
          stack: referralError.stack
        });
      } finally {
        session.endSession();
      }
    }

    const token = await admin.auth().createCustomToken(firebaseUser.uid);
    console.log('[PROD] Generated auth token for user:', firebaseUser.uid);

    // Get fresh user data
    const updatedUser = await User.findOne({ uid: firebaseUser.uid }).lean();
    console.log('[PROD] Final user state:', {
      uid: updatedUser.uid,
      referredBy: updatedUser.referredBy || 'none',
      referralCodeUsed: updatedUser.referralCodeUsed || 'none'
    });

    res.status(200).json({
      success: true,
      token,
      user: updatedUser,
      referralApplied: !!updatedUser.referralCodeUsed
    });

  } catch (error) {
    console.error('[FATAL ERROR] OTP verification failed:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'verification_failed',
      message: 'OTP verification failed. Please try again.',
      systemError: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const googleLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        success: false,
        message: "Missing firebaseToken"
      });
    }

    // 1️⃣ Verify Google Firebase token
    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const uid = decoded.uid;
    const name = decoded.name || "";
    const email = decoded.email || "";
    const photo = decoded.picture || "";

    console.log("Google Login Verified:", uid);

    // 2️⃣ Find or Create User
    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        name,
        email,
        photo
      });

      console.log("New user created:", uid);
    }

    // 3️⃣ Create Firebase Custom Token for login
    const customToken = await admin.auth().createCustomToken(uid);

    return res.json({
      success: true,
      message: "Google login successful",
      firebaseToken: customToken,
      user
    });

  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google login failed",
      error: error.message
    });
  }
};


module.exports = { sendOtp, verifyOtp,googleLogin };



