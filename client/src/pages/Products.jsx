/**
 * Products Page - Product catalog with filters and views
 * 
 * Features:
 * - Category filter (from URL params)
 * - Sort options (price, newest)
 * - Grid/List view toggle
 * - Product cards with hover effects
 */

import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../context/CartContext';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    const { products, loading } = useProducts();
    const { categories } = useCategories();
    const { addToCart, openCart } = useCart();

    // Get filter values from URL
    const categoryFilter = searchParams.get('category') || '';
    const sortBy = searchParams.get('sort') || 'newest';

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...(products || [])];

        // Filter by category
        if (categoryFilter) {
            const category = categories?.find(c => c.slug === categoryFilter);
            if (category) {
                result = result.filter(p => p.categoryId === category._id);
            }
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        return result;
    }, [products, categories, categoryFilter, sortBy]);

    const handleCategoryChange = (slug) => {
        if (slug) {
            searchParams.set('category', slug);
        } else {
            searchParams.delete('category');
        }
        setSearchParams(searchParams);
    };

    const handleSortChange = (value) => {
        searchParams.set('sort', value);
        setSearchParams(searchParams);
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock > 0) {
            addToCart(product);
            openCart();
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    return (
        <div className="py-8 md:py-12">
            <div className="container">
                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-2">
                        Productos
                    </h1>
                    <p className="text-foreground-secondary">
                        {loading ? 'Cargando...' : `${filteredProducts.length} piezas disponibles`}
                    </p>
                </div>

                {/* Filters bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
                    {/* Category filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                        <button
                            onClick={() => handleCategoryChange('')}
                            className={`
                px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all
                ${!categoryFilter
                                    ? 'bg-foreground text-foreground-inverse'
                                    : 'bg-surface border border-border text-foreground-secondary hover:border-border-strong'
                                }
              `}
                        >
                            Todos
                        </button>
                        {categories?.map((category) => (
                            <button
                                key={category._id}
                                onClick={() => handleCategoryChange(category.slug)}
                                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all
                  ${categoryFilter === category.slug
                                        ? 'bg-foreground text-foreground-inverse'
                                        : 'bg-surface border border-border text-foreground-secondary hover:border-border-strong'
                                    }
                `}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-4">
                        {/* Sort select */}
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="input py-1.5 px-3 pr-8 text-sm w-auto"
                        >
                            <option value="newest">Más recientes</option>
                            <option value="price-asc">Precio: menor a mayor</option>
                            <option value="price-desc">Precio: mayor a menor</option>
                        </select>

                        {/* View toggle */}
                        <div className="hidden sm:flex items-center border border-border rounded-md">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-surface-hover text-foreground' : 'text-foreground-tertiary hover:text-foreground'}`}
                                aria-label="Vista cuadrícula"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-surface-hover text-foreground' : 'text-foreground-tertiary hover:text-foreground'}`}
                                aria-label="Vista lista"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products grid/list */}
                {loading ? (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={`${viewMode === 'list' ? 'flex gap-6' : ''}`}>
                                <div className={`${viewMode === 'list' ? 'w-32 h-32' : 'aspect-product'} bg-surface-hover rounded-lg animate-pulse`} />
                                <div className={`${viewMode === 'list' ? 'flex-1 py-2' : 'mt-4'} space-y-2`}>
                                    <div className="h-4 bg-surface-hover rounded animate-pulse w-3/4" />
                                    <div className="h-4 bg-surface-hover rounded animate-pulse w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-foreground-secondary mb-4">No se encontraron productos</p>
                        {categoryFilter && (
                            <button
                                onClick={() => handleCategoryChange('')}
                                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                            >
                                Ver todos los productos
                            </button>
                        )}
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
                    >
                        {filteredProducts.map((product) => (
                            <motion.div key={product._id} variants={fadeInUp}>
                                <Link
                                    to={`/products/${product._id}`}
                                    className={`group block ${viewMode === 'list' ? 'flex gap-6 items-start' : ''}`}
                                >
                                    {/* Product image */}
                                    <div className={`relative overflow-hidden rounded-lg bg-surface ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-product'}`}>
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                                                <span className="text-foreground-tertiary text-sm">Sin imagen</span>
                                            </div>
                                        )}

                                        {/* Quick add button - only on grid */}
                                        {viewMode === 'grid' && product.stock > 0 && (
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="absolute bottom-3 right-3 p-2 bg-surface/90 backdrop-blur-sm border border-border rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-surface hover:border-border-strong"
                                                aria-label="Añadir al carrito"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Stock badge */}
                                        {product.stock <= 0 && (
                                            <span className="absolute top-3 left-3 px-2 py-1 text-xs font-mono bg-surface/90 backdrop-blur-sm rounded text-foreground-secondary">
                                                Agotado
                                            </span>
                                        )}
                                    </div>

                                    {/* Product info */}
                                    <div className={viewMode === 'list' ? 'flex-1 py-2' : 'mt-4'}>
                                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                            {product.name}
                                        </h3>
                                        {viewMode === 'list' && (
                                            <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                        <p className="text-sm font-mono text-foreground-secondary mt-1">
                                            {formatPrice(product.price)}
                                        </p>

                                        {/* Add to cart button for list view */}
                                        {viewMode === 'list' && product.stock > 0 && (
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="btn btn-secondary mt-3 text-xs py-1.5 px-3"
                                            >
                                                Añadir al carrito
                                            </button>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Products;
