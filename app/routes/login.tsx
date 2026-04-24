export default function Login() {
    return (
        <div className="flex items-center justify-center h-screen">
            <form className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-lg p-8 w-full max-w-xl">
                <h1 className="font-space-grotesk text-3xl font-bold">Indie Games</h1>
                <h3 className="text-sm text-neutral-400">Bienvenido de nuevo, por favor ingresa tus credenciales.</h3>

                <label className="block mt-4 text-sm font-medium">Nombre de Usuario</label>
                <input
                    type="text"
                    className="w-full px-4 py-2 mt-2 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <label className="block mt-4 text-sm font-medium">Contraseña</label>
                <input
                    type="password"
                    className="w-full px-4 py-2 mt-2 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button className="w-full mt-6 px-4 py-2 bg-green-700 text-white rounded-lg cursor-pointer">
                    Iniciar Sesión
                </button>
                <h4 className="text-sm text-neutral-400 mt-4">¿No tienes una cuenta? <a href="/register" className="text-green-500 hover:underline">Regístrate aquí</a></h4>
                <h4 className="text-sm text-neutral-400 mt-2"><a href="/forgot-password" className="text-green-500 hover:underline">¿Olvidaste tu contraseña?</a></h4>
            </form>
        </div>
    )
}