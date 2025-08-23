const admin = require('firebase-admin');

// Remove the initialization from here - it should only happen in server.js
// Just use the already initialized admin instance

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
};


