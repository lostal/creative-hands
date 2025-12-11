/**
 * About Page - Company story and philosophy
 */

import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const About = () => {
    return (
        <div className="py-12 md:py-20">
            <div className="container max-w-3xl">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                >
                    <motion.div variants={fadeInUp} className="text-center mb-12">
                        <h1 className="font-brand text-4xl md:text-5xl text-foreground mb-4">
                            Nuestra Historia
                        </h1>
                        <p className="text-lg text-foreground-secondary">
                            Arte hecho a mano, diseñado para perdurar
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="prose prose-lg max-w-none">
                        <div className="space-y-8 text-foreground-secondary">
                            <p className="text-lg leading-relaxed">
                                Creative Hands nació de la pasión por crear objetos únicos que cuenten una historia.
                                Cada pieza que elaboramos es el resultado de horas de trabajo dedicado, donde la paciencia
                                y el detalle se convierten en arte tangible.
                            </p>

                            <div className="my-12 py-8 border-y border-border">
                                <blockquote className="text-2xl font-brand text-foreground text-center italic">
                                    "Cada pieza es una conversación entre el material y las manos que lo moldean"
                                </blockquote>
                            </div>

                            <h2 className="font-brand text-2xl text-foreground mt-12 mb-4">
                                Filosofía
                            </h2>
                            <p className="leading-relaxed">
                                Creemos en la belleza de lo imperfecto, en las pequeñas variaciones que hacen
                                cada pieza única. No buscamos la producción en masa, sino la creación consciente.
                                Cada objeto que sale de nuestro taller lleva consigo parte de nuestra historia.
                            </p>

                            <h2 className="font-brand text-2xl text-foreground mt-12 mb-4">
                                Materiales
                            </h2>
                            <p className="leading-relaxed">
                                Trabajamos con materiales nobles y sostenibles. Desde cerámicas de alta temperatura
                                hasta maderas de origen responsable, cada material es seleccionado por su calidad
                                y su capacidad de envejecer con gracia.
                            </p>

                            <h2 className="font-brand text-2xl text-foreground mt-12 mb-4">
                                El Proceso
                            </h2>
                            <p className="leading-relaxed">
                                Todo comienza con una idea, un boceto en papel. Luego viene la selección del
                                material, el trabajo manual, los detalles cuidados uno a uno. Finalmente, cada
                                pieza pasa por un control de calidad antes de encontrar su nuevo hogar.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="mt-16 p-8 bg-surface border border-border rounded-lg text-center"
                    >
                        <h3 className="font-brand text-xl text-foreground mb-3">
                            ¿Tienes alguna pregunta?
                        </h3>
                        <p className="text-foreground-secondary mb-4">
                            Nos encantaría saber de ti
                        </p>
                        <a
                            href="mailto:hola@creativehands.es"
                            className="text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                            hola@creativehands.es
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
