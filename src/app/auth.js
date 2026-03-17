import { api } from "../lib/api";
import { saveSession, clearSession, loadSession } from "./storage";

/**
 * Calls /api/auth/login, stores { userId, role, token, ...user } in localStorage.
 * Returns the full user object on success, throws on failure.
 */
export async function login(email, password) {
    const { token, user } = await api.login(email, password);

    // Normalise the stored keys so the rest of the app keeps working
    const session = {
        userId: user.id,
        role: user.role,
        token,
        ...user,
    };
    saveSession(session);
    return session;
}

export function logout() {
    clearSession();
}

export function getUser() {
    return loadSession();
}
