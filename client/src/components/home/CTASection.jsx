import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * CTASection Component - v2 Design System
 * Final call-to-action section
 */

const CTASection = () => {
    return (
        <section className="section-lg bg-gradient-to-b from-background to-background-secondary relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, var(--primary-200) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>

            {/* Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-3xl" />

            <div className="container-narrow relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-16 h-16 mb-6
                      bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl
                      shadow-glow"
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Encuentra tu próxima
                        <span className="block text-gradient mt-2">pieza única</span>
                    </h2>

                    <p className="text-foreground-secondary text-lg max-w-xl mx-auto mb-8">
                        Explora nuestra colección de productos artesanales y encuentra
                        esa pieza especial que estás buscando.
                    </p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to="/products"
                            className="btn btn-primary btn-lg group"
                        >
                            <span>Explorar productos</span>
                            <ArrowRight className="w-5 h-5 transition-transform duration-fast
                                   group-hover:translate-x-1" />
                        </Link>

                        <Link
                            to="/register"
                            className="btn btn-secondary btn-lg"
                        >
                            Crear cuenta gratis
                        </Link>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 flex items-center justify-center gap-6 text-sm font-mono text-foreground-tertiary"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            Envío gratis
                        </span>
                        <span className="opacity-30">·</span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            Pago seguro
                        </span>
                        <span className="opacity-30">·</span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            Garantía de calidad
                        </span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
