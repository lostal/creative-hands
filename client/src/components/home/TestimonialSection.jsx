import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

/**
 * TestimonialSection Component - v2 Design System
 * Clean carousel with simple arrows navigation
 */

const testimonials = [
    {
        id: 1,
        name: 'María García',
        text: 'La calidad de las piezas es excepcional. Se nota el amor y dedicación en cada detalle. Mi collar es único y precioso.',
        rating: 5,
    },
    {
        id: 2,
        name: 'Carlos Rodríguez',
        text: 'Compré un set de cerámica para regalo y quedó encantada. El empaquetado es precioso y la atención al cliente inmejorable.',
        rating: 5,
    },
    {
        id: 3,
        name: 'Ana Martínez',
        text: 'Ya es mi tercera compra. Cada pieza tiene una historia y se siente especial. Totalmente recomendado.',
        rating: 5,
    },
];

const TestimonialSection = () => {
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    const testimonial = testimonials[current];

    return (
        <section className="py-20 md:py-28 bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Lo que dicen nuestros clientes
                    </h2>
                </motion.div>

                {/* Testimonial Card */}
                <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-surface border border-border-subtle rounded-2xl p-8 md:p-10 text-center"
                >
                    {/* Stars */}
                    <div className="flex items-center justify-center gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${i < testimonial.rating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-border'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                        "{testimonial.text}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {testimonial.name.charAt(0)}
                            </span>
                        </div>
                        <span className="font-medium text-foreground">{testimonial.name}</span>
                    </div>
                </motion.div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={prev}
                        className="p-2 rounded-full border border-border-subtle text-foreground-secondary
                     hover:border-border hover:text-foreground transition-colors"
                        aria-label="Anterior testimonio"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Counter */}
                    <span className="text-sm text-foreground-tertiary">
                        {current + 1} / {testimonials.length}
                    </span>

                    <button
                        onClick={next}
                        className="p-2 rounded-full border border-border-subtle text-foreground-secondary
                     hover:border-border hover:text-foreground transition-colors"
                        aria-label="Siguiente testimonio"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
