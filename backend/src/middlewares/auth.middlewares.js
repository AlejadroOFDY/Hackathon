import { verifyToken } from "../helpers/jwt.helpers.js";
import { UserModel } from "../models/user.model.js";

/*Este Middleware va verificar la autenticación del usuario mediante JWT Extrae el token de las cookies, lo verifica y adjunta el usuario a la request
 */

export const authMiddleware = async (req, res, next) => {
  try {
    // Sacamos el token preferentemente de las cookies (httpOnly)
    // Si no está disponible (p. ej. CORS/cookie bloqueada), aceptamos también
    // el header Authorization: Bearer <token> como fallback (útil para dev)
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    if (!token) {
      return res
        .status(401)
        .json({ message: "Acceso Denegado, token no encontrado" });
    }
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Token inválido" });
    }
    // Busca al Usuario en la BD con el token
    const user = await UserModel.findByPk(decoded.id, {
      attributes: { exclude: "password" },
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Agregamos al usuario a la request para que esté disponible en los otros middlewares
    req.user = user;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Error interno del servidor" });
  }
};
