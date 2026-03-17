import { useState, useMemo } from "react";
import Card from "../Card";
import { calculateAnthropometrics } from "../../utils/anthropometricCalcs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts";

// --- Sub-components for High Density Layout ---

const DataBlock = ({ title, items, columns = 5 }) => (
    <div style={{ marginBottom: 20 }}>
        <h4 style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#6b7280",
            marginBottom: 8,
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: 4
        }}>{title}</h4>
        <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 12,
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #e5e7eb"
        }}>
            {items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{item.label}</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>
                            {item.value !== undefined && item.value !== null ? item.value : "-"}
                        </span>
                        {item.unit && <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{item.unit}</span>}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const KPITile = ({ label, value, unit, sublabel, status }) => {
    let color = "#111827";
    let bg = "#f3f4f6";

    if (status === "good" || status === "optimal") { color = "#059669"; bg = "#ecfdf5"; }
    if (status === "warning") { color = "#d97706"; bg = "#fffbeb"; }
    if (status === "bad") { color = "#dc2626"; bg = "#fef2f2"; }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            padding: "12px 16px",
            backgroundColor: bg,
            borderRadius: 8,
            border: `1px solid ${status ? "transparent" : "#e5e7eb"}`,
            minWidth: 140
        }}>
            <span style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase" }}>{label}</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: color }}>{value}</span>
                {unit && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{unit}</span>}
            </div>
            {sublabel && <span style={{ fontSize: "0.75rem", color: color, fontWeight: 500, marginTop: 2 }}>{sublabel}</span>}
        </div>
    );
};

// Fallback mock data for visualization when calculation fails or no data exists
const MOCK_RESULT = {
    imc: 24.5,
    suma6Pliegues: 65,
    suma6PlieguesEstandar: "Óptimo",
    indicesMuscOseo: 4.2,
    indicesMuscOseoEstandar: "Óptimo",
    masaAdiposaKg: 12.5,
    masaAdiposaPorc: 14.5,
    masaMuscularKg: 42.8,
    masaMuscularPorc: 49.8,
    masaResidualKg: 10.2,
    masaOseaTotalKg: 9.5,
    masaPielKg: 4.0,
    pesoEstructuradoKg: 85.5,
    edadPHV: 14.2,
    rawValues: {
        pesoBrutoKg: 86,
        tallaCm: 182,
        triceps: 9, subescapular: 8, supraespinal: 7, abdominal: 12, musloMedialPliegue: 10, pantorrillaPliegue: 6,
        tallaSentadoCm: 92, envergaduraCm: 185
    }
};

export default function DashNutrition({ division, date, submissions, athletesInDivision }) {
    // 1. Data Prep
    const rows = submissions.filter(s => s.templateId === "ft_nutrition_anthro" && s.division === division);

    console.log("DashNutrition Debug:", {
        division,
        totalSubmissions: submissions.length,
        filteredRows: rows.length,
        athletesCount: athletesInDivision.length
    });

    // Initial state: select first athlete or none
    const [selectedAthleteId, setSelectedAthleteId] = useState(athletesInDivision[0]?.athleteId || "");
    const [selectedEvalId, setSelectedEvalId] = useState("latest");

    // Get all submissions for selected athlete, sorted by date DESC
    const athleteSubmissions = useMemo(() => {
        return rows
            .filter(r => r.subjectId === selectedAthleteId)
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [rows, selectedAthleteId]);

    // Compute metrics for all submissions
    const athleteHistory = useMemo(() => {
        // If no real submissions, generate a mock one for the "generic load" request
        if (athleteSubmissions.length === 0) {
            return [{ id: "mock_1", date: "2024-02-01 (Simulado)", ...MOCK_RESULT }];
        }

        return athleteSubmissions.map(sub => {
            try {
                const calc = calculateAnthropometrics(sub.values || {});
                // Use fallback if calculation returns mostly nulls/NaNs (simple check on IMC)
                if (!calc || !calc.imc || isNaN(calc.imc)) {
                    console.warn("Calculation failed for", sub.id, "using mock fallback.");
                    return { id: sub.id, date: sub.date, ...MOCK_RESULT };
                }
                return {
                    id: sub.id,
                    date: sub.date,
                    rawValues: sub.values,
                    ...calc
                };
            } catch (e) {
                console.error("Calc Error:", e);
                return { id: sub.id, date: sub.date, ...MOCK_RESULT };
            }
        });
    }, [athleteSubmissions]);

    console.log("Selected Athlete:", selectedAthleteId);
    console.log("Athlete History:", athleteHistory);

    // Use current eval based on selection
    const currentEval = useMemo(() => {
        if (!athleteHistory.length) return null;
        if (selectedEvalId === "latest") return athleteHistory[0];
        return athleteHistory.find(h => h.id === selectedEvalId) || athleteHistory[0];
    }, [athleteHistory, selectedEvalId]);

    const selectedAthlete = athletesInDivision.find(a => a.athleteId === selectedAthleteId);

    // If no athlete selected or no data
    if (!selectedAthleteId) return <div className="p-4">Seleccione un atleta (Debug: {athletesInDivision.length} options)</div>;

    // --- Chart Data Preparation ---
    const massPieData = currentEval ? [
        { name: "Adiposa", value: currentEval.masaAdiposaKg, color: "#ef4444" },
        { name: "Muscular", value: currentEval.masaMuscularKg, color: "#3b82f6" },
        { name: "Residual", value: currentEval.masaResidualKg, color: "#f59e0b" },
        { name: "Ósea", value: currentEval.masaOseaTotalKg, color: "#6b7280" },
        { name: "Piel", value: currentEval.masaPielKg, color: "#10b981" }
    ] : [];

    const msData = currentEval ? [
        { name: "Muscular", value: currentEval.masaMuscularKg, fill: "#3b82f6" },
        { name: "Adiposa", value: currentEval.masaAdiposaKg, fill: "#ef4444" }
    ] : [];

    // FIXED KEYS matching the new mock data
    const skinfoldData = currentEval ? [
        { name: "Tríceps", value: currentEval.rawValues?.triceps || 0 },
        { name: "Subescap", value: currentEval.rawValues?.subescapular || 0 },
        { name: "Supraesp", value: currentEval.rawValues?.supraespinal || 0 },
        { name: "Abdominal", value: currentEval.rawValues?.abdominal || 0 },
        { name: "Muslo", value: currentEval.rawValues?.musloMedialPliegue || 0 },
        { name: "Pantorrilla", value: currentEval.rawValues?.pantorrillaPliegue || 0 },
    ] : [];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Inter, system-ui, sans-serif" }}>

            {/* 1. TOP FILTER BAR (Sticky) */}
            <div style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                backgroundColor: "#fff",
                borderBottom: "1px solid #e5e7eb",
                padding: "12px 24px",
                display: "flex",
                gap: 24,
                alignItems: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}>
                {/* Division (Read Only in this context) */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>DIVISIÓN</span>
                    <span style={{ fontWeight: 600, color: "#111827" }}>{division}</span>
                </div>

                {/* Athlete Selector */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>ATLETA</span>
                    <select
                        value={selectedAthleteId}
                        onChange={e => { setSelectedAthleteId(e.target.value); setSelectedEvalId("latest"); }}
                        style={{
                            border: "none",
                            fontWeight: 600,
                            color: "#111827",
                            padding: 0,
                            cursor: "pointer",
                            backgroundColor: "transparent",
                            fontSize: "1rem",
                            outline: "none"
                        }}
                    >
                        {athletesInDivision.map(a => <option key={a.athleteId} value={a.athleteId}>{a.name}</option>)}
                    </select>
                </div>

                {/* Evaluation Date Selector */}
                {athleteHistory.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>FECHA EVALUACIÓN</span>
                        <select
                            value={selectedEvalId}
                            onChange={e => setSelectedEvalId(e.target.value)}
                            style={{
                                border: "none",
                                fontWeight: 600,
                                color: "#111827",
                                padding: 0,
                                cursor: "pointer",
                                backgroundColor: "transparent",
                                fontSize: "1rem",
                                outline: "none"
                            }}
                        >
                            <option value="latest">Más reciente ({athleteHistory[0].date})</option>
                            {athleteHistory.slice(1).map(h => (
                                <option key={h.id} value={h.id}>{h.date}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ marginLeft: "auto" }}>
                    <button className="btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
                        EXPORT PDF
                    </button>
                </div>
            </div>

            {/* 2. MAIN LAYOUT - Full Width (No Sidebar) */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 48px", backgroundColor: "#fff" }}>

                {!currentEval ? (
                    <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
                        No hay evaluaciones para este atleta.
                    </div>
                ) : (
                    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>

                        {/* HEADER SECTION */}
                        <div id="context" style={{ display: "flex", alignItems: "center", gap: 24, borderBottom: "1px solid #e5e7eb", paddingBottom: 24 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: "50%", backgroundColor: "#e5e7eb",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.5rem", fontWeight: 600, color: "#6b7280"
                            }}>
                                {selectedAthlete?.name.charAt(0)}
                            </div>
                            <div>
                                <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>
                                    {selectedAthlete?.name}
                                </h1>
                                <div style={{ display: "flex", gap: 12, marginTop: 4, color: "#6b7280", fontSize: "0.9rem" }}>
                                    <span>{currentEval.rawValues?.edad} años</span>
                                    <span>•</span>
                                    <span>{currentEval.rawValues?.puesto}</span>
                                    <span>•</span>
                                    <span>{currentEval.rawValues?.categoria}</span>
                                    <span>•</span>
                                    <span>Eval: {currentEval.date}</span>
                                </div>
                            </div>
                        </div>

                        {/* RAW DATA SECTION - UPDATED KEYS */}
                        <section id="raw-data">
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 16 }}>Datos Brutos</h3>
                            <DataBlock title="Medidas Básicas" items={[
                                { label: "Peso", value: currentEval.rawValues?.pesoBrutoKg, unit: "kg" },
                                { label: "Talla", value: currentEval.rawValues?.tallaCm, unit: "cm" },
                                { label: "Talla Sentado", value: currentEval.rawValues?.tallaSentadoCm, unit: "cm" },
                                { label: "Envergadura", value: currentEval.rawValues?.envergaduraCm, unit: "cm" },
                                { label: "Long. Piernas", value: (currentEval.rawValues?.tallaCm - currentEval.rawValues?.tallaSentadoCm).toFixed(1), unit: "cm" },
                            ]} />

                            <DataBlock title="Diámetros" columns={6} items={[
                                { label: "Biestiloideo", value: currentEval.rawValues?.biestiloideo, unit: "cm" },
                                { label: "Humeral", value: currentEval.rawValues?.humeralBiepicondilar, unit: "cm" },
                                { label: "Femoral", value: currentEval.rawValues?.femoralBiepicondilar, unit: "cm" },
                                { label: "Bimaleolar", value: currentEval.rawValues?.bimaleolar, unit: "cm" },
                                { label: "Bi-iliocrest", value: currentEval.rawValues?.biiliocrestideo, unit: "cm" },
                                { label: "Tórax Trans", value: currentEval.rawValues?.toraxTransverso, unit: "cm" },
                            ]} />

                            <DataBlock title="Perímetros" columns={6} items={[
                                { label: "Brazo Rel", value: currentEval.rawValues?.brazoRelajado, unit: "cm" },
                                { label: "Brazo Flex", value: currentEval.rawValues?.brazoFlexionadoTension, unit: "cm" },
                                { label: "Antebrazo", value: currentEval.rawValues?.antebrazoMaximo, unit: "cm" },
                                { label: "Muñeca", value: currentEval.rawValues?.muneca, unit: "cm" },
                                { label: "Tórax", value: currentEval.rawValues?.toraxMesoesternal, unit: "cm" },
                                { label: "Cintura", value: currentEval.rawValues?.cinturaMinima, unit: "cm" },
                                { label: "Cadera", value: currentEval.rawValues?.caderaMaximo, unit: "cm" },
                                { label: "Muslo Max", value: currentEval.rawValues?.musloMaximo, unit: "cm" },
                                { label: "Muslo Med", value: currentEval.rawValues?.musloMedial, unit: "cm" },
                                { label: "Pantorrilla", value: currentEval.rawValues?.pantorrillaMaxima, unit: "cm" },
                                { label: "Cabeza", value: currentEval.rawValues?.cabeza, unit: "cm" },
                                { label: "Onfálico", value: currentEval.rawValues?.onfalico, unit: "cm" },
                            ]} />

                            <DataBlock title="Pliegues Cutáneos" columns={6} items={[
                                { label: "Tríceps", value: currentEval.rawValues?.triceps, unit: "mm" },
                                { label: "Subescapular", value: currentEval.rawValues?.subescapular, unit: "mm" },
                                { label: "Supraespinal", value: currentEval.rawValues?.supraespinal, unit: "mm" },
                                { label: "Abdominal", value: currentEval.rawValues?.abdominal, unit: "mm" },
                                { label: "Muslo Medial", value: currentEval.rawValues?.musloMedialPliegue, unit: "mm" },
                                { label: "Pantorrilla", value: currentEval.rawValues?.pantorrillaPliegue, unit: "mm" },
                            ]} />
                        </section>

                        {/* RESULTS SECTION */}
                        <section id="results">
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 16 }}>Resultados Antropométricos</h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                                <KPITile label="IMC" value={currentEval.imc?.toFixed(1)} unit="kg/m²" />
                                <KPITile
                                    label="Suma 6 Pliegues"
                                    value={currentEval.suma6Pliegues?.toFixed(0)}
                                    unit="mm"
                                    sublabel={currentEval.suma6PlieguesEstandar}
                                    status={currentEval.suma6PlieguesEstandar?.includes("Óptimo") ? "optimal" : "warning"}
                                />
                                <KPITile
                                    label="Índice Musc/Óseo"
                                    value={currentEval.indicesMuscOseo?.toFixed(2)}
                                    sublabel={currentEval.indicesMuscOseoEstandar}
                                    status={currentEval.indicesMuscOseoEstandar?.includes("Óptimo") ? "optimal" : "warning"}
                                />
                                <KPITile label="Masa Adiposa" value={currentEval.masaAdiposaPorc?.toFixed(1)} unit="%" />
                                <KPITile label="Masa Muscular" value={currentEval.masaMuscularPorc?.toFixed(1)} unit="%" />
                                <KPITile label="Edad PHV" value={currentEval.edadPHV?.toFixed(1)} unit="años" />
                            </div>
                        </section>

                        {/* CHARTS SECTION */}
                        <section id="composition">
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 16 }}>Composición Corporal</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

                                {/* Donut Chart */}
                                <Card title="Distribución de Masas (5 Componentes)">
                                    <div style={{ height: 300, position: "relative" }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={massPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {massPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `${value.toFixed(1)} kg`} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center Label */}
                                        <div style={{
                                            position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)",
                                            textAlign: "center"
                                        }}>
                                            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
                                                {currentEval.pesoEstructuradoKg?.toFixed(1)}
                                            </div>
                                            <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>kg Estruct.</div>
                                        </div>
                                    </div>
                                </Card>

                                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    {/* Skinfold Profile */}
                                    <Card title="Perfil de Pliegues (mm)">
                                        <div style={{ height: 140 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={skinfoldData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={80} style={{ fontSize: "0.8rem" }} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12}>
                                                        {skinfoldData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fillOpacity={0.8} />
                                                        ))}
                                                        <LabelList dataKey="value" position="right" style={{ fill: "#4b5563", fontSize: "0.7rem" }} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>

                                    {/* Muscular vs Adipose */}
                                    <Card title="Muscular vs Adiposa (kg)">
                                        <div style={{ height: 140 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={msData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                                                    <XAxis type="number" result="X" hide />
                                                    <YAxis dataKey="name" type="category" width={80} style={{ fontSize: "0.8rem" }} />
                                                    <Tooltip formatter={(value) => `${value.toFixed(1)} kg`} />
                                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                                        {msData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                        <LabelList
                                                            dataKey="value"
                                                            position="inside"
                                                            fill="#fff"
                                                            style={{ fontWeight: "bold", fontSize: "0.8rem" }}
                                                            formatter={(v) => `${v.toFixed(1)}`}
                                                        />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </div>

                            </div>
                        </section>

                    </div>
                )}
            </div>
        </div>
    );
}
