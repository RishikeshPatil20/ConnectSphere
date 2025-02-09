import LikesRepository from "./likes.repository.js";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";

dotenv.config();
const secretKey = process.env.SECRET_KEY;

class LikesController {
  constructor() {
    this.likesRepository = new LikesRepository();
    this.getLikesForPost = this.getLikesForPost.bind(this);
    this.toggleLike = this.toggleLike.bind(this);
  }

  // Get all likes for a specific post
  async getLikesForPost(req, res) {
    try {
      const { postId } = req.body;

      // Retrieve all likes for the specified post
      const likes = await this.likesRepository.getLikesForPost(postId);

      if (!likes) {
        return res.status(404).json({
          success: false,
          message: "Post not found or no likes yet.",
        });
      }

      return res.status(200).json({
        success: true,
        data: likes,
      });
    } catch (error) {
      console.error("Error fetching likes:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  // Toggle like status for a specific post
  async toggleLike(req, res) {
    try {
      const { id:postId } = req.body;
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token missing" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;
      console.log("Decoded User ID:", userId);

      // Toggle the like status for the post and user
      const result = await this.likesRepository.toggleLike(postId, userId);
      const isLiked = result.isLiked();
      
      return res.status(200).json({
        success: true,
        message: result.isLiked ? "Post liked successfully." : "Post unliked successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
}

export default LikesController;
