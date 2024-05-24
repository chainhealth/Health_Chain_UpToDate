const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
const mongoUri = 'mongodb://localhost:27017/id_service'; // Replace with your connection string

// Define Mongoose schema for the last ID document
const LastIdSchema = new mongoose.Schema({
  lastId: { type: Number, required: true, default: 0 },
});

const LastId = mongoose.model('LastId', LastIdSchema);

// Connect to MongoDB using Mongoose
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.get('/new-id', async (req, res) => {
  try {
    // Find and update the LastId document atomically
    const updateResult = await LastId.findOneAndUpdate({}, { $inc: { lastId: 1 } }, { new: true }); // Return updated doc

    if (!updateResult) {
      // Create a new LastId document if it doesn't exist
      const newLastId = new LastId({ lastId: 1 });
      await newLastId.save();
      return res.json({ id: `ph${1}` });
    }

    const newId = updateResult.lastId;
    res.json({ id: `ph${newId}` });
  } catch (error) {
    console.error('Error generating new ID:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, () => {
  console.log(`ID generation service listening on port ${port}`);
});