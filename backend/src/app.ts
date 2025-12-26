import express from "express";
import cors from "cors";
import path from "path";
import contentRoutes from "./routes/content";
import productRoutes from "./routes/products";
import adminRoutes from "./routes/admin/index";

const app = express();

app.use(cors());
app.use(express.json());

/* GLOBAL STATIC UPLOADS */
app.use(
  "/api/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

/* OPTIONAL: spesifik path lama tetap aman */
app.use(
  "/api/uploads/images",
  express.static(path.join(process.cwd(), "uploads/images"))
);

app.use(
  "/api/uploads/bg-catalog",
  express.static(path.join(process.cwd(), "uploads/bg-catalog"))
);

app.use(
  "/api/uploads/size-guide",
  express.static(path.join(process.cwd(), "uploads/size-guide"))
);

/* API ROUTES */
app.use("/api/content", contentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

export default app;