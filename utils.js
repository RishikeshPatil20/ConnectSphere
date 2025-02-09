import fs from "fs/promises";
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

export function encodeBase64(str) {
  return Buffer.from(str).toString("base64");
}

export function decodeBase64(base64String) {
  return Buffer.from(base64String, "base64").toString("utf-8");
}

export async function writeLog(logContent) {
  try {
    logContent = new Date().toString()+ " : " +logContent + "\n";
    await fs.appendFile('./src/storage/logs/logger.log',logContent);

  } catch (error) {
    console.log("error :", error);
  }
}
//---------------------------------------------------------------
//otp-authentication via email

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

export const sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Authentication',
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
// via sms mobile 
import twilio from 'twilio';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Missing Twilio Account SID or Auth Token in environment variables');
}

const client = twilio(accountSid, authToken);

export const sendSmsOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Error sending SMS:', error.message);
  }
};


