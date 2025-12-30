import express from "express";
import auth from "../middlewares/auth.js";
import { getMovies, toggleSaveMovie, getMySavedMovies, getMovieVideos } from "../controllers/movie.js";
import { movieSaveValidator } from "../validators/movieSave.js";
import validate from "../middlewares/validator.js";

const router = express.Router();

router.get("/", getMovies);
router.post("/save", auth, movieSaveValidator, validate, toggleSaveMovie);
router.get("/saved", auth, getMySavedMovies);
router.get("/:movieId/videos", getMovieVideos);

export default router;
