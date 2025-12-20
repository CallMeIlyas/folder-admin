import express from "express";
import cors from "cors";
import path from "path";
import contentRoutes from "./routes/content";
import productRoutes from "./routes/products";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.use("/api/content", contentRoutes);
app.use("/api/products", productRoutes);

export default app;