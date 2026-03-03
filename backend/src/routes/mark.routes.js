import express from "express";
import { createMark } from "../controllers/mark.controller.js";

const router = express.Router();

router.post("/", createMark);

export default router;