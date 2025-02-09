import validator from "validator";
import UserModel from "./user.model.js";
import jwt from 'jsonwebtoken';
import  UserRepository  from "./user.repository.js";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import { deleteOtp } from "../otp-authentication/otp-authentication.repository.js";
import { verifyResetPasswordOtp } from "../otp-authentication/otp-authentication.controller.js";
dotenv.config();

const secretKey = process.env.SECRET_KEY;

export default class userController {
  constructor(){
    this.userRepository = new UserRepository();
    this.registerUser = this.registerUser.bind(this);
    this.login = this.login.bind(this);
    this.viewUser = this.viewUser.bind(this);
    this.sendFriendRequest = this.sendFriendRequest.bind(this);
    this.respondToFriendRequest = this.respondToFriendRequest.bind(this);
    this.logoutAll = this.logoutAll.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    
  }
  async registerUser(req, res) {
    try {
      const { name, email, password, gender, phoneNumber } = req.body;
  
      // Validate email
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Email is not valid",
        });
      }
      // Validate gender
      if (!["male", "female", "other"].includes(gender.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Gender should be 'male', 'female', or 'other'",
        });
      }
      // Validate password
      if (!validator.isAlphanumeric(password)) {
        return res.status(400).json({
          success: false,
          message: "Password should contain only letters and numbers",
        });
      }
      if (!validator.isMobilePhone(phoneNumber, 'any')) {
        return res.status(400).json({
          success: false,
          message: "Phone number is not valid",
        });
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // User object
      const user = {
        name,
        email,
        password: hashedPassword,
        gender: gender.toLowerCase(),
        phoneNumber, // Save phone number
      };

      // Save user
      const newUser = await this.userRepository.createUser(user);
      // Success
      return res.status(201).json({
        success: true,
        data: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          gender: newUser.gender,
          phoneNumber: newUser.phoneNumber,
        },
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
  
  
  async login(req, res) {
    try {
      const { email, password } = req.body;
  
      if (!email || !validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email",
        });
      }
      console.log("comment 1")
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }
      console.log("comment 2")

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }
      let payloadData = {
        id : user.id,
        email: user.email,
        name: user.name,
      };
      console.log(payloadData);
      let token = jwt.sign(payloadData, secretKey, { expiresIn: '1h' });

      user.tokens.push({ token });
      await user.save();
  
      // const secretKey = "your_secret_key"; // Replace with environment variable
      // const token = jwt.sign(
      //   { id: user._id, email: user.email, name: user.name },
      //   secretKey,
      //   { expiresIn: "1h" }
      // );
  
      return res.status(200).json({
        success: true,
        token,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
  
  async viewUser(req, res) {
    try {
      const userId = req.params.userId;
  
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }
      //
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
  async logoutAll(req, res) {
    try {
      const user = req.user; // Retrieved via `jwtAuth` middleware
      console.log("user token", user);
      await this.userRepository.logoutAll(user); // Clear tokens via the repository
      return res.status(200).json({ success: true, message: "Logged out from all devices" });
    } catch (error) {
      console.error("Error logging out from all devices:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  } 

  //---friendShip
  async sendFriendRequest(req, res) {
    try {
      const { senderId, receiverId } = req.body;

      if (!senderId || !receiverId) {
        return res.status(400).json({ success: false, message: "Sender and receiver IDs are required" });
      }

      const receiver = await this.userRepository.sendFriendRequest(senderId, receiverId);
      return res.status(200).json({ success: true, data: receiver });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  async respondToFriendRequest(req, res) {
    try {
      const { userId } = req.params;
      const { senderId, response } = req.body; // "accepted" or "rejected"

      if (!["accepted", "rejected"].includes(response)) {
        return res.status(400).json({ success: false, message: "Invalid response" });
      }

      const user = await this.userRepository.respondToFriendRequest(userId, senderId, response);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  //reset password using otp
  async resetPassword(req, res) {
    try {
      const { email, phoneNumber, otp, newPassword } = req.body;
      console.log("user otp : ",otp);
      // Validate OTP
      const isOtpValid = await verifyResetPasswordOtp({ email, phoneNumber, otp });
      console.log("otp valid", isOtpValid);
      if (!isOtpValid) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.updateUserPassword(email, hashedPassword);
      await deleteOtp(email);

      res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error user', error: error.message });
    }
  }
}
