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
const upload = multer({
  limits: { fieldSize: 25 * 1024 * 1024 }  // 25MB max field size for large image data
});

// Add CORS middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080', // Specify your client's origin
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Parse JSON requests
app.use(bodyParser.json({limit: '10mb'})); // Increased limit for image data

// Parse URL-encoded form data (important for handling form submissions)
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Test email connectivity
app.get('/api/test-email-connection', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      logger: true
    });
    
    // Verify connection configuration
    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection successful' });
  } catch (error) {
    console.error('SMTP Connection Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-chart-email', upload.none(), async (req, res) => {
  try {
    console.log('==== Email Chart Request ====');
    console.log('Headers:', req.headers['content-type']);
    console.log('Request body keys:', Object.keys(req.body));
    
    // Get data from request 
    const recipient = req.body.recipient;
    const subject = req.body.subject;
    const message = req.body.message;
    const chartImage = req.body.chartImage;
    
    console.log('Recipient:', recipient);
    console.log('Subject:', subject ? 'Present' : 'Missing');
    console.log('Message:', message ? 'Present' : 'Missing');
    console.log('Chart Image:', chartImage ? 'Present' : 'Missing');
    
    // Check if required fields exist
    if (!recipient || !chartImage) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields', 
        received: { 
          recipient: !!recipient, 
          subject: !!subject, 
          message: !!message, 
          chartImage: !!chartImage 
        } 
      });
    }
    
    // Create base64 data for image embedding
    const imageData = chartImage.replace(/^data:image\/png;base64,/, '');
    
    // Configure email transporter (using environment variables)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
      port: process.env.EMAIL_PORT, // e.g., 587 for TLS
      secure: false, // true for 465, false for other ports like 587
      requireTLS: true, // Force using TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      logger: true // Log to console for debugging
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