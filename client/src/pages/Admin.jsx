import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Package,
  X,
  Save,
  Loader,
  Upload,
  GripVertical,
  Star,
  ShoppingCart,
} from "lucide-react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import AdminChat from "../components/AdminChat";
import AdminOrders from "../components/AdminOrders";

const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    materials: "",
  });
  // imageList mantiene el orden actual de miniaturas (mezcla de existentes y nuevas)
  // item: { id: string, type: 'existing'|'new', url: string, file?: File }
  const [imageList, setImageList] = useState([]);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  const draggedIdRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingFromList, setEditingFromList] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/products");
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/products");
      setProducts(data.products);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId
          ? product.categoryId._id || product.categoryId
          : "",
        stock: product.stock,
        materials: product.materials?.join(", ") || "",
      });
      // populate imageList with existing images
      setImageList(
        product.images && product.images.length > 0
          ? product.images.map((url, idx) => ({
            id: `e-${idx}-${Date.now()}`,
            type: "existing",
            url,
          }))
          : []
      );
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stock: "",
        materials: "",
      });
      setImageList([]);
    }
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    // limpiar previews y revocar URLs
    imageList.forEach((it) => {
      if (it.type === "new" && it.url) URL.revokeObjectURL(it.url);
    });
    setImageList([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "categoryId") {
      // when selecting a category by id, keep the selected id only
      setFormData({
        ...formData,
        categoryId: value,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Usar FormData para enviar archivos si hay imágenes
      let response;
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("categoryId", formData.categoryId);
      fd.append("stock", formData.stock);
      fd.append("materials", formData.materials);

      // Si estamos editando, enviar la lista de imágenes que queremos mantener
      if (editingProduct) {
        const keepImages = imageList
          .filter((it) => it.type === "existing")
          .map((it) => it.url);
        fd.append("keepImages", JSON.stringify(keepImages));

        // Build an order array mixing existing urls and placeholders for new files
        const order = imageList.map((it) =>
          it.type === "existing" ? it.url : "__new__"
        );
        fd.append("order", JSON.stringify(order));

        // Append new files in the sequence they appear in imageList so server can map '__new__' placeholders
        for (const it of imageList) {
          if (it.type === "new" && it.file) fd.append("images", it.file);
        }
      } else {
        // creating new product -> append all new files in their current order
        for (const it of imageList) {
          if (it.type === "new" && it.file) fd.append("images", it.file);
        }
      }

      if (editingProduct) {
        response = await api.put(`/api/products/${editingProduct._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProducts(
          products.map((p) =>
            p._id === editingProduct._id ? response.data.product : p
          )
        );
      } else {
        response = await api.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProducts([response.data.product, ...products]);
      }

      // limpiar previews locales
      imageList.forEach((it) => {
        if (it.type === "new" && it.url) URL.revokeObjectURL(it.url);
      });
      setImageList([]);
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const errors = [];

    const validFiles = [];
    files.forEach((file) => {
      if (!allowed.includes(file.type)) {
        errors.push(`${file.name}: tipo no permitido`);
        return;
      }
      if (file.size > maxSize) {
        errors.push(`${file.name}: excede 2MB`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) setFileErrors((prev) => [...prev, ...errors]);

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    // crear previews como items 'new' y añadir al final del imageList
    const previews = validFiles.map((file, idx) => ({
      id: `n-${Date.now()}-${idx}`,
      type: "new",
      url: URL.createObjectURL(file),
      file,
    }));

    setImageList((prev) => [...prev, ...previews]);
    // reset input value to allow selecting same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // keep active
    setDragActive(true);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    // reuse logic from onFilesSelected by building a fake event
    const fakeEvent = { target: { files } };
    onFilesSelected(fakeEvent);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const removeImage = (id) => {
    const item = imageList.find((it) => it.id === id);
    if (!item) return;

    if (item.type === "existing") {
      if (!editingProduct) {
        setImageList((prev) => prev.filter((it) => it.id !== id));
        return;
      }

      if (
        !window.confirm(
          "¿Eliminar esta imagen? Esta acción borrará el archivo del servidor."
        )
      )
        return;

      (async () => {
        try {
          const { data } = await api.delete(
            `/api/products/${editingProduct._id}/images`,
            {
              data: { image: item.url },
            }
          );
          if (data && data.success) {
            setImageList((prev) => prev.filter((it) => it.id !== id));
            setProducts((prev) =>
              prev.map((p) => (p._id === data.product._id ? data.product : p))
            );
          } else {
            alert(data.message || "No se pudo eliminar la imagen");
          }
        } catch (error) {
          console.error("Error al eliminar imagen:", error);
          alert(error.response?.data?.message || "Error al eliminar imagen");
        }
      })();
    } else {
      // nueva imagen local
      if (item.url) URL.revokeObjectURL(item.url);
      setImageList((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const onThumbDragStart = (e, id) => {
    draggedIdRef.current = id;
    try {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    } catch (err) {
      // some browsers in React synthetic events may throw; ignore
    }
  };

  const onThumbDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onThumbDrop = (e, targetId) => {
    e.preventDefault();
    const fromId = draggedIdRef.current || e.dataTransfer.getData("text/plain");
    if (!fromId || fromId === targetId) return;
    // reorder
    setImageList((prev) => {
      const arr = [...prev];
      const fromIndex = arr.findIndex((it) => it.id === fromId);
      const toIndex = arr.findIndex((it) => it.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
    draggedIdRef.current = null;
  };

  const onThumbDragEnd = () => {
    draggedIdRef.current = null;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await api.delete(`/api/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  const handleOpenCategoryModal = () => {
    setNewCategory({ name: "", slug: "", description: "" });
    setShowCategoryModal(true);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newCategory };
      const { data } = await api.post("/api/categories", payload);
      // refresh categories
      fetchCategories();
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error al crear categoría:", error);
      alert(error.response?.data?.message || "Error al crear categoría");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (
      !window.confirm(
        "¿Eliminar esta categoría? Los productos pueden quedarse con category legacy."
      )
    )
      return;
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert(error.response?.data?.message || "Error al eliminar categoría");
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategoryId(cat._id);
    setEditingCategoryData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
    });
    // If the list modal is open, close it first so the edit modal doesn't appear behind due
    // to stacking contexts/animations. Re-open the list when editing finishes if needed.
    if (showCategoryModal) {
      setEditingFromList(true);
      setShowCategoryModal(false);
      // wait a short moment to let the exit animation start/stacking contexts settle
      setTimeout(() => setShowEditCategoryModal(true), 120);
    } else {
      setShowEditCategoryModal(true);
    }
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryData({ name: "", slug: "", description: "" });
    setShowEditCategoryModal(false);
    if (editingFromList) {
      // restore the categories modal that the user came from
      setShowCategoryModal(true);
      setEditingFromList(false);
    }
  };

  const saveEditCategory = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `/api/categories/${editingCategoryId}`,
        editingCategoryData
      );
      fetchCategories();
      cancelEditCategory();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      alert(error.response?.data?.message || "Error al actualizar categoría");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/categories");
      setCategoriesList(data.categories || []);
    } catch (error) {
      console.error(
        "Error cargando categorías en admin, usando lista por defecto:",
        error
      );
      setCategoriesList([
        { _id: "", name: "Joyería artesanal", slug: "joyeria-artesanal" },
        { _id: "", name: "Velas y aromáticos", slug: "velas-y-aromaticos" },
        { _id: "", name: "Textiles y ropa", slug: "textiles-y-ropa" },
        { _id: "", name: "Cerámica y arcilla", slug: "ceramica-y-arcilla" },
        { _id: "", name: "Arte hecho a mano", slug: "arte-hecho-a-mano" },
      ]);
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-br from-light-500 via-primary-50 to-light-500 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Panel de <span className="gradient-text">Administración</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Gestiona productos y conversaciones con clientes
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-200 min-h-[48px] text-base ${activeTab === "products"
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
              : "glass text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
          >
            <Package className="w-5 h-5" />
            <span>Productos</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-200 min-h-[48px] text-base ${activeTab === "chat"
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
              : "glass text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Conversaciones</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-200 min-h-[48px] text-base ${activeTab === "orders"
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
              : "glass text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Pedidos</span>
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Add Product Button */}
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenModal()}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-200 min-h-[48px] text-base"
                  style={{ willChange: "transform" }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Nuevo Producto</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOpenCategoryModal}
                  className="flex items-center justify-center space-x-2 px-4 py-3 glass rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:shadow-md transition-shadow duration-200 min-h-[48px] text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gestionar categorías</span>
                </motion.button>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="w-12 h-12 text-primary-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      isAdmin={true}
                      hideDetails={true}
                      onEdit={handleOpenModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AdminChat />
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AdminOrders />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Category Modal */}
        <AnimatePresence>
          {showEditCategoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => cancelEditCategory()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-3xl p-6 max-w-md w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Editar categoría
                  </h3>
                  <button
                    onClick={() => cancelEditCategory()}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <form onSubmit={saveEditCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre
                    </label>
                    <input
                      value={editingCategoryData.name}
                      onChange={(e) =>
                        setEditingCategoryData({
                          ...editingCategoryData,
                          name: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Slug
                    </label>
                    <input
                      value={editingCategoryData.slug}
                      onChange={(e) =>
                        setEditingCategoryData({
                          ...editingCategoryData,
                          slug: e.target.value,
                        })
                      }
                      placeholder="auto"
                      className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descripción
                    </label>
                    <textarea
                      value={editingCategoryData.description}
                      onChange={(e) =>
                        setEditingCategoryData({
                          ...editingCategoryData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => cancelEditCategory()}
                      className="px-4 py-2 rounded-xl glass text-gray-700 dark:text-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-primary-500 text-white"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Modal */}
        <AnimatePresence>
          {showProductModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Precio (€)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    >
                      <option value="">-- Seleccionar categoría --</option>
                      {categoriesList.map((cat) => (
                        <option
                          key={cat._id || cat.slug || cat.name}
                          value={cat._id || cat.slug || cat.name}
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Materiales (separados por coma)
                    </label>
                    <input
                      type="text"
                      name="materials"
                      value={formData.materials}
                      onChange={handleChange}
                      placeholder="Ej: Cerámica, Arcilla, Esmalte"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Imágenes del producto
                    </label>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onFilesSelected}
                      className="hidden"
                    />

                    {/* Dropzone / selector estilizado */}
                    <div
                      onClick={triggerFileInput}
                      onDragEnter={onDragEnter}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      className={`w-full cursor-pointer rounded-xl border-2 border-dashed p-4 flex items-center gap-4 ${dragActive
                        ? "border-primary-500 bg-primary-50/40 dark:bg-primary-900/20"
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        }`}
                    >
                      <div className="p-3 rounded-lg bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-white">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Añadir imágenes
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {dragActive
                            ? "Suelta para subir"
                            : "Haz click para seleccionar o arrastra los archivos aquí"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {imageList.length > 0
                            ? `${imageList.length} imagen(es) seleccionadas — arrastra las miniaturas para reordenar`
                            : "Puedes seleccionar varias imágenes (máx. 5)"}
                        </div>
                      </div>
                      <div className="ml-2 hidden sm:flex items-center text-xs text-gray-500 dark:text-gray-300">
                        <span className="px-2 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full">
                          Arrastra para reordenar
                        </span>
                      </div>
                    </div>

                    {/* file errors */}
                    {fileErrors.length > 0 && (
                      <div className="mt-2 text-sm text-red-500">
                        {fileErrors.map((err, i) => (
                          <div key={i}>{err}</div>
                        ))}
                      </div>
                    )}

                    {/* Thumbnails: mezcla de imágenes existentes y nuevas (reordenables) */}
                    {imageList && imageList.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {imageList.map((it) => (
                          <motion.div
                            key={it.id}
                            layout
                            draggable
                            onDragStart={(e) => onThumbDragStart(e, it.id)}
                            onDragOver={onThumbDragOver}
                            onDrop={(e) => onThumbDrop(e, it.id)}
                            onDragEnd={onThumbDragEnd}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-move shadow-sm"
                          >
                            {/* drag handle */}
                            <div className="absolute left-2 top-2 text-white/90 dark:text-white/90">
                              <GripVertical className="w-4 h-4 opacity-90" />
                            </div>

                            <img
                              src={it.url}
                              alt={
                                it.type === "new"
                                  ? it.file?.name || "preview"
                                  : "img"
                              }
                              className="w-full h-24 object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => removeImage(it.id)}
                              className="absolute top-2 right-2 bg-black/40 dark:bg-white/10 text-white dark:text-white p-1 rounded-full hover:bg-red-500"
                              aria-label="Eliminar imagen"
                            >
                              <X className="w-3 h-3" />
                            </button>

                            <div className="absolute left-2 bottom-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded">
                              {it.type === "existing"
                                ? "Subida"
                                : it.file?.name || "Nuevo"}
                            </div>

                            {/* badge principal para la primera miniatura */}
                            {imageList[0] && imageList[0].id === it.id && (
                              <div className="absolute right-2 bottom-2 flex items-center gap-1 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded">
                                <Star className="w-3 h-3" />
                                <span>Principal</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    {/* Campo 'Producto destacado' eliminado — el control de admin queda centralizado en la pestaña Admin principal */}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      style={{ willChange: "transform" }}
                    >
                      {saving ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>{editingProduct ? "Actualizar" : "Crear"}</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-3 glass rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:shadow-md transition-shadow duration-200"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Modal */}
        <AnimatePresence>
          {showCategoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCategoryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-3xl p-6 max-w-lg w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Crear categoría
                  </h3>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Categorías existentes
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categoriesList.map((cat) => (
                        <div
                          key={cat._id || cat.slug || cat.name}
                          className="p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 flex items-center justify-between gap-4 overflow-hidden"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {cat.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {cat.slug}
                            </div>
                            {cat.description ? (
                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                                {cat.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => startEditCategory(cat)}
                              className="px-3 py-1 glass rounded-md text-gray-700 dark:text-gray-300"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre
                      </label>
                      <input
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Slug (opcional)
                      </label>
                      <input
                        value={newCategory.slug}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            slug: e.target.value,
                          })
                        }
                        placeholder="auto"
                        className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción (opcional)
                      </label>
                      <textarea
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(false)}
                        className="px-4 py-2 rounded-xl glass text-gray-700 dark:text-gray-300"
                      >
                        Cerrar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-primary-500 text-white"
                      >
                        Crear
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
