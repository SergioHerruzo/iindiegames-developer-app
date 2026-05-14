import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@auth/UseAuth";
import PrimaryButton from "@components/PrimaryButton";
import SecondaryButton from "@components/SecondaryButton";
import TopBar from "@components/TopBar/TopBar";

export default function Home() {
    const { isAuthenticated, isLoading, profile } = useAuth();

    return (
        <div className="min-h-screen flex flex-col landing-bg">
            <TopBar />

            <main className="flex-1 flex flex-col items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-4 text-center max-w-2xl px-6">
                    <h1>IndieGames</h1>
                    <p className="text-lg leading-relaxed">
                        La plataforma para desarrolladores independientes. Publica tus juegos,
                        gestiona builds y llega a miles de jugadores desde un solo lugar.
                    </p>
                </div>
                {!isLoading && (
                    <div className="flex items-center gap-3">
                        {!isAuthenticated && (
                            <Link to="/register">
                                <PrimaryButton className="px-8 py-3 text-base!">
                                    <PrimaryButton.Text>Empezar a crear videojuegos</PrimaryButton.Text>
                                </PrimaryButton>
                            </Link>
                        )}
                        {isAuthenticated && profile?.role === "Developer" && (
                            <Link to="/panel">
                                <PrimaryButton className="px-8 py-3 text-base!">
                                    <PrimaryButton.Text>Ir al Panel</PrimaryButton.Text>
                                </PrimaryButton>
                            </Link>
                        )}
                        {isAuthenticated && profile?.role === "User" && (
                            <Link to="/agreement">
                                <PrimaryButton className="px-8 py-3 text-base!">
                                    <PrimaryButton.Text>Convertirse en desarrollador</PrimaryButton.Text>
                                </PrimaryButton>
                            </Link>
                        )}
                        <SecondaryButton className="px-8 py-3 text-base!">
                            <SecondaryButton.Icon icon={BookOpen} />
                            <SecondaryButton.Text>Documentación</SecondaryButton.Text>
                        </SecondaryButton>
                    </div>
                )}
            </main>
        </div>
    );
}
