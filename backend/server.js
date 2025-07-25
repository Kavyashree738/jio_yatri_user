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
const userRoutes=require('./routes/userRoutes')
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

// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://jioyatri.com'


// ];

// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true // if you're using cookies/auth
// }));

// const corsOptions = {
//   origin: ['https://jioyatri.com'], // ✅ Allow your frontend origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true // Optional, only if you use cookies or tokens
// };
// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = ['https://jioyatri.com', 'http://localhost:3000','http://jioyatri.com'];
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));

const corsOptions = {
  origin: 'https://jioyatri.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ✅ CORS first
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://jioyatri.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));




// Use it in your routes

app.use(express.json());
app.use('/api', partnerRoutes);
app.use('/api', enterpriseRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/address', addressRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/payment',paymentRoutes)
app.use('/api/driver',driverRoutes)

app.use('/api/ratings', ratingRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
