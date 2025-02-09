import mongoose from "mongoose";
export const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      phoneNumber: { type: String, required: true }, 
      password: {
        type: String,
        required: true,
      },
      gender: { type: String, required: true },
      role: {
        type: String,
        default: "user",
        enum: ["user", "admin"],
      },
      bio: String,
      profilePic: String,
      posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
      comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      tokens: [{ token: { type: String, required: true } }],
      friendRequests: [
        {
          sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        },
      ],
      friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true } // Automatically add createdAt and updatedAt fields
  );
  