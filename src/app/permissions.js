// módulos (los que se van a mostrar en Users & Permissions)
export const MODULES = [
    "Forms",
    "Dashboards",
    "Reports",
    "ReportsExport",
    "Medical",
    "Nutrition",
    "PhysicalStrength",
    "PhysicalField",
    "ManagerAttendance",
    "Wellness", // usado para Athlete
];

export function canView(user, moduleKey) {
    if (!user) return false;

    // Athlete hard rule
    if (user.role === "Athlete") {
        return moduleKey === "Wellness";
    }

    const p = user.permissions?.[moduleKey];
    return Boolean(p?.view);
}

export function canWrite(user, moduleKey) {
    if (!user) return false;
    if (user.role === "Athlete") return moduleKey === "Wellness";

    // Dashboards siempre read-only (Teamworks)
    if (moduleKey === "Dashboards") return false;

    const p = user.permissions?.[moduleKey];
    return Boolean(p?.write);
}

export function canDelete(user, moduleKey) {
    if (!user) return false;
    if (user.role === "Athlete") return false;

    // Dashboards siempre read-only
    if (moduleKey === "Dashboards") return false;

    const p = user.permissions?.[moduleKey];
    return Boolean(p?.delete);
}

// Default permissions al crear usuarios
export function defaultPermissionsForRole(role) {
    // base: todo apagado
    const base = Object.fromEntries(MODULES.map(m => [m, { view: false, write: false, delete: false }]));

    if (role === "Admin") {
        // Admin puede todo excepto dashboards write/delete
        for (const m of MODULES) {
            base[m].view = true;
            base[m].write = m !== "Dashboards";
            base[m].delete = m !== "Dashboards";
        }
        base["ReportsExport"].view = true;
        base["ReportsExport"].write = false;
        base["ReportsExport"].delete = false;
        return base;
    }

    if (role === "Coach") {
        // Coach base: ver dashboards/reports y cargar forms (general)
        base["Dashboards"].view = true;
        base["Reports"].view = true;
        base["ReportsExport"].view = true; // lo podés apagar si querés
        base["Forms"].view = true;
        base["Forms"].write = true;

        // módulos sensibles quedan apagados por default; Admin los activa
        return base;
    }

    // Athlete: hardcode wellness
    base["Wellness"].view = true;
    base["Wellness"].write = true;
    base["Wellness"].delete = false;
    return base;
}
