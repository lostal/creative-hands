const PrivacyTerms = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-24 flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass p-6 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-semibold mb-4 dark:text-white">
            Política de Privacidad y Términos de Servicio
          </h1>

          <section className="mb-6">
            <h2 className="text-lg font-medium dark:text-white">Privacidad</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Tratamos tus datos con responsabilidad. Recogemos la información
              necesaria para procesar pedidos y mejorar la experiencia. No
              compartimos datos con terceros sin tu consentimiento, salvo por
              obligación legal o para la prestación del servicio (ej. servicios
              de envío).
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium dark:text-white">
              Términos de servicio
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Al utilizar nuestra tienda aceptas las condiciones de compra,
              pagos y política de devoluciones. El uso de la web debe respetar
              las leyes aplicables y los derechos de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium dark:text-white">Contacto</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Si tienes preguntas sobre privacidad o los términos, contáctanos
              en: legal@creativehands.example
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyTerms;

