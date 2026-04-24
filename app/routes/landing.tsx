import CardStats from '@components/card-stats'

export default function Landing() {
    return (
        <>
            <div className="flex flex-col h-screen bg-no-repeat bg-[radial-gradient(80vw_50vw_at_10%_0%,rgba(46,139,87,0.20),transparent_60%),radial-gradient(70vw_40vw_at_90%_100%,rgba(143,188,143,0.14),transparent_65%)]">
                <div className="flex flex-col items-center justify-center flex-1 px-4">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold font-space-grotesk">Indie Games</h1>
                    <p className="text-center max-w-2xl text-sm sm:text-lg text-text-200">
                        Indie Games es una compañía creada para impulsar el talento Indie y
                        darle voz a la comunidad. Aquí los jugadores también son creadores,
                        publican sus ideas y construyen experiencias únicas para todos.
                    </p>

                    <div className="flex gap-6 mt-6">
                        <button className="px-6 py-2 bg-primary-100 text-text-100 rounded-full transition-transform hover:-translate-y-1 hover:bg-primary-200">
                            Descargar Cliente
                        </button>
                        <button className="px-6 py-2 bg-bg-200 text-text-100 border border-bg-300 rounded-full transition-transform hover:-translate-y-1 hover:bg-bg-300">
                            Documentación
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-stretch sm:items-center justify-center p-4 sm:p-6 gap-4 sm:gap-6 w-full max-w-6xl mx-auto px-4">
                    <CardStats>
                        <CardStats.Title>100</CardStats.Title>
                        <CardStats.Description>Juegos Publicados</CardStats.Description>
                    </CardStats>
                    <CardStats>
                        <CardStats.Title>250</CardStats.Title>
                        <CardStats.Description>Juegos Vendidos</CardStats.Description>
                    </CardStats>
                    <CardStats>
                        <CardStats.Title>25</CardStats.Title>
                        <CardStats.Description>Desarrolladores</CardStats.Description>
                    </CardStats>
                </div>
            </div>
        </>
    )
}