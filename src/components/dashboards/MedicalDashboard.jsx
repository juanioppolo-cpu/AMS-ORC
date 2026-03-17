import { useState, useMemo } from "react";
import Card from "../Card";
import BodyMap from "../BodyMap";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashMedical({ division, date, submissions, athletesInDivision }) {
    const [selectedAthleteId, setSelectedAthleteId] = useState(athletesInDivision[0]?.athleteId || "");

    // Filter all medical injuries for this division
    const allInjuries = submissions.filter(s =>
        s.templateId === "ft_medical_injury" &&
        s.division === division
    );

    // Filter injuries for selected athlete
    const athleteInjuries = useMemo(() => {
        return allInjuries.filter(injury => injury.subjectId === selectedAthleteId);
    }, [allInjuries, selectedAthleteId]);

    // Count by injury type (for selected athlete)
    const injuryTypeCounts = useMemo(() => {
        const counts = {};
        for (const injury of athleteInjuries) {
            const type = injury.values?.injuryType || "No especificado";
            counts[type] = (counts[type] || 0) + 1;
        }
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [athleteInjuries]);

    // Count by mechanism (contact vs non-contact) for selected athlete
    const mechanismCounts = useMemo(() => {
        const counts = { Contacto: 0, "No Contacto": 0 };
        for (const injury of athleteInjuries) {
            const mechanism = injury.values?.mechanism || "";
            if (mechanism.toLowerCase().includes("contacto")) {
                counts.Contacto++;
            } else {
                counts["No Contacto"]++;
            }
        }
        return [
            { name: "Contacto", value: counts.Contacto, color: "#ef4444" },
            { name: "No Contacto", value: counts["No Contacto"], color: "#3b82f6" }
        ].filter(item => item.value > 0);
    }, [athleteInjuries]);

    // Count by body zone for selected athlete
    const zoneCounts = useMemo(() => {
        const counts = {};
        for (const injury of athleteInjuries) {
            const zone = injury.values?.zone || "No especificado";
            const hemisphere = injury.values?.hemisphere || "";
            const fullZone = hemisphere ? `${zone} (${hemisphere})` : zone;
            counts[fullZone] = (counts[fullZone] || 0) + 1;
        }
        return counts;
    }, [athleteInjuries]);

    const selectedAthlete = athletesInDivision.find(a => a.athleteId === selectedAthleteId);

    return (
        <div className="container">
            <div style={{ display: "grid", gap: 12 }}>
                {/* Athlete Selector */}
                <Card title="Análisis Individual de Lesiones" subtitle="Seleccionar atleta para ver historial médico">
                    <div className="row" style={{ gap: 16, alignItems: "center" }}>
                        <span className="small">Atleta:</span>
                        <select
                            className="select"
                            value={selectedAthleteId}
                            onChange={(e) => setSelectedAthleteId(e.target.value)}
                            style={{ minWidth: 200 }}
                        >
                            {athletesInDivision.map(a => (
                                <option key={a.athleteId} value={a.athleteId}>{a.name}</option>
                            ))}
                        </select>
                        <div style={{ marginLeft: "auto" }}>
                            <div style={{ fontWeight: 700 }}>{athleteInjuries.length}</div>
                            <div className="small">Lesiones totales</div>
                        </div>
                    </div>
                </Card>

                {athleteInjuries.length === 0 ? (
                    <Card title="Sin Lesiones" subtitle={selectedAthlete?.name}>
                        <div className="small">Este atleta no tiene lesiones registradas.</div>
                    </Card>
                ) : (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {/* Bar Chart - Injury Types */}
                            <Card title="Lesiones por Tipo" subtitle={selectedAthlete?.name}>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={injuryTypeCounts}>
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#3b82f6" name="Cantidad" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>

                            {/* Pie Chart - Contact vs Non-Contact */}
                            <Card title="Mecanismo de Lesión" subtitle="Contacto vs No Contacto">
                                {mechanismCounts.length === 0 ? (
                                    <div className="small">No hay datos de mecanismo.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={mechanismCounts}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {mechanismCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </Card>
                        </div>

                        {/* Body Diagram */}
                        <Card title="Mapa Corporal de Lesiones" subtitle={`Zonas afectadas - ${selectedAthlete?.name}`}>
                            <BodyMap injuries={athleteInjuries} />

                            {/* Zone counts legend */}
                            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {Object.entries(zoneCounts).map(([zone, count]) => (
                                    <span key={zone} className="pill" style={{ fontSize: 12 }}>
                                        {zone}: {count}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* Diagnoses List */}
                        <Card title="Diagnósticos Registrados" subtitle={`Historial completo - ${selectedAthlete?.name}`}>
                            <div style={{ display: "grid", gap: 12 }}>
                                {athleteInjuries.map(injury => (
                                    <div
                                        key={injury.id}
                                        style={{
                                            padding: 12,
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 8,
                                            backgroundColor: "#f9fafb"
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <div style={{ fontWeight: 700 }}>
                                                {injury.values?.diagnosis || "Sin diagnóstico"}
                                            </div>
                                            <span className="small" style={{ color: "#6b7280" }}>{injury.date}</span>
                                        </div>
                                        <div className="small" style={{ color: "#6b7280" }}>
                                            <strong>Tipo:</strong> {injury.values?.injuryType || "N/A"} •
                                            <strong> Mecanismo:</strong> {injury.values?.mechanism || "N/A"} •
                                            <strong> Zona:</strong> {injury.values?.zone || "N/A"} {injury.values?.hemisphere || ""}
                                            {injury.values?.recurrence && ` • Recurrencia: ${injury.values.recurrence}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
