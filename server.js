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
  methods: ['POST','GET', 'OPTIONS'],
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
    console.log('SMTP connection verified successfully');
  } catch (error) {
    console.error('SMTP Connection Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/send-email", async (req, res) => {
  const { email, image } = req.body;
  console.log("SEND EMAIL WORKS", { email, image });

  // Create a transporter object using SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      logger: true
  });

  // Email options
  let mailOptions = {
    from: "test@resend.dev",
    to: email,
    subject: "Your Chart Image",
    text: "Please find your chart image attached.",
    attachments: [
      {
        filename: "chart.png",
        content: image.split("base64,")[1],
        encoding: "base64",
      },
    ],
  };
  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    //res.status(200).send("Email sent successfully!");
    console.log('Email sent successfully:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.log({ error });
    //res.status(500).send("Failed to send email.");
    console.error('Email error details:', {
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command,
      message: error.message
    });
    
    // Handle different error codes specifically
    let errorMessage = 'Failed to send email';
    
    switch(error.responseCode) {
      case 450:
        errorMessage = 'Email rejected: The mail server is temporarily unavailable or has restrictions. Try again later.';
        break;
      case 501:
        errorMessage = 'Email syntax error: Invalid email address format.';
        break;
      case 550:
        errorMessage = 'Email rejected: The recipient address was rejected.';
        break;
      case 535:
        errorMessage = 'Authentication failed: Check your email credentials.';
        break;
      default:
        if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
          errorMessage = 'Connection problem with email server. Try again later.';
        }
    }
    
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// app.post('/api/send-chart-email', upload.none(), async (req, res) => {
//   try {
//     console.log('==== Email Chart Request ====');
//     console.log('Headers:', req.headers['content-type']);
//     console.log('Request body keys:', Object.keys(req.body));
    
//     // Get data from request 
//     const recipient = req.body.recipient;
//     const subject = req.body.subject;
//     const message = req.body.message;
//     const chartImage = req.body.chartImage;
    
//     console.log('Recipient:', recipient);
//     console.log('Subject:', subject ? 'Present' : 'Missing');
//     console.log('Message:', message ? 'Present' : 'Missing');
//     console.log('Chart Image:', chartImage ? 'Present' : 'Missing');
    
//     // Check if required fields exist
//     if (!recipient || !chartImage) {
//       console.log('Missing required fields');
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Missing required fields', 
//         received: { 
//           recipient: !!recipient, 
//           subject: !!subject, 
//           message: !!message, 
//           chartImage: !!chartImage 
//         } 
//       });
//     }
    
//     // Create base64 data for image embedding    const imageData = chartImage.replace(/^data:image\/png;base64,/, '');
    
//     // Configure email transporter optimized for Resend
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//       },
//       connectionTimeout: 5000, // 5 seconds
//       greetingTimeout: 5000,
//       socketTimeout: 10000,
//       logger: true,
//       debug: true    });
    
//     // Optimize the image size to prevent delivery issues
//     let optimizedImageData = imageData;
//     if (optimizedImageData.length > 2000000) { // If larger than ~2MB
//       console.log('Large image detected, would be better to optimize it');
//       // In production, you could add image compression here
//     }

//     // Send email with optimized configuration for Resend
//     const info = await transporter.sendMail({
//       from: 'test@resend.dev', // 'Bucks2Bar <onboarding@resend.dev>
//       to: recipient,
//       subject: subject || 'Your Financial Chart',
//       text: message || 'Here is your financial chart from Bucks2Bar.',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #4CAF50;">Your Financial Chart</h2>
//           <p>${message || 'Here is your financial chart from Bucks2Bar.'}</p>
//           <div style="margin: 20px 0;">
//             <img src="cid:chart-image" style="max-width: 100%; height: auto;" />
//           </div>
//           <p style="color: #666; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
//         </div>
//       `,
//       attachments: [{
//         filename: 'financial-chart.png',
//         content: Buffer.from(optimizedImageData, 'base64'),
//         cid: 'chart-image'
//       }],
//       headers: {
//         'X-Entity-Ref-ID': `chart-${Date.now()}` // Prevent duplicate emails
//       }
//     });
//       console.log('Email sent successfully:', info.messageId);
//     res.json({ success: true, messageId: info.messageId });
//   } catch (error) {
//     console.error('Email error details:', {
//       code: error.code,
//       response: error.response,
//       responseCode: error.responseCode,
//       command: error.command,
//       message: error.message
//     });
    
//     // Handle different error codes specifically
//     let errorMessage = 'Failed to send email';
    
//     switch(error.responseCode) {
//       case 450:
//         errorMessage = 'Email rejected: The mail server is temporarily unavailable or has restrictions. Try again later.';
//         break;
//       case 501:
//         errorMessage = 'Email syntax error: Invalid email address format.';
//         break;
//       case 550:
//         errorMessage = 'Email rejected: The recipient address was rejected.';
//         break;
//       case 535:
//         errorMessage = 'Authentication failed: Check your email credentials.';
//         break;
//       default:
//         if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
//           errorMessage = 'Connection problem with email server. Try again later.';
//         }
//     }
    
//     res.status(500).json({ success: false, error: errorMessage });
//   }
// });

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