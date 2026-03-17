import { USERS } from "./users";

// Mock data generator for physical preparation submissions (strength, jumps, field)
export function seedPhysicalSubmissions() {
    const now = new Date();
    const submissions = [];

    // Helper to create date string
    const dateStr = (daysAgo) => {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().slice(0, 10);
    };

    // Helper to generate random variation
    const vary = (base, range) => base + (Math.random() * range * 2 - range);

    // All athletes dynamically from users
    const athletes = USERS.filter(u => u.role === "Athlete");

    let subId = 1;

    athletes.forEach((athlete, idx) => {
        // Base values (M19 athletes are stronger)
        const primaryDivision = athlete.divisions?.[0] || 'Unknown';
        const isM19 = primaryDivision === "M19" || primaryDivision === "Plantel Superior";
        const strengthBase = isM19 ? 80 : 65;
        const jumpBase = isM19 ? 250 : 235;
        const speedBase = isM19 ? 1.70 : 1.80;

        // Generate 3 evaluations per athlete showing progression
        for (let evalNum = 0; evalNum < 3; evalNum++) {
            const daysAgo = 60 - (evalNum * 25); // 60, 35, 10 days ago
            const progression = evalNum * 0.08; // 8% improvement per evalNum

            // STRENGTH
            submissions.push({
                id: `sub_pf_str_${subId++}`,
                templateId: "ft_pf_strength",
                division: primaryDivision,
                subjectId: athlete.id,
                submittedBy: "coach.principal@orc.com",
                date: dateStr(daysAgo),
                values: {
                    pressPlanoKg: Math.round(vary(strengthBase * (1 + progression), 5)),
                    dominadasKg: Math.round(vary((strengthBase - 15) * (1 + progression), 5)),
                    sentadillasKg: Math.round(vary((strengthBase + 25) * (1 + progression), 8)),
                    pesoMuertoKg: Math.round(vary((strengthBase + 35) * (1 + progression), 10))
                }
            });

            // JUMPS
            submissions.push({
                id: `sub_pf_jmp_${subId++}`,
                templateId: "ft_pf_jumps",
                division: primaryDivision,
                subjectId: athlete.id,
                submittedBy: "coach.principal@orc.com",
                date: dateStr(daysAgo),
                values: {
                    broadJumpCm: Math.round(vary(jumpBase * (1 + progression * 0.5), 5)),
                    verticalJumpCm: Math.round(vary((jumpBase / 5) * (1 + progression * 0.5), 2))
                }
            });

            // FIELD TESTS
            submissions.push({
                id: `sub_pf_fld_${subId++}`,
                templateId: "ft_pf_field",
                division: primaryDivision,
                subjectId: athlete.id,
                submittedBy: "coach.principal@orc.com",
                date: dateStr(daysAgo),
                values: {
                    broncoSec: Math.round(vary(290 * (1 - progression * 0.3), 5)),
                    yoyoIR1: parseFloat(vary(16.5 * (1 + progression * 0.4), 0.5).toFixed(1)),
                    velocidad10mSec: parseFloat(vary(speedBase * (1 - progression * 0.3), 0.03).toFixed(2))
                }
            });
        }
    });

    return submissions;
}
