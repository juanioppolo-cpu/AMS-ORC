export default function AppShell({ title, subtitle, children, right }) {
    return (
        <div className="flex-1 min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-[var(--bg-app)]/90 backdrop-blur border-b border-[var(--border)]">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-[var(--text-secondary)]">
                            Dashboard / {subtitle ?? "Home"}
                        </div>
                        <h1 className="text-[20px] font-semibold">{title}</h1>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-3">
                        {right}
                        <div className="hidden md:flex items-center gap-2 rounded-md bg-white px-3 py-2 border border-[var(--border)] shadow-sm">
                            <span className="text-xs text-[var(--text-secondary)]">Date</span>
                            <span className="text-sm font-medium">Today</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="px-6 py-6">
                <div className="max-w-6xl">{children}</div>
            </div>
        </div>
    );
}
