/**
 * PrivacyTerms Page - Privacy policy and terms
 */

const PrivacyTerms = () => {
    return (
        <div className="py-12 md:py-20">
            <div className="container max-w-3xl">
                <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-8">
                    Privacidad y Términos
                </h1>

                <div className="prose max-w-none space-y-8">
                    <section>
                        <h2 className="font-brand text-xl text-foreground mb-4">Política de Privacidad</h2>
                        <div className="text-foreground-secondary space-y-4">
                            <p>
                                En Creative Hands, respetamos tu privacidad. Esta política describe cómo
                                recopilamos, usamos y protegemos tu información personal.
                            </p>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Información que recopilamos</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Datos de contacto (nombre, email, teléfono)</li>
                                <li>Dirección de envío</li>
                                <li>Historial de pedidos</li>
                            </ul>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Uso de la información</h3>
                            <p>
                                Utilizamos tus datos únicamente para procesar pedidos, enviarte productos
                                y comunicarnos contigo sobre tu cuenta o pedidos.
                            </p>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Protección de datos</h3>
                            <p>
                                Implementamos medidas de seguridad técnicas y organizativas para proteger
                                tu información personal contra acceso no autorizado.
                            </p>
                        </div>
                    </section>

                    <hr className="border-border" />

                    <section>
                        <h2 className="font-brand text-xl text-foreground mb-4">Términos y Condiciones</h2>
                        <div className="text-foreground-secondary space-y-4">
                            <p>
                                Al utilizar nuestro sitio web y realizar compras, aceptas los siguientes
                                términos y condiciones.
                            </p>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Productos</h3>
                            <p>
                                Todas las piezas son únicas y hechas a mano. Pueden existir pequeñas
                                variaciones entre la imagen del producto y el artículo recibido, lo cual
                                es parte de su carácter artesanal.
                            </p>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Precios</h3>
                            <p>
                                Todos los precios incluyen IVA. Nos reservamos el derecho de modificar
                                precios sin previo aviso.
                            </p>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Propiedad intelectual</h3>
                            <p>
                                Todos los diseños, imágenes y contenido de este sitio son propiedad de
                                Creative Hands y están protegidos por derechos de autor.
                            </p>
                        </div>
                    </section>
                </div>

                <p className="mt-12 text-sm text-foreground-tertiary">
                    Última actualización: Diciembre 2024
                </p>
            </div>
        </div>
    );
};

export default PrivacyTerms;
