import mongoose from "mongoose";
import { userSchema } from "./user.schema.js";

// Create the user model
const userModel = mongoose.model("User", userSchema);

export default class UserRepository {
  // Create a new user
  async createUser(userData) {
    try {
      const user = new userModel(userData);
      await user.save();
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Find a user by ID
  async findById(userId) {
    try {
      return await userModel.findById(userId).exec();
    } catch (error) {
      throw new Error(
        `Failed to find user with ID ${userId}: ${error.message}`
      );
    }
  }

  // Find a user by email
  async findByEmail(email) {
    try {
      return await userModel.findOne({ email }).exec(); // Use userModel instead of User
    } catch (error) {
      throw new Error(
        `Failed to find user with email ${email}: ${error.message}`
      );
    }
  }
  // Get a user by email
  async getUserFromEmail(email) {
    try {
      return await this.findByEmail(email); // Reuse the findByEmail method to get the user
    } catch (error) {
      throw new Error(
        `Failed to get user from email ${email}: ${error.message}`
      );
    }
  }
  // Verify a user by ID
  async verifyUser(userId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to verify user: ${error.message}`);
    }
  }
  async addPost(userId, postId) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.posts.push(postId); // Add the post ID to the user's posts array
      await user.save();
      return user;
    } catch (error) {
      throw new Error(`Failed to add post to user: ${error.message}`);
    }
  }
  async addComment(userId, commentId) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.comments.push(commentId); // Add the comment ID to the user's comments array
      await user.save();
      return user;
    } catch (error) {
      throw new Error(`Failed to add comment to user: ${error.message}`);
    }
  }


  async logoutAll(user) {
    try {
      user.tokens = []; // Clear all tokens
      await user.save();
    } catch (error) {
      throw new Error(`Failed to log out all devices: ${error.message}`);
    }
  }
  //---friendship
  async sendFriendRequest(senderId, receiverId) {
    try {
      const receiver = await userModel.findById(receiverId);
      if (!receiver) throw new Error("User not found");

      receiver.friendRequests.push({ sender: senderId, status: "pending" });
      await receiver.save();
      return receiver;
    } catch (error) {
      throw new Error(`Failed to send friend request: ${error.message}`);
    }
  }

  async respondToFriendRequest(userId, senderId, response) {
    try {
      const user = await userModel.findById(userId);
      if (!user) throw new Error("User not found");

      const request = user.friendRequests.find((req) => req.sender.toString() === senderId);
      if (!request) throw new Error("Friend request not found");

      request.status = response;

      if (response === "accepted") {
        user.friends.push(senderId);
        const sender = await userModel.findById(senderId);
        sender.friends.push(userId);
        await sender.save();
      }

      user.friendRequests = user.friendRequests.filter((req) => req.sender.toString() !== senderId || req.status === "pending");
      await user.save();

      return user;
    } catch (error) {
      throw new Error(`Failed to respond to friend request: ${error.message}`);
    }
  }
  //otp-auth
  async updateUserPassword (email, newPassword){
    
    return await userModel.updateOne({ email }, { password: newPassword });
  };
}
