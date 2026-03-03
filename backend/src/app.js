import express from "express";
import cors from "cors";
import memberRoutes from "./routes/member.routes.js";
import markRoutes from "./routes/mark.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/members", memberRoutes);
app.use("/api/marks", markRoutes);

export default app;
