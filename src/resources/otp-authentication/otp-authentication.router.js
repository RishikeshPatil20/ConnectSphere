import express from 'express';
import { requestResetPasswordOtp , verifyResetPasswordOtp } from './otp-authentication.controller.js';

const otpRouter = express.Router();

otpRouter.post('/request', requestResetPasswordOtp );

export default otpRouter;
