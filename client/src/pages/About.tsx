const About = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-24 flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass p-6 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-semibold mb-4 dark:text-white">
            Quiénes somos
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Creative Hands es una tienda dedicada a la artesanía y productos
            hechos a mano. Nuestra misión es conectar artesanos con clientes que
            valoran piezas únicas y sostenibles.
          </p>

          <section className="mb-6">
            <h2 className="text-lg font-medium dark:text-white">
              Nuestra historia
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Nacimos con la idea de apoyar el trabajo artesanal local y ofrecer
              productos con historia. Cada pieza se fabrica con atención al
              detalle y cariño.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium dark:text-white">Contacto</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              ¿Tienes preguntas? Escríbenos a contacto@creativehands.example
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;

