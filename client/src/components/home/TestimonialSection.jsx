import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * TestimonialSection Component - v2 Design System
 * Customer testimonials with carousel
 */

const testimonials = [
    {
        id: 1,
        name: 'María García',
        role: 'Cliente verificado',
        avatar: 'M',
        rating: 5,
        text: 'La calidad de las piezas es excepcional. Se nota el amor y dedicación en cada detalle. Mi collar es único y precioso.',
        product: 'Collar artesanal dorado',
    },
    {
        id: 2,
        name: 'Carlos Rodríguez',
        role: 'Cliente verificado',
        avatar: 'C',
        rating: 5,
        text: 'Compré un set de cerámica para regalo y quedó encantada. El empaquetado es precioso y la atención al cliente inmejorable.',
        product: 'Set de cerámica azul',
    },
    {
        id: 3,
        name: 'Ana Martínez',
        role: 'Cliente frecuente',
        avatar: 'A',
        rating: 5,
        text: 'Ya es mi tercera compra. Cada pieza tiene una historia y se siente especial. Totalmente recomendado.',
        product: 'Ilustración original',
    },
];

const TestimonialCard = ({ testimonial, isActive }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
                opacity: isActive ? 1 : 0.5,
                scale: isActive ? 1 : 0.95,
            }}
            transition={{ duration: 0.4 }}
            className={`
        relative bg-surface border border-border-subtle rounded-xl p-6 md:p-8
        transition-all duration-fast
        ${isActive ? 'shadow-lg' : ''}
      `}
        >
            {/* Quote Icon */}
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-100 dark:text-primary-900/30" />

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating
                                ? 'text-warning fill-warning'
                                : 'text-border'
                            }`}
                    />
                ))}
            </div>

            {/* Quote Text */}
            <p className="text-foreground text-base md:text-lg leading-relaxed mb-6">
                "{testimonial.text}"
            </p>

            {/* Product Tag */}
            <span className="inline-block px-2 py-1 text-xs font-mono text-foreground-tertiary
                     bg-surface-hover rounded mb-4">
                {testimonial.product}
            </span>

            {/* Author */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600
                      flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                        {testimonial.avatar}
                    </span>
                </div>
                <div>
                    <p className="font-medium text-foreground text-sm">
                        {testimonial.name}
                    </p>
                    <p className="text-xs text-foreground-tertiary font-mono">
                        {testimonial.role}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const TestimonialSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
                        Testimonios
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Lo que dicen nuestros clientes
                    </h2>
                    <p className="text-foreground-secondary max-w-2xl mx-auto">
                        Cada opinión refleja nuestra dedicación por ofrecer piezas únicas y experiencias memorables.
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                            isActive={index === activeIndex}
                        />
                    ))}
                </div>

                {/* Indicators */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`
                w-2 h-2 rounded-full transition-all duration-fast
                ${index === activeIndex
                                    ? 'w-8 bg-primary-500'
                                    : 'bg-border hover:bg-foreground-tertiary'
                                }
              `}
                            aria-label={`Ver testimonio ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
