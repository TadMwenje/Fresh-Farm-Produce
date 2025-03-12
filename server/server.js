// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const axios = require('axios'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/farm-data', { // Replace with your MongoDB connection string
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schema
const formDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  sentiment: String, // Add field for sentiment analysis result
  summary: String, // Add field for summary result (optional)
});

const FormData = mongoose.model('form-submissions', formDataSchema);

// Function to call Gemini API
async function analyzeMessage(message) {
    const GEMINI_API_KEY = 'AIzaSyAvc9hvIHFW51SL3g7gw6alWe5UwFGr4yQ'; // Your Gemini API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
   
    try {
        const response = await axios.post(apiUrl, {
            contents: [{
                parts: [{ text: `Analyze the sentiment of this message and provide a short summary: ${message}` }]
            }]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Gemini API Response:", response.data);

        if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content && response.data.candidates[0].content.parts && response.data.candidates[0].content.parts[0] && response.data.candidates[0].content.parts[0].text) {
            const text = response.data.candidates[0].content.parts[0].text;
            const lines = text.split('\n');
            const sentiment = lines[0].replace('Sentiment: ', '');
            const summary = lines[1].replace('Summary: ', '');

            return { sentiment, summary };
        } else {
            console.error('Unexpected Gemini API response format:', response.data);
            return { sentiment: 'Error', summary: 'Error' };
        }

    } catch (error) {
        console.error('Error analyzing message:', error);
        return { sentiment: 'Error', summary: 'Error' };
    }
}

// POST Endpoint
app.post('/api/form-submissions', async (req, res) => {
    try {
        const formData = new FormData(req.body);

        const { sentiment, summary } = await analyzeMessage(formData.message);
        formData.sentiment = sentiment;
        formData.summary = summary;

        await formData.save();
        res.status(201).json({ message: 'Form data saved successfully' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET Endpoint
app.get('/api/form-submissions', async (req, res) => {
    try {
        const formSubmissions = await FormData.find();
        res.json(formSubmissions);
    } catch (error) {
        console.error('Error retrieving form submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});