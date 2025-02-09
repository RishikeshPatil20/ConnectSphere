import jwt from "jsonwebtoken";
import validator from "validator";
import CommentRepository from "./comments.repository.js";
import UserRepository from "../user/user.repository.js";
import dotenv from "dotenv";
import PostRepository from "../posts/posts.repository.js";
dotenv.config();

const secretKey = process.env.SECRET_KEY;
export default class CommentController {
  constructor() {
    this.commentRepository = new CommentRepository();
    this.createComment = this.createComment.bind(this);
    this.getCommentsForPost = this.getCommentsForPost.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.likeComment = this.likeComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.addReply = this.addReply.bind(this);
  }

  // Create a new comment
  async createComment(req, res) {
    try {
      const { content, postId } = req.body;
      
      // Check for authorization token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token missing" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;
      console.log("create user userID",userId);
      // Validate input
      if (!content || !validator.isLength(content, { min: 1 })) {
        return res.status(400).json({ message: "Comment content cannot be empty." });
      }

      if (!postId) {
        return res.status(400).json({ message: "Post ID is required." });
      }
      const userRepository = new UserRepository();
      const user = await userRepository.findById(userId);

      const postRepository = new PostRepository();
      const post = await postRepository.getPostById();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Add comment via repository
      const newComment = await this.commentRepository.createComment(content, userId, postId);
      
      await userRepository.addComment(userId, newComment._id);
      await postRepository.addComment(postId, newComment._id);
      
      return res.status(201).json({
        success: true,
        message: "Comment created successfully.",
        data: newComment,
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  // Get all comments for a specific post
  async getCommentsForPost(req, res) {
    try {
      const { postId } = req.params;

      if (!postId) {
        return res.status(400).json({ message: "Post ID is required." });
      }

      const comments = await this.commentRepository.getCommentsForPost(postId);

      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  // Update comment
  async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content }= req.body;

      if (!content || !validator.isLength(content, { min: 1 })) {
        return res.status(400).json({ message: "Comment content cannot be empty." });
      }

      const updatedComment = await this.commentRepository.updateCommentById(commentId, content);

      return res.status(200).json({
        success: true,
        message: "Comment updated successfully.",
        data: updatedComment,
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  // Like a comment
  // async likeComment(req, res) {
  //   try {
  //     const { commentId } = req.body;

  //     const updatedComment = await this.commentRepository.likeCommentById(commentId);

  //     if (!updatedComment) {
  //       return res.status(404).json({ message: "Comment not found." });
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       message: "Comment liked successfully.",
  //       data: updatedComment,
  //     });
  //   } catch (error) {
  //     console.error("Error liking comment:", error);
  //     return res.status(500).json({ message: "Internal server error." });
  //   }
  // }
// Like a comment
async likeComment(req, res) {
  try {
    const { commentId } = req.params; // Alphanumeric ID

    const updatedComment = await this.commentRepository.likeCommentById(commentId);

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Comment liked successfully.",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

  // Delete comment
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;

      const deletedComment = await this.commentRepository.deleteById(commentId);

      if (!deletedComment) {
        return res.status(404).json({ message: "Comment not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Comment deleted successfully.",
        data: deletedComment,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }
  // Add a reply to a comment
  async addReply(req, res) {
    try {
      const { commentId } = req.params; // Alphanumeric ID
      const { replyContent } = req.body;

      if (!replyContent || !validator.isLength(replyContent, { min: 1 })) {
        return res.status(400).json({ message: "Reply content cannot be empty." });
      }

      const replyComment = await this.commentRepository.createCommentReply(
        replyContent,
        req.user.id, // Assuming req.user contains the authenticated user's ID
      );

      const updatedComment = await this.commentRepository.addReply(commentId, replyComment._id);

      if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found." });
      }

      return res.status(201).json({
        success: true,
        message: "Reply added successfully.",
        data: updatedComment,
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

}
