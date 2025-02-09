import { Otp } from "./otp-authentication.schema.js";

// export const saveOtp = async ({ email, otp }) => {
//   const otpEntry = new Otp({ email, otp });
//   await otpEntry.save();
// };
// export const findOtpByEmailOrPhone = async (identifier) => {
//   // Replace with actual DB logic
//   return Otp.findOne({ identifier });
// };

// export const deleteOtp = async (identifier) => {
//   // Replace with actual DB logic
//   await Otp.deleteOne({ identifier });
// };
// Save OTP to the database
export const saveOtp = async ({ email, otp, expiresAt }) => {
  try {
    // Create a new OTP entry
    const otpEntry = new Otp({ email, otp, expiresAt });
    await otpEntry.save();
    console.log("OTP saved successfully.");
  } catch (error) {
    console.error("Error saving OTP:", error.message);
    throw new Error("Failed to save OTP.");
  }
};

// Find OTP by email or phone
export const findOtpByEmailOrPhone = async (identifier) => {
  try {
    const query = { $or: [{ email: identifier }, { phoneNumber: identifier }] };
    const otpRecord = await Otp.findOne(query).lean();
    if (!otpRecord) {
      throw new Error("OTP not found.");
    }
    return otpRecord;
  } catch (error) {
    console.error("Error finding OTP:", error.message);
    throw error;
  }
};

// Delete OTP from the database
export const deleteOtp = async (identifier) => {
  try {
    const query = { $or: [{ email: identifier }, { phoneNumber: identifier }] };
    const result = await Otp.deleteOne(query);
    console.log("OTP deleted successfully:", result);
  } catch (error) {
    console.error("Error deleting OTP:", error.message);
    throw new Error("Failed to delete OTP.");
  }
};

