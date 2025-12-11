/**
 * Controlador de productos
 * Contiene la lógica de negocio para operaciones CRUD de productos
 */
import { Request, Response } from "express";
import { QueryFilter } from "mongoose";
import Product, { IProduct } from "../models/Product";
import Category from "../models/Category";
import { cloudinary } from "../config/cloudinary";
import { enrichProductWithMetrics } from "../utils/reviewUtils";
import { AuthRequest } from "../middleware/auth";
import logger from "../utils/logger";
import { getErrorMessage } from "../utils/errors";

// Fix: Allow files to be object or array to match Express.Request type compatibility
interface MulterRequest extends AuthRequest {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}

/**
 * Obtener todos los productos
 * @route GET /api/products
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, sort = "-createdAt" } = req.query;
    const query: QueryFilter<IProduct> = {};

    if (search) {
      query.$text = { $search: search as string };
    }

    const products = await Product.find(query)
      .sort(sort as string)
      .populate("createdBy", "name")
      .populate("categoryId", "name slug");

    const enriched = products.map(enrichProductWithMetrics);

    res.json({
      success: true,
      count: products.length,
      products: enriched,
    });
  } catch (error) {
    logger.error("Error al obtener productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
    });
  }
};

/**
 * Obtener productos por categoría
 * @route GET /api/products/category/:slug
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    const products = await Product.find({ categoryId: category._id })
      .populate("createdBy", "name")
      .populate("categoryId", "name slug");

    const enriched = products.map(enrichProductWithMetrics);

    res.json({ success: true, count: products.length, products: enriched });
  } catch (error) {
    logger.error("Error al obtener productos por categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos por categoría",
    });
  }
};

/**
 * Obtener un producto por ID
 * @route GET /api/products/:id
 */
export const getProductById = async (req: Request, res: Response) => {
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

    res.json({
      success: true,
      product: enrichProductWithMetrics(product),
    });
  } catch (error) {
    logger.error("Error al obtener producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto",
    });
  }
};

/**
 * Crear nuevo producto
 * @route POST /api/products
 */
export const createProduct = async (req: MulterRequest, res: Response) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user?.id,
    };

    if (productData.price) productData.price = parseFloat(productData.price);
    if (productData.stock) productData.stock = parseInt(productData.stock, 10);

    if (productData.materials && typeof productData.materials === "string") {
      productData.materials = productData.materials
        .split(",")
        .map((m: string) => m.trim())
        .filter(Boolean);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      productData.images = req.files.map((f) => f.path);
    }

    const newProduct = new Product(productData);
    const product = await newProduct.save();
    const populatedProduct = await Product.findById(product._id)
      .populate("createdBy", "name")
      .populate("categoryId", "name slug");

    res.status(201).json({
      success: true,
      product: populatedProduct || product,
    });
  } catch (error: unknown) {
    logger.error("Error al crear producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear producto",
      error: getErrorMessage(error),
    });
  }
};

/**
 * Actualizar producto
 * @route PUT /api/products/:id
 */
export const updateProduct = async (req: MulterRequest, res: Response) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Procesar imágenes a mantener
    let keepImages: string[] = [];
    if (req.body.keepImages) {
      try {
        keepImages =
          typeof req.body.keepImages === "string"
            ? JSON.parse(req.body.keepImages)
            : req.body.keepImages;
      } catch {
        keepImages = [];
      }
    }

    // Eliminar imágenes no conservadas de Cloudinary
    const toDelete = (product.images || []).filter(
      (img) => !keepImages.includes(img),
    );
    for (const imgUrl of toDelete) {
      try {
        const matches = imgUrl.match(/\/creative-hands\/products\/([^/.]+)/);
        if (matches && matches[0]) {
          const publicId = matches[0].substring(1);
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err: unknown) {
        logger.warn(
          "Warning al borrar imagen de Cloudinary:",
          getErrorMessage(err),
        );
      }
    }

    // Construir lista final de imágenes
    const newFiles =
      req.files && Array.isArray(req.files) && req.files.length > 0
        ? req.files
        : [];
    let finalImages: string[] = [];

    if (req.body.order) {
      let orderArr: string[] = [];
      try {
        orderArr =
          typeof req.body.order === "string"
            ? JSON.parse(req.body.order)
            : req.body.order;
      } catch {
        orderArr = [];
      }

      let newIdx = 0;
      for (const entry of orderArr) {
        if (entry === "__new__") {
          const file = newFiles[newIdx];
          if (file) {
            finalImages.push(file.path);
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

    // Parsear campos numéricos
    if (req.body.price) req.body.price = parseFloat(req.body.price);
    if (req.body.stock) req.body.stock = parseInt(req.body.stock, 10);
    if (req.body.materials && typeof req.body.materials === "string") {
      req.body.materials = req.body.materials
        .split(",")
        .map((m: string) => m.trim())
        .filter(Boolean);
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    product = (await Product.findById(product!._id)
      .populate("createdBy", "name")
      .populate("categoryId", "name slug")) as typeof product;

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    logger.error("Error al actualizar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar producto",
    });
  }
};

/**
 * Eliminar producto
 * @route DELETE /api/products/:id
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Eliminar imágenes de Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        try {
          const matches = imgUrl.match(/\/creative-hands\/products\/([^/.]+)/);
          if (matches && matches[0]) {
            const publicId = matches[0].substring(1);
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err: unknown) {
          logger.warn(
            "Warning al borrar imagen en delete:",
            getErrorMessage(err),
          );
        }
      }
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    logger.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
    });
  }
};

/**
 * Eliminar una imagen específica de un producto
 * @route DELETE /api/products/:id/images
 */
export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
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

    if (!product.images || !product.images.includes(image)) {
      return res
        .status(400)
        .json({ success: false, message: "Imagen no asociada al producto" });
    }

    // Borrar de Cloudinary
    try {
      const matches = image.match(/\/creative-hands\/products\/([^/.]+)/);
      if (matches && matches[0]) {
        const publicId = matches[0].substring(1);
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err: unknown) {
      logger.warn(
        "Warning al borrar imagen (del endpoint):",
        getErrorMessage(err),
      );
    }

    product.images = product.images.filter((u) => u !== image);
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    logger.error("Error al eliminar imagen:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar imagen" });
  }
};

/**
 * Obtener lista de categorías (legacy)
 * @route GET /api/products/categories/list
 */
export const getCategoriesList = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort("name");
    res.json({ success: true, categories });
  } catch (error) {
    logger.error("Error al obtener lista de categorías:", error);
    const fallback = [
      "Joyería artesanal",
      "Velas y aromáticos",
      "Textiles y ropa",
      "Cerámica y arcilla",
      "Arte hecho a mano",
    ];
    res.json({ success: true, categories: fallback });
  }
};
