import Card from "@components/Card";
import { Input } from "@components/Input";
import { Lock, User } from "lucide-react";
import { useState } from "react";
import PrimaryButton from "@components/PrimaryButton";
import { Link } from "react-router";

export default function Login() {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");

    return (
        <form className="min-h-screen max-w-xl m-auto flex items-center">
            <Card>

                <div className="mb-6">
                    <h2>
                        Iniciar Sesión
                    </h2>
                    <h5>
                        Bienvenido de nuevo, ingresa tus credenciales
                    </h5>
                </div>

                <div className="flex flex-col gap-4">
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

                    <PrimaryButton>
                        Iniciar Sesión
                    </PrimaryButton>
                    <div className="flex flex-col gap-3">
                        <p className="text-sm">
                            Has olvidado tu contraseña? <Link to="/recover" className="link">Recuperar</Link>
                        </p>
                        <p className="text-sm">
                            No tienes una cuenta? <Link to="/register" className="link">Registrarse</Link>
                        </p>
                    </div>
                </div>
            </Card>
        </form>
    );
}