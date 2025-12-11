/**
 * Controlador de autenticación
 * Contiene la lógica de negocio para registro, login y gestión de usuarios
 */
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generar token JWT
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

/**
 * Registrar nuevo usuario
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "Este email ya está registrado",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: "user",
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({
            success: false,
            message: "Error al registrar usuario",
        });
    }
};

/**
 * Iniciar sesión
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
            });
        }

        // Actualizar estado online
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            success: false,
            message: "Error al iniciar sesión",
        });
    }
};

/**
 * Obtener usuario actual
 * @route GET /api/auth/me
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isOnline: user.isOnline,
            },
        });
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener información del usuario",
        });
    }
};

/**
 * Cerrar sesión
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            isOnline: false,
            lastSeen: new Date(),
        });

        res.json({
            success: true,
            message: "Sesión cerrada correctamente",
        });
    } catch (error) {
        console.error("Error en logout:", error);
        res.status(500).json({
            success: false,
            message: "Error al cerrar sesión",
        });
    }
};

/**
 * Actualizar perfil del usuario
 * @route PATCH /api/auth/me
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, password, currentPassword } = req.body;

        const user = await User.findById(req.user.id).select("+password");

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Usuario no encontrado" });
        }

        if (name) user.name = name;

        // Cambio de contraseña
        if (password) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Se requiere la contraseña actual para cambiar la contraseña",
                });
            }

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ success: false, message: "Contraseña actual incorrecta" });
            }

            user.password = password;
        }

        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res
            .status(500)
            .json({ success: false, message: "Error al actualizar perfil" });
    }
};
