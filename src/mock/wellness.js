import { USERS } from "./users";

export function seedWellness() {
    const submissions = [];
    const now = new Date();

    const athletes = USERS.filter(u => u.role === "Athlete");

    // Helper
    const dateStr = (daysAgo) => {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().slice(0, 10);
    };

    let idTracker = 1;

    athletes.forEach(athlete => {
        // Generate daily wellness for the last 5 days
        for (let daysAgo = 4; daysAgo >= 0; daysAgo--) {
            // Some missing data randomly
            if (Math.random() > 0.8) continue;

            const sleepQuality = Math.floor(1 + Math.random() * 5); // 1 to 5
            const fatigue = Math.floor(1 + Math.random() * 5);
            const soreness = Math.floor(1 + Math.random() * 5);
            const stress = Math.floor(1 + Math.random() * 5);
            const mood = Math.floor(1 + Math.random() * 5);

            submissions.push({
                id: `sub_well_${idTracker++}`,
                templateId: "ft_wellness",
                subjectId: athlete.id, // For latest schema
                userId: athlete.id,
                date: dateStr(daysAgo),
                createdAt: new Date().toISOString(), // Match schema
                division: (athlete.divisions && athlete.divisions.length > 0) ? athlete.divisions[0] : "ALL",
                values: {
                    sleepQuality: String(sleepQuality),
                    fatigue: String(fatigue),
                    soreness: String(soreness),
                    stress: String(stress),
                    mood: String(mood)
                }
            });
        }
    });

    return submissions;
}
