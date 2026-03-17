import { useState, useMemo, useEffect } from "react";
import { EXERCISES } from "../mock/exercises";
import RoutineDetailView from "../components/RoutineDetailView";
import { MockAthletes } from "../mock/athletes";
import { DIVISIONS_CONFIG } from "../mock/divisions";
import { supabase } from "../lib/supabase";

// Helper to get week days
const getWeekDays = (startDate) => {
    const days = [];
    const current = new Date(startDate);
    // Adjust to Monday
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
    }
    return days;
};

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const getDayName = (date) => ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];

export default function PhysicalRoutineManager({ onBack }) {
    const [tab, setTab] = useState("exercises");

    // --- STATE: EXERCISES ---
    const [exercises, setExercises] = useState(EXERCISES);
    const [showExModal, setShowExModal] = useState(false);
    const [newEx, setNewEx] = useState({ name: "", category: "Fuerza", videoUrl: "" });

    // --- STATE: ROUTINES & CALENDAR ---
    const [routines, setRoutines] = useState([]);
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoutines = async () => {
            const { data, error } = await supabase.from("routines").select("*");
            if (error) {
                console.error("Error fetching routines:", error);
            } else if (data) {
                // Map DB schema names to component state names if needed
                const mapped = data.map(r => ({
                    id: r.id,
                    name: r.name,
                    scheduledDate: r.scheduled_date,
                    assignedTo: { type: r.assigned_to_type, id: r.assigned_to_id, name: r.assigned_to_id }, // Name requires a join, for now ID is fine for demo
                    blocks: r.blocks || [],
                    createdAt: r.created_at
                }));
                setRoutines(mapped);
            }
            setIsLoading(false);
        };
        fetchRoutines();
    }, []);

    // Filter State
    const [filterType, setFilterType] = useState("all"); // all, division, athlete
    const [filterValue, setFilterValue] = useState("");

    // Calendar State
    // Defaulting to the week of the first routine for demo purposes, or today
    const [currentWeekStart, setCurrentWeekStart] = useState(() => new Date(2026, 1, 16));
    const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

    // Complex Routine Form
    const [routineForm, setRoutineForm] = useState({
        name: "",
        scheduledDate: formatDate(new Date()),
        assignedTo: { type: "division", id: "", name: "" }, // or type: "athlete"
        blocks: []
    });

    const [viewRoutine, setViewRoutine] = useState(null);

    // --- COMPUTED ---
    const filteredRoutines = useMemo(() => {
        return routines.filter(r => {
            if (filterType === "all") return true;
            if (filterType === "division") return r.assignedTo?.type === "division" && r.assignedTo?.id === filterValue;
            if (filterType === "athlete") return r.assignedTo?.type === "athlete" && r.assignedTo?.id === filterValue;
            return true;
        });
    }, [routines, filterType, filterValue]);

    // --- HANDLERS: EXERCISES ---
    const handleAddExercise = () => {
        if (!newEx.name) return alert("El nombre es obligatorio");
        setExercises([...exercises, { ...newEx, id: crypto.randomUUID() }]);
        setShowExModal(false);
        setNewEx({ name: "", category: "Fuerza", videoUrl: "" });
    };

    const handleDeleteExercise = (id) => {
        if (confirm("¿Eliminar ejercicio?")) {
            setExercises(exercises.filter(e => e.id !== id));
        }
    };

    // --- HANDLERS: ROUTINES ---
    const handleOpenRoutineModal = (dateStr = null) => {
        let defaultDate = dateStr;
        if (!defaultDate) {
            const todayStr = formatDate(new Date());
            const isTodayInWeek = weekDays.some(d => formatDate(d) === todayStr);
            defaultDate = isTodayInWeek ? todayStr : formatDate(currentWeekStart);
        }

        let defaultAssign = { type: "division", id: "div_sub18", name: "Sub-18" };
        if (filterType === "division" && filterValue) {
            defaultAssign = {
                type: "division",
                id: filterValue,
                name: filterValue === "div_sub18" ? "Sub-18" : (filterValue === "div_first" ? "Primera" : "Reserva")
            };
        } else if (filterType === "athlete" && filterValue) {
            defaultAssign = { type: "athlete", id: filterValue, name: filterValue };
        }

        setRoutineForm({
            name: "",
            scheduledDate: defaultDate,
            assignedTo: defaultAssign,
            dateLabel: "", // Keeping for backward compat or manual label
            blocks: [{ id: crypto.randomUUID(), name: "Bloque 1", exercises: [] }]
        });
        setShowRoutineModal(true);
    };

    const handleSaveRoutine = async () => {
        if (!routineForm.name) return alert("El nombre es obligatorio");

        const newR = {
            name: routineForm.name,
            scheduled_date: routineForm.scheduledDate,
            assigned_to_type: routineForm.assignedTo.type,
            assigned_to_id: routineForm.assignedTo.id || "Unknown",
            blocks: routineForm.blocks
        };

        const { data, error } = await supabase
            .from("routines")
            .insert(newR)
            .select()
            .single();

        if (error) {
            console.error("Error saving routine:", error);
            alert("Hubo un error al guardar la rutina.");
            return;
        }

        const mappedR = {
            id: data.id,
            name: data.name,
            scheduledDate: data.scheduled_date,
            assignedTo: { type: data.assigned_to_type, id: data.assigned_to_id, name: data.assigned_to_id },
            blocks: data.blocks || [],
            createdAt: data.created_at
        };

        setRoutines([...routines, mappedR]);
        setShowRoutineModal(false);
    };

    // ... Block/Set Logic (Same as before) ...
    const addBlock = () => {
        setRoutineForm(prev => ({
            ...prev,
            blocks: [...prev.blocks, { id: crypto.randomUUID(), name: `Bloque ${prev.blocks.length + 1}`, exercises: [] }]
        }));
    };

    const removeBlock = (blockId) => {
        setRoutineForm(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== blockId)
        }));
    };

    const updateBlockName = (blockId, name) => {
        setRoutineForm(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === blockId ? { ...b, name } : b)
        }));
    };

    const addExerciseToBlock = (blockId, exId) => {
        const exDef = exercises.find(e => e.id === exId);
        if (!exDef) return;
        const newExInstance = {
            id: crypto.randomUUID(),
            exerciseId: exDef.id,
            exerciseName: exDef.name,
            videoUrl: exDef.videoUrl,
            sets: [{ id: crypto.randomUUID(), reps: "10", load: "", rest: "60s" }]
        };
        setRoutineForm(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === blockId ? { ...b, exercises: [...b.exercises, newExInstance] } : b)
        }));
    };

    const removeExerciseFromBlock = (blockId, exInstId) => {
        setRoutineForm(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === blockId ? { ...b, exercises: b.exercises.filter(e => e.id !== exInstId) } : b)
        }));
    };

    const addSet = (blockId, exInstId) => {
        setRoutineForm(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === blockId ? {
                ...b, exercises: b.exercises.map(e => e.id === exInstId ? {
                    ...e, sets: [...e.sets, { id: crypto.randomUUID(), reps: "10", load: "", rest: "60s" }]
                } : e)
            } : b)
        }));
    };

    const removeSet = (blockId, exInstId, setId) => {
        setRoutineForm(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === blockId ? {
                ...b, exercises: b.exercises.map(e => e.id === exInstId ? {
                    ...e, sets: e.sets.filter(s => s.id !== setId)
                } : e)
            } : b)
        }));
    };

    const updateSet = (blockId, exInstId, setId, field, value) => {
        setRoutineForm(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === blockId ? {
                ...b, exercises: b.exercises.map(e => e.id === exInstId ? {
                    ...e, sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
                } : e)
            } : b)
        }));
    };


    return (
        <div className="container" style={{ paddingBottom: 100 }}>
            {/* HEADER */}
            <div className="pagehead" style={{ marginBottom: 24 }}>
                <div className="pagehead-inner">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <button className="btn small" onClick={onBack}>← Volver</button>
                        <div>
                            <div className="pagehead-sub">PREPARACIÓN FÍSICA</div>
                            <div className="pagehead-title">Planificación Semanal</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
                <div className={`tab ${tab === "calendar" ? "active" : ""}`} onClick={() => setTab("calendar")}
                    style={{ padding: "12px 24px", cursor: "pointer", borderBottom: tab === "calendar" ? "2px solid var(--brand-orange)" : "none", fontWeight: tab === "calendar" ? 600 : 400 }}>
                    Calendario Semanal
                </div>
                <div className={`tab ${tab === "exercises" ? "active" : ""}`} onClick={() => setTab("exercises")}
                    style={{ padding: "12px 24px", cursor: "pointer", borderBottom: tab === "exercises" ? "2px solid var(--brand-orange)" : "none", fontWeight: tab === "exercises" ? 600 : 400 }}>
                    Base de Datos de Ejercicios
                </div>
            </div>

            {/* CONTENT: EXERCISES */}
            {tab === "exercises" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                        <button className="btn primary" onClick={() => setShowExModal(true)}>+ Nuevo Ejercicio</button>
                    </div>
                    <div style={{ display: "grid", gap: 12 }}>
                        {exercises.map(ex => (
                            <div key={ex.id} style={{
                                backgroundColor: "white", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{ex.name}</div>
                                    <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{ex.category}</div>
                                    {ex.videoUrl && (
                                        <a href={ex.videoUrl} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                            🎥 Ver Video
                                        </a>
                                    )}
                                </div>
                                <button className="btn small danger" onClick={() => handleDeleteExercise(ex.id)} style={{ color: "#ef4444", borderColor: "#ef4444" }}>🗑️</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CONTENT: CALENDAR */}
            {tab === "calendar" && (
                <div>
                    {/* FILTER BAR */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, backgroundColor: "white", padding: 16, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <span style={{ fontWeight: 600, color: "#374151" }}>Filtrar por:</span>
                            <select className="input" value={filterType} onChange={e => { setFilterType(e.target.value); setFilterValue(""); }}>
                                <option value="all">Todo</option>
                                <option value="division">División</option>
                                <option value="athlete">Atleta</option>
                            </select>

                            {filterType === "division" && (
                                <select className="input" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                                    <option value="">Seleccionar División...</option>
                                    <option value="div_sub18">Sub-18</option>
                                    <option value="div_first">Primera</option>
                                </select>
                            )}
                            {filterType === "athlete" && (
                                <input
                                    className="input"
                                    placeholder="ID Atleta (ej. ath_1)"
                                    value={filterValue}
                                    onChange={e => setFilterValue(e.target.value)}
                                />
                            )}
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button className="btn secondary" onClick={() => {
                                const d = new Date(currentWeekStart);
                                d.setDate(d.getDate() - 7);
                                setCurrentWeekStart(d);
                            }}>← Semana Ant.</button>
                            <button className="btn secondary" onClick={() => {
                                const d = new Date(currentWeekStart);
                                d.setDate(d.getDate() + 7);
                                setCurrentWeekStart(d);
                            }}>Semana Sig. →</button>
                            <button className="btn primary" onClick={() => handleOpenRoutineModal()}>+ Nueva Rutina</button>
                        </div>
                    </div>

                    {/* CALENDAR GRID */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
                        {weekDays.map(day => {
                            const dateStr = formatDate(day);
                            const dayRoutines = filteredRoutines.filter(r => r.scheduledDate === dateStr);
                            const isToday = formatDate(new Date()) === dateStr;

                            return (
                                <div key={dateStr} style={{ backgroundColor: isToday ? "#eff6ff" : "white", borderRadius: 8, border: `1px solid ${isToday ? "#93c5fd" : "#e5e7eb"}`, minHeight: 300, display: "flex", flexDirection: "column" }}>
                                    {/* DAY HEADER */}
                                    <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                                        <div style={{ fontWeight: 700, color: "#374151" }}>{getDayName(day)}</div>
                                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{day.getDate()}</div>
                                    </div>

                                    {/* ROUTINES LIST */}
                                    <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                                        {dayRoutines.map(rt => (
                                            <div key={rt.id}
                                                onClick={() => setViewRoutine(rt)}
                                                className="hover-card"
                                                style={{
                                                    backgroundColor: "white", padding: 12, borderRadius: 6, border: "1px solid #e5e7eb",
                                                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)", cursor: "pointer", fontSize: "0.9rem"
                                                }}>
                                                <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>{rt.name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                                                    {rt.assignedTo?.type === "division" ? "👥" : "👤"}
                                                    {rt.assignedTo?.name}
                                                </div>
                                                {/* Visual indicator of blocks */}
                                                <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                                                    {rt.blocks?.map((_, i) => (
                                                        <div key={i} style={{ height: 4, width: 12, borderRadius: 2, backgroundColor: "#c084fc" }} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => handleOpenRoutineModal(dateStr)}
                                            style={{
                                                marginTop: "auto", border: "1px dashed #d1d5db", borderRadius: 6, padding: 8,
                                                color: "#6b7280", fontSize: "0.8rem", cursor: "pointer", background: "transparent", width: "100%"
                                            }}>
                                            + Agregar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


            {/* MODAL: NEW EXERCISE */}
            {showExModal && (
                <div style={modalOverlayStyle}>
                    {/* ... (Same exercise modal content) ... */}
                    <div style={modalContentStyle}>
                        <h2>Nuevo Ejercicio</h2>
                        <div style={{ display: "grid", gap: 12 }}>
                            <div>
                                <label className="label">Nombre</label>
                                <input className="input" style={{ width: "100%" }} value={newEx.name} onChange={e => setNewEx({ ...newEx, name: e.target.value })} autoFocus />
                            </div>
                            <div>
                                <label className="label">Categoría</label>
                                <select className="input" style={{ width: "100%" }} value={newEx.category} onChange={e => setNewEx({ ...newEx, category: e.target.value })}>
                                    <option>Fuerza - Piernas</option>
                                    <option>Fuerza - Empuje</option>
                                    <option>Fuerza - Tracción</option>
                                    <option>Potencia</option>
                                    <option>Core</option>
                                    <option>Rehabilitación</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Link Video (YouTube/Drive)</label>
                                <input className="input" style={{ width: "100%" }} value={newEx.videoUrl} onChange={e => setNewEx({ ...newEx, videoUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                                <button className="btn secondary" onClick={() => setShowExModal(false)}>Cancelar</button>
                                <button className="btn primary" onClick={handleAddExercise}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ROUTINE BUILDER */}
            {showRoutineModal && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, maxWidth: 900, maxHeight: "95vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ marginBottom: 16 }}>
                            <h2 style={{ margin: "0 0 16px 0" }}>Constructor de Rutinas</h2>

                            {/* TOP FORM: DATE & ASSIGNMENT */}
                            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label className="label">Nombre de la Rutina</label>
                                    <input className="input" style={{ width: "100%" }} value={routineForm.name} onChange={e => setRoutineForm({ ...routineForm, name: e.target.value })} placeholder="Ej. Fuerza Hipertrofia" />
                                </div>
                                <div>
                                    <label className="label">Fecha Programada</label>
                                    <input type="date" className="input" style={{ width: "100%" }} value={routineForm.scheduledDate} onChange={e => setRoutineForm({ ...routineForm, scheduledDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Asignar A:</label>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <select
                                            className="input" style={{ width: "100%" }}
                                            value={routineForm.assignedTo.type}
                                            onChange={e => setRoutineForm({ ...routineForm, assignedTo: { ...routineForm.assignedTo, type: e.target.value, id: "", name: "" } })}
                                        >
                                            <option value="division">División</option>
                                            <option value="athlete">Atleta</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* ASSIGNMENT SELECTOR (Dynamic) */}
                            <div style={{ marginBottom: 16 }}>
                                {routineForm.assignedTo.type === "division" ? (
                                    <div>
                                        <label className="label">Seleccionar División</label>
                                        <select
                                            className="input" style={{ width: "100%" }}
                                            value={routineForm.assignedTo.id}
                                            onChange={e => setRoutineForm({ ...routineForm, assignedTo: { ...routineForm.assignedTo, id: e.target.value, name: e.target.options[e.target.selectedIndex].text } })}
                                        >
                                            <option value="div_sub18">Sub-18</option>
                                            <option value="div_first">Primera</option>
                                            <option value="div_reserva">Reserva</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="label">Buscar Atleta (ID)</label>
                                        <input
                                            className="input" style={{ width: "100%" }} placeholder="ID o Nombre..."
                                            value={routineForm.assignedTo.name}
                                            onChange={e => setRoutineForm({ ...routineForm, assignedTo: { ...routineForm.assignedTo, id: "ath_gen", name: e.target.value } })}
                                        />
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* WORKSPACE (Same as before) */}
                        <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #e5e7eb", paddingTop: 16, display: "flex", flexDirection: "column", gap: 24 }}>
                            {routineForm.blocks.map((block, bIdx) => (
                                <div key={block.id} style={{ backgroundColor: "#f9fafb", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
                                    {/* Block Header */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                        <input
                                            value={block.name}
                                            onChange={e => updateBlockName(block.id, e.target.value)}
                                            style={{ fontSize: "1rem", fontWeight: 700, border: "none", background: "transparent", color: "#374151" }}
                                        />
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <select
                                                className="input small"
                                                onChange={e => { if (e.target.value) { addExerciseToBlock(block.id, e.target.value); e.target.value = ""; } }}
                                                style={{ width: 150 }}
                                            >
                                                <option value="">+ Ejercicio...</option>
                                                {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                            </select>
                                            <button className="btn small danger" onClick={() => removeBlock(block.id)}>Eliminar Bloque</button>
                                        </div>
                                    </div>

                                    {/* Exercises List */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {block.exercises.map(exInst => (
                                            <div key={exInst.id} style={{ backgroundColor: "white", padding: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontWeight: 600 }}>
                                                    <span>{exInst.exerciseName}</span>
                                                    <button onClick={() => removeExerciseFromBlock(block.id, exInst.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444" }}>✕</button>
                                                </div>

                                                {/* Sets Table */}
                                                <table style={{ width: "100%", fontSize: "0.85rem" }}>
                                                    <thead>
                                                        <tr style={{ color: "#6b7280", textAlign: "left" }}>
                                                            <th>Serie</th>
                                                            <th>Reps</th>
                                                            <th>Carga / RIR</th>
                                                            <th>Pausa</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {exInst.sets.map((set, sIdx) => (
                                                            <tr key={set.id}>
                                                                <td style={{ color: "#9ca3af" }}>{sIdx + 1}</td>
                                                                <td><input className="input small" style={{ width: 50 }} value={set.reps} onChange={e => updateSet(block.id, exInst.id, set.id, "reps", e.target.value)} /></td>
                                                                <td><input className="input small" style={{ width: 120 }} value={set.load} onChange={e => updateSet(block.id, exInst.id, set.id, "load", e.target.value)} placeholder="Ej. 60% @ RIR 2" /></td>
                                                                <td><input className="input small" style={{ width: 60 }} value={set.rest} onChange={e => updateSet(block.id, exInst.id, set.id, "rest", e.target.value)} /></td>
                                                                <td><button onClick={() => removeSet(block.id, exInst.id, set.id)} style={{ color: "#ef4444", border: "none", background: "transparent", cursor: "pointer" }}>-</button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <button onClick={() => addSet(block.id, exInst.id)} style={{ marginTop: 8, fontSize: "0.8rem", color: "#3b82f6", border: "none", background: "none", cursor: "pointer" }}>+ Agregar Serie</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button className="btn secondary" onClick={addBlock} style={{ borderStyle: "dashed" }}>+ Agregar Nuevo Bloque</button>
                        </div>

                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                            <button className="btn secondary" onClick={() => setShowRoutineModal(false)}>Cancelar</button>
                            <button className="btn primary" onClick={handleSaveRoutine}>Guardar Rutina</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ROUTINE DETAIL VIEW (PREVIEW) */}
            {viewRoutine && (
                <RoutineDetailView
                    routine={viewRoutine}
                    onClose={() => setViewRoutine(null)}
                />
            )}
        </div>
    );
}

const modalOverlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
};

const modalContentStyle = {
    backgroundColor: "white", padding: 24, borderRadius: 12,
    width: "100%", maxWidth: 500, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
};
