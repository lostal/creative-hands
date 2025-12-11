/**
 * Home Page - Landing with hero and sections
 * 
 * Sections:
 * 1. Hero - Full viewport with headline and CTA
 * 2. Categories - Grid of product categories
 * 3. Featured Products - Highlighted products
 * 4. Process - How pieces are made
 * 5. Testimonials - Customer reviews
 * 6. CTA - Final call to action
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const Home = () => {
    const { products, loading: productsLoading } = useProducts();
    const { categories, loading: categoriesLoading } = useCategories();

    // Get featured products (first 4)
    const featuredProducts = products?.slice(0, 4) || [];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface-hover" />

                {/* Content */}
                <div className="container relative z-10 text-center py-20">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-3xl mx-auto"
                    >
                        <motion.p
                            variants={fadeInUp}
                            className="text-sm font-mono uppercase tracking-widest text-foreground-tertiary mb-6"
                        >
                            Arte hecho a mano
                        </motion.p>

                        <motion.h1
                            variants={fadeInUp}
                            className="font-brand text-5xl md:text-7xl lg:text-8xl text-foreground mb-8 leading-tight"
                        >
                            Piezas únicas para espacios únicos
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-foreground-secondary max-w-xl mx-auto mb-10"
                        >
                            Cada creación es una obra de arte irrepetible, elaborada con materiales nobles y atención al detalle.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link to="/products" className="btn btn-primary px-8 py-3">
                                Explorar Colección
                            </Link>
                            <Link to="/about" className="btn btn-secondary px-8 py-3">
                                Nuestra Historia
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll indicator - positioned outside main content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-0"
                >
                    <div className="flex flex-col items-center gap-2 text-foreground-tertiary">
                        <span className="text-xs font-mono">Descubrir</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Categories Section */}
            <section className="py-20 md:py-28 bg-background">
                <div className="container">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-12">
                            <h2 className="font-brand text-3xl md:text-4xl text-foreground mb-4">
                                Categorías
                            </h2>
                            <p className="text-foreground-secondary max-w-md mx-auto">
                                Explora nuestra colección organizada por tipo de pieza
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {categoriesLoading ? (
                                // Skeleton loading
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="aspect-[4/3] bg-surface-hover rounded-lg animate-pulse" />
                                ))
                            ) : categories?.length > 0 ? (
                                categories.map((category) => (
                                    <motion.div key={category._id} variants={fadeInUp}>
                                        <Link
                                            to={`/products?category=${category.slug}`}
                                            className="group block relative aspect-[4/3] bg-surface rounded-lg overflow-hidden border border-border hover:border-border-strong transition-all duration-normal"
                                        >
                                            {/* Category background - gradient placeholder */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-slow" />

                                            {/* Category name */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                                <h3 className="text-xl font-medium text-foreground mb-2">
                                                    {category.name}
                                                </h3>
                                                {category.description && (
                                                    <p className="text-sm text-foreground-secondary text-center line-clamp-2">
                                                        {category.description}
                                                    </p>
                                                )}
                                                <span className="mt-4 text-xs font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Ver productos →
                                                </span>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-foreground-secondary">
                                    No hay categorías disponibles
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-20 md:py-28 bg-surface">
                <div className="container">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                            <div>
                                <h2 className="font-brand text-3xl md:text-4xl text-foreground mb-4">
                                    Destacados
                                </h2>
                                <p className="text-foreground-secondary max-w-md">
                                    Las piezas más apreciadas de nuestra colección
                                </p>
                            </div>
                            <Link
                                to="/products"
                                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                            >
                                Ver todo →
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {productsLoading ? (
                                // Skeleton loading
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="aspect-product bg-surface-hover rounded-lg animate-pulse" />
                                        <div className="h-4 bg-surface-hover rounded animate-pulse w-3/4" />
                                        <div className="h-4 bg-surface-hover rounded animate-pulse w-1/4" />
                                    </div>
                                ))
                            ) : featuredProducts.length > 0 ? (
                                featuredProducts.map((product) => (
                                    <motion.div key={product._id} variants={fadeInUp}>
                                        <Link
                                            to={`/products/${product._id}`}
                                            className="group block"
                                        >
                                            {/* Product image */}
                                            <div className="relative aspect-product bg-background rounded-lg overflow-hidden mb-4">
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

                                                {/* Stock badge */}
                                                {product.stock <= 0 && (
                                                    <span className="absolute top-3 left-3 px-2 py-1 text-xs font-mono bg-surface/90 backdrop-blur-sm rounded text-foreground-secondary">
                                                        Agotado
                                                    </span>
                                                )}
                                            </div>

                                            {/* Product info */}
                                            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm font-mono text-foreground-secondary mt-1">
                                                {formatPrice(product.price)}
                                            </p>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-foreground-secondary">
                                    No hay productos destacados
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 md:py-28 bg-background">
                <div className="container">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-16">
                            <h2 className="font-brand text-3xl md:text-4xl text-foreground mb-4">
                                El Proceso
                            </h2>
                            <p className="text-foreground-secondary max-w-md mx-auto">
                                Cada pieza pasa por un proceso artesanal cuidadoso
                            </p>
                        </motion.div>

                        {/* Process steps - properly centered with connecting lines */}
                        <div className="relative max-w-4xl mx-auto">
                            {/* Connecting line for desktop */}
                            <div className="hidden md:block absolute top-4 left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-px bg-border" />

                            <motion.div
                                variants={staggerContainer}
                                className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6"
                            >
                                {[
                                    { step: '01', title: 'Diseño', description: 'Cada pieza comienza con un boceto único' },
                                    { step: '02', title: 'Materiales', description: 'Selección cuidadosa de materiales nobles' },
                                    { step: '03', title: 'Creación', description: 'Trabajo artesanal con atención al detalle' },
                                    { step: '04', title: 'Acabado', description: 'Revisión final para garantizar la calidad' },
                                ].map((item) => (
                                    <motion.div
                                        key={item.step}
                                        variants={fadeInUp}
                                        className="text-center"
                                    >
                                        <span className="relative z-10 inline-flex items-center justify-center w-8 h-8 mb-4 bg-background border border-border rounded-full text-xs font-mono text-foreground-secondary">
                                            {item.step}
                                        </span>
                                        <h3 className="text-lg font-medium text-foreground mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-foreground-secondary max-w-[200px] mx-auto">
                                            {item.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-28 bg-surface border-t border-border">
                <div className="container">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="font-brand text-3xl md:text-4xl text-foreground mb-6"
                        >
                            ¿Listo para encontrar tu pieza?
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-foreground-secondary mb-8"
                        >
                            Explora nuestra colección completa y encuentra esa pieza especial que transformará tu espacio.
                        </motion.p>
                        <motion.div variants={fadeInUp}>
                            <Link to="/products" className="btn btn-primary px-8 py-3">
                                Explorar Colección
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
