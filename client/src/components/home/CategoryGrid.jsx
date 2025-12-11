import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * CategoryGrid Component - v2 Design System
 * Asymmetric grid layout for featured categories
 */

const categories = [
    {
        slug: 'joyeria-artesanal',
        title: 'Joyería',
        description: 'Collares, anillos y piezas únicas',
        image: 'https://images.unsplash.com/photo-1697925493572-a8da651b0c12?w=800&q=80',
        size: 'large',
    },
    {
        slug: 'ceramica-y-arcilla',
        title: 'Cerámica',
        description: 'Vajillas y piezas artesanales',
        image: 'https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=800&q=80',
        size: 'medium',
    },
    {
        slug: 'arte-hecho-a-mano',
        title: 'Arte',
        description: 'Ilustraciones y obra original',
        image: 'https://plus.unsplash.com/premium_photo-1677609898243-63280b6c89a1?w=800&q=80',
        size: 'medium',
    },
];

const CategoryCard = ({ category, index }) => {
    const isLarge = category.size === 'large';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`
        relative group overflow-hidden rounded-xl
        ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}
      `}
        >
            <Link to={`/products/category/${category.slug}`} className="block h-full">
                {/* Image */}
                <div className={`relative overflow-hidden ${isLarge ? 'aspect-[4/3]' : 'aspect-square'}`}>
                    <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover transition-transform duration-slow
                     group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent
                        opacity-60 group-hover:opacity-80 transition-opacity duration-fast" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <h3 className={`font-semibold text-white mb-1
                           ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                                {category.title}
                            </h3>
                            <p className="text-sm text-white/70 mb-4">
                                {category.description}
                            </p>

                            {/* CTA */}
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-white
                             group-hover:text-primary-300 transition-colors duration-fast">
                                Explorar
                                <ArrowRight className="w-4 h-4 transition-transform duration-fast
                                      group-hover:translate-x-1" />
                            </span>
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const CategoryGrid = () => {
    return (
        <section className="section bg-background">
            <div className="container-page">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-xs font-mono font-medium 
                         text-primary-500 bg-primary-100 dark:bg-primary-500/15 
                         rounded-full uppercase tracking-wider mb-4">
                        Categorías
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Explora nuestra <span className="text-gradient">colección</span>
                    </h2>
                    <p className="text-foreground-secondary max-w-2xl mx-auto">
                        Encuentra piezas únicas organizadas por categoría.
                        Cada obra es creada con pasión y dedicación.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {categories.map((category, index) => (
                        <CategoryCard key={category.slug} category={category} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
