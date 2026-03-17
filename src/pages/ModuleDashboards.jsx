import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/dashboards/DashboardLayout';
import ManagerAttendanceDashboard from '../components/dashboards/ManagerAttendanceDashboard';
import MedicalDashboard from '../components/dashboards/MedicalDashboard';
import NutritionDashboard from '../components/dashboards/NutritionDashboard';
import PhysicalDashboard from '../components/dashboards/PhysicalDashboard';

// Module definitions
const MODULES = [
    { key: "ManagerAttendance", label: "Manager / Asistencia" },
    { key: "Medical", label: "Médico" },
    { key: "Nutrition", label: "Nutrición" },
    { key: "PhysicalStrength", label: "Físico" }, // We aggregate Strength/Field/Jumps here
];

export default function ModuleDashboards({ user, division, submissions, athletesInDivision }) {
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const [date, setDate] = useState(today);

    // Determine available modules based on permissions
    const allowedModules = useMemo(() => {
        return MODULES.filter(m => user.permissions?.[m.key]?.view);
    }, [user]);

    const [activeModule, setActiveModule] = useState(allowedModules[0]?.key || "");

    // If no access
    if (allowedModules.length === 0) {
        return <div className="container p-4">No dashboard access for this role.</div>;
    }

    const renderDashboard = () => {
        const props = { submissions, athletesInDivision, date };
        switch (activeModule) {
            case "ManagerAttendance": return <ManagerAttendanceDashboard {...props} />;
            case "Medical": return <MedicalDashboard {...props} />;
            case "Nutrition": return <NutritionDashboard {...props} />;
            case "PhysicalStrength": return <PhysicalDashboard {...props} />;
            default: return <div>Select a module</div>;
        }
    };

    const currentModuleLabel = MODULES.find(m => m.key === activeModule)?.label;

    return (
        <div>
            {/* Module Picker Navigation */}
            <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '12px 24px', overflowX: 'auto' }}>
                <div className="row" style={{ gap: 8 }}>
                    {allowedModules.map(m => (
                        <button
                            key={m.key}
                            className={`pill ${activeModule === m.key ? 'primary' : ''}`}
                            onClick={() => setActiveModule(m.key)}
                            style={{
                                cursor: 'pointer',
                                border: '1px solid #ddd',
                                padding: '6px 16px',
                                fontSize: '0.9rem'
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Layout */}
            <DashboardLayout
                title={`${currentModuleLabel} Dashboard`}
                subtitle="Operational View"
                date={date}
                onDateChange={setDate}
                division={division}
            >
                {renderDashboard()}
            </DashboardLayout>
        </div>
    );
}
