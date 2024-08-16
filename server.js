const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();
const cors = require("cors");
const path = require('path')

const Contact = require("./Model/Contact");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//static file access
app.use(express.static(path.join(__dirname,'./client/build')))
// Allow all origins or specify your React app's URL
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your React frontend URL
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Route to handle form submission
app.post("/send-mail", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Save the message to MongoDB
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Send an email notification (optional)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from:process.env.EMAIL_USER,
      to:process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      html: `
        <h2>From: ${name}</h2>
        <h3>Email: ${email}</h3>
        <p>Message: ${message}</p>
      `,
      text: message, 
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json("Something went wrong. Please try again later.");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json("Your message has been sent successfully!");
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
});

app.get('*',function(req,res){
  res.sendFile(path.join(__dirname,'./client/build/index.html'))
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
