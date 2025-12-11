import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Palette } from 'lucide-react';
import { useRef } from 'react';

// Home sections
import {
  StatsBar,
  CategoryGrid,
  ProcessTimeline,
  TestimonialSection,
  CTASection,
} from '../components/home';

// UI Components
import { GridBackground, IndicatorDot } from '../components/ui';

/**
 * Home Page - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 * Full landing page with multiple sections
 */

const Home = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const scrollToContent = () => {
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Grid Background with Parallax */}
        <GridBackground
          dotSize={1}
          dotSpacing={32}
          parallaxStrength={0.15}
          overlay
          className="absolute inset-0"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/80" />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-500 to-primary-600 
                           rounded-2xl flex items-center justify-center shadow-glow rotate-12"
                  whileHover={{ rotate: 0, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Palette className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </motion.div>

                {/* Status Indicator */}
                <div className="absolute -top-1 -right-1">
                  <IndicatorDot status="active" pulse size="lg" />
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-brand uppercase 
                           text-primary-500 leading-none tracking-tight">
                Creative
                <span className="block">Hands</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto font-medium"
            >
              Piezas únicas creadas con pasión y dedicación.
              <span className="block mt-1 text-foreground-tertiary">
                Arte hecho a mano que cuenta historias.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/products">
                <motion.button
                  className="btn btn-primary btn-lg group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Explorar productos</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-fast
                                       group-hover:translate-x-1" />
                </motion.button>
              </Link>

              <Link to="/register">
                <motion.button
                  className="btn btn-secondary btn-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Crear cuenta gratis
                </motion.button>
              </Link>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={scrollToContent}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
                       text-foreground-tertiary hover:text-foreground transition-colors duration-fast
                       cursor-pointer"
              aria-label="Scroll to content"
            >
              <span className="text-xs font-mono uppercase tracking-wider">Descubrir</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div id="stats-section">
        <StatsBar />
      </div>

      {/* ===== CATEGORY GRID ===== */}
      <CategoryGrid />

      {/* ===== PROCESS TIMELINE ===== */}
      <ProcessTimeline />

      {/* ===== TESTIMONIALS ===== */}
      <TestimonialSection />

      {/* ===== FINAL CTA ===== */}
      <CTASection />
    </div>
  );
};

export default Home;
