import { motion } from 'framer-motion';
import { Paintbrush, Package, Truck, Sparkles } from 'lucide-react';

/**
 * ProcessTimeline Component - v2 Design System
 * Clean horizontal timeline without overlapping elements
 */

const steps = [
    {
        icon: Paintbrush,
        title: 'Diseño',
        description: 'Cada pieza comienza con una idea única.',
    },
    {
        icon: Sparkles,
        title: 'Creación',
        description: 'Artesanos dan vida al diseño.',
    },
    {
        icon: Package,
        title: 'Empaquetado',
        description: 'Cuidamos cada detalle del embalaje.',
    },
    {
        icon: Truck,
        title: 'Envío',
        description: 'Tu pieza llega protegida a casa.',
    },
];

const ProcessTimeline = () => {
    return (
        <section className="py-20 md:py-28 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Del taller a tu hogar
                    </h2>
                    <p className="text-foreground-secondary max-w-xl mx-auto">
                        Un viaje cuidado en cada paso, desde la primera pincelada hasta tu puerta.
                    </p>
                </motion.div>

                {/* Timeline Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Card */}
                            <div className="bg-background border border-border-subtle rounded-xl p-6
                            hover:border-border hover:shadow-md transition-all duration-300">
                                {/* Step Number */}
                                <span className="inline-block text-xs font-semibold text-primary-500 
                               bg-primary-100 dark:bg-primary-500/10 
                               px-2 py-0.5 rounded mb-4">
                                    Paso {index + 1}
                                </span>

                                {/* Icon */}
                                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/10
                              flex items-center justify-center mb-4">
                                    <step.icon className="w-5 h-5 text-primary-500" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-foreground-secondary leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Connector Line (not on last item, hidden on mobile) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessTimeline;
