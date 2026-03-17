import Card from "../components/Card";

export default function AthleteHome() {
    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="text-center py-8">
                <div className="text-6xl mb-4">🔋</div>
                <h2 className="text-3xl font-bold text-[var(--green)]">85% Ready</h2>
                <p className="text-[var(--text-secondary)] mt-1">Consistency is key today, Juan.</p>
            </div>

            <Card title="Daily Tasks" subtitle="Compliance checklist">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-md bg-[var(--bg-app)] border border-[var(--border)]">
                        <input type="checkbox" className="w-5 h-5 accent-[var(--green)]" defaultChecked />
                        <span className="text-sm">Morning Wellness</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-md border border-[var(--border)]">
                        <input type="checkbox" className="w-5 h-5 accent-[var(--green)]" />
                        <span className="text-sm">Post-Training RPE</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
