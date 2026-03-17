import Card from "../components/Card";

function KPI({ label, value, tone }) {
    const toneMap = {
        red: "text-[var(--red)]",
        yellow: "text-[var(--yellow)]",
        green: "text-[var(--green)]",
        blue: "text-[var(--blue)]",
    };

    return (
        <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                {label}
            </div>
            <div className={`mt-2 text-2xl font-bold tabular-nums ${tone ? toneMap[tone] : ""}`}>
                {value}
            </div>
        </div>
    );
}

export default function PerformanceHome() {
    return (
        <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPI label="Players flagged" value="3" tone="red" />
                <KPI label="Avg wellness" value="6.8" />
                <KPI label="Sessions today" value="2" tone="blue" />
            </div>

            {/* Alerts + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card
                    title="Alerts"
                    subtitle="What needs attention now"
                    className="lg:col-span-2"
                >
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-md border border-[var(--border)] p-3 hover:bg-slate-50 transition-colors">
                            <div>
                                <div className="text-sm font-bold">3 athletes in RED</div>
                                <div className="text-xs text-[var(--text-secondary)] mt-1">
                                    Load flag + low wellness reported today
                                </div>
                            </div>
                            <button className="px-3 py-1.5 rounded-md bg-[#0B1220] text-white text-xs font-bold uppercase tracking-wider">
                                Review
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-md border border-[var(--border)] p-3 hover:bg-slate-50 transition-colors">
                            <div>
                                <div className="text-sm font-bold">Wellness missing (5)</div>
                                <div className="text-xs text-[var(--text-secondary)] mt-1">
                                    Athletes haven’t submitted today
                                </div>
                            </div>
                            <button className="px-3 py-1.5 rounded-md border border-[var(--border)] text-xs font-bold uppercase tracking-wider">
                                Remind
                            </button>
                        </div>
                    </div>
                </Card>

                <Card title="Quick actions" subtitle="Fast workflows">
                    <div className="space-y-2">
                        <button className="w-full px-3 py-2.5 rounded-md bg-[#0B1220] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-95 transition-opacity">
                            Enter Session
                        </button>
                        <button className="w-full px-3 py-2.5 rounded-md border border-[var(--border)] text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">
                            Wellness Summary
                        </button>
                        <button className="w-full px-3 py-2.5 rounded-md border border-[var(--border)] text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">
                            Export Report
                        </button>
                    </div>
                </Card>
            </div>

            {/* Table area */}
            <Card title="Today overview" subtitle="Scan the squad fast">
                <div className="overflow-auto rounded-lg border border-[var(--border)]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F8FAFC] text-[10px] uppercase font-bold tracking-widest text-[var(--text-secondary)] border-b border-[var(--border)]">
                                <th className="text-left p-4">Athlete</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-center p-4">Wellness</th>
                                <th className="text-center p-4">Load</th>
                                <th className="text-right p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {[
                                { name: "M. Jones", status: "RED", wellness: "3/10", load: "High" },
                                { name: "S. Conners", status: "YELLOW", wellness: "5/10", load: "Mod" },
                                { name: "T. Reynolds", status: "GREEN", wellness: "8/10", load: "Low" },
                            ].map((r) => (
                                <tr key={r.name} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 font-bold text-slate-800 tracking-tight">{r.name}</td>
                                    <td className="p-4">
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${r.status === "RED"
                                                    ? "border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red)]"
                                                    : r.status === "YELLOW"
                                                        ? "border-[var(--yellow)]/30 bg-[var(--yellow)]/10 text-[var(--yellow)]"
                                                        : "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]"
                                                }`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center tabular-nums">{r.wellness}</td>
                                    <td className="p-4 text-center">{r.load}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors">
                                            Open
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
