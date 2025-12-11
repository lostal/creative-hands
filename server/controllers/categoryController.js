/**
 * Controlador de categorías
 * Contiene la lógica de negocio para gestión de categorías
 */
const Category = require("../models/Category");

/**
 * Helper para generar slug
 */
const generateSlug = (str = "") => {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

/**
 * Obtener todas las categorías
 * @route GET /api/categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener categorías" });
  }
};

/**
 * Crear categoría
 * @route POST /api/categories
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "El nombre es obligatorio" });
    }

    const finalSlug = slug && slug.trim() ? slug.trim() : generateSlug(name);

    const exists = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: finalSlug }],
    });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Categoría ya existe" });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      description,
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al crear categoría" });
  }
};

/**
 * Actualizar categoría
 * @route PUT /api/categories/:id
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Categoría no encontrada" });
    }

    // Regenerar slug si se actualiza el nombre sin slug
    if ((!updates.slug || !updates.slug.trim()) && updates.name) {
      updates.slug = generateSlug(updates.name);
    }

    category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, category });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar categoría" });
  }
};

/**
 * Eliminar categoría
 * @route DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Categoría no encontrada" });
    }

    await category.deleteOne();
    res.json({ success: true, message: "Categoría eliminada" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar categoría" });
  }
};
