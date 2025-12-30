import { body } from "express-validator";

export const tvLikeValidator = [
  body("tvId")
    .notEmpty()
    .withMessage("tvId is required")
    .isNumeric()
    .withMessage("tvId must be a number"),
];
