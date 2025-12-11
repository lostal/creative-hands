/**
 * ShippingReturns Page - Shipping info and return policy
 */

const ShippingReturns = () => {
    return (
        <div className="py-12 md:py-20">
            <div className="container max-w-3xl">
                <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-8">
                    Envíos y Devoluciones
                </h1>

                <div className="prose max-w-none space-y-8">
                    <section>
                        <h2 className="font-brand text-xl text-foreground mb-4">Envíos</h2>
                        <div className="text-foreground-secondary space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-surface border border-border rounded-lg">
                                    <h3 className="font-medium text-foreground mb-2">España Peninsular</h3>
                                    <p className="text-sm">Envío gratuito en pedidos superiores a 50€</p>
                                    <p className="text-xs text-foreground-tertiary mt-1">3-5 días laborables</p>
                                </div>
                                <div className="p-4 bg-surface border border-border rounded-lg">
                                    <h3 className="font-medium text-foreground mb-2">Baleares y Canarias</h3>
                                    <p className="text-sm">Consultar gastos de envío</p>
                                    <p className="text-xs text-foreground-tertiary mt-1">5-7 días laborables</p>
                                </div>
                            </div>

                            <p>
                                Todos los pedidos son preparados con cuidado y embalados para garantizar
                                que lleguen en perfectas condiciones. Recibirás un email con el número
                                de seguimiento cuando tu pedido sea enviado.
                            </p>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Embalaje</h3>
                            <p>
                                Utilizamos materiales de embalaje sostenibles y reciclables siempre que
                                es posible. Cada pieza se protege cuidadosamente para evitar daños
                                durante el transporte.
                            </p>
                        </div>
                    </section>

                    <hr className="border-border" />

                    <section>
                        <h2 className="font-brand text-xl text-foreground mb-4">Devoluciones</h2>
                        <div className="text-foreground-secondary space-y-4">
                            <p>
                                Queremos que estés completamente satisfecho con tu compra. Si por cualquier
                                motivo no estás contento, ofrecemos devoluciones durante los primeros 14 días.
                            </p>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Condiciones</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>El producto debe estar en su estado original</li>
                                <li>Debe conservar el embalaje original</li>
                                <li>No debe haber sido usado</li>
                                <li>Plazo máximo de 14 días desde la recepción</li>
                            </ul>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Proceso de devolución</h3>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Contacta con nosotros indicando tu número de pedido</li>
                                <li>Te enviaremos las instrucciones de devolución</li>
                                <li>Una vez recibido el producto, procesaremos el reembolso</li>
                            </ol>

                            <h3 className="font-medium text-foreground mt-6 mb-2">Reembolsos</h3>
                            <p>
                                Los reembolsos se procesan en 5-7 días laborables tras recibir el
                                producto. El importe se devolverá al método de pago original.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 p-6 bg-surface border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">¿Necesitas ayuda?</h3>
                    <p className="text-sm text-foreground-secondary mb-3">
                        Estamos aquí para resolver cualquier duda sobre envíos o devoluciones.
                    </p>
                    <a
                        href="mailto:hola@creativehands.es"
                        className="text-primary hover:text-primary-hover font-medium transition-colors text-sm"
                    >
                        hola@creativehands.es
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ShippingReturns;
