import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { start_DB } from "./src/config/database.js";
import userRoute from "./src/routes/user.routes.js";
import profileRoute from "./src/routes/profile.routes.js";
import authRoute from "./src/routes/auth.routes.js";
import plotRoute from "./src/routes/plot.routes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:5173', // Vite / dev
        'http://localhost:5500', // http-server
        'http://127.0.0.1:5500'
      ];
      // allow requests with no origin (e.g. curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowed.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/", userRoute);
app.use("/api/", profileRoute);
app.use("/api", authRoute);
app.use("/api/", plotRoute);

app.listen(PORT, async () => {
  await start_DB(), console.log(`Servidor corriendo en: localhost ${PORT}`);
  console.log("---------------------------------------------------");
  console.log("---------------------------------------------------");
  console.log("---------------------------------------------------");
  console.log("Lo nuevo va acá abajo: ↓↓↓↓↓");
});
