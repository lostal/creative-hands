import { Link } from "react-router";

const Footer = () => {
  return (
    <footer
      className="bg-linear-to-t from-gray-50 via-white to-transparent dark:from-gray-900 dark:via-gray-900"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*
          Responsive layout:
          - mobile: 2 rows (first: Brand | Information side by side, second: Phrase centered)
          - md and up: 3 columns (Brand | Phrase | Information) all in one row
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-center">
          {/* Brand - Left */}
          <div className="text-left col-span-1">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Creative Hands
            </h4>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Tienda de artesanía y productos hechos a mano. Calidad y cariño en
              cada pieza.
            </p>
          </div>

          {/* Phrase: centered, full width on mobile (below Brand/Info), middle column on md+ */}
          <div className="flex justify-center col-span-2 md:col-span-1 order-3 md:order-2">
            <div className="text-center text-sm text-gray-700 dark:text-gray-200">
              <div className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-xl bg-white/8 dark:bg-gray-800/60 backdrop-blur-md shadow-xs border border-white/6 dark:border-white/10">
                <span className="font-medium">
                  © {new Date().getFullYear()} Álvaro Lostal
                </span>
                <span className="opacity-50">·</span>
                <span aria-hidden="true" className="text-red-400">
                  ♥
                </span>
                <span className="opacity-50">·</span>
                <span className="font-medium">Creative Hands</span>
              </div>
            </div>
          </div>

          {/* Information - Right */}
          <div className="flex justify-end col-span-1 order-2 md:order-3">
            <div>
              <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Información
              </h5>
              <ul className="space-y-1 text-sm text-left">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500"
                  >
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/envios"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500"
                  >
                    Envíos y Devoluciones
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacidad"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500"
                  >
                    Privacidad & Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
