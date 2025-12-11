const ShippingReturns = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-24 flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass p-6 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-semibold mb-4 dark:text-white">
            Política de Envíos y Devoluciones
          </h1>

          <section className="mb-6">
            <h2 className="text-lg font-medium dark:text-white">Envíos</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Realizamos envíos nacionales en un plazo estimado de 3-7 días
              hábiles. Los tiempos pueden variar según la disponibilidad y la
              localización.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium dark:text-white">
              Devoluciones
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Aceptamos devoluciones en un plazo de 14 días desde la recepción
              del pedido, siempre que el producto esté en condiciones
              originales. Para iniciar una devolución, contacta con nuestro
              equipo de soporte indicando el número de pedido y motivo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium dark:text-white">Contacto</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Para dudas sobre envíos o devoluciones, escribe a:
              soporte@creativehands.example
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingReturns;
