import { Link } from 'react-router-dom';

/**
 * Footer Component - v2 Design System
 * Clean, minimal, no unnecessary decorations
 */

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-background" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-xl font-brand uppercase text-primary-500">
              Creative Hands
            </span>
            <p className="mt-3 text-sm text-foreground-secondary max-w-sm leading-relaxed">
              Artesanía de calidad, creada con pasión y cuidado.
              Cada pieza cuenta una historia única.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Tienda
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link
                  to="/products/category/joyeria-artesanal"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  Joyería
                </Link>
              </li>
              <li>
                <Link
                  to="/products/category/ceramica-y-arcilla"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  Cerámica
                </Link>
              </li>
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Información
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link
                  to="/envios"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  Envíos y Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidad"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border-subtle">
          <p className="text-sm text-foreground-tertiary text-center">
            © {currentYear} Álvaro Lostal · Creative Hands
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
