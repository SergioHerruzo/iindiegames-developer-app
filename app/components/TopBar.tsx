export default function TopBar() {
    return (
        <nav className="w-full h-20 bg-bg-100 border-b border-bg-500 flex items-center justify-between px-40">
            <div className="flex items-center justify-start gap-8">
                <a href="/dashboard" className="text-2xl font-space-grotesk text-text-200">Indie Games</a>
            </div>
            <div className="flex items-center justify-start gap-4">
                <button className="border border-bg-300 cursor-pointer">
                    <img
                        src="https://preview.redd.it/ce-spuneti-de-dictatorul-mbappe-v0-k8l241njsqtg1.jpeg?width=451&format=pjpg&auto=webp&s=860149b0068c2f1b1efd438b35b9a8154b6a3f93"
                        alt="User Avatar"
                        className="h-10 w-10 rounded-full object-cover"
                    />
                </button>
            </div>
        </nav>
    )
}