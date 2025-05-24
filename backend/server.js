// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/check-price', (req, res) => {
  const { pickup, drop, phone, date } = req.body;

  if (!pickup || !drop || !phone || !date) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Dummy pricing logic
  const basePrice = 300;
  const distanceFactor = Math.abs(pickup.length - drop.length) * 50;
  const totalPrice = basePrice + distanceFactor;

  res.json({ price: totalPrice });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
