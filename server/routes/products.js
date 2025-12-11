const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const Category = require("../models/Category");
const multer = require("multer");
const { cloudinary, storage } = require("../config/cloudinary");
const { enrichProductWithMetrics } = require("../utils/reviewUtils");
const { validate, productSchema, reviewSchema } = require("../validators/schemas");

// Validación y límites: solo imágenes, max 2MB por archivo
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de archivo no permitido. Solo JPEG/PNG/WebP/GIF."));
};

const upload = multer({
  storage, // Ahora usa Cloudinary storage
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
});

// @route   GET /api/products
// @desc    Obtener todos los productos
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { search, sort = "-createdAt" } = req.query;

    const query = {};

    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .sort(sort)
      .populate("createdBy", "name")
      .populate("categoryId", "name slug");

    // Usar utilidad DRY para enriquecer con métricas de reviews
    const enriched = products.map(enrichProductWithMetrics);

    res.json({
      success: true,
      count: products.length,
      products: enriched,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
    });
  }
});

// @route   GET /api/products/:id
// @desc    Obtener un producto por ID
// @access  Public
// NOTE: category-specific route must be declared before the generic '/:id' route
// @route   GET /api/products/category/:slug
// @desc    Obtener productos por slug de categoría
// @access  Public
router.get("/category/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    // Verificación null para evitar crash
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    // Buscar por categoryId (ya no usamos el campo legacy `category`)
    const query = { categoryId: category._id };

    const products = await Product.find(query)
      .populate("createdBy", "name")
      .populate("categoryId", "name slug");

    // Usar utilidad DRY para enriquecer con métricas de reviews
    const enriched = products.map(enrichProductWithMetrics);

    res.json({ success: true, count: products.length, products: enriched });
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos por categoría",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("categoryId", "name slug")
      .populate("reviews.user", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Usar utilidad DRY para enriquecer con métricas de reviews
    res.json({
      success: true,
      product: enrichProductWithMetrics(product),
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto",
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Añadir una valoración/review a un producto (title, comment, rating)
// @access  Private (usuarios autenticados, no admin)
router.post("/:id/reviews", protect, validate(reviewSchema), async (req, res) => {
  try {
    const { title, comment, rating } = req.body;
    // La validación de campos ya está hecha por Joi

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Rating debe ser un entero entre 1 y 5",
        });
    }

    // No permitir que administradores añadan reviews
    if (req.user && req.user.role === "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Administradores no pueden dejar valoraciones",
        });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    // Evitar que un mismo usuario publique más de una review: debe editar o borrar la anterior
    const existing = (product.reviews || []).find(
      (r) => r.user && r.user.toString() === req.user.id.toString()
    );
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Ya has dejado una valoración en este producto. Edita o elimina tu valoración para publicar otra.",
        });
    }

    // Crear review
    const review = {
      user: req.user.id,
      title: String(title).trim(),
      comment: String(comment).trim(),
      rating: numericRating,
    };

    product.reviews = product.reviews || [];
    product.reviews.push(review);
    await product.save();

    // Devolver el producto actualizado con reviews pobladas y métricas
    const updated = await Product.findById(product._id)
      .populate("createdBy", "name email")
      .populate("categoryId", "name slug")
      .populate("reviews.user", "name email");

    res
      .status(201)
      .json({
        success: true,
        product: enrichProductWithMetrics(updated),
      });
  } catch (error) {
    console.error("Error al añadir review:", error);
    res.status(500).json({ success: false, message: "Error al añadir review" });
  }
});

// @route   PUT /api/products/:id/reviews/:reviewId
// @desc    Editar una review propia
// @access  Private (propietario de la review)
router.put("/:id/reviews/:reviewId", protect, async (req, res) => {
  try {
    const { title, comment, rating } = req.body;
    const numericRating =
      rating !== undefined ? parseInt(rating, 10) : undefined;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });

    const review =
      (product.reviews || []).id(req.params.reviewId) ||
      (product.reviews || []).find(
        (r) => r._id && r._id.toString() === req.params.reviewId
      );
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review no encontrada" });

    if (review.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "No tienes permiso para editar esta review",
        });
    }

    if (title !== undefined) review.title = String(title).trim();
    if (comment !== undefined) review.comment = String(comment).trim();
    if (numericRating !== undefined) {
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5)
        return res
          .status(400)
          .json({
            success: false,
            message: "Rating debe ser un entero entre 1 y 5",
          });
      review.rating = numericRating;
    }

    await product.save();

    const updated = await Product.findById(product._id)
      .populate("createdBy", "name email")
      .populate("categoryId", "name slug")
      .populate("reviews.user", "name email");

    res.json({
      success: true,
      product: enrichProductWithMetrics(updated),
    });
  } catch (error) {
    console.error("Error editing review:", error);
    res.status(500).json({ success: false, message: "Error al editar review" });
  }
});

// @route   DELETE /api/products/:id/reviews/:reviewId
// @desc    Eliminar una review propia
// @access  Private (propietario de la review)
router.delete("/:id/reviews/:reviewId", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });

    const review =
      (product.reviews || []).id(req.params.reviewId) ||
      (product.reviews || []).find(
        (r) => r._id && r._id.toString() === req.params.reviewId
      );
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review no encontrada" });

    if (review.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "No tienes permiso para eliminar esta review",
        });
    }

    // remover la review
    product.reviews = (product.reviews || []).filter(
      (r) => !(r._id && r._id.toString() === req.params.reviewId)
    );
    await product.save();

    const updated = await Product.findById(product._id)
      .populate("createdBy", "name email")
      .populate("categoryId", "name slug")
      .populate("reviews.user", "name email");

    res.json({
      success: true,
      product: enrichProductWithMetrics(updated),
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar review" });
  }
});

// @route   POST /api/products
// @desc    Crear nuevo producto (acepta imágenes multipart/form-data)
// @access  Private/Admin
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  async (req, res) => {
    try {
      // Construir datos del producto y parsear campos comunes
      const productData = {
        ...req.body,
        createdBy: req.user.id,
      };

      if (productData.price) productData.price = parseFloat(productData.price);
      if (productData.stock)
        productData.stock = parseInt(productData.stock, 10);

      if (productData.materials && typeof productData.materials === "string") {
        productData.materials = productData.materials
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);
      }

      if (req.files && req.files.length > 0) {
        // Cloudinary devuelve directamente las URLs en file.path
        productData.images = req.files.map((f) => f.path);
      }

      let product = await Product.create(productData);
      product = await Product.findById(product._id)
        .populate("createdBy", "name")
        .populate("categoryId", "name slug");

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear producto",
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Actualizar producto
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  async (req, res) => {
    try {
      let product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      // Si vienen archivos nuevos, reemplazamos las imágenes y borramos las anteriores
      // Manejo avanzado de imágenes: el cliente puede enviar keepImages (array de URLs que quiere conservar)
      // y además archivos nuevos en req.files. Eliminamos solo las imágenes que el cliente no quiera conservar.
      let keepImages = [];
      if (req.body.keepImages) {
        try {
          // puede venir como JSON string o como array ya parseado
          keepImages =
            typeof req.body.keepImages === "string"
              ? JSON.parse(req.body.keepImages)
              : req.body.keepImages;
        } catch (err) {
          keepImages = [];
        }
      }

      // Determinar qué imágenes eliminar (las que están en product.images y no en keepImages)
      const toDelete = (product.images || []).filter(
        (img) => !keepImages.includes(img)
      );
      if (toDelete.length > 0) {
        // Eliminar de Cloudinary usando el public_id extraído de la URL
        for (const imgUrl of toDelete) {
          try {
            // Extraer public_id de la URL de Cloudinary
            // Ejemplo: https://res.cloudinary.com/demo/image/upload/v123456/creative-hands/products/abc123.jpg
            // public_id sería: creative-hands/products/abc123
            const matches = imgUrl.match(/\/creative-hands\/products\/([^/.]+)/);
            if (matches && matches[0]) {
              const publicId = matches[0].substring(1); // Remover el / inicial
              await cloudinary.uploader.destroy(publicId);
            }
          } catch (err) {
            console.warn("Warning al borrar imagen de Cloudinary:", err.message);
          }
        }
      }

      // Construir la lista final de imágenes teniendo en cuenta un posible 'order' enviado por el cliente.
      // Si el cliente envía `order` (array) puede mezclar URLs existentes y placeholders '__new__' para archivos subidos.
      const newFiles = req.files && req.files.length > 0 ? req.files : [];

      let finalImages = [];
      if (req.body.order) {
        let orderArr = [];
        try {
          orderArr =
            typeof req.body.order === "string"
              ? JSON.parse(req.body.order)
              : req.body.order;
        } catch (err) {
          orderArr = [];
        }

        let newIdx = 0;
        for (const entry of orderArr) {
          if (entry === "__new__") {
            if (newFiles[newIdx]) {
              // Cloudinary devuelve la URL en file.path
              finalImages.push(newFiles[newIdx].path);
              newIdx++;
            }
          } else if (typeof entry === "string") {
            finalImages.push(entry);
          }
        }
      } else {
        const newUploaded =
          newFiles.length > 0 ? newFiles.map((f) => f.path) : [];
        finalImages = [
          ...(Array.isArray(keepImages) ? keepImages : []),
          ...newUploaded,
        ];
      }

      req.body.images = finalImages;

      // parsear campos numéricos y arrays que vengan en body
      if (req.body.price) req.body.price = parseFloat(req.body.price);
      if (req.body.stock) req.body.stock = parseInt(req.body.stock, 10);
      if (req.body.materials && typeof req.body.materials === "string") {
        req.body.materials = req.body.materials
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);
      }

      product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      product = await Product.findById(product._id)
        .populate("createdBy", "name")
        .populate("categoryId", "name slug");

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar producto",
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Eliminar producto
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // eliminar imágenes asociadas de Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        try {
          // Extraer public_id de la URL de Cloudinary
          const matches = imgUrl.match(/\/creative-hands\/products\/([^/.]+)/);
          if (matches && matches[0]) {
            const publicId = matches[0].substring(1);
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.warn("Warning al borrar imagen en delete:", err.message);
        }
      }
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
    });
  }
});

// @route DELETE /api/products/:id/images
// @desc  Eliminar una imagen concreta asociada al producto
// @access Private/Admin
router.delete("/:id/images", protect, adminOnly, async (req, res) => {
  try {
    const { image } = req.body; // URL completa de la imagen
    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Falta el parámetro 'image'" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    // Si la imagen no está en la lista, nada que hacer
    if (!product.images || !product.images.includes(image)) {
      return res
        .status(400)
        .json({ success: false, message: "Imagen no asociada al producto" });
    }

    // Borrar archivo de Cloudinary si existe
    try {
      const matches = image.match(/\/creative-hands\/products\/([^/.]+)/);
      if (matches && matches[0]) {
        const publicId = matches[0].substring(1);
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.warn("Warning al borrar imagen (del endpoint):", err.message);
    }

    // Quitar de la lista y guardar
    product.images = product.images.filter((u) => u !== image);
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar imagen" });
  }
});

// @route   GET /api/products/categories/list
// @desc    Obtener lista de categorías (legacy path) - lee desde DB si está disponible
// @access  Public
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Error al obtener lista de categorías:", error);
    // fallback a lista hardcodeada si algo falla
    const fallback = [
      "Joyería artesanal",
      "Velas y aromáticos",
      "Textiles y ropa",
      "Cerámica y arcilla",
      "Arte hecho a mano",
    ];
    res.json({ success: true, categories: fallback });
  }
});

module.exports = router;
