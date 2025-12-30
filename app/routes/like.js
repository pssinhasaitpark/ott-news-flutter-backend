import express from "express";
import auth from "../middlewares/auth.js";
import { toggleMovieLike, getMyLikedMovies, getMoviesLikeCount } from "../controllers/like.js";
import { likeValidator } from "../validators/like.js";
import validate from "../middlewares/validator.js";

const router = express.Router();

router.post("/", auth, likeValidator, validate, toggleMovieLike);
router.get("/", auth, getMyLikedMovies);
router.post("/count", getMoviesLikeCount);

export default router;
