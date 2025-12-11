/**
 * Footer - Minimal footer with essential links
 * 
 * Grid editorial style with clean typography
 */

import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { to: '/about', label: 'Nosotros' },
        { to: '/shipping', label: 'Envíos' },
        { to: '/privacy', label: 'Privacidad' },
    ];

    return (
        <footer className="border-t border-border bg-background">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="font-brand text-lg tracking-wide text-foreground">
                            CREATIVE HANDS
                        </Link>
                        <p className="text-sm text-foreground-secondary leading-relaxed max-w-xs">
                            Piezas de arte únicas, hechas a mano con dedicación y pasión por el detalle.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary">
                            Enlaces
                        </h4>
                        <nav className="flex flex-col space-y-2">
                            {footerLinks.map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className="text-sm text-foreground-secondary hover:text-foreground transition-colors w-fit"
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary">
                            Contacto
                        </h4>
                        <div className="space-y-2">
                            <a
                                href="mailto:hola@creativehands.es"
                                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
                            >
                                hola@creativehands.es
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-6 border-t border-border-subtle">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs font-mono text-foreground-tertiary">
                            © {currentYear} CREATIVE HANDS
                        </p>
                        <p className="text-xs text-foreground-tertiary">
                            Hecho a mano con <span className="text-primary">♥</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
