import { useState } from "react";
import { Link } from "react-router";
import Card from "@components/Card";
import { Input } from "@components/Input";
import PrimaryButton from "@components/PrimaryButton";
import { User, Lock, Mail } from "lucide-react";

export default function Register() {
    const [email, setEmail] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <form className="min-h-screen max-w-xl m-auto flex items-center">
            <Card>
                <div className="mb-6">
                    <h2>
                        Registrarse
                    </h2>
                    <h5>
                        Crea tu cuenta para comenzar a desarrollar tus juegos Indies
                    </h5>
                </div>

                <div className="flex flex-col gap-4">
                    <Input.Root
                        id="email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        variant="inside card"
                    >
                        <Input.Label>Correo Electrónico</Input.Label>
                        <Input.Field placeholder="Ingresa tu correo electrónico" icon={Mail} />
                    </Input.Root>

                    <Input.Root
                        id="user"
                        type="text"
                        value={user}
                        onChange={setUser}
                        variant="inside card"
                    >
                        <Input.Label>Usuario</Input.Label>
                        <Input.Field placeholder="Ingresa tu nombre de usuario" icon={User} />
                    </Input.Root>

                    <Input.Root
                        id="password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        variant="inside card"
                    >
                        <Input.Label>Contraseña</Input.Label>
                        <Input.Field placeholder="Ingresa tu contraseña" icon={Lock} />
                    </Input.Root>

                    <Input.Root
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        variant="inside card"
                    >
                        <Input.Label>Confirmar Contraseña</Input.Label>
                        <Input.Field placeholder="Escribe tu contraseña de nuevo" icon={Lock} />
                    </Input.Root>

                    <PrimaryButton>
                        Registrarse
                    </PrimaryButton>
                    <div className="flex flex-col gap-3">
                        <p className="text-sm">
                            Ya tienes una cuenta? <Link to="/login" className="link">Iniciar Sesión</Link>
                        </p>
                    </div>
                </div>
            </Card>
        </form>
    );
}