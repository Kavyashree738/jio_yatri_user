require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const partnerRoutes = require('./routes/partnerRoutes');
const enterpriseRoutes = require('./routes/enterpriseRoutes');
const userRoutes=require("./routes/userRoutes")
const addressRoutes=require("./routes/addressRoutes")
const createOrGetUser=require('./controllers/userController')
const shipmentRoutes = require('./routes/shipmentRoutes');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const admin = require('firebase-admin'); 

const serviceAccount = require('./config/firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'authentication-e6bd0' // Add your project ID here
});



app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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
// Routes
app.use('/api/users', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/shipments', shipmentRoutes);
// app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
