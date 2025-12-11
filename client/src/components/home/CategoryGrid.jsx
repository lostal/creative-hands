import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * CategoryGrid Component - v2 Design System
 * Clean grid with proper border radius on all corners
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
        relative group overflow-hidden rounded-2xl
        ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}
      `}
        >
            <Link to={`/products/category/${category.slug}`} className="block h-full">
                <div className={`relative overflow-hidden rounded-2xl ${isLarge ? 'aspect-[4/3]' : 'aspect-square'}`}>
                    <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover transition-transform duration-500
                     group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
                        group-hover:from-black/80 transition-all duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <h3 className={`font-semibold text-white mb-1
                         ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                            {category.title}
                        </h3>
                        <p className="text-sm text-white/80 mb-3">
                            {category.description}
                        </p>

                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white
                           group-hover:gap-2.5 transition-all duration-300">
                            Ver productos
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const CategoryGrid = () => {
    return (
        <section className="py-20 md:py-28 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Explora nuestras categorías
                    </h2>
                    <p className="text-foreground-secondary max-w-xl mx-auto">
                        Piezas únicas organizadas por tipo. Cada obra es creada con pasión.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category, index) => (
                        <CategoryCard key={category.slug} category={category} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
