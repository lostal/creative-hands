import { motion } from 'framer-motion';

/**
 * StatsBar Component - v2 Design System
 * Simple stats display, no unnecessary decorations
 */

const StatsBar = ({ stats = [] }) => {
    const defaultStats = [
        { label: 'Piezas únicas', value: '200+' },
        { label: 'Artesanos', value: '12' },
        { label: 'Hecho a mano', value: '100%' },
    ];

    const displayStats = stats.length > 0 ? stats : defaultStats;

    return (
        <div className="border-y border-border-subtle bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center md:justify-between py-6 gap-12 overflow-x-auto">
                    {displayStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col items-center md:items-start text-center md:text-left"
                        >
                            <span className="text-2xl md:text-3xl font-bold text-foreground">
                                {stat.value}
                            </span>
                            <span className="text-sm text-foreground-secondary mt-1">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsBar;
