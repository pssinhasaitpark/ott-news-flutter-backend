import { body } from "express-validator";

export const likeValidator = [
  body("movieId")
    .notEmpty()
    .withMessage("movieId is required")
    .isNumeric()
    .withMessage("movieId must be a number"),
]; 