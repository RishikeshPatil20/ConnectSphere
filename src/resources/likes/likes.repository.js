import mongoose from "mongoose";
import { likeSchema } from "./likes.schema.js";

const LikeModel = mongoose.model("Like", likeSchema);

export default class LikesRepository {
  // Get all likes for a specific post
  async getLikesForPost(postId) {
    return await LikeModel.find({ postId })
      .populate("userId", "name email")
      .exec();
  }

  // Toggle like status for a specific post by a user
  async toggleLike(postId, userId) {
    try {
      const existingLike = await LikeModel.findOne({ postId, userId });

      if (existingLike) {
        // Toggle the `isLiked` status
        existingLike.isLiked = !existingLike.isLiked;
        await existingLike.save();
        return existingLike;
      } else {
        // Create a new like if not already present
        const newLike = new LikeModel({ postId, userId, isLiked: true });
        await newLike.save();
        return newLike;
      }
    } catch (error) {
      throw new Error(`Failed to toggle like: ${error.message}`);
    }
  }
}
