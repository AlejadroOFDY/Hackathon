import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { generateToken } from "../helpers/jwt.helpers.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helpers.js";

export const register = async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    first_name,
    last_name,
    establishmentLocation,
    establishmentLat,
    establishmentLng,
  } = req.body;
  try {
    const hashedPassword = await hashPassword(password);

    const existingUser = await UserModel.findOne({
      where: { username: username },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Ya existe un usuario con este nombre de usuario" });
    }

    const existingEmail = await UserModel.findOne({ where: { email: email } });

    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Ya existe un usuario con este email" });
    }

    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role,
      establishmentLocation,
      establishmentLat,
      establishmentLng,
    });

    await ProfileModel.create({
      user_id: user.id,
      first_name,
      last_name,
    });
    return res.status(201).json({ message: "Usuario creado existosamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "No se pudo crear el usuario" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({
      where: { username: username },
      include: {
        model: ProfileModel,
        as: "profile",
        attributes: ["first_name", "last_name"],
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = generateToken(user);

    // Configuración de cookie para entornos locales y producción
    const cookieOptions = {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hora
      // En producción queremos permitir envío cross-site (SameSite=None) y Secure=true
      // En desarrollo mantenemos SameSite=lax para evitar problemas con http
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    };

  res.cookie("token", token, cookieOptions);

  // Además devolvemos el token en el body como fallback para entornos de desarrollo
  // donde las cookies cross-site pueden ser bloqueadas por el navegador.
  return res.status(200).json({ message: "Login existoso", token });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message, message: "No se pudo ingresar" });
  }
};

export const logout = (req, res) => {
  // Limpiar cookie usando mismas opciones (sin value)
  const cookieOptions = {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "Logout exitoso" });
};

// Devuelve el usuario autenticado (sin password)
export const me = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    // Excluir password si por alguna razón está presente
    const safe = { ...user.toJSON() };
    delete safe.password;
    return res.status(200).json(safe);
  } catch (error) {
    return res.status(500).json({ message: 'Error interno' });
  }
};
