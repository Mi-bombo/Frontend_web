
import inclusionImg from "/inclusion.jpg";
import transporteImg from "/transporte.jpg";
import tecnologiaImg from "/tecnologia.jpg";

export function About() {
    return (
        <main className="flex flex-col min-h-screen bg-linear-to-b from-cyan-200 via-white to-blue-100">
            <section className="py-12 bg-white">
                <div className="max-w-4xl px-6 mx-auto text-center">
                    <h1 className="mb-4 font-serif text-5xl font-bold text-blue-700 drop-shadow">
                        Acerca de nuestro sistema
                    </h1>
                    <p className="mb-2 text-lg text-gray-700">
                        La innovación en el transporte público de Formosa, inspirado en los valores nacionales.
                    </p>
                    <div className="w-20 h-2 mx-auto mt-4 mb-6 bg-yellow-300 rounded" />
                </div>
            </section>

            <section className="grid items-center max-w-6xl grid-cols-1 gap-10 px-6 py-16 mx-auto bg-white shadow-lg md:grid-cols-2 rounded-xl">

                <div>
                    <h2 className="mb-4 font-serif text-3xl font-bold text-cyan-700">
                        Inclusión y conectividad
                    </h2>
                    <p className="mb-4 text-base text-gray-700">
                        Nuestro sistema vincula colectiveros y supervisores de manera inclusiva, promoviendo igualdad y colaboración para toda la ciudad.
                    </p>
                    <div className="w-10 h-1 mb-4 bg-yellow-400 rounded" />
                </div>
                <div className="flex justify-center">
                    <img
                        src={inclusionImg}
                        alt="Inclusión en el transporte"
                        className="w-full max-w-xs border-4 border-blue-200 shadow-lg rounded-xl" />
                </div>

                <div className="flex justify-center order-4 md:order-3">
                    <img
                        src={transporteImg}
                        alt="Transporte inteligente"
                        className="w-full max-w-xs border-4 shadow-lg rounded-xl border-cyan-200" />
                </div>
                <div className="order-3 md:order-4">
                    <h2 className="mb-4 font-serif text-3xl font-bold text-blue-700">
                        Modernización y tecnología
                    </h2>
                    <p className="mb-4 text-base text-gray-700">
                        El sistema es ágil, seguro y escalable, usando lo más avanzado en arquitectura orientada a eventos y gestión en tiempo real, brindando eficiencia y transparencia.
                    </p>
                    <div className="w-8 h-1 mb-4 bg-yellow-400 rounded" />
                </div>

                <div className="flex flex-col items-center mt-8 md:col-span-2">
                    <h2 className="mb-2 font-serif text-3xl font-bold text-cyan-700">
                        Orgullo formoseño, identidad nacional
                    </h2>
                    <p className="max-w-2xl mb-4 text-base text-center text-gray-700">
                        Nuestro sistema refleja los colores y fortalezas de la Argentina: el celeste del cielo, el blanco de la igualdad y el amarillo del sol, símbolo de energía y movimiento. Creemos en un transporte público confiable y humano para todos.
                    </p>
                    <img
                        src={tecnologiaImg}
                        alt="Tecnología e identidad"
                        className="bg-white border-4 border-yellow-400 rounded-full shadow-xl w-36 h-36" />
                    <div className="w-16 h-2 my-6 bg-yellow-300 rounded-full" />
                </div>
            </section>

            <footer className="flex items-center justify-center py-6 bg-linear-to-r from-cyan-300 to-blue-500">
                <span className="font-serif text-xl font-bold text-white drop-shadow">
                    Transporte Público Formosa
                </span>
                <span className="w-6 h-6 ml-4 bg-yellow-400 rounded-full"></span>
            </footer>
        </main>
    );
}
