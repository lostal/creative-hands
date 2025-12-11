import { motion } from 'framer-motion';
import { IndicatorDot } from '../ui';

/**
 * StatsBar Component - v2 Design System
 * Teenage Engineering inspired stats display
 */

const StatsBar = ({ stats = [] }) => {
    const defaultStats = [
        { label: 'Piezas únicas', value: '200+', active: true },
        { label: 'Artesanos', value: '12', active: false },
        { label: 'Hecho a mano', value: '100%', active: true },
    ];

    const displayStats = stats.length > 0 ? stats : defaultStats;

    return (
        <div className="w-full border-y border-border-subtle bg-surface/50 backdrop-blur-sm">
            <div className="container-page">
                <div className="flex items-center justify-center md:justify-between py-4 gap-8 overflow-x-auto scrollbar-hide">
                    {displayStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className="flex items-center gap-3 whitespace-nowrap"
                        >
                            <IndicatorDot
                                status={stat.active ? 'active' : 'off'}
                                size="md"
                            />
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl md:text-2xl font-mono font-bold text-foreground">
                                    {stat.value}
                                </span>
                                <span className="text-xs md:text-sm font-mono text-foreground-tertiary uppercase tracking-wide">
                                    {stat.label}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsBar;
