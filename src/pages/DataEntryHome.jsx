import { useState, useMemo } from "react";
import Card from "../components/Card";




import PhysicalSelectorModal from "../components/PhysicalSelectorModal";
import ModuleTile from "../components/ModuleTile";

function matchesDivision(tpl, division) {
    const divs = tpl.divisions ?? ["ALL"];
    return divs.includes("ALL") || divs.includes(division);
}

export default function DataEntryHome({ user, division, templates = [], onOpen, onBulkOp = () => { } }) {
    console.log("Rendering DataEntryHome", { user, division, templatesCount: templates?.length, onBulkOp });
    const [isPfSelectorOpen, setIsPfSelectorOpen] = useState(false);

    // Filter templates based on role and division
    const visibleTemplates = useMemo(() => {
        return templates
            .filter(t => t.status === "published")
            .filter(t => matchesDivision(t, division))
            .filter(t => {
                // Coach/Admin see generic stuff, Athletes see only their stuff
                // Simplified role check for now
                if (user.role === "Athlete") return t.targetRole === "Athlete";
                return t.targetRole === "Coach" || t.targetRole === "Athlete"; // Coach sees all mostly
            });
    }, [templates, division, user]);

    // Helpers to find specific templates
    const findTemplate = (startStr) => visibleTemplates.find(t => t.id.startsWith(startStr))?.id;

    // Handlers
    const handleTileClick = (module) => {
        if (module === "Physical") {
            setIsPfSelectorOpen(true);
            return;
        }

        // Direct mapping for other modules
        let templateId;
        switch (module) {
            case "Wellness": templateId = findTemplate("ft_wellness"); break;
            case "Medical": templateId = findTemplate("ft_medical"); break; // Matches any medical
            case "Nutrition": templateId = findTemplate("ft_nutrition"); break;
            case "Manager": templateId = findTemplate("ft_manager"); break;
        }

        if (templateId) {
            onOpen(templateId);
        } else {
            alert("No hay formulario disponible para este módulo.");
        }
    };

    const handlePhysicalSelect = (type) => {
        setIsPfSelectorOpen(false);
        let tid;
        switch (type) {
            case "strength": tid = findTemplate("ft_pf_strength"); break;
            case "jumps": tid = findTemplate("ft_pf_jumps"); break;
            case "field": tid = findTemplate("ft_pf_field"); break;
        }
        if (tid) onOpen(tid);
        else alert("Formulario no encontrado para esta selección.");
    };

    return (
        <div className="container">
            <div className="pagehead" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
                <div className="pagehead-inner">
                    <div>
                        <div className="pagehead-sub">ENTRADA DE DATOS</div>
                        <div className="pagehead-title">Hub de Formularios</div>
                    </div>
                    <span className="pill">{division}</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                <ModuleTile title="Wellness" count={1} icon="🧘" color="#10b981" onClick={() => handleTileClick("Wellness")} />
                <ModuleTile title="Médico" count={1} icon="🩺" color="#ef4444" onClick={() => handleTileClick("Medical")} />
                <ModuleTile title="Nutrición" count={1} icon="🥗" color="#f59e0b" onClick={() => handleTileClick("Nutrition")} />
                <ModuleTile title="Preparación Física" count={3} icon="🏋️" color="#3b82f6" onClick={() => handleTileClick("Physical")} />
                <ModuleTile title="Manager" count={1} icon="📋" color="#6366f1" onClick={() => handleTileClick("Manager")} />
                {(user.role === "Coach" || user.role === "Admin") && (
                    <ModuleTile
                        title="Gestor de Rutinas"
                        count="Ejercicios y Planes"
                        icon="🏋️‍♀️"
                        color="#8b5cf6"
                        onClick={() => onBulkOp("routineManager")}
                    />
                )}
            </div>

            {isPfSelectorOpen && (
                <PhysicalSelectorModal
                    onClose={() => setIsPfSelectorOpen(false)}
                    onSelect={handlePhysicalSelect}
                />
            )}
        </div>
    );
}
