import { useState, useMemo, useEffect } from "react";
import { EVENTS } from "../mock/events";
import { DIVISIONS_CONFIG } from "../mock/divisions";
import RoutineDetailView from "../components/RoutineDetailView";
import { api } from "../lib/api";

// --- DATE HELPERS ---
const formatDate = (date) => date.toISOString().split('T')[0];
const getDayName = (date) => ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];

const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(d.setDate(diff));
};

const getWeekDays = (startDate) => {
    if (!startDate) return [];
    const days = [];
    const current = new Date(startDate);
    if (isNaN(current.getTime())) return []; // Invalid date check
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

const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Grid Setup: Start from the Monday before the 1st (if 1st is not Mon)
    const startDate = getWeekStart(firstDay);

    // End on the Sunday after the last day (if last day is not Sun)
    const endDay = lastDay.getDay();
    const endDate = new Date(lastDay);
    if (endDay !== 0) {
        endDate.setDate(lastDay.getDate() + (7 - endDay));
    }

    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
};

export default function TeamSchedule({ onBack }) {
    // View State
    const [viewMode, setViewMode] = useState("week"); // 'day', 'week', 'month'
    const [currentDate, setCurrentDate] = useState(new Date("2026-02-16")); // Anchor date

    // Computed Date Ranges
    const calendarDays = useMemo(() => {
        if (viewMode === "week") {
            return getWeekDays(currentDate);
        }
        if (viewMode === "month") {
            return getMonthDays(currentDate);
        }
        if (viewMode === "day") {
            return [new Date(currentDate)];
        }
        return [];
    }, [viewMode, currentDate]);

    // Navigation Handlers
    const handlePrev = () => {
        const d = new Date(currentDate);
        if (viewMode === "week") d.setDate(d.getDate() - 7);
        if (viewMode === "month") d.setMonth(d.getMonth() - 1);
        if (viewMode === "day") d.setDate(d.getDate() - 1);
        setCurrentDate(d);
    };

    const handleNext = () => {
        const d = new Date(currentDate);
        if (viewMode === "week") d.setDate(d.getDate() + 7);
        if (viewMode === "month") d.setMonth(d.getMonth() + 1);
        if (viewMode === "day") d.setDate(d.getDate() + 1);
        setCurrentDate(d);
    };

    const getTitle = () => {
        const opts = { month: 'long', year: 'numeric' };
        if (viewMode === "day") return currentDate.toLocaleDateString("es-ES", { ...opts, day: 'numeric', weekday: 'long' });
        return currentDate.toLocaleDateString("es-ES", opts);
    };


    // Filter State
    const [filterType, setFilterType] = useState("all");
    const [filterValue, setFilterValue] = useState("");
    const [eventTypeFilter, setEventTypeFilter] = useState("all");

    // Local state for events, initialized with mock EVENTS
    const [localEvents, setLocalEvents] = useState(EVENTS);
    const [routines, setRoutines] = useState([]);

    useEffect(() => {
        const fetchRoutines = async () => {
            try {
                const data = await api.getRoutines();
                if (data) {
                    // Map db names to camelCase for the frontend component
                    const mapped = data.map(r => ({
                        id: r.id,
                        name: r.name,
                        scheduledDate: r.scheduled_date,
                        assignedTo: { type: r.assigned_to_type, id: r.assigned_to_id, name: r.assigned_to_id },
                        blocks: r.blocks || [],
                        createdAt: r.created_at
                    }));
                    setRoutines(mapped);
                }
            } catch (err) {
                console.error("Error fetching routines:", err);
            }
        };
        fetchRoutines();
    }, []);

    // Unified Events
    const allEvents = useMemo(() => {
        const routinesArray = Array.isArray(routines) ? routines : [];
        const additionalEvents = Array.isArray(localEvents) ? localEvents : [];

        const routinesAsEvents = routinesArray.map(r => ({
            id: r.id, type: "routine", title: r.name, date: r.scheduledDate, time: "Flexible", assignedTo: r.assignedTo, originalData: r
        }));
        return [...routinesAsEvents, ...additionalEvents];
    }, [localEvents]);

    const filteredEvents = useMemo(() => {
        return allEvents.filter(evt => {
            if (eventTypeFilter !== "all" && evt.type !== eventTypeFilter) return false;
            if (filterType === "all") return true;
            if (filterType === "division") return evt.assignedTo?.type === "division" && evt.assignedTo?.id === filterValue;
            return true;
        });
    }, [allEvents, filterType, filterValue, eventTypeFilter]);


    // Interaction State
    const [viewRoutine, setViewRoutine] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "", type: "training", date: formatDate(currentDate), time: "10:00", assignedTo: { type: "division", id: "div_first", name: "Primera" }
    });

    const handleSaveEvent = () => {
        if (!newEvent.title) return alert("Título obligatorio");
        const eventToAdd = { ...newEvent, id: crypto.randomUUID() };
        EVENTS.push(eventToAdd); // Push to mock for persistence across mounts (in session)
        setLocalEvents([...localEvents, eventToAdd]); // Update local state for re-render
        setShowEventModal(false);
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'match': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
            case 'training': return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
            case 'routine': return { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' };
            case 'medical': return { bg: '#d1fae5', border: '#10b981', text: '#065f46' };
            case 'meeting': return { bg: '#fff7ed', border: '#f97316', text: '#9a3412' }; // Orange
            default: return { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' };
        }
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'match': return '⚽';
            case 'training': return '🏃';
            case 'routine': return '🏋️';
            case 'medical': return '🩺';
            case 'meeting': return '📹';
            default: return '📅';
        }
    };

    return (
        <div className="container" style={{ paddingBottom: 100 }}>
            {/* HEADER */}
            <div className="pagehead" style={{ marginBottom: 24 }}>
                <div className="pagehead-inner">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <button className="btn small" onClick={onBack}>← Volver</button>
                        <div>
                            <div className="pagehead-sub">GESTIÓN DE EQUIPO</div>
                            <div className="pagehead-title">Calendario Unificado</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROLS BAR: View + Nav + Filters */}
            <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Top Row: Nav & View Mode */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ display: "flex", backgroundColor: "#f3f4f6", borderRadius: 8, padding: 4 }}>
                            {['day', 'week', 'month'].map(m => (
                                <button key={m}
                                    onClick={() => setViewMode(m)}
                                    style={{
                                        border: "none", background: viewMode === m ? "white" : "transparent",
                                        padding: "6px 12px", borderRadius: 6, fontWeight: 600, fontSize: "0.9rem",
                                        boxShadow: viewMode === m ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                                        color: viewMode === m ? "#111827" : "#6b7280", cursor: "pointer"
                                    }}>
                                    {m === 'day' ? 'Día' : m === 'week' ? 'Semana' : 'Mes'}
                                </button>
                            ))}
                        </div>
                        <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#111827", textTransform: "capitalize", minWidth: 200 }}>
                            {getTitle()}
                        </h2>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn secondary" onClick={handlePrev}>← Anterior</button>
                        <button className="btn secondary" onClick={() => setCurrentDate(new Date())}>Hoy</button>
                        <button className="btn secondary" onClick={handleNext}>Siguiente →</button>
                        <button className="btn primary" onClick={() => setShowEventModal(true)}>+ Nuevo Evento</button>
                    </div>
                </div>

                {/* Second Row: Filters */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", backgroundColor: "white", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                    <span style={{ fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Filtrar:</span>
                    <select className="input small" value={filterType} onChange={e => { setFilterType(e.target.value); setFilterValue(""); }}>
                        <option value="all">Toda la Organización</option>
                        <option value="division">Por División</option>
                    </select>

                    {filterType === "division" && (
                        <select className="input small" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {DIVISIONS_CONFIG.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    )}

                    <div style={{ width: 1, height: 20, backgroundColor: "#e5e7eb", margin: "0 8px" }} />

                    <select className="input small" value={eventTypeFilter} onChange={e => setEventTypeFilter(e.target.value)}>
                        <option value="all">Todos los Tipos</option>
                        <option value="match">Partidos</option>
                        <option value="training">Entrenamientos</option>
                        <option value="routine">Físico</option>
                        <option value="medical">Médico</option>
                    </select>
                </div>
            </div>

            {/* GRID RENDER */}
            <div style={{
                display: "grid",
                gridTemplateColumns: viewMode === "day" ? "1fr" : "repeat(7, 1fr)",
                gap: 8
            }}>
                {/* Week Header (Only for Week/Month) */}
                {viewMode !== "day" && ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                    <div key={d} style={{ textAlign: "center", fontWeight: 600, color: "#6b7280", fontSize: "0.85rem", paddingBottom: 4 }}>
                        {d}
                    </div>
                ))}

                {calendarDays.map((day, idx) => {
                    const dateStr = formatDate(day);
                    const dayEvents = filteredEvents.filter(e => e.date === dateStr);
                    const isToday = formatDate(new Date()) === dateStr;
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    // DAY VIEW STYLE
                    if (viewMode === "day") {
                        return (
                            <div key={dateStr} style={{ minHeight: 400, backgroundColor: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
                                <div style={{ marginBottom: 24, borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
                                    <h3 style={{ margin: 0, fontSize: "1.5rem" }}>Eventos del Día</h3>
                                </div>
                                {dayEvents.length === 0 ? (
                                    <div style={{ color: "#9ca3af", fontStyle: "italic" }}>No hay eventos programados.</div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        {dayEvents.sort((a, b) => a.time.localeCompare(b.time)).map(evt => {
                                            const styles = getEventColor(evt.type);
                                            return (
                                                <div key={evt.id} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 16, backgroundColor: styles.bg, borderRadius: 8, borderLeft: `6px solid ${styles.border}` }}>
                                                    <div style={{ minWidth: 80, fontWeight: 700, color: "#374151" }}>
                                                        {evt.time !== "Flexible" ? evt.time : "Flex"}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: styles.text }}>{evt.title}</div>
                                                        <div style={{ color: "#4b5563", marginTop: 4 }}>{evt.assignedTo?.name} • {evt.location || "Sin lugar"}</div>
                                                        {evt.type === 'routine' && (
                                                            <button
                                                                onClick={() => setViewRoutine(evt.originalData)}
                                                                style={{ marginTop: 8, fontSize: "0.85rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                                                                Ver Rutina Completa
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // MONTH/WEEK GRID STYLE
                    return (
                        <div key={dateStr} style={{
                            backgroundColor: isToday ? "#eff6ff" : (viewMode === "month" && !isCurrentMonth ? "#f9fafb" : "white"),
                            borderRadius: 6,
                            border: `1px solid ${isToday ? "#93c5fd" : "#e5e7eb"}`,
                            minHeight: viewMode === "month" ? 120 : 300,
                            display: "flex", flexDirection: "column",
                            opacity: viewMode === "month" && !isCurrentMonth ? 0.6 : 1
                        }}>
                            <div style={{ padding: "8px", textAlign: "right", fontSize: "0.85rem", fontWeight: isToday ? 700 : 400, color: isToday ? "#1e40af" : "#6b7280" }}>
                                {day.getDate()}
                            </div>

                            <div style={{ padding: "0 4px 4px 4px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                                {dayEvents.map(evt => {
                                    const styles = getEventColor(evt.type);
                                    return (
                                        <div key={evt.id}
                                            onClick={() => { if (evt.type === 'routine') setViewRoutine(evt.originalData); }}
                                            style={{
                                                backgroundColor: styles.bg,
                                                borderLeft: `3px solid ${styles.border}`,
                                                padding: "4px 6px",
                                                borderRadius: 3,
                                                cursor: evt.type === 'routine' ? "pointer" : "default",
                                                fontSize: "0.75rem",
                                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                            }}
                                            title={evt.title}
                                        >
                                            <span style={{ fontWeight: 700 }}>{getEventIcon(evt.type)}</span> {evt.title}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ROUTINE PREVIEW */}
            {viewRoutine && (
                <RoutineDetailView routine={viewRoutine} onClose={() => setViewRoutine(null)} />
            )}

            {/* NEW EVENT MODAL */}
            {showEventModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>Nuevo Evento</h2>
                        {/* Simplified Modal Logic (Same as before) */}
                        <div style={{ display: "grid", gap: 16 }}>
                            <input className="input" style={{ width: "100%" }} value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Título" />
                            <div style={{ display: "flex", gap: 8 }}>
                                <select className="input" style={{ flex: 1 }} value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}>
                                    <option value="match">Partido</option>
                                    <option value="training">Entrenamiento</option>
                                    <option value="medical">Médico</option>
                                    <option value="meeting">Reunión</option>
                                </select>
                                <input type="date" className="input" style={{ flex: 1 }} value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                            </div>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button className="btn secondary" onClick={() => setShowEventModal(false)}>Cancelar</button>
                                <button className="btn primary" onClick={handleSaveEvent}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalOverlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60
};

const modalContentStyle = {
    backgroundColor: "white", padding: 24, borderRadius: 12,
    width: "100%", maxWidth: 400, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
};
