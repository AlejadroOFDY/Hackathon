import jwt from "jsonwebtoken";

// Crea el token
export const generateToken = (user) => {
  try {
    const payload = {
      id: user.id,
      username: user.username,
      //   role: user.role,
      //   first_name: user.profile.first_name,
      //   last_name: user.profile.last_name,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  } catch (error) {
    throw new Error("No se pudo generar el token" + error.message);
  }
};
// Verifica el token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("No se pudo verificar el token", error.message);
  }
};
