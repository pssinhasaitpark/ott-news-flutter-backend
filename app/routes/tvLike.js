import express from "express";
import auth from "../middlewares/auth.js";
import validate from "../middlewares/validator.js";
import { tvLikeValidator } from "../validators/tvLike.js";
import { toggleTVLike, getMyLikedTV, getTVLikeCount, } from "../controllers/tvLike.js";

const router = express.Router();

router.post("/", auth, tvLikeValidator, validate, toggleTVLike);
router.get("/", auth, getMyLikedTV);
router.post("/count", getTVLikeCount);

export default router;
