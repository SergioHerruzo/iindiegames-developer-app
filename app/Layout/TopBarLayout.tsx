import { Outlet } from "react-router"
import TopBar from "@components/TopBar/TopBar";

export default function TopBarLayout() {
    return (
        <>
            <TopBar />
            <main>
                <Outlet />
            </main>
        </>
    )
}