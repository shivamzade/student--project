import express from "express";
import cors from "cors";
import studentRoutes from "./routes/student.routes.js";
import markRoutes from "./routes/mark.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/marks", markRoutes);

export default app;