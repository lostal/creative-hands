import { motion } from 'framer-motion';
import { Paintbrush, Package, Truck, Sparkles } from 'lucide-react';

/**
 * ProcessTimeline Component - v2 Design System
 * Visual timeline showing the craft process
 */

const steps = [
    {
        icon: Paintbrush,
        title: 'Diseño',
        description: 'Cada pieza comienza con una idea única, bocetada a mano.',
        number: '01',
    },
    {
        icon: Sparkles,
        title: 'Creación',
        description: 'Artesanos expertos dan vida a cada diseño con técnicas tradicionales.',
        number: '02',
    },
    {
        icon: Package,
        title: 'Empaquetado',
        description: 'Cuidamos cada detalle del embalaje para una experiencia premium.',
        number: '03',
    },
    {
        icon: Truck,
        title: 'Envío',
        description: 'Tu pieza llega a casa protegida y lista para disfrutar.',
        number: '04',
    },
];

const ProcessTimeline = () => {
    return (
        <section className="section bg-background-secondary">
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
                        Proceso
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Del taller a tu hogar
                    </h2>
                    <p className="text-foreground-secondary max-w-2xl mx-auto">
                        Un viaje cuidado en cada paso, desde la primera pincelada hasta tu puerta.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="relative"
                            >
                                {/* Card */}
                                <div className="relative z-10 bg-surface border border-border-subtle rounded-xl p-6
                              hover:border-border hover:shadow-lg transition-all duration-fast">
                                    {/* Number */}
                                    <span className="absolute -top-3 -left-2 font-mono text-5xl font-bold 
                                 text-primary-100 dark:text-primary-900/30 select-none">
                                        {step.number}
                                    </span>

                                    {/* Icon */}
                                    <div className="relative mb-4">
                                        <div className="inline-flex items-center justify-center w-12 h-12 
                                  bg-primary-100 dark:bg-primary-500/15 rounded-lg">
                                            <step.icon className="w-6 h-6 text-primary-500" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-foreground-secondary leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Dot on line (desktop) */}
                                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                              w-4 h-4 bg-background border-2 border-primary-500 rounded-full z-20" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProcessTimeline;
