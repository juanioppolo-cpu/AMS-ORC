export function seedFormTemplates() {
    const now = new Date().toISOString();

    return [
        // --- WELLNESS (Athlete) ---
        {
            id: "ft_wellness",
            name: "Morning Wellness",
            module: "Wellness",
            status: "published",
            targetRole: "Athlete",
            divisions: ["ALL"],
            fields: [
                { id: "sec_physical", type: "section", key: "sec_physical", label: "FÍSICO" },
                { id: "f_soreness", key: "soreness", type: "scale5", label: "Dolor Muscular", required: true, leftLabel: "Mucho Dolor", rightLabel: "Sin Dolor" },
                { id: "f_fatigue", key: "fatigue", type: "scale5", label: "Fatiga", required: true, leftLabel: "Muy fatigado", rightLabel: "Fresco" },

                { id: "sec_mental", type: "section", key: "sec_mental", label: "MENTAL & DESCANSO" },
                { id: "f_stress", key: "stress", type: "scale5", label: "Estrés", required: true, leftLabel: "Alto", rightLabel: "Bajo" },
                { id: "f_mood", key: "mood", type: "scale5", label: "Estado de Ánimo", required: true, leftLabel: "Malo", rightLabel: "Excelente" },
                { id: "f_sleepQuality", key: "sleepQuality", type: "scale5", label: "Calidad de Sueño", required: true, leftLabel: "Mala", rightLabel: "Excelente" },

                { id: "f_notes", key: "notes", type: "text", label: "Notas (opcional)", required: false, multiline: true },
            ],
            createdAt: now,
            updatedAt: now,
        },

        // --- MEDICO (Coach/Staff) ---
        {
            id: "ft_medical_injury",
            name: "Parte Médico – Lesión",
            module: "Medical",
            status: "published",
            targetRole: "Coach",
            subjectType: "athlete",
            divisions: ["ALL"],
            fields: [
                { id: "sec_med", type: "section", key: "sec_med", label: "MEDICO" },
                { id: "f_injuryDate", key: "injuryDate", type: "date", label: "Fecha de Lesión", required: true },

                {
                    id: "f_injuryType", key: "injuryType", type: "select", label: "Tipo de Lesión", required: true, options: [
                        "Contusiva", "Muscular", "Tendinosa", "Articular Ligamentaria"
                    ]
                },

                {
                    id: "f_mechanism", key: "mechanism", type: "select", label: "Mecanismo", required: true, options: [
                        "Contacto", "No Contacto"
                    ]
                },

                {
                    id: "f_zone", key: "zone", type: "select", label: "Zona", required: true, options: [
                        "Anterior", "Posterior", "Interno", "Externo"
                    ]
                },

                {
                    id: "f_hemisphere", key: "hemisphere", type: "select", label: "Hemisferio", required: true, options: [
                        "Derecho", "Izquierdo", "Bilateral"
                    ]
                },

                // Diagnóstico: por ahora “texto”, hasta que consigas la lista final
                { id: "f_diagnosis", key: "diagnosis", type: "text", label: "Diagnóstico (lista pendiente)", required: true, multiline: false },

                {
                    id: "f_recurrence", key: "recurrence", type: "select", label: "Recurrencia", required: true, options: [
                        "Si", "No"
                    ]
                },

                {
                    id: "f_moment", key: "moment", type: "select", label: "Momento", required: true, options: [
                        "Pre-Temp", "Comp", "Post Temp"
                    ]
                },

                { id: "f_med_notes", key: "notes", type: "text", label: "Notas (opcional)", required: false, multiline: true },
            ],
            createdAt: now,
            updatedAt: now,
        },

        // --- NUTRICION (Coach/Staff) ---
        {
            id: "ft_nutrition_anthro",
            name: "Nutrición – Antropometría",
            module: "Nutrition",
            status: "published",
            targetRole: "Coach",
            subjectType: "athlete",
            divisions: ["ALL"],
            fields: [
                { id: "sec_meta", type: "section", key: "sec_meta", label: "METADATA" },
                { id: "meta_gender", key: "genero", type: "select", label: "Género", required: true, options: ["Hombre", "Mujer"] },
                { id: "meta_age", key: "edad", type: "number", label: "Edad (años)", required: true, step: 0.1, min: 0 },
                { id: "meta_cat", key: "categoria", type: "select", label: "Categoría", required: true, options: ["9na", "8va", "7ma", "6ta", "5ta", "4ta", "Reserva", "Primera"] },
                { id: "meta_pos", key: "puesto", type: "select", label: "Puesto", required: true, options: ["Arquero", "Campo"] },

                { id: "sec_basic", type: "section", key: "sec_basic", label: "DATOS BÁSICOS" },
                { id: "n_peso", key: "pesoBrutoKg", type: "number", label: "Peso Bruto (Kg)", required: true, step: 0.1 },
                { id: "n_talla", key: "tallaCm", type: "number", label: "Talla Corporal (cm)", required: true, step: 0.1 },
                { id: "n_tallaSent", key: "tallaSentadoCm", type: "number", label: "Talla Sentado (cm)", required: true, step: 0.1 },
                { id: "n_enverg", key: "envergaduraCm", type: "number", label: "Envergadura (cm)", required: true, step: 0.1 },

                { id: "sec_diam", type: "section", key: "sec_diam", label: "DIÁMETROS (cm)" },
                { id: "d_biac", key: "biacromial", type: "number", label: "Biacromial", required: true, step: 0.1 },
                { id: "d_toraxT", key: "toraxTransverso", type: "number", label: "Tórax Transverso", required: true, step: 0.1 },
                { id: "d_toraxAP", key: "toraxAnteroPosterior", type: "number", label: "Tórax Antero-posterior", required: true, step: 0.1 },
                { id: "d_biili", key: "biiliocrestideo", type: "number", label: "Bi-iliocrestídeo", required: true, step: 0.1 },
                { id: "d_hum", key: "humeralBiepicondilar", type: "number", label: "Humeral (biepicondilar)", required: true, step: 0.1 },
                { id: "d_fem", key: "femoralBiepicondilar", type: "number", label: "Femoral (biepicondilar)", required: true, step: 0.1 },

                { id: "sec_per", type: "section", key: "sec_per", label: "PERÍMETROS (cm)" },
                { id: "p_cab", key: "cabeza", type: "number", label: "Cabeza", required: true, step: 0.1 },
                { id: "p_brRel", key: "brazoRelajado", type: "number", label: "Brazo Relajado", required: true, step: 0.1 },
                { id: "p_brFlex", key: "brazoFlexionadoTension", type: "number", label: "Brazo Flexionado en Tensión", required: true, step: 0.1 },
                { id: "p_ante", key: "antebrazoMaximo", type: "number", label: "Antebrazo Máximo", required: true, step: 0.1 },
                { id: "p_torax", key: "toraxMesoesternal", type: "number", label: "Tórax Mesoesternal", required: true, step: 0.1 },
                { id: "p_cint", key: "cinturaMinima", type: "number", label: "Cintura (mínima)", required: true, step: 0.1 },
                { id: "p_onf", key: "onfalico", type: "number", label: "Onfálico", required: true, step: 0.1 },
                { id: "p_cad", key: "caderaMaximo", type: "number", label: "Cadera (máximo)", required: true, step: 0.1 },
                { id: "p_musMax", key: "musloMaximo", type: "number", label: "Muslo (máximo)", required: true, step: 0.1 },
                { id: "p_musMed", key: "musloMedial", type: "number", label: "Muslo (medial)", required: true, step: 0.1 },
                { id: "p_pant", key: "pantorrillaMaxima", type: "number", label: "Pantorrilla (máxima)", required: true, step: 0.1 },

                { id: "sec_plieg", type: "section", key: "sec_plieg", label: "PLIEGUES CUTÁNEOS (mm)" },
                { id: "s_tri", key: "triceps", type: "number", label: "Tríceps", required: true, step: 0.1 },
                { id: "s_sub", key: "subescapular", type: "number", label: "Subescapular", required: true, step: 0.1 },
                { id: "s_supra", key: "supraespinal", type: "number", label: "Supraespinal", required: true, step: 0.1 },
                { id: "s_abd", key: "abdominal", type: "number", label: "Abdominal", required: true, step: 0.1 },
                { id: "s_mus", key: "musloMedialPliegue", type: "number", label: "Muslo Medial", required: true, step: 0.1 },
                { id: "s_pant", key: "pantorrillaPliegue", type: "number", label: "Pantorrilla (máxima)", required: true, step: 0.1 },

                { id: "n_notes", key: "notes", type: "text", label: "Notas (opcional)", required: false, multiline: true },
            ],
            createdAt: now,
            updatedAt: now,
        },

        // --- PREPARACION FISICA (stub por ahora) ---
        {
            id: "ft_pf_session",
            name: "Preparación Física – Sesión (MVP)",
            module: "PhysicalStrength",
            status: "published",
            targetRole: "Coach",
            subjectType: "athlete",
            divisions: ["ALL"],
            fields: [
                { id: "sec_pf", type: "section", key: "sec_pf", label: "PREPARACIÓN FÍSICA" },
                { id: "pf_date", key: "sessionDate", type: "date", label: "Fecha", required: true },
                {
                    id: "pf_type", key: "sessionType", type: "select", label: "Tipo de sesión", required: true, options: [
                        "Fuerza", "Campo", "Mixta"
                    ]
                },
                { id: "pf_rpe", key: "sessionRPE", type: "number", label: "RPE (0–10)", required: true, min: 0, max: 10, step: 1 },
                { id: "pf_notes", key: "notes", type: "text", label: "Notas (opcional)", required: false, multiline: true },
            ],
            createdAt: now,
            updatedAt: now,
        },
        // --- PREPARACIÓN FÍSICA – FUERZA ---
        {
            id: "ft_pf_strength",
            name: "PF – Fuerza",
            module: "PhysicalStrength",
            status: "published",
            targetRole: "Coach",
            subjectType: "athlete",
            divisions: ["ALL"],
            fields: [
                { id: "sec_pf_strength", type: "section", key: "sec_pf_strength", label: "PREPARACIÓN FÍSICA – FUERZA" },
                { id: "pf_strength_date", key: "date", type: "date", label: "Fecha", required: true },

                { id: "pf_bp", key: "pressPlanoKg", type: "number", label: "Press Plano (kg)", required: true, step: 0.5, min: 0 },
                { id: "pf_pull", key: "dominadasKg", type: "number", label: "Dominadas (kg)", required: true, step: 0.5, min: 0 },
                { id: "pf_sq", key: "sentadillasKg", type: "number", label: "Sentadillas (kg)", required: true, step: 0.5, min: 0 },
                { id: "pf_dl", key: "pesoMuertoKg", type: "number", label: "Peso Muerto (kg)", required: true, step: 0.5, min: 0 },

                { id: "pf_strength_notes", key: "notes", type: "text", label: "Notas (opcional)", required: false, multiline: true },
            ],
            createdAt: now,
            updatedAt: now,
        },

        // --- PREPARACIÓN FÍSICA – SALTOS ---
        {
            id: "ft_pf_jumps",
            name: "PF – Saltos",
            module: "PhysicalStrength",
            status: "published",
            targetRole: "Coach",
            subjectType: "athlete",
            divisions: ["ALL"],
            fields: [
                { id: "sec_pf_jumps", type: "section", key: "sec_pf_jumps", label: "PREPARACIÓN FÍSICA – SALTOS" },
                { id: "pf_jumps_date", key: "date", type: "date", label: "Fecha", required: true },

                { id: "pf_broad", key: "broadJumpCm", type: "number", label: "Broad Jump (cm)", required: true, step: 1, min: 0 },
                { id: "pf_vj", key: "verticalJumpCm", type: "number", label: "Vertical Jump (cm)", required: true, step: 1, min: 0 },

                { id: "pf_jumps_notes", key: "notes", type: "text", label: "Notas (opcional)", required: false, multiline: true },
            ],
            createdAt: now,
            updatedAt: now,
        },

        // --- PREPARACIÓN FÍSICA – CAMPO ---
        {
            id: "ft_pf_field",
            name: "PF – Campo",
            module: "PhysicalField",
            status: "published",
            targetRole: "Coach",
            subjectType: "athlete",
            divisions: ["ALL"],
            fields: [
                { id: "sec_pf_field", type: "section", key: "sec_pf_field", label: "PREPARACIÓN FÍSICA – CAMPO" },
                { id: "pf_field_date", key: "date", type: "date", label: "Fecha", required: true },

                { id: "pf_bronco", key: "broncoSec", type: "number", label: "Bronco (seg)", required: true, step: 1, min: 0 },
                { id: "pf_yoyo", key: "yoyoIR1", type: "number", label: "Yo-Yo IR1 (nivel)", required: true, step: 0.1, min: 0 },
                { id: "pf_speed", key: "velocidad10mSec", type: "number", label: "Velocidad (seg)", required: true, step: 0.01, min: 0 },

                { id: "pf_field_notes", key: "notes", type: "text", label: "Notas (opcional)", required: false, multiline: true },
            ],
            createdAt: now,
            updatedAt: now,
        },

        // --- MANAGER – ASISTENCIA ---
        {
            id: "ft_manager_attendance",
            name: "Manager – Asistencia",
            module: "ManagerAttendance",
            status: "published",
            targetRole: "Coach",
            subjectType: "athlete",
            divisions: ["ALL"],
            fields: [
                { id: "sec_mgr", type: "section", key: "sec_mgr", label: "MANAGER – ASISTENCIA" },
                { id: "mgr_date", key: "date", type: "date", label: "Fecha", required: true },

                {
                    id: "mgr_status", key: "status", type: "select", label: "Estado", required: true, options: [
                        "Presente",
                        "Ausente",
                        "Tarde",
                        "Lesionado",
                        "Enfermo",
                        "Permiso"
                    ]
                },

                { id: "mgr_reason", key: "reason", type: "text", label: "Motivo / Comentario (opcional)", required: false, multiline: true },
            ],
            createdAt: now,
            updatedAt: now,
        },
    ];
}
