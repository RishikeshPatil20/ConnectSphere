import { saveOtp, deleteOtp  } from './otp-authentication.repository.js';
import UserRepository from '../user/user.repository.js';
import { sendEmailOTP,sendSmsOTP } from '../../../utils.js';
import { findOtpByEmailOrPhone } from './otp-authentication.repository.js';


export const requestResetPasswordOtp  = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

  // Generate OTP
  // const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
  // const expiresAt = new Date(Date.now() + 5 * 60000); // Expires in 5 minutes

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const userRepository = new UserRepository();
    // Check if user exists (email-based)
    if (email) {
      const user = await userRepository.findByEmail(email);
      console.log("user email",email);
      if (!user) return res.status(400).json({ message: 'User not found' });

      await deleteOtp(email); // Remove old OTPs
      await saveOtp({ email, otp }); // Save new OTP
      await sendEmailOTP(email, otp); // Send OTP via email
      //await sendSmsOTP(phoneNumber, otp);// Send OTP via phoneNumber
    }

    // Check if phone number exists (for SMS-based OTP)
    // if (phoneNumber) {
    //   // Logic for verifying phoneNumber with database, if required
    //   await sendSmsOTP(phoneNumber, otp); // Send OTP via SMS
    // }

    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


export const verifyResetPasswordOtp = async ({ email, phoneNumber, otp }) => {
  try {
    if (!email && !phoneNumber) {
      throw new Error('Email or phone number is required');
    }
    console.log("Otp module otp : ",otp);
    
    // Fetch OTP record based on email or phone number
    const otpRecord = await findOtpByEmailOrPhone(email || phoneNumber);
    console.log("otpReord",otpRecord.otp);
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < Date.now()) {
      throw new Error('Invalid or expired OTP');
    }

    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    return false;
  }
};

