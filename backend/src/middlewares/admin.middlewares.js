export const adminMiddleware = (req, res, next) => {
  try {
    // En este punto el usuario ya está en la request por authMiddleware
    // Verifica si el rol es admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "El usuario no tiene los permisos adecuados" });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Error interno del servidor" });
  }
};
