require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const partnerRoutes = require('./routes/partnerRoutes');
const enterpriseRoutes = require('./routes/enterpriseRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const addressRoutes=require('./routes/addressRoutes')
const paymentRoutes=require('./routes/paymentRoutes')
const ratingRoutes = require('./routes/ratingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const app = express();

const PORT = process.env.PORT || 5000;
const cors = require('cors');
const admin = require('firebase-admin'); 
const authRoutes=require('./routes/authRoutes')
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'authentication-e6bd0' // Add your project ID here
});

// Updated CORS configuration (replace your existing one)
const allowedOrigins = [
  'https://jioyatri.com',
  'https://www.jioyatri.com',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight support

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));




// Use it in your routes
app.use(express.json());

try {
  console.log("Registering /api partner routes");
  app.use('/api', partnerRoutes);
} catch (e) {
  console.error("Error in partnerRoutes:", e);
}

try {
  console.log("Registering /api enterprise routes");
  app.use('/api', enterpriseRoutes);
} catch (e) {
  console.error("Error in enterpriseRoutes:", e);
}

try {
  console.log("Registering /api/shipments routes");
  app.use('/api/shipments', shipmentRoutes);
} catch (e) {
  console.error("Error in shipmentRoutes:", e);
}

try {
  console.log("Registering /api/address routes");
  app.use('/api/address', addressRoutes);
} catch (e) {
  console.error("Error in addressRoutes:", e);
}

try {
  console.log("Registering /api/auth routes");
  app.use('/api/auth', authRoutes);
} catch (e) {
  console.error("Error in authRoutes:", e);
}

try {
  console.log("Registering /api/payment routes");
  app.use('/api/payment', paymentRoutes);
} catch (e) {
  console.error("Error in paymentRoutes:", e);
}

try {
  console.log("Registering /api/driver routes");
  app.use('/api/driver', driverRoutes);
} catch (e) {
  console.error("Error in driverRoutes:", e);
}

try {
  console.log("Registering /api/ratings routes");
  app.use('/api/ratings', ratingRoutes);
} catch (e) {
  console.error("Error in ratingRoutes:", e);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
