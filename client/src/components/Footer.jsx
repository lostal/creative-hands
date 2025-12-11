import { Link } from 'react-router-dom';
import { IndicatorDot } from './ui';

/**
 * Footer Component - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 * Minimal, technical, grid-based layout
 */

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    info: [
      { label: 'Quiénes somos', path: '/about' },
      { label: 'Envíos y Devoluciones', path: '/envios' },
      { label: 'Privacidad', path: '/privacidad' },
    ],
    shop: [
      { label: 'Todos los productos', path: '/products' },
      { label: 'Joyería', path: '/products/category/joyeria-artesanal' },
      { label: 'Cerámica', path: '/products/category/ceramica-y-arcilla' },
    ],
  };

  return (
    <footer className="border-t border-border-subtle bg-background-secondary" role="contentinfo">
      <div className="container-page py-12 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <IndicatorDot status="active" size="sm" />
              <span className="font-brand uppercase text-lg text-primary-500">
                Creative Hands
              </span>
            </div>
            <p className="text-sm text-foreground-secondary leading-relaxed max-w-sm">
              Artesanía de calidad, creada con pasión y cuidado.
              Cada pieza cuenta una historia única.
            </p>

            {/* Status Indicators (Teenage Engineering style) */}
            <div className="mt-6 flex items-center gap-6 text-xs font-mono text-foreground-tertiary">
              <div className="flex items-center gap-2">
                <IndicatorDot status="on" size="sm" />
                <span>ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-50">v2.0</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-3 lg:col-span-2">
            <h4 className="text-xs font-mono font-semibold text-foreground-tertiary uppercase tracking-wider mb-4">
              Tienda
            </h4>
            <ul className="space-y-3">
              {links.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-foreground-secondary hover:text-foreground
                             transition-colors duration-fast"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <h4 className="text-xs font-mono font-semibold text-foreground-tertiary uppercase tracking-wider mb-4">
              Información
            </h4>
            <ul className="space-y-3">
              {links.info.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-foreground-secondary hover:text-foreground
                             transition-colors duration-fast"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact/Social Column */}
          <div className="md:col-span-1 lg:col-span-4 md:text-right">
            <h4 className="text-xs font-mono font-semibold text-foreground-tertiary uppercase tracking-wider mb-4">
              Contacto
            </h4>
            <a
              href="mailto:hola@creativehands.es"
              className="text-sm text-foreground-secondary hover:text-primary-500
                       transition-colors duration-fast"
            >
              hola@creativehands.es
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border-subtle">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground-tertiary">
            <div className="flex items-center gap-2 font-mono">
              <span>© {currentYear}</span>
              <span className="opacity-50">·</span>
              <span>Álvaro Lostal</span>
              <span className="opacity-50">·</span>
              <span className="text-primary-500">Creative Hands</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono opacity-50">
                Hecho con
                <span className="mx-1 text-error">♥</span>
                en España
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
