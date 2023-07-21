const nodemailer = require('nodemailer');


// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail', 'Outlook', etc.
  auth: {
    user: 'messagemarweg@gmail.com',
    pass: 'messagemarwegpass',
  },
});

// Route to handle form submissions
app.post('/api/send-message', (req, res) => {
  const { name, email, message, reservationDate } = req.body;

  // Compose email message
  const mailOptions = {
    from: 'messagemarweg@gmail.com',
    to: 'cristianosvar@gmail.com', // Destination email address
    subject: 'TestMail',
    html: `
      <h3>Contact Details:</h3>
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>Message: ${message}</p>
      <p>Reservation Date: ${reservationDate}</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    } else {
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});

