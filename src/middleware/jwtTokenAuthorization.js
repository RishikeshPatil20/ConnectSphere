import jwt from "jsonwebtoken";
import UserModel from "../resources/user/user.model.js";
import UserRepository from "../resources/user/user.repository.js";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.SECRET_KEY;

// export default jwtAuth;
//--------------------

const jwtAuth = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    console.log("auth", req.headers.authorization);
    const [authType, token] = req.headers.authorization.split(" ");

    if (authType === "Bearer") {
      // decode the token
      try {
        // syntax jwt.verify(token_value, 'secret_key');
        const payloadData = jwt.verify(token, secretKey);
        const email = payloadData.email;

        // Use the UserRepository to fetch the user from the database
        const userRepository = new UserRepository();
        const user = await userRepository.getUserFromEmail(email); // Assuming this method is in your repository
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized",
          });
        }

        req.user = user;
        next();
      } catch (error) {
        console.log("error", error);
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export default jwtAuth;
