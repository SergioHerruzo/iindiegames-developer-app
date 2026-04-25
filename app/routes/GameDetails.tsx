import { useParams } from "react-router-dom";
import TopBar from "@components/TopBar";

export default function GameDetails() {
    const { id } = useParams();

    return (
        <>
            <TopBar />
        </>
    )
}