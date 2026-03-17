import Card from "../components/Card";

export default function AdminHome() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[var(--border)] shadow-sm">
                    <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">System Status</div>
                    <div className="mt-2 text-sm font-bold text-[var(--green)]">ONLINE</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[var(--border)] shadow-sm">
                    <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Data Flow</div>
                    <div className="mt-2 text-sm font-bold text-[var(--blue)]">NOMINAL</div>
                </div>
            </div>

            <Card title="Integration Matrix" subtitle="Connected data sources">
                <div className="divide-y divide-[var(--border)] text-sm">
                    <div className="py-2 flex justify-between">
                        <span>GPS (Catapult)</span>
                        <span className="text-[var(--green)] font-medium">CONNECTED</span>
                    </div>
                    <div className="py-2 flex justify-between">
                        <span>HR (Polar)</span>
                        <span className="text-[var(--red)] font-medium">ERROR (API 401)</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
