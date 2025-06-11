import { Router } from 'express';
import {
  createPost,
  getUserPost,
  updatePost,
  deletePost
} from "../controllers/communityPost.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); 

router.route("/").post(createPost);
router.route("/user/:postId").get(getUserPost);
router.route("/:postId").patch(updatePost).delete(deletePost);

export default router