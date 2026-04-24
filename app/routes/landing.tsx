import Card from "~/components/card";

export default function Landing() {
    return (
        <>
            <div className="flex flex-col h-screen">
                <div className="flex flex-col items-center justify-center flex-1 px-4">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold font-space-grotesk">Indie Games</h1>
                    <p className="text-center max-w-2xl text-sm sm:text-lg">
                        Indie Games es una compañía creada para impulsar el talento Indie y
                        darle voz a la comunidad. Aquí los jugadores también son creadores,
                        publican sus ideas y construyen experiencias únicas para todos.
                    </p>

                    <div className="flex gap-6 mt-6">
                        <button className="px-6 py-2 bg-green-700 text-white rounded-full transition-transform hover:-translate-y-1">
                            Descargar Cliente
                        </button>
                        <button className="px-6 py-2 bg-neutral-800 text-white border border-neutral-700 rounded-full transition-transform hover:-translate-y-1">
                            Documentación
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-stretch sm:items-center justify-center p-4 sm:p-6 gap-4 sm:gap-6 w-full max-w-6xl mx-auto px-4">
                    <Card>
                        <Card.Title>100</Card.Title>
                        <Card.Description>Juegos Publicados</Card.Description>
                    </Card>
                    <Card>
                        <Card.Title>250</Card.Title>
                        <Card.Description>Juegos Vendidos</Card.Description>
                    </Card>
                    <Card>
                        <Card.Title>25</Card.Title>
                        <Card.Description>Desarrolladores</Card.Description>
                    </Card>
                </div>
            </div>
        </>
    )
}