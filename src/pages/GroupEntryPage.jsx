import { useState, useMemo } from "react";
import Card from "../components/Card";
import Papa from "papaparse";

export default function GroupEntryPage({ user, division, users, templates, submissions, setSubmissions, onBack }) {
    const [step, setStep] = useState(1); // 1: Selection, 2: Entry
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedDivision, setSelectedDivision] = useState("");
    const [selectedAthletes, setSelectedAthletes] = useState([]);

    // Grid State: { [athleteId]: { [fieldKey]: value } }
    const [gridData, setGridData] = useState({});

    // Filter athletes by division
    const athletesInDivision = useMemo(() => {
        if (!selectedDivision) return []; // Wait for selection
        return users.filter(u => u.role === "Athlete" && (u.divisions || []).includes(selectedDivision));
    }, [users, selectedDivision]);

    // Handlers
    const handleStart = () => {
        if (selectedTemplate && selectedAthletes.length > 0) {
            // Initialize grid data with empty values if not exists
            const initData = { ...gridData };
            selectedAthletes.forEach(id => {
                if (!initData[id]) initData[id] = {};
                selectedTemplate.fields.forEach(f => {
                    if (f.type !== "section" && !initData[id][f.key]) {
                        initData[id][f.key] = "";
                    }
                });
            });
            setGridData(initData);
            setStep(2);
        } else {
            alert("Selecciona un template y al menos un atleta.");
        }
    };

    const handleCellChange = (athleteId, fieldKey, value) => {
        setGridData(prev => ({
            ...prev,
            [athleteId]: {
                ...prev[athleteId],
                [fieldKey]: value
            }
        }));
    };

    const handleCopyDown = (fieldKey) => {
        if (selectedAthletes.length < 2) return;

        const firstAthleteId = selectedAthletes[0];
        const valueToCopy = gridData[firstAthleteId]?.[fieldKey];

        if (valueToCopy === undefined || valueToCopy === "") return;

        if (!confirm(`¿Copiar "${valueToCopy}" a todos los ${selectedAthletes.length - 1} atletas restantes?`)) return;

        setGridData(prev => {
            const newData = { ...prev };
            selectedAthletes.forEach((id, index) => {
                if (index === 0) return; // Skip first
                if (!newData[id]) newData[id] = {};
                newData[id][fieldKey] = valueToCopy;
            });
            return newData;
        });
    };

    const handleDownloadTemplate = () => {
        if (!selectedTemplate) return;

        // Headers
        const data = selectedAthletes.map(id => {
            const athlete = users.find(u => u.id === id);
            const row = {
                AthleteID: id,
                Name: athlete ? athlete.name : "Unknown",
            };
            // Add empty columns for template fields
            selectedTemplate.fields.forEach(f => {
                if (f.type !== "section") row[f.label] = "";
            });
            return row;
        });

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${selectedTemplate.name}_${selectedDivision}_Template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveAll = () => {
        // Validation (Basic: check required fields)
        // ... skip for MVP speed

        const newSubmissions = [];
        const now = new Date().toISOString();
        const dateStr = new Date().toISOString().split("T")[0]; // Use today's date for bulk entry

        selectedAthletes.forEach(id => {
            const rowValues = gridData[id];
            // Only save if there is data? Or save even empty forms? 
            // Saving typically requires at least one field or follows strict rules.
            // For MVP, we save if the user clicked Save.

            // Convert types based on template
            const cleanedValues = {};
            selectedTemplate.fields.forEach(f => {
                if (f.type === "section") return;
                let val = rowValues[f.key];
                if (f.type === "number" || f.type === "scale5") {
                    val = Number(val);
                }
                cleanedValues[f.key] = val;
            });

            newSubmissions.push({
                id: crypto.randomUUID(),
                templateId: selectedTemplate.id,
                subjectId: id, // Athlete ID
                authorId: user.id, // Coach ID
                date: dateStr,
                division: selectedDivision,
                status: "submitted",
                values: cleanedValues,
                createdAt: now,
                updatedAt: now,
            });
        });

        setSubmissions([...submissions, ...newSubmissions]);
        alert(`¡Guardados ${newSubmissions.length} registros exitosamente!`);
        onBack();
    };

    const fieldsToRender = useMemo(() => {
        return selectedTemplate?.fields.filter(f => f.type !== "section") || [];
    }, [selectedTemplate]);

    return (
        <div className="container" style={{ maxWidth: "100%", paddingBottom: 100 }}>
            <div className="pagehead" style={{ marginBottom: 24 }}>
                <div className="pagehead-inner">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <button className="btn small" onClick={onBack}>← Volver</button>
                        <div>
                            <div className="pagehead-sub">OPERACIONES MASIVAS</div>
                            <div className="pagehead-title">Entrada Grupal</div>
                        </div>
                    </div>
                </div>
            </div>

            {step === 1 && (
                <Card title="Paso 1: Configuración de Carga">
                    <div style={{ display: "grid", gap: 16, maxWidth: 600 }}>
                        {/* 1. Template */}
                        <div>
                            <label className="label">Formulario</label>
                            <select
                                className="input"
                                value={selectedTemplate?.id || ""}
                                onChange={e => setSelectedTemplate(templates.find(t => t.id === e.target.value))}
                            >
                                <option value="">Seleccionar...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.module})</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Division */}
                        <div>
                            <label className="label">División</label>
                            <select
                                className="input"
                                value={selectedDivision}
                                onChange={e => {
                                    setSelectedDivision(e.target.value);
                                    setSelectedAthletes([]); // Reset athletes
                                }}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="M17">M17</option>
                                <option value="M19">M19</option>
                                <option value="Plantel Superior">Plantel Superior</option>
                            </select>
                        </div>

                        {/* 3. Athletes */}
                        {selectedDivision && (
                            <div>
                                <label className="label">Atletas ({selectedAthletes.length} seleccionados)</label>
                                <div style={{
                                    border: "1px solid #e5e7eb", borderRadius: 8, padding: 12,
                                    maxHeight: 200, overflowY: "auto", display: "grid", gap: 8
                                }}>
                                    <label style={{ display: "flex", gap: 8, fontWeight: 600 }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedAthletes.length === athletesInDivision.length && athletesInDivision.length > 0}
                                            onChange={e => {
                                                if (e.target.checked) setSelectedAthletes(athletesInDivision.map(u => u.id));
                                                else setSelectedAthletes([]);
                                            }}
                                        />
                                        Seleccionar Todos
                                    </label>
                                    <hr style={{ margin: "4px 0", borderColor: "#f3f4f6" }} />
                                    {athletesInDivision.map(u => (
                                        <label key={u.id} style={{ display: "flex", gap: 8 }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedAthletes.includes(u.id)}
                                                onChange={e => {
                                                    if (e.target.checked) setSelectedAthletes([...selectedAthletes, u.id]);
                                                    else setSelectedAthletes(selectedAthletes.filter(id => id !== u.id));
                                                }}
                                            />
                                            {u.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 16 }}>
                            <button className="btn primary" onClick={handleStart} disabled={!selectedTemplate || selectedAthletes.length === 0}>
                                Continuar a Tabla de Carga →
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h3 style={{ margin: 0 }}>{selectedTemplate.name}</h3>
                            <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Cargando datos para {selectedAthletes.length} atletas</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn secondary" onClick={() => setStep(1)}>Cambiar Selección</button>
                            <button className="btn secondary" onClick={handleDownloadTemplate}>📥 Descargar Excel/CSV</button>
                            <button className="btn primary" onClick={handleSaveAll}>💾 Guardar Todo</button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                                    <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280", position: "sticky", left: 0, backgroundColor: "#f9fafb", borderRight: "1px solid #e5e7eb" }}>
                                        Atleta
                                    </th>
                                    {fieldsToRender.map(f => (
                                        <th key={f.id} style={{ padding: "12px 16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280", minWidth: 120 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                                                {f.label}
                                                <button
                                                    onClick={() => handleCopyDown(f.key)}
                                                    title="Copiar valor de la 1ra fila a todas"
                                                    style={{
                                                        border: "none",
                                                        background: "none",
                                                        cursor: "pointer",
                                                        fontSize: "1.1rem",
                                                        padding: 0,
                                                        opacity: 0.6
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                                                >
                                                    ⬇️
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedAthletes.map(athleteId => {
                                    const athlete = users.find(u => u.id === athleteId);
                                    return (
                                        <tr key={athleteId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "8px 16px", fontWeight: 500, color: "#111827", position: "sticky", left: 0, backgroundColor: "white", borderRight: "1px solid #e5e7eb" }}>
                                                {athlete ? athlete.name : athleteId}
                                            </td>
                                            {fieldsToRender.map(f => (
                                                <td key={f.id} style={{ padding: 4 }}>
                                                    {f.type === "select" && f.options ? (
                                                        <select
                                                            className="input"
                                                            style={{ width: "100%", border: "none", backgroundColor: "transparent", padding: "8px" }}
                                                            value={gridData[athleteId]?.[f.key] || ""}
                                                            onChange={e => handleCellChange(athleteId, f.key, e.target.value)}
                                                        >
                                                            <option value="" disabled>-</option>
                                                            {f.options.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={f.type === "date" ? "date" : (f.type === "number" || f.type === "scale5" ? "number" : "text")}
                                                            className="input"
                                                            min={f.type === "scale5" ? 1 : undefined}
                                                            max={f.type === "scale5" ? 5 : undefined}
                                                            style={{
                                                                width: "100%", border: "none",
                                                                backgroundColor: (f.type === "scale5" && gridData[athleteId]?.[f.key])
                                                                    ? (Number(gridData[athleteId][f.key]) <= 2 ? "#fee2e2"
                                                                        : Number(gridData[athleteId][f.key]) === 3 ? "#ffedd5"
                                                                            : "#dcfce3")
                                                                    : "transparent",
                                                                color: (f.type === "scale5" && gridData[athleteId]?.[f.key]) ? (
                                                                    Number(gridData[athleteId][f.key]) <= 2 ? "#b91c1c"
                                                                        : Number(gridData[athleteId][f.key]) === 3 ? "#c2410c"
                                                                            : "#15803d"
                                                                ) : "inherit",
                                                                fontWeight: f.type === "scale5" ? 600 : "normal",
                                                                padding: "8px"
                                                            }}
                                                            placeholder={f.type === "date" ? "" : "..."}
                                                            value={gridData[athleteId]?.[f.key] || ""}
                                                            onChange={e => handleCellChange(athleteId, f.key, e.target.value)}
                                                        />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
