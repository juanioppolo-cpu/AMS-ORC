import { useEffect, useMemo, useState } from "react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";

// App Context & Config
import { DIVISIONS } from "./app/divisions";

// Remote Database
import { api } from "./lib/api";

// Services & Routing
import { tabsForUser, TAB_KEYS } from "./app/routes";
import { loadUsers, saveUsers, loadSession, saveSession, clearSession, loadFormTemplates, saveFormTemplates, loadFormSubmissions, saveFormSubmissions } from "./app/storage";
import { canView, canWrite } from "./app/permissions";

// Components & Pages
import Login from "./pages/Login";
import TopBar from "./components/TopBar";
import Card from "./components/Card";
import SquadWellnessDashboard from "./components/wellness/SquadWellnessDashboard";
import WellnessRawReport from "./components/wellness/WellnessRawReport";
import AdminPortal from "./components/admin/AdminPortal";
import FormRunner from "./pages/FormRunner";
import GroupEntryPage from "./pages/GroupEntryPage";
import ImportPage from "./pages/ImportPage";
import DataEntryHome from "./pages/DataEntryHome";
import PhysicalRoutineManager from "./pages/PhysicalRoutineManager";
import TeamSchedule from "./pages/TeamSchedule";

// ... existing imports ...

// In the Routes configuration:
// ...
// <Route path="/data-entry" element={<DataEntryHome ... />} />
// <Route path="/data-entry/bulk" element={<GroupEntryPage onBack={() => window.history.back()} />} />
// <Route path="/data-entry/import" element={<ImportPage onBack={() => window.history.back()} />} />
// ...
import DashboardHub from "./pages/DashboardHub";
import Integrations from "./pages/settings/Integrations";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import AthleteProfileDashboard from "./components/dashboards/AthleteProfileDashboard";
import { seedFormTemplates } from "./mock/formTemplates";
import { seedNutritionSubmissions } from "./mock/nutritionSubmissions";
import { seedPhysicalSubmissions } from "./mock/physicalSubmissions";
import { seedMedicalSubmissions } from "./mock/medicalSubmissions";
import { seedWellness } from "./mock/wellness";
import SubmissionHistory from "./components/SubmissionHistory";

// Assets
import logoSrc from "./assets/logo-orc.png";

export default function App() {
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [formTemplates, setFormTemplates] = useState([]);
  const [formSubmissions, setFormSubmissions] = useState([]);
  const [openTemplateId, setOpenTemplateId] = useState(null);
  const [bulkOp, setBulkOp] = useState(null); // 'group' or 'import'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [viewHistoryParams, setViewHistoryParams] = useState(null);
  const [editSubmissionId, setEditSubmissionId] = useState(null);

  const selectedTemplate = useMemo(() => {
    return formTemplates.find(t => t.id === openTemplateId) ?? null;
  }, [openTemplateId, formTemplates]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    if (!session) return null;
    return users.find(u => u.id === session.userId) ?? session;
  }, [session, users]);

  // Division scoping
  const divisionsAllowed = useMemo(() => {
    if (!user) return [];
    if (user.role === "Admin") return [...DIVISIONS];
    return user.divisions ?? [];
  }, [user]);

  const [activeDivision, setActiveDivision] = useState(DIVISIONS[0]);
  const [activeTab, setActiveTab] = useState(TAB_KEYS.DASHBOARDS);

  // Initial Boot & Seed
  useEffect(() => {
    const u = loadUsers();
    const s = loadSession();
    const ftData = loadFormTemplates();
    let fsData = loadFormSubmissions();

    // Fetch real users from Neon via API
    async function fetchUsers() {
      try {
        const data = await api.getUsers();
        if (data && data.length > 0) {
          saveUsers(data);
          setUsers(data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }

    if (!u || u.length === 0) {
      fetchUsers();
    } else {
      setUsers(u);
    }

    // Load templates
    if (ftData && ftData.length > 0) {
      setFormTemplates(ftData);
    } else {
      const templates = seedFormTemplates();
      saveFormTemplates(templates);
      setFormTemplates(templates);
    }
    // We will force a re-seed of all data to ensure the new 360 data is present
    const needsReseed = !fsData || fsData.length === 0 || !fsData.some(item => item.templateId === "ft_wellness" && item.values && item.values.mood);

    if (needsReseed) {
      console.log("Seeding/Updating All Mock Submissions and Templates for 360 Profile...");

      // Force update templates so the user sees the new fields
      const freshTemplates = seedFormTemplates();
      saveFormTemplates(freshTemplates);
      setFormTemplates(freshTemplates);

      const newNutrition = seedNutritionSubmissions();
      const physicalSeed = seedPhysicalSubmissions();
      const medicalSeed = seedMedicalSubmissions();
      const wellnessSeed = seedWellness();

      const attendanceSeed = [
        { id: "att-1", templateId: "ft_manager_attendance", subjectId: "u_ath_001", userId: "user-1", date: "2024-03-20T10:00:00Z", division: "M17", values: { status: "Presente" } },
        { id: "att-2", templateId: "ft_manager_attendance", subjectId: "u_ath_001", userId: "user-1", date: "2024-03-21T10:00:00Z", division: "M17", values: { status: "Presente" } },
        { id: "att-3", templateId: "ft_manager_attendance", subjectId: "u_ath_001", userId: "user-1", date: "2024-03-22T10:00:00Z", division: "M17", values: { status: "Ausente", reason: "Falta personal" } },
        { id: "att-4", templateId: "ft_manager_attendance", subjectId: "u_ath_002", userId: "user-1", date: "2024-03-20T10:00:00Z", division: "M17", values: { status: "Presente" } },
        { id: "att-5", templateId: "ft_manager_attendance", subjectId: "u_ath_002", userId: "user-1", date: "2024-03-21T10:00:00Z", division: "M17", values: { status: "Tarde" } }
      ];

      fsData = [...newNutrition, ...physicalSeed, ...medicalSeed, ...wellnessSeed, ...attendanceSeed];
    }

    // Ensure we save the seeded data immediately so it persists
    saveFormSubmissions(fsData);
    setFormSubmissions(fsData);

    if (s) setSession(s);
    setLoading(false);
  }, []);

  const handleSetTemplates = (next) => {
    setFormTemplates(next);
    saveFormTemplates(next);
  };

  // Sync to persistence
  useEffect(() => {
    if (users.length > 0) saveUsers(users);
  }, [users]);

  useEffect(() => {
    if (formTemplates.length > 0) saveFormTemplates(formTemplates);
  }, [formTemplates]);

  useEffect(() => {
    setOpenTemplateId(null);
  }, [activeTab]);

  useEffect(() => {
    saveFormSubmissions(formSubmissions);
  }, [formSubmissions]);

  // Scoping context adjust
  useEffect(() => {
    if (!user) return;
    const allowed = divisionsAllowed;
    if (allowed.length === 0) return;

    if (allowed.length === 1) {
      setActiveDivision(allowed[0]);
    } else if (!allowed.includes(activeDivision)) {
      setActiveDivision(allowed[0]);
    }

    if (user.role === "Admin" || user.role === "Coach") setActiveTab(TAB_KEYS.HOME);
    else if (user.role === "Athlete") setActiveTab(TAB_KEYS.HOME);
  }, [user]); // eslint-disable-line

  // Derived Wellness Data from Dynamic Submissions
  const wellnessRowsFromSubmissions = useMemo(() => {
    const nameMap = new Map();
    users.forEach(u => {
      if (u.role === "Athlete") {
        nameMap.set(u.id, u.name);
        if (u.athleteId) nameMap.set(u.athleteId, u.name);
      }
    });

    return formSubmissions
      .filter(s => s.templateId === "ft_wellness")
      .map(s => {
        const sq = Number(s.values?.sleepQuality ?? 0);
        const fa = Number(s.values?.fatigue ?? 0);
        const so = Number(s.values?.soreness ?? 0);
        const st = Number(s.values?.stress ?? 0);
        const mo = Number(s.values?.mood ?? 0);
        const totalScore = sq + fa + so + st + mo;

        return {
          id: s.id,
          date: s.date,
          division: s.division,
          athleteId: s.subjectId,
          athleteName: nameMap.get(s.subjectId) ?? "Unknown Athlete",
          sleepQuality: sq,
          fatigue: fa,
          soreness: so,
          stress: st,
          mood: mo,
          totalScore: totalScore,
          notes: String(s.values?.notes ?? ""),
          createdAt: s.createdAt,
        };
      })
      .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  }, [formSubmissions, users]);

  // Compliance list (athletes in current scope)
  const athletesInDivision = useMemo(() => {
    return users
      .filter(u => u.role === "Athlete" && (u.divisions ?? []).includes(activeDivision))
      .map(u => ({ id: u.id, name: u.name, athleteId: u.athleteId ?? u.id }));
  }, [users, activeDivision]);

  const onLogin = (sess) => {
    saveSession(sess);
    setSession(sess);
  };

  const onLogout = () => {
    clearSession();
    setSession(null);
    setActiveDivision(DIVISIONS[0]);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-300">INITIALIZING AMS...</div>;

  if (!user && !session) {
    return <Login onSuccess={onLogin} />;
  }

  const tabs = tabsForUser(user);

  const renderContent = () => {
    if (viewHistoryParams) {
      return (
        <SubmissionHistory
          athleteId={viewHistoryParams.athleteId}
          categoryKey={viewHistoryParams.categoryKey}
          submissions={formSubmissions}
          users={users}
          onEdit={(submissionId) => {
            const sub = formSubmissions.find(s => s.id === submissionId);
            if (sub) {
              setViewHistoryParams(null);
              setEditSubmissionId(submissionId);
              setOpenTemplateId(sub.templateId);
              setActiveTab(TAB_KEYS.FORMS);
            }
          }}
          onBack={() => setViewHistoryParams(null)}
        />
      );
    }

    // 1. Athlete Views
    if (user.role === "Athlete") {
      if (activeTab === TAB_KEYS.HOME) {
        return <Home user={user} />;
      }

      if (activeTab === "wellness") {
        if (!canWrite(user, "Wellness")) return <div className="container p-4">No access.</div>;

        const tpl = formTemplates.find(t => t.id === "ft_wellness" && t.status === "published");
        if (!tpl) return <div className="container p-4">Wellness template not found.</div>;

        const division = (user.divisions ?? [activeDivision])[0];

        return (
          <FormRunner
            user={user}
            division={activeDivision}
            template={tpl}
            submissions={formSubmissions}
            setSubmissions={setFormSubmissions}
            athletesInDivision={athletesInDivision}
          />
        );
      }

      return (
        <div className="container p-4">
          <div className="pagehead-title">My Profile (stub)</div>
        </div>
      );
    }

    // 2. Staff/Admin Views
    switch (activeTab) {
      case TAB_KEYS.HOME:
        return <Home user={user} />;

      case TAB_KEYS.SETTINGS:
        if (user.role !== "Admin") return <div className="container p-4">Unauthorized: Admin Access Required.</div>;
        return <Integrations />;

      case TAB_KEYS.USERS:
        if (user.role !== "Admin") return <div className="container p-4">Unauthorized: Admin Access Required.</div>;
        return <AdminPortal users={users} setUsers={setUsers} />;

      case TAB_KEYS.DASHBOARDS:
        if (!canView(user, "Dashboards")) return <div className="container">No access.</div>;
        return (
          <DashboardHub
            user={user}
            division={activeDivision}
            divisionsAllowed={divisionsAllowed}
            onDivisionChange={setActiveDivision}
            wellnessRows={wellnessRowsFromSubmissions}
            formSubmissions={formSubmissions}
            athletesInDivision={athletesInDivision}
            users={users}
          />
        );

      case TAB_KEYS.REPORTS:
        if (!canView(user, "Reports")) return <div className="container p-4">Unauthorized: Report Access Restricted.</div>;
        return (
          <WellnessRawReport
            division={activeDivision}
            wellnessRows={wellnessRowsFromSubmissions}
            athletesInDivision={athletesInDivision}
          />
        );

      case TAB_KEYS.FORMS:
        if (!canView(user, "Forms")) return <div className="container">No access.</div>;

        if (bulkOp === "routineManager") {
          return <PhysicalRoutineManager onBack={() => setBulkOp(null)} />;
        }

        // Si hay template abierto, render FormRunner
        if (openTemplateId) {
          const tpl = formTemplates.find(t => t.id === openTemplateId);
          if (!tpl) return <div className="container">Template not found.</div>;

          return (
            <FormRunner
              user={user}
              division={activeDivision}
              template={tpl}
              submissions={formSubmissions}
              setSubmissions={setFormSubmissions}
              athletesInDivision={athletesInDivision}
              editSubmissionId={editSubmissionId}
              onCancel={() => {
                setOpenTemplateId(null);
                setEditSubmissionId(null);
              }}
            />
          );
        }

        // Si no, render Home de Entrada de Datos
        return (
          <DataEntryHome
            user={user}
            division={activeDivision}
            templates={formTemplates}
            onOpen={(id) => setOpenTemplateId(id)}
            onBulkOp={setBulkOp}
          />
        );

      case TAB_KEYS.CALENDAR:
        if (!canView(user, "Forms")) return <div className="container">No access.</div>;
        return <TeamSchedule />;

      case TAB_KEYS.GROUP_ENTRY:
        if (!canView(user, "Forms")) return <div className="container">No access.</div>;
        return (
          <GroupEntryPage
            user={user}
            division={activeDivision}
            users={users}
            templates={formTemplates}
            submissions={formSubmissions}
            setSubmissions={setFormSubmissions}
          />
        );

      case TAB_KEYS.IMPORT:
        if (!canView(user, "Forms")) return <div className="container">No access.</div>;
        return (
          <ImportPage
            user={user}
            users={users}
            templates={formTemplates}
            submissions={formSubmissions}
            setSubmissions={setFormSubmissions}
          />
        );

      default:
        return <div className="container p-4 text-center text-muted">Operational section not initialized.</div>;
    }
  };

  return (
    <div className="layout-root flex h-screen" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        division={activeDivision}
        divisionsAllowed={divisionsAllowed}
        onDivisionChange={setActiveDivision}
        users={users}
        formSubmissions={formSubmissions}
        onEditSubmission={(id) => {
          // Later we will handle this to open FormRunner
        }}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar
          user={user}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={onLogout}
          logoSrc={logoSrc}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: activeTab === TAB_KEYS.HOME ? 0 : '24px 0' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
