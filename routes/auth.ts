import passport from "passport";
import * as AuthController from "../controllers/authController";
import {Router} from "express";

const router = Router();

router.get('/sign-up', AuthController.sign_up_get);
router.post('/sign-up', AuthController.sign_up_post);
router.get('/login', AuthController.login_get);
router.post('/login/auth', AuthController.login_auth_post);
router.get('/log-out', AuthController.log_out_get);
export default router;