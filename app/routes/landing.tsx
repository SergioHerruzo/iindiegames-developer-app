import Card from "~/components/card";

export default function Landing() {
    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-9xl font-bold font-space-grotesk">Indie Games</h1>
                <p className="text-center max-w-2xl text-lg">
                    Indie Games es una compañía creada para impulsar el talento Indie y
                    darle voz a la comunidad. Aquí los jugadores también son creadores,
                    publican sus ideas y construyen experiencias únicas para todos.
                </p>
                <div className="flex gap-6 mt-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                        Descargar Cliente
                    </button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition">
                        Documentación
                    </button>
                </div>
            </div>
            <Card title="Juego 1" description="Descripción del juego 1" imageUrl="/images/game1.jpg" />
        </>
    )
}