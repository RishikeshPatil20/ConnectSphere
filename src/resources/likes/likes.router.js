import express from "express";
import jwtAuth from "../../middleware/jwtTokenAuthorization.js";
import LikesController from "./likes.controller.js";

const likesRouter = express.Router();
const likesController = new LikesController();
// Route to retrieve all likes for a specific post
likesRouter.get("", jwtAuth, likesController.getLikesForPost);

// Route to toggle like status for a specific post
likesRouter.get("/toggle", jwtAuth, likesController.toggleLike);

export default likesRouter;
