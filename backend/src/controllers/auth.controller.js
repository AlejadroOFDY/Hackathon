import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { generateToken } from "../helpers/jwt.helpers.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helpers.js";

export const register = async (req, res) => {
  const { username, email, password, role, first_name, last_name } = req.body;
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

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // El token va a durar 1 hora
    });

    return res.status(200).json({ message: "Login existoso" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message, message: "No se pudo ingresar" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token"); // Eliminará la cookie
  return res.json({ message: "Logout exitoso" });
};
