import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Palette,
  ChevronDown,
} from "lucide-react";
import { useRef } from "react";

const Home = () => {
  const MotionLink = motion(Link) as any;
  const MotionDiv = motion.div as any;
  const MotionH1 = motion.h1 as any;
  const MotionP = motion.p as any;
  const MotionButton = motion.button as any;

  const ctaRef = useRef(null);
  const btnRef = useRef(null);
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-light-500 via-primary-50 to-light-500 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600">
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <MotionDiv
                key={i}
                className="absolute w-2 h-2 bg-primary-400 rounded-full"
                style={{
                  left: `${(i * 13) % 100}%`,
                  top: `${(i * 23) % 100}%`,
                  willChange: "transform, opacity",
                }}
                animate={{ y: [0, -18, 0], opacity: [0.25, 0.7, 0.25] }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo/Icon */}
            <MotionDiv
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
                  <Palette className="w-12 h-12 text-white" />
                </div>
                <MotionDiv
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-8 h-8 text-primary-400" />
                </MotionDiv>
              </div>
            </MotionDiv>

            {/* Main Heading */}
            <MotionH1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold copernicus copernicus-110 uppercase text-primary-500"
            >
              CREATIVE
              <span className="block">HANDS</span>
            </MotionH1>

            {/* Subtitle */}
            <MotionP
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium subtitle px-4"
            >
              Descubre piezas únicas creadas con amor y dedicación.
              <br />
              Arte hecho a mano que cuenta historias.
            </MotionP>

            {/* CTA Buttons (wrapper relative para centrar la flecha) */}
            <div className="relative inline-block w-full">
              <MotionDiv
                ref={ctaRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-8 px-4"
              >
                <Link to="/products" className="w-full sm:w-auto">
                  <MotionButton
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-medium text-base sm:text-lg shadow-md hover:shadow-xl transition-shadow duration-200 bg-primary-500 dark:bg-primary-600 text-white min-h-[44px]"
                    style={{ willChange: "transform" }}
                  >
                    <span>Explorar Productos</span>
                  </MotionButton>
                </Link>

                <Link to="/register" className="w-full sm:w-auto">
                  <MotionButton
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 200, damping: 26 }}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 glass rounded-2xl font-medium text-base sm:text-lg text-gray-900 dark:text-white shadow-md hover:shadow-lg transition-shadow duration-200 min-h-[44px]"
                    style={{ willChange: "transform" }}
                  >
                    Regístrate ahora
                  </MotionButton>
                </Link>
              </MotionDiv>

              {/* Flecha absoluta dentro del wrapper de CTA para centrarla exactamente */}
              <MotionButton
                ref={btnRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.7 }}
                onClick={() => {
                  const el = document.getElementById("destacados");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                aria-label="Ir a destacados"
                className="hero-scroll-btn subtle-bounce z-30 left-1/2 transform -translate-x-1/2"
              >
                <ChevronDown className="w-6 h-6 text-primary-600" />
              </MotionButton>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Featured Products Section (rediseñado): tarjetas que aparecen lateralmente al hacer scroll */}
      <section
        id="destacados"
        className="py-16 sm:py-20 md:py-24 bg-white dark:bg-dark-500"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Destacados
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 px-4">
              Lo mejor de nuestro taller — calidad artesanal y diseño único.
            </p>
          </MotionDiv>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                slug: "joyeria-artesanal",
                title: "Joyería artesanal",
                text: "Collares, anillos y piezas únicas trabajadas a mano.",
                img: "https://images.unsplash.com/photo-1697925493572-a8da651b0c12?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670",
              },
              {
                slug: "ceramica-y-arcilla",
                title: "Cerámica y arcilla",
                text: "Vajillas y piezas de cerámica con acabados artesanales.",
                img: "https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774",
              },
              {
                slug: "arte-hecho-a-mano",
                title: "Arte hecho a mano",
                text: "Láminas, ilustraciones y obra original de artistas locales.",
                img: "https://plus.unsplash.com/premium_photo-1677609898243-63280b6c89a1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=766",
              },
            ].map((c, i) => (
              <MotionDiv
                key={c.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="glass p-3 sm:p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200"
                style={{ willChange: "transform" }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="w-full sm:w-20 h-48 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={c.img}
                      alt={c.title}
                      className="w-full h-full object-cover"
                      width="80"
                      height="80"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {c.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                      {c.text}
                    </p>
                    <div className="mt-3 sm:mt-4">
                      <MotionLink
                        to={`/products/category/${c.slug}`}
                        whileHover={{ y: -3 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 26,
                        }}
                        className="inline-flex items-center px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:shadow-md hover:opacity-95 transition-shadow duration-200 min-h-[44px]"
                        style={{
                          willChange: "transform, opacity",
                          transitionProperty: "box-shadow, opacity",
                          transitionDuration: "200ms",
                        }}
                      >
                        Ver {c.title}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </MotionLink>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Footer gestionado globalmente en App.jsx */}
    </div>
  );
};


export default Home;
