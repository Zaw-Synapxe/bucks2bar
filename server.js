// Server-side code (not part of client JS files)
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer();

// Add CORS middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080', // Specify your client's origin
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

app.use(bodyParser.json({limit: '10mb'})); // Increased limit for image data

app.post('/api/send-chart-email', upload.none(), async (req, res) => {
  try {
    // Get data from request
    const { recipient, subject, message, chartImage } = req.body;
    
    // Create base64 data for image embedding
    const imageData = chartImage.replace(/^data:image\/png;base64,/, '');
    
    // Configure email transporter (using environment variables)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Send email
    const info = await transporter.sendMail({
      from: `"Bucks2Bar" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      text: message,
      html: `<p>${message}</p><img src="cid:chart-image" />`,
      attachments: [{
        filename: 'chart.png',
        content: Buffer.from(imageData, 'base64'),
        cid: 'chart-image'
      }]
    });
    
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Set port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`- Static files served from the root directory`);
  console.log(`- Email API endpoint available at /api/send-chart-email`);
});