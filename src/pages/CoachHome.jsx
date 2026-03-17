import Card from "../components/Card";

export default function CoachHome() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[var(--border)] shadow-sm">
                    <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Available Players</div>
                    <div className="mt-2 text-2xl font-semibold text-[var(--green)]">22/25</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[var(--border)] shadow-sm">
                    <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Training Intensity</div>
                    <div className="mt-2 text-2xl font-semibold">Optimal</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[var(--border)] shadow-sm">
                    <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Match Fatigue</div>
                    <div className="mt-2 text-2xl font-semibold text-[var(--yellow)]">Moderate</div>
                </div>
            </div>

            <Card title="Selection Board" subtitle="Proposed lineup for next match">
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-md text-[var(--text-secondary)]">
                    Visual Selection Component Stub
                </div>
            </Card>
        </div>
    );
}
