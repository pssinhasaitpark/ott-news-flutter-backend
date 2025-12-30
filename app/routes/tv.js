import express from "express";
import { getTVShows } from "../controllers/tv.js";
import { tvSaveValidator } from "../validators/tvSave.js";
import { toggleTVSave, getMySavedTV, } from "../controllers/tv.js";
import auth from "../middlewares/auth.js";
import validate from "../middlewares/validator.js";


const router = express.Router();

router.get("/", getTVShows);
router.post("/save", auth, tvSaveValidator, validate, toggleTVSave);
router.get("/saved", auth, getMySavedTV);

export default router;
