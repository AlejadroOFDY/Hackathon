import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { start_DB } from "./src/config/database.js";
import userRoute from "./src/routes/user.routes.js";
import profileRoute from "./src/routes/profile.routes.js";
import authRoute from "./src/routes/auth.routes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// ==== CORS (lista blanca) ====
const allowedOrigins = [
  "http://localhost:5173",   // Vite / http-server en 5173
  "http://127.0.0.1:5500",   // Live Server por IP
  "http://localhost:5500",   // Live Server por hostname
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permite tools sin Origin (Postman/curl) o si el origin está en la whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true, // mantenemos cookies/sesiones habilitadas
};

app.use(cors(corsOptions));
// Preflight (OPTIONS) para /api/* usando REGEX (evita path-to-regexp)
app.options(/^\/api\/.*$/, cors(corsOptions));
// =============================

app.use(cookieParser());

// Rutas
app.use("/api/", userRoute);
app.use("/api/", profileRoute);
app.use("/api", authRoute);

// ==== Manejador global de errores (siempre JSON) ====
// Colocalo DESPUÉS de las rutas y ANTES del listen
app.use((err, req, res, next) => {
  // Log para backend
  console.error("ERROR:", err);

  // Si ya se envió cabecera, delega
  if (res.headersSent) return next(err);

  // Estado: usa el que venga, o 500 por defecto
  const status = err.status || err.statusCode || 500;

  // Mensaje seguro
  const message =
    typeof err === "string"
      ? err
      : err?.message || "Internal Server Error";

  // Respuesta consistente en JSON
  res.status(status).json({
    message,
    // Opcional en dev: detalles para depurar (podés sacar esto en prod)
    // stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
  });
});
// ====================================================

app.listen(PORT, async () => {
  await start_DB(), console.log(`Servidor corriendo en: localhost ${PORT}`);
  console.log("---------------------------------------------------");
  console.log("---------------------------------------------------");
  console.log("---------------------------------------------------");
  console.log("Lo nuevo va acá abajo: ↓↓↓↓↓");
});
