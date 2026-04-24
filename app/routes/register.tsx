import { Mail, User, Lock, ShieldCheck } from 'lucide-react';

export default function Register() {
    return (
        <div className="flex items-center justify-center h-screen px-4">
            <form className="bg-bg-200 border border-bg-300 rounded-2xl shadow-lg p-8 w-full max-w-xl">
                <h1 className="font-space-grotesk text-3xl font-bold">Indie Games</h1>
                <h3 className="text-sm text-text-200">Crea tu cuenta para empezar a publicar y descubrir juegos indie.</h3>

                <label className="block mt-4 text-sm font-medium">Correo Electrónico</label>
                <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="email"
                        placeholder="Ingresa tu correo electrónico"
                        className="w-full pl-10 pr-4 py-2 bg-bg-300 border border-bg-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-200 placeholder:text-sm placeholder:text-text-200"
                    />
                </div>

                <label className="block mt-4 text-sm font-medium">Nombre de Usuario</label>
                <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="text"
                        placeholder="Crea tu nombre de usuario"
                        className="w-full pl-10 pr-4 py-2 bg-bg-300 border border-bg-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-200 placeholder:text-sm placeholder:text-text-200"
                    />
                </div>

                <label className="block mt-4 text-sm font-medium">Contraseña</label>
                <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="password"
                        placeholder="Crea una contraseña segura"
                        className="w-full pl-10 pr-4 py-2 bg-bg-300 border border-bg-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-200 placeholder:text-sm placeholder:text-text-200"
                    />
                </div>

                <label className="block mt-4 text-sm font-medium">Confirmar Contraseña</label>
                <div className="relative mt-2">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="password"
                        placeholder="Confirma tu contraseña"
                        className="w-full pl-10 pr-4 py-2 bg-bg-300 border border-bg-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-200 placeholder:text-sm placeholder:text-text-200"
                    />
                </div>

                <button className="w-full mt-6 px-4 py-2 bg-primary-100 text-text-100 rounded-lg cursor-pointer hover:bg-primary-200 transition-colors">
                    Crear Cuenta
                </button>

                <h4 className="text-sm text-text-200 mt-4">
                    ¿Ya tienes una cuenta? <a href="/login" className="text-accent-100 hover:text-primary-200 hover:underline">Inicia sesión aquí</a>
                </h4>
            </form>
        </div>
    )
}