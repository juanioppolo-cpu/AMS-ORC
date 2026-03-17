import { USERS } from "../mock/users";
import { saveSession, clearSession, loadSession } from "./storage";

export function login(email, password) {
    const user = USERS.find(u => u.email === email && u.password === password);
    if (!user) return null;
    saveSession(user);
    return user;
}

export function logout() {
    clearSession();
}

export function getUser() {
    return loadSession();
}
