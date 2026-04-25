import { Link, useParams } from "react-router-dom";
import TopBar from "@components/TopBar";
import { ArrowLeft } from "lucide-react";

export default function GameDetails() {
    const { id } = useParams();

    return (
        <>
            <TopBar />
            <div className="px-40 py-8">
                <div>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-200 hover:text-text-300 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                        Volver al dashboard
                    </Link>
                    <h1 className="text-3xl mt-4">Detalles del juego</h1>
                </div>
            </div>
        </>
    )
}