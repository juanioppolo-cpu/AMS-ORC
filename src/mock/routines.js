export const ROUTINES = [
    {
        id: "rt_hyper_legs",
        name: "Fuerza - Piernas",
        scheduledDate: "2026-02-16", // Lunes (assuming current week for demo)
        assignedTo: { type: "division", id: "div_sub18", name: "Sub-18" },
        blocks: [
            {
                id: "blk_1",
                name: "Bloque 1",
                exercises: [
                    {
                        id: "ex_inst_1",
                        exerciseId: "ex_sq_back",
                        exerciseName: "Sentadilla Trasera",
                        sets: [
                            { id: "s1", reps: "6", load: "60% / RIR 5", rest: "90s" },
                            { id: "s2", reps: "4", load: "75% / RIR 3", rest: "90s" },
                            { id: "s3", reps: "3", load: "85% / RIR 1", rest: "120s" }
                        ]
                    }
                ]
            },
            {
                id: "blk_2",
                name: "Bloque 2",
                exercises: [
                    {
                        id: "ex_inst_2",
                        exerciseId: "ex_dl_conv",
                        exerciseName: "Peso Muerto Convencional",
                        sets: [
                            { id: "s1", reps: "5", load: "RIR 2", rest: "90s" },
                            { id: "s2", reps: "5", load: "RIR 2", rest: "90s" }
                        ]
                    }
                ]
            }
        ],
        createdAt: "2024-05-01T10:00:00Z"
    },
    {
        id: "rt_upper_power",
        name: "Potencia Tren Superior",
        scheduledDate: "2026-02-18", // Miércoles
        assignedTo: { type: "athlete", id: "ath_1", name: "Juan Perez" },
        blocks: [
            {
                id: "blk_p1",
                name: "Potencia",
                exercises: [
                    {
                        id: "ex_bp_p",
                        exerciseId: "ex_bench_press",
                        exerciseName: "Press Banca Vel.",
                        sets: [
                            { id: "s1", reps: "3", load: "50% / Max Vel", rest: "60s" },
                            { id: "s2", reps: "3", load: "50% / Max Vel", rest: "60s" },
                            { id: "s3", reps: "3", load: "50% / Max Vel", rest: "60s" }
                        ]
                    }
                ]
            }
        ],
        createdAt: "2024-05-02T10:00:00Z"
    }
];
