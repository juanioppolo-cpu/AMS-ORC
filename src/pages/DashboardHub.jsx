import { useMemo, useState, useEffect } from "react";
import Card from "../components/Card";
import ModuleTile from "../components/ModuleTile";
// Adapted imports to match file structure
import CoachDashWellness from "../components/wellness/SquadWellnessDashboard";
import DashMedical from "../components/dashboards/MedicalDashboard";
import DashNutrition from "../components/dashboards/NutritionDashboard";
import DashPhysicalPreparation from "../components/dashboards/DashPhysicalPreparation";
import DashManagerAttendance from "../components/dashboards/ManagerAttendanceDashboard";
import AthleteProfileDashboard from "../components/dashboards/AthleteProfileDashboard";
import { canView } from "../app/permissions";

const DASHES = [
    { key: "profile", label: "Perfil 360", modulePerm: "Dashboards", icon: "👤", color: "#8b5cf6", subtitle: "Visión global del atleta" },
    { key: "wellness", label: "Wellness", modulePerm: "Dashboards", icon: "🧘", color: "#10b981", subtitle: "Monitoreo diario de bienestar" },
    { key: "medical", label: "Médico", modulePerm: "Medical", icon: "🩺", color: "#ef4444", subtitle: "Lesiones y partes médicos" },
    { key: "nutrition", label: "Nutrición", modulePerm: "Nutrition", icon: "🥗", color: "#f59e0b", subtitle: "Antropometría y composición corporal" },
    { key: "physical", label: "Preparación Física", modulePerm: "PhysicalStrength", icon: "🏋️", color: "#3b82f6", subtitle: "Evaluaciones de fuerza, saltos y campo" },
    { key: "manager", label: "Manager – Asistencia", modulePerm: "ManagerAttendance", icon: "📋", color: "#6366f1", subtitle: "Control de asistencia" },
];

export default function DashboardHub({ user, division, divisionsAllowed = [], onDivisionChange, wellnessRows, formSubmissions: submissions, athletesInDivision, users }) {
    const [activeDash, setActiveDash] = useState(null); // null = show dashboard selector
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedAthleteId, setSelectedAthleteId] = useState("");

    // Update selected athlete when division changes or initial load
    useEffect(() => {
        if (athletesInDivision.length > 0) {
            if (!selectedAthleteId || !athletesInDivision.find(a => a.athleteId === selectedAthleteId || a.id === selectedAthleteId)) {
                setSelectedAthleteId(athletesInDivision[0].id);
            }
        } else {
            setSelectedAthleteId("");
        }
    }, [athletesInDivision, selectedAthleteId]);

    const allowedDashes = useMemo(() => {
        return DASHES.filter(d => {
            if (d.key === "wellness" || d.key === "profile") return canView(user, "Dashboards");
            return canView(user, d.modulePerm);
        });
    }, [user]);

    // Dashboard selector view (when activeDash is null)
    const DashboardSelector = () => (
        <div className="container">
            <div className="pagehead" style={{ borderRadius: 14, overflow: "hidden" }}>
                <div className="pagehead-inner">
                    <div>
                        <div className="pagehead-sub">DASHBOARDS</div>
                        <div className="pagehead-title">Seleccionar Dashboard</div>
                    </div>
                    <span className="pill">{division}</span>
                </div>
            </div>

            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {allowedDashes.map(dash => (
                    <ModuleTile
                        key={dash.key}
                        title={dash.label}
                        icon={dash.icon}
                        color={dash.color}
                        subtitle={dash.subtitle}
                        onClick={() => setActiveDash(dash.key)}
                    />
                ))}
            </div>
        </div>
    );

    const Header = () => {
        const currentDash = allowedDashes.find(d => d.key === activeDash);
        return (
            <div className="container">
                <div className="pagehead" style={{ borderRadius: 14, overflow: "hidden" }}>
                    <div className="pagehead-inner">
                        <div>
                            <div className="pagehead-sub">DASHBOARDS / {currentDash?.label || "Selector"}</div>

                            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "12px" }}>
                                {divisionsAllowed.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>DIVISIÓN</span>
                                        <select
                                            value={division}
                                            onChange={(e) => onDivisionChange(e.target.value)}
                                            style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 8px", outline: "none", fontWeight: "bold", fontSize: "0.9rem", cursor: "pointer" }}
                                        >
                                            {divisionsAllowed.map(d => <option key={d} value={d} style={{ color: "black" }}>{d}</option>)}
                                        </select>
                                    </div>
                                )}
                                {athletesInDivision.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>ATLETA</span>
                                        <select
                                            value={selectedAthleteId}
                                            onChange={(e) => setSelectedAthleteId(e.target.value)}
                                            style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 8px", outline: "none", fontWeight: "bold", fontSize: "0.9rem", cursor: "pointer" }}
                                        >
                                            {athletesInDivision.map(a => <option key={a.id} value={a.id} style={{ color: "black" }}>{a.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 12 }} className="card">
                    <div className="card-body">
                        <div className="row" style={{ justifyContent: "space-between" }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setActiveDash(null)}
                                style={{ padding: "6px 12px", fontSize: 14 }}
                            >
                                ← Volver a Dashboards
                            </button>
                            <div className="row">
                                <span className="small">Date</span>
                                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const Body = () => {
        if (activeDash === "profile") {
            return (
                <AthleteProfileDashboard
                    athleteId={selectedAthleteId}
                    users={users}
                    submissions={submissions}
                    athletesInDivision={athletesInDivision}
                    onAthleteSelect={setSelectedAthleteId}
                    hideHeader={true}
                />
            );
        }
        if (activeDash === "wellness") {
            return (
                <CoachDashWellness
                    division={division}
                    wellnessRows={wellnessRows}
                    athletesInDivision={athletesInDivision}
                    date={date}
                    selectedAthleteId={selectedAthleteId}
                />
            );
        }
        if (activeDash === "medical") return <DashMedical division={division} date={date} submissions={submissions} athletesInDivision={athletesInDivision} selectedAthleteId={selectedAthleteId} />;
        if (activeDash === "nutrition") return <DashNutrition division={division} date={date} submissions={submissions} athletesInDivision={athletesInDivision} selectedAthleteId={selectedAthleteId} />;
        if (activeDash === "physical") return <DashPhysicalPreparation division={division} date={date} submissions={submissions} athletesInDivision={athletesInDivision} selectedAthleteId={selectedAthleteId} />;
        if (activeDash === "manager") return <DashManagerAttendance division={division} date={date} submissions={submissions} athletesInDivision={athletesInDivision} selectedAthleteId={selectedAthleteId} />;
        return null;
    };

    // Show selector if no dashboard is active
    if (!activeDash) {
        return <DashboardSelector />;
    }

    return (
        <>
            <Header />
            <div style={{ marginTop: 12 }}>
                <Body />
            </div>
        </>
    );
}
