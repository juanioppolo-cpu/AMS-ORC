export const TAB_KEYS = {
    HOME: "home",
    FORMS: "forms",
    DASHBOARDS: "dashboards",
    CALENDAR: "calendar",
    GROUP_ENTRY: "group_entry",
    IMPORT: "import",
    REPORTS: "reports",
    USERS: "users",
    SETTINGS: "settings",
    PROFILE: "profile",
};

export function tabsForUser(user) {
    if (!user) return [];

    if (user.role === "Admin") return [
        { key: TAB_KEYS.HOME, label: "INICIO" },
        { key: TAB_KEYS.FORMS, label: "ENTRADA DE DATOS" },
        { key: TAB_KEYS.DASHBOARDS, label: "DASHBOARDS" },
        { key: TAB_KEYS.CALENDAR, label: "CALENDARIO" },
        { key: TAB_KEYS.GROUP_ENTRY, label: "ENTRADA GRUPAL" },
        { key: TAB_KEYS.IMPORT, label: "IMPORTAR" },
        { key: TAB_KEYS.REPORTS, label: "REPORTS" },
    ];

    if (user.role === "Coach") return [
        { key: TAB_KEYS.HOME, label: "INICIO" },
        { key: TAB_KEYS.FORMS, label: "ENTRADA DE DATOS" },
        { key: TAB_KEYS.DASHBOARDS, label: "DASHBOARDS" },
        { key: TAB_KEYS.CALENDAR, label: "CALENDARIO" },
        { key: TAB_KEYS.GROUP_ENTRY, label: "ENTRADA GRUPAL" },
        { key: TAB_KEYS.IMPORT, label: "IMPORTAR" },
        { key: TAB_KEYS.REPORTS, label: "REPORTS" },
    ];

    // Athlete
    return [
        { key: TAB_KEYS.HOME, label: "INICIO" },
        { key: "profile", label: "MY PROFILE" },
        { key: "wellness", label: "WELLNESS" },
    ];
}
