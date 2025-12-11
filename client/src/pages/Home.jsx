import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

// Home sections
import {
  StatsBar,
  CategoryGrid,
  ProcessTimeline,
  TestimonialSection,
} from '../components/home';

// UI Component
import { GridBackground } from '../components/ui';

/**
 * Home Page - v2 Design System
 * Clean, minimal, properly structured
 */

const Home = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Grid Background */}
        <GridBackground
          dotSize={1}
          dotSpacing={32}
          parallaxStrength={0.1}
          overlay
          className="absolute inset-0"
        />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-brand uppercase 
                     text-primary-500 leading-none tracking-tight mb-6"
          >
            Creative
            <span className="block">Hands</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-foreground-secondary max-w-xl mx-auto mb-10"
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
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 
                       bg-primary-500 hover:bg-primary-600 
                       text-white font-medium rounded-lg
                       transition-colors group"
            >
              <span>Explorar productos</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 
                       border border-border hover:border-foreground-tertiary
                       text-foreground font-medium rounded-lg
                       transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator - Fixed at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-foreground-tertiary"
          >
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <div className="w-px h-6 bg-foreground-tertiary/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS BAR ===== */}
      <StatsBar />

      {/* ===== CATEGORY GRID ===== */}
      <CategoryGrid />

      {/* ===== PROCESS TIMELINE ===== */}
      <ProcessTimeline />

      {/* ===== TESTIMONIALS ===== */}
      <TestimonialSection />
    </div>
  );
};

export default Home;
