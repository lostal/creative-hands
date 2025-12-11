/**
 * AdminProducts - Product management (CRUD)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { createProduct, updateProduct, deleteProduct } from '../../services/productService';

const AdminProducts = () => {
    const { products, loading, refetch } = useProducts();
    const { categories } = useCategories();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        materials: '',
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            categoryId: '',
            materials: '',
        });
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            categoryId: product.categoryId || '',
            materials: product.materials?.join(', ') || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('stock', formData.stock);
            if (formData.categoryId) data.append('categoryId', formData.categoryId);
            if (formData.materials) {
                formData.materials.split(',').forEach(m => data.append('materials', m.trim()));
            }

            if (editingProduct) {
                await updateProduct(editingProduct._id, data);
            } else {
                await createProduct(data);
            }

            refetch();
            setShowModal(false);
        } catch (err) {
            console.error('Error saving product:', err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await deleteProduct(id);
            refetch();
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-brand text-2xl md:text-3xl text-foreground">Productos</h1>
                <button onClick={openCreateModal} className="btn btn-primary">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Nuevo Producto
                </button>
            </div>

            {/* Products table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-hover border-b border-border">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Producto</th>
                                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Precio</th>
                                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Stock</th>
                                <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3"><div className="h-10 bg-surface-hover rounded animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-16 bg-surface-hover rounded animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-12 bg-surface-hover rounded animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-20 bg-surface-hover rounded animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : products?.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-surface-hover transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md bg-background overflow-hidden flex-shrink-0">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-surface-hover" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                                                    <p className="text-xs text-foreground-tertiary truncate max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-mono text-foreground">{formatPrice(product.price)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-sm font-mono ${product.stock > 0 ? 'text-foreground' : 'text-error'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-1.5 text-foreground-secondary hover:text-foreground transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-1.5 text-foreground-secondary hover:text-error transition-colors ml-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-foreground-secondary">
                                        No hay productos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-modal-backdrop bg-black/50"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-modal w-auto md:w-full md:max-w-lg bg-surface border border-border rounded-lg shadow-xl overflow-auto max-h-[90vh]"
                        >
                            <div className="p-6">
                                <h2 className="font-brand text-xl text-foreground mb-6">
                                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input min-h-[80px]"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Precio (€)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="input"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                className="input"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Categoría</label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="input"
                                        >
                                            <option value="">Sin categoría</option>
                                            {categories?.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">
                                            Materiales <span className="text-foreground-tertiary font-normal">(separados por coma)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.materials}
                                            onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                                            className="input"
                                            placeholder="Cerámica, Madera, ..."
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button type="submit" disabled={formLoading} className="btn btn-primary flex-1">
                                            {formLoading ? 'Guardando...' : 'Guardar'}
                                        </button>
                                        <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProducts;
