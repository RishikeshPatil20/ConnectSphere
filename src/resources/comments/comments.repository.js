import mongoose from "mongoose";
import { commentSchema } from "./comments.schema.js";

// Create the Comment model
const commentModel = mongoose.model("Comment", commentSchema);

export default class CommentRepository {
  // Add a new comment
  async createComment(content, userId, postId) {
    try {
      const comment = new commentModel({ content, userId, postId });
      return await comment.save();
    } catch (error) {
      throw new Error("Error adding comment: " + error.message);
    }
  }
  async createCommentReply(content, userId) {
    try {
      const comment = new commentModel({ content, userId });
      return await comment.save();
    } catch (error) {
      throw new Error("Error adding comment: " + error.message);
    }
  }
  
  // Get comments for a specific post
  async getCommentsForPost(postId) {
    try {
      return await commentModel.find({ postId }).populate("userId", "name email").exec();
    } catch (error) {
      throw new Error("Error retrieving comments: " + error.message);
    }
  }

  // Get a comment by ID
  async getCommentById(commentId) {
    try {
      return await commentModel.findById(commentId).populate("userId", "name email").exec();
    } catch (error) {
      throw new Error("Error retrieving comment: " + error.message);
    }
  }

  // Update a comment
  async updateCommentById(commentId, newContent) {
    try {
      return await commentModel.findByIdAndUpdate(
        commentId,
        { content: newContent, updated_at: new Date() },
        { new: true }
      );
    } catch (error) {
      throw new Error("Error updating comment: " + error.message);
    }
  }

  // Delete a comment
  async deleteById(commentId) {
    try {
      // Delete the comment by its ID
      const deletedComment = await commentModel.findByIdAndDelete(commentId);
  
      if (!deletedComment) {
        throw new Error("Comment not found.");
      }
      // Find and update any comments containing this ID in their 'replies' array
      await commentModel.updateMany(
        { replies: commentId }, // Find comments with this commentId in replies
        { $pull: { replies: commentId } } // Remove the commentId from the replies array
      );
  
      return deletedComment; // Return the deleted comment for reference
    } catch (error) {
      throw new Error("Error deleting comment: " + error.message);
    }
  }
  

  // Like a comment
  async likeCommentById(commentId) {
    try {
      const comment = await commentModel.findById(commentId);
      if (!comment) return null;

      comment.likes += 1;
      return await comment.save();
    } catch (error) {
      throw new Error("Error liking comment: " + error.message);
    }
  }

  // Add a reply to a comment
  async addReply(commentId, replyCommentId) {
    try {
      const comment = await commentModel.findById(commentId);
      if (!comment) return null;

      comment.replies.push(replyCommentId);
      return await comment.save();
    } catch (error) {
      throw new Error("Error adding reply: " + error.message);
    }
  }

  // Get all replies for a specific comment
  async getReplies(commentId) {
    try {
      const comment = await commentModel.findById(commentId).populate("replies").exec();
      return comment ? comment.replies : null;
    } catch (error) {
      throw new Error("Error retrieving replies: " + error.message);
    }
  }
}
