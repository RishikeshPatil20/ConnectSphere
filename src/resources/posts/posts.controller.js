import jwt from "jsonwebtoken";
import PostRepository from "./posts.repository.js";
import UserRepository from "../user/user.repository.js";
import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.SECRET_KEY;

export default class PostController {
  constructor() {
    console.log("PostController constructor called");
    this.postRepository = new PostRepository();
    this.getAllPosts = this.getAllPosts.bind(this);
    this.getPostById = this.getPostById.bind(this);
    this.createPost = this.createPost.bind(this);
    this.updatePost = this.updatePost.bind(this);
    this.deletePost = this.deletePost.bind(this);
    console.log("PostRepository initialized", this.postRepository);
  }
  // GET: Retrieve all posts
  async getAllPosts(req, res) {
    try {
      const posts = await this.postRepository.getAllPosts();
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // GET: Retrieve a specific post by ID
  async getPostById(req, res) {
    try {
      const { id: postId } = req.body;
      const post = await this.postRepository.getPostById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Create a new post
  async createPost(req, res) {
    try {
      const { title, content,caption } = req.body;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token missing" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;

      const userRepository = new UserRepository();
      const user = await userRepository.findById(userId);
      console.log("user find by id", user);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const imageUrl = req.file ? req.file.path : "";
      const post = await this.postRepository.createPost({
        title,
        content,
        userId,
        imageUrl,
        caption,
      });
      await userRepository.addPost(userId, post._id);

      return res.status(201).json({ message: "Post created", post });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // PUT: Update a specific post by ID
  async updatePost(req, res) {
    try {
      const { id: postId, title, content, caption} = req.body;
      const imageUrl = req.file ? req.file.path : null;

      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token missing" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, secretKey);
      const decodedUserId = decoded.id; // User making the request

      const post = await this.postRepository.getPostById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      console.log("post userid",post.userId);
      if (post.userId._id.toString() !== decodedUserId) {
        return res.status(403).json({ error: "Access denied: You are not the owner of this post" });
      }
      const updatedPost = await this.postRepository.updatePost(postId, {
        title,
        content,
        imageUrl,
        caption,
        updatedAt: new Date(),
      });
      if (!updatedPost) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res
        .status(200)
        .json({ message: "Post updated", post: updatedPost });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE: Delete a specific post by ID
  async deletePost(req, res) {
    try {
      const { id: postId } = req.body;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token missing" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id; // User making the request

      const post = await this.postRepository.getPostById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.userId.toString() !== userId) {
        return res.status(403).json({ error: "Access denied: You are not the owner of this post" });
      }
      const deletedPost = await this.postRepository.deletePost(postId);
      if (!deletedPost) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res
        .status(200)
        .json({ message: "Post deleted", post: deletedPost });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
