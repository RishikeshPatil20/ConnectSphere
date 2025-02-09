import express from "express";
import PostController from "./posts.controller.js";
import upload from "../../middleware/uploadFile.js";
import jwtAuth from "../../middleware/jwtTokenAuthorization.js";

const postRouter = express.Router();
const postController = new PostController();

// Endpoints
postRouter.get("/all", jwtAuth, postController.getAllPosts);
postRouter.get("/", jwtAuth, postController.getPostById);
postRouter.post("/create-post", jwtAuth, upload.single("imageUrl"), postController.createPost);
postRouter.put("/update-post", jwtAuth, upload.single("imageUrl"), postController.updatePost);
postRouter.delete("/delete-post", jwtAuth, postController.deletePost);

export default postRouter;
