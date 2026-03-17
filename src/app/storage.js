const KEYS = {
    USERS: "ams_users_v1",
    SESSION: "ams_session_v1",
    WELLNESS: "ams_wellness_v1",
    INTEGRATIONS: "ams_integrations_v1",
};


export function loadUsers() {
    const raw = localStorage.getItem(KEYS.USERS);
    return raw ? JSON.parse(raw) : null;
}
export function saveUsers(users) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function loadSession() {
    const raw = localStorage.getItem(KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
}
export function saveSession(session) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}
export function clearSession() {
    localStorage.removeItem(KEYS.SESSION);
}

export function loadWellness() {
    const raw = localStorage.getItem(KEYS.WELLNESS);
    return raw ? JSON.parse(raw) : [];
}
export function saveWellness(rows) {
    localStorage.setItem(KEYS.WELLNESS, JSON.stringify(rows));
}

// --- Form Builder (MVP) ---
const KEY_TEMPLATES = "ams_form_templates_v1";
const KEY_SUBMISSIONS = "ams_form_submissions_v1";

export function loadFormTemplates() {
    const raw = localStorage.getItem(KEY_TEMPLATES);
    return raw ? JSON.parse(raw) : [];
}
export function saveFormTemplates(rows) {
    localStorage.setItem(KEY_TEMPLATES, JSON.stringify(rows));
}

export function loadFormSubmissions() {
    const raw = localStorage.getItem(KEY_SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
}
export function saveFormSubmissions(rows) {
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(rows));
}

// --- API Integrations ---
export function loadIntegrations() {
    const raw = localStorage.getItem(KEYS.INTEGRATIONS);
    return raw ? JSON.parse(raw) : [];
}
export function saveIntegrations(integrations) {
    localStorage.setItem(KEYS.INTEGRATIONS, JSON.stringify(integrations));
}

