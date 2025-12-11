/**
 * ProductDetail Page - Individual product view
 * 
 * Features:
 * - Image gallery with thumbnails
 * - Product info (name, price, description)
 * - Technical specs (materials, dimensions, weight)
 * - Quantity selector and add to cart
 * - Reviews section
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductById, addReview } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart, openCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Review form
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ title: '', comment: '', rating: 5 });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductById(id);
                setProduct(data.product);
            } catch (err) {
                setError(err.response?.data?.message || 'Error al cargar el producto');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product && product.stock > 0) {
            addToCart(product, quantity);
            openCart();
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSubmittingReview(true);
            const data = await addReview(id, reviewForm);
            setProduct(data.product);
            setReviewForm({ title: '', comment: '', rating: 5 });
            setShowReviewForm(false);
        } catch (err) {
            console.error('Error submitting review:', err);
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const averageRating = product?.reviews?.length > 0
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
        : null;

    if (loading) {
        return (
            <div className="container py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="aspect-square bg-surface-hover rounded-lg animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-8 bg-surface-hover rounded animate-pulse w-3/4" />
                        <div className="h-6 bg-surface-hover rounded animate-pulse w-1/4" />
                        <div className="h-24 bg-surface-hover rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container py-12 text-center">
                <p className="text-foreground-secondary mb-4">{error || 'Producto no encontrado'}</p>
                <Link to="/products" className="text-primary hover:text-primary-hover transition-colors">
                    ← Volver a productos
                </Link>
            </div>
        );
    }

    return (
        <div className="py-8 md:py-12">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm">
                    <ol className="flex items-center gap-2 text-foreground-secondary">
                        <li><Link to="/products" className="hover:text-foreground transition-colors">Productos</Link></li>
                        <li>/</li>
                        <li className="text-foreground truncate">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {/* Main image */}
                        <div className="aspect-square bg-surface rounded-lg overflow-hidden">
                            {product.images?.[selectedImage] ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                                    <span className="text-foreground-tertiary">Sin imagen</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`
                      flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all
                      ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'}
                    `}
                                    >
                                        <img src={image} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-2">
                                {product.name}
                            </h1>

                            {/* Rating summary */}
                            {averageRating && (
                                <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-primary' : 'text-border'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span>{averageRating}</span>
                                    <span>·</span>
                                    <span>{product.reviews.length} reseñas</span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <p className="text-2xl font-mono text-foreground">
                            {formatPrice(product.price)}
                        </p>

                        {/* Description */}
                        <p className="text-foreground-secondary leading-relaxed">
                            {product.description}
                        </p>

                        {/* Technical specs */}
                        {(product.materials?.length > 0 || product.dimensions || product.weight?.value) && (
                            <div className="border border-border rounded-lg p-4 space-y-3">
                                <h3 className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary">
                                    Especificaciones
                                </h3>

                                {product.materials?.length > 0 && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-foreground-secondary w-24">Materiales:</span>
                                        <span className="text-foreground">{product.materials.join(', ')}</span>
                                    </div>
                                )}

                                {product.dimensions && (product.dimensions.height || product.dimensions.width || product.dimensions.depth) && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-foreground-secondary w-24">Dimensiones:</span>
                                        <span className="text-foreground font-mono">
                                            {[product.dimensions.height, product.dimensions.width, product.dimensions.depth]
                                                .filter(Boolean)
                                                .join(' × ')} {product.dimensions.unit || 'cm'}
                                        </span>
                                    </div>
                                )}

                                {product.weight?.value && (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-foreground-secondary w-24">Peso:</span>
                                        <span className="text-foreground font-mono">
                                            {product.weight.value} {product.weight.unit || 'g'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Stock status */}
                        <div className="flex items-center gap-2">
                            <span className={`led ${product.stock > 0 ? 'led-on' : 'led-off'}`} />
                            <span className="text-sm text-foreground-secondary">
                                {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                            </span>
                        </div>

                        {/* Quantity and Add to Cart */}
                        {product.stock > 0 && (
                            <div className="flex items-center gap-4">
                                {/* Quantity selector */}
                                <div className="flex items-center border border-border rounded-md">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-2 text-foreground-secondary hover:text-foreground transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <span className="px-4 py-2 font-mono text-sm">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="px-3 py-2 text-foreground-secondary hover:text-foreground transition-colors"
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="btn btn-primary flex-1"
                                >
                                    Añadir al carrito
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Reviews Section */}
                <section className="mt-16 pt-12 border-t border-border">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="font-brand text-2xl text-foreground">
                            Reseñas {product.reviews?.length > 0 && `(${product.reviews.length})`}
                        </h2>

                        {user && !showReviewForm && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="btn btn-secondary"
                            >
                                Escribir reseña
                            </button>
                        )}
                    </div>

                    {/* Review form */}
                    {showReviewForm && (
                        <motion.form
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmitReview}
                            className="mb-8 p-6 bg-surface border border-border rounded-lg"
                        >
                            <h3 className="font-medium text-foreground mb-4">Tu reseña</h3>

                            {/* Rating */}
                            <div className="mb-4">
                                <label className="block text-sm text-foreground-secondary mb-2">Valoración</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="p-1"
                                        >
                                            <svg
                                                className={`w-6 h-6 transition-colors ${star <= reviewForm.rating ? 'text-primary' : 'text-border hover:text-primary/50'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-foreground-secondary mb-2">Título</label>
                                <input
                                    type="text"
                                    value={reviewForm.title}
                                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-foreground-secondary mb-2">Comentario</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    className="input min-h-[100px]"
                                    required
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="btn btn-primary"
                                >
                                    {submittingReview ? 'Enviando...' : 'Enviar reseña'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="btn btn-ghost"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {/* Reviews list */}
                    {product.reviews?.length > 0 ? (
                        <div className="space-y-6">
                            {product.reviews.map((review, index) => (
                                <div key={index} className="pb-6 border-b border-border-subtle last:border-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-primary' : 'text-border'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{review.title}</span>
                                    </div>
                                    <p className="text-sm text-foreground-secondary">{review.comment}</p>
                                    <p className="text-xs text-foreground-tertiary mt-2">
                                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-foreground-secondary">
                            Este producto aún no tiene reseñas. {user ? 'Sé el primero en escribir una.' : 'Inicia sesión para escribir una reseña.'}
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProductDetail;
