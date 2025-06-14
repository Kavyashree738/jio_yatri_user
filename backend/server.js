require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const partnerRoutes = require('./routes/partnerRoutes');
const enterpriseRoutes = require('./routes/enterpriseRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const addressRoutes=require('./routes/addressRoutes')
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const admin = require('firebase-admin'); 

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'authentication-e6bd0' // Add your project ID here
});

const allowedOrigins = [
  'http://localhost:3000',
  'https://jioyatriuser.netlify.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // if you're using cookies/auth
}));

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
// app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
