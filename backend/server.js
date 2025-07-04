// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const partnerRoutes = require('./routes/partnerRoutes');
// const enterpriseRoutes = require('./routes/enterpriseRoutes');
// const shipmentRoutes = require('./routes/shipmentRoutes');
// const addressRoutes=require('./routes/addressRoutes')
// const paymentRoutes=require('./routes/paymentRoutes')
// const ratingRoutes = require('./routes/ratingRoutes');
// const driverRoutes = require('./routes/driverRoutes');
// const app = express();

// const PORT = process.env.PORT || 5000;
// const cors = require('cors');
// const admin = require('firebase-admin'); 
// const authRoutes=require('./routes/authRoutes')
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   projectId: 'authentication-e6bd0' // Add your project ID here
// });

// // const allowedOrigins = [
// //   'http://localhost:3000',
// //   'https://jioyatri.com'


// // ];

// // app.use(cors({
// //   origin: function(origin, callback) {
// //     if (!origin || allowedOrigins.includes(origin)) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error('Not allowed by CORS'));
// //     }
// //   },
// //   credentials: true // if you're using cookies/auth
// // }));

// const corsOptions = {
//   origin: ['https://jioyatri.com'], // ✅ Allow your frontend origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true // Optional, only if you use cookies or tokens
// };

// app.use(cors(corsOptions));


// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));




// // Use it in your routes

// app.use(express.json());
// app.use('/api', partnerRoutes);
// app.use('/api', enterpriseRoutes);
// app.use('/api/shipments', shipmentRoutes);
// app.use('/api/address', addressRoutes); 
// app.use('/api/auth', authRoutes);
// app.use('/api/payment',paymentRoutes)
// app.use('/api/driver',driverRoutes)

// app.use('/api/ratings', ratingRoutes);
// // app.use('/api/user', userRoutes);

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const partnerRoutes = require('./routes/partnerRoutes');
const enterpriseRoutes = require('./routes/enterpriseRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const addressRoutes = require('./routes/addressRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const app = express();

const PORT = process.env.PORT || 5000;
const cors = require('cors');
const admin = require('firebase-admin'); 
const authRoutes = require('./routes/authRoutes');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'authentication-e6bd0'
});

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://jioyatri.com',
  'https://www.jioyatri.com' // Add www version if needed
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());

// Add headers before routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Routes
app.use('/api', partnerRoutes);
app.use('/api', enterpriseRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/address', addressRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/ratings', ratingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
