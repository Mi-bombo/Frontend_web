
import inclusionImg from "/inclusion.jpg";
import transporteImg from "/transporte.jpg";
import tecnologiaImg from "/tecnologia.jpg";

export function About() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-cyan-200 via-white to-blue-100 flex flex-col">
            <section className="py-12 bg-white">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h1 className="text-5xl font-bold font-serif text-blue-700 mb-4 drop-shadow">
                        Acerca de nuestro sistema
                    </h1>
                    <p className="text-lg text-gray-700 mb-2">
                        La innovación en el transporte público de Formosa, inspirado en los valores nacionales.
                    </p>
                    <div className="w-20 h-2 mx-auto bg-yellow-300 rounded mt-4 mb-6" />
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-16 bg-white rounded-xl shadow-lg">

                <div>
                    <h2 className="text-3xl font-bold text-cyan-700 font-serif mb-4">
                        Inclusión y conectividad
                    </h2>
                    <p className="text-gray-700 text-base mb-4">
                        Nuestro sistema vincula colectiveros y supervisores de manera inclusiva, promoviendo igualdad y colaboración para toda la ciudad.
                    </p>
                    <div className="w-10 h-1 bg-yellow-400 mb-4 rounded" />
                </div>
                <div className="flex justify-center">
                    <img
                        src={inclusionImg}
                        alt="Inclusión en el transporte"
                        className="rounded-xl shadow-lg w-full max-w-xs border-4 border-blue-200" />
                </div>

                <div className="flex justify-center md:order-3 order-4">
                    <img
                        src={transporteImg}
                        alt="Transporte inteligente"
                        className="rounded-xl shadow-lg w-full max-w-xs border-4 border-cyan-200" />
                </div>
                <div className="md:order-4 order-3">
                    <h2 className="text-3xl font-bold text-blue-700 font-serif mb-4">
                        Modernización y tecnología
                    </h2>
                    <p className="text-gray-700 text-base mb-4">
                        El sistema es ágil, seguro y escalable, usando lo más avanzado en arquitectura orientada a eventos y gestión en tiempo real, brindando eficiencia y transparencia.
                    </p>
                    <div className="w-8 h-1 bg-yellow-400 mb-4 rounded" />
                </div>

                <div className="md:col-span-2 flex flex-col items-center mt-8">
                    <h2 className="text-3xl font-bold text-cyan-700 font-serif mb-2">
                        Orgullo formoseño, identidad nacional
                    </h2>
                    <p className="text-gray-700 text-base mb-4 text-center max-w-2xl">
                        Nuestro sistema refleja los colores y fortalezas de la Argentina: el celeste del cielo, el blanco de la igualdad y el amarillo del sol, símbolo de energía y movimiento. Creemos en un transporte público confiable y humano para todos.
                    </p>
                    <img
                        src={tecnologiaImg}
                        alt="Tecnología e identidad"
                        className="rounded-full shadow-xl w-36 h-36 border-4 border-yellow-400 bg-white" />
                    <div className="w-16 h-2 bg-yellow-300 my-6 rounded-full" />
                </div>
            </section>

            <footer className="py-6 bg-gradient-to-r from-cyan-300 to-blue-500 flex justify-center items-center">
                <span className="text-white font-bold text-xl font-serif drop-shadow">
                    Transporte Público Formosa
                </span>
                <span className="w-6 h-6 bg-yellow-400 rounded-full ml-4"></span>
            </footer>
        </main>
    );
}
