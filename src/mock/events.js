export const EVENTS = [
    {
        id: "evt_match_1",
        type: "match",
        title: "Partido vs Club A",
        date: "2026-02-21", // Sábado
        time: "15:30",
        location: "Estadio Principal",
        assignedTo: { type: "division", id: "div_first", name: "Primera" }
    },
    {
        id: "evt_train_1",
        type: "training",
        title: "Entrenamiento Técnico",
        date: "2026-02-17", // Martes
        time: "10:00",
        location: "Cancha 2",
        assignedTo: { type: "division", id: "div_sub18", name: "Sub-18" }
    },
    {
        id: "evt_med_1",
        type: "medical",
        title: "Evaluaciones Antropométricas",
        date: "2026-02-18", // Miércoles
        time: "09:00",
        location: "Consultorio",
        assignedTo: { type: "division", id: "div_reserva", name: "Reserva" }
    }
];
