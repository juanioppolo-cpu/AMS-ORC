import React, { useMemo } from 'react';
import Card from '../Card';

export default function PhysicalDashboard({ submissions, athletesInDivision, date }) {
    // Filter subs by module
    const relevantSubs = useMemo(() => {
        return submissions.filter(s =>
            s.module.startsWith("Physical") && // PhysicalStrength or PhysicalField
            s.date === date &&
            athletesInDivision.some(a => a.athleteId === s.subjectId)
        );
    }, [submissions, date, athletesInDivision]);

    // Break down by type
    const strengthSubs = relevantSubs.filter(s => s.templateId === "ft_pf_strength");
    const jumpSubs = relevantSubs.filter(s => s.templateId === "ft_pf_jumps");
    const fieldSubs = relevantSubs.filter(s => s.templateId === "ft_pf_field");

    // Leaderboards (Top 3)
    const getTop3 = (subs, key, label, reverse = false) => {
        const list = subs
            .filter(s => s.values?.[key] !== undefined)
            .map(s => ({
                name: athletesInDivision.find(a => a.athleteId === s.subjectId)?.name ?? "Unknown",
                val: Number(s.values[key])
            }))
            .sort((a, b) => reverse ? a.val - b.val : b.val - a.val) // default desc (higher better), reverse for speed (lower better)
            .slice(0, 3);

        return { label, list };
    };

    const topSquat = getTop3(strengthSubs, "sentadillasKg", "Top Squat (Kg)");
    const topVert = getTop3(jumpSubs, "verticalJumpCm", "Top Vert Jump (cm)");
    const topSpeed = getTop3(fieldSubs, "velocidad10mSec", "Top Speed 10m (s)", true);

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            {/* Compliance Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <Card title="Strength Sessions">
                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{strengthSubs.length}</div>
                    <div className="small">Reports Today</div>
                </Card>
                <Card title="Jump Sessions">
                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{jumpSubs.length}</div>
                    <div className="small">Reports Today</div>
                </Card>
                <Card title="Field Sessions">
                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{fieldSubs.length}</div>
                    <div className="small">Reports Today</div>
                </Card>
            </div>

            {/* Leaderboards */}
            {(strengthSubs.length > 0 || jumpSubs.length > 0 || fieldSubs.length > 0) && (
                <div style={{ display: 'grid', gap: 16 }}>
                    <div className="section-title">DAILY LEADERS ({date})</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                        <LeaderboardCard data={topSquat} />
                        <LeaderboardCard data={topVert} />
                        <LeaderboardCard data={topSpeed} />
                    </div>
                </div>
            )}
        </div>
    );
}

function LeaderboardCard({ data }) {
    if (data.list.length === 0) return null;
    return (
        <Card title={data.label}>
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <tbody>
                    {data.list.map((item, i) => (
                        <tr key={i} style={{ borderBottom: i < 2 ? '1px solid #eee' : 'none' }}>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: i === 0 ? 'var(--primary)' : 'inherit' }}>
                                #{i + 1} {item.name}
                            </td>
                            <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>
                                {item.val}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
