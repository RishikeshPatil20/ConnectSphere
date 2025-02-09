import express from "express";
import userController from "../user/user.controller.js";
import jwtAuth from "../../middleware/jwtTokenAuthorization.js";

const userRouter = express.Router();
const UserController = new userController();

// Authentication routes (should be at the top for better security)
userRouter.post('/login', UserController.login);
userRouter.post("/logoutAll", jwtAuth, UserController.logoutAll);

// User routes requiring JWT authorization (place after authentication)
userRouter.get("/view/:userId", jwtAuth, UserController.viewUser);
userRouter.post("/sendFriendRequest", jwtAuth, UserController.sendFriendRequest);
userRouter.post("/respondToFriendRequest/:userId", jwtAuth, UserController.respondToFriendRequest);
userRouter.delete('/:id',jwtAuth, (req, res) => {
    return res.status(200).json({
      success: true,
      data: "delete id request"
    });
  });
// User routes (can be accessed without authentication)
userRouter.post('/registerUser', UserController.registerUser);
//
userRouter.post('/reset-password', UserController.resetPassword);

export default userRouter;