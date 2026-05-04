import { Link, useParams } from "react-router";
import TopBar from "@components/TopBar/TopBar";
import { ArrowLeft } from "lucide-react";

export default function Game() {
    const { gameId } = useParams();

    return (
        <>
            <TopBar />
            <div className="p-6 flex flex-col gap-4">
                {/* Title */}
                <Link
                    to="/panel"
                    className="group inline-flex items-center w-fit text-slate-600 dark:text-white/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-300"
                >
                    <div className="flex items-center w-0 overflow-hidden opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:w-6 group-hover:opacity-100 group-hover:translate-x-0">
                        <ArrowLeft size={16} />
                    </div>
                    <span>Volver al Panel</span>
                </Link>
                <h2>{gameId}</h2>
            </div>
        </>
    )
}