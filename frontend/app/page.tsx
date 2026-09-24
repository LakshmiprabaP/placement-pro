"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";


type Application = {
  id: number;
  company: string;
  role: string;
  location: string;
  ctc: string | null;
  status: string;
  priority: string;
  applied_date: string;
  next_event_date: string | null;
  notes: string;
};


type PreparationTask = {
  id: number;
  application: number;
  company: string;
  role: string;
  topic: string;
  completed: boolean;
  created_at: string;
};


type FormData = {
  company: string;
  role: string;
  location: string;
  ctc: string;
  status: string;
  priority: string;
  applied_date: string;
  next_event_date: string;
  notes: string;
};


const APPLICATION_API =
  "http://127.0.0.1:8000/api/applications/";

const TASK_API =
  "http://127.0.0.1:8000/api/preparation-tasks/";


const emptyForm: FormData = {
  company: "",
  role: "",
  location: "",
  ctc: "",
  status: "APPLIED",
  priority: "MEDIUM",
  applied_date: "",
  next_event_date: "",
  notes: "",
};


const statusNames: Record<string, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  TEST: "Test",
  GD: "Group Discussion",
  TECHNICAL: "Technical Interview",
  HR: "HR Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};


const pipelineStatuses = [
  "APPLIED",
  "SHORTLISTED",
  "TEST",
  "GD",
  "TECHNICAL",
  "HR",
  "OFFER",
  "REJECTED",
];


export default function Home() {
  const router = useRouter();

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [tasks, setTasks] =
    useState<PreparationTask[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [form, setForm] =
    useState<FormData>(emptyForm);

  const [newTopics, setNewTopics] =
    useState<Record<number, string>>({});

  const [openPreparation, setOpenPreparation] =
    useState<Record<number, boolean>>({});


  // =========================================
  // AUTHENTICATION
  // =========================================

  const getAccessToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token")
    );
  };


  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  };


  const handleUnauthorized = () => {
    clearTokens();
    router.replace("/login");
  };


  const getAuthHeaders = () => {
    const token = getAccessToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };


  // =========================================
  // FETCH APPLICATIONS
  // =========================================

  const fetchApplications = async () => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(
        APPLICATION_API,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to fetch applications"
        );
      }

      const data = await response.json();

      setApplications(data);

    } catch (error) {
      console.error(
        "Application fetch error:",
        error
      );
    }
  };


  // =========================================
  // FETCH PREPARATION TASKS
  // =========================================

  const fetchTasks = async () => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(
        TASK_API,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to fetch preparation tasks"
        );
      }

      const data = await response.json();

      setTasks(data);

    } catch (error) {
      console.error(
        "Task fetch error:",
        error
      );
    }
  };


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    const loadDashboard = async () => {
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      try {
        await Promise.all([
          fetchApplications(),
          fetchTasks(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // =========================================
  // CREATE / UPDATE APPLICATION
  // =========================================

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const url =
        editingId !== null
          ? `${APPLICATION_API}${editingId}/`
          : APPLICATION_API;

      const method =
        editingId !== null
          ? "PATCH"
          : "POST";

      const response = await fetch(
        url,
        {
          method,

          headers: getAuthHeaders(),

          body: JSON.stringify({
            ...form,

            ctc: form.ctc
              ? Number(form.ctc)
              : null,

            next_event_date:
              form.next_event_date ||
              null,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data =
          await response.json();

        console.error(
          "Save application error:",
          data
        );

        alert(
          "Unable to save application."
        );

        return;
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchApplications();

    } catch (error) {
      console.error(
        "Save error:",
        error
      );

      alert(
        "Unable to save application."
      );
    }
  };


  // =========================================
  // EDIT APPLICATION
  // =========================================

  const handleEdit = (
    application: Application
  ) => {
    setEditingId(application.id);

    setForm({
      company:
        application.company,

      role:
        application.role,

      location:
        application.location || "",

      ctc:
        application.ctc || "",

      status:
        application.status,

      priority:
        application.priority,

      applied_date:
        application.applied_date,

      next_event_date:
        application.next_event_date
          ? application.next_event_date.slice(
              0,
              16
            )
          : "",

      notes:
        application.notes || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =========================================
  // DELETE APPLICATION
  // =========================================

  const handleDelete = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Delete this application? Its preparation tasks will also be deleted."
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${APPLICATION_API}${id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${getAccessToken()}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to delete application"
        );
      }

      await Promise.all([
        fetchApplications(),
        fetchTasks(),
      ]);

    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete application."
      );
    }
  };


  // =========================================
  // CANCEL FORM
  // =========================================

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };


  // =========================================
  // ADD PREPARATION TASK
  // =========================================

  const handleAddTask = async (
    applicationId: number
  ) => {
    const topic =
      newTopics[
        applicationId
      ]?.trim();

    if (!topic) {
      alert(
        "Enter a preparation topic."
      );

      return;
    }

    try {
      const response = await fetch(
        TASK_API,
        {
          method: "POST",

          headers:
            getAuthHeaders(),

          body: JSON.stringify({
            application:
              applicationId,

            topic,

            completed: false,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data =
          await response.json();

        console.error(
          "Task creation error:",
          data
        );

        alert(
          "Unable to add preparation topic."
        );

        return;
      }

      setNewTopics(
        (previous) => ({
          ...previous,
          [applicationId]: "",
        })
      );

      await fetchTasks();

    } catch (error) {
      console.error(error);

      alert(
        "Unable to add preparation topic."
      );
    }
  };


  // =========================================
  // TOGGLE PREPARATION TASK
  // =========================================

  const handleToggleTask = async (
    task: PreparationTask
  ) => {
    try {
      const response = await fetch(
        `${TASK_API}${task.id}/`,
        {
          method: "PATCH",

          headers:
            getAuthHeaders(),

          body: JSON.stringify({
            completed:
              !task.completed,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to update task"
        );
      }

      await fetchTasks();

    } catch (error) {
      console.error(error);

      alert(
        "Unable to update preparation task."
      );
    }
  };


  // =========================================
  // DELETE PREPARATION TASK
  // =========================================

  const handleDeleteTask = async (
    taskId: number
  ) => {
    try {
      const response = await fetch(
        `${TASK_API}${taskId}/`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${getAccessToken()}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to delete task"
        );
      }

      await fetchTasks();

    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete preparation task."
      );
    }
  };


  // =========================================
  // APPLICATION TASKS
  // =========================================

  const getApplicationTasks = (
    applicationId: number
  ) => {
    return tasks.filter(
      (task) =>
        task.application ===
        applicationId
    );
  };


  // =========================================
  // READINESS SCORE
  // =========================================

  const getReadiness = (
    applicationId: number
  ) => {
    const applicationTasks =
      getApplicationTasks(
        applicationId
      );

    if (
      applicationTasks.length === 0
    ) {
      return 0;
    }

    const completed =
      applicationTasks.filter(
        (task) =>
          task.completed
      ).length;

    return Math.round(
      (
        completed /
        applicationTasks.length
      ) * 100
    );
  };


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    clearTokens();
    router.replace("/login");
  };


  // =========================================
  // DASHBOARD DATA
  // =========================================

  const interviews =
    applications.filter(
      (app) =>
        app.status ===
          "TECHNICAL" ||
        app.status === "HR"
    ).length;


  const offers =
    applications.filter(
      (app) =>
        app.status === "OFFER"
    ).length;


  const tests =
    applications.filter(
      (app) =>
        app.status === "TEST"
    ).length;


  const rejected =
    applications.filter(
      (app) =>
        app.status ===
        "REJECTED"
    ).length;


  const activeApplications =
    applications.filter(
      (app) =>
        app.status !==
          "REJECTED" &&
        app.status !==
          "OFFER"
    ).length;


  const reachedInterview =
    applications.filter(
      (app) =>
        app.status ===
          "TECHNICAL" ||
        app.status ===
          "HR" ||
        app.status ===
          "OFFER"
    ).length;


  const interviewRate =
    applications.length > 0
      ? Math.round(
          (
            reachedInterview /
            applications.length
          ) * 100
        )
      : 0;


  const offerRate =
    reachedInterview > 0
      ? Math.round(
          (
            offers /
            reachedInterview
          ) * 100
        )
      : 0;


  // =========================================
  // SEARCH + FILTER
  // =========================================

  const filteredApplications =
    applications.filter((app) => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      const matchesSearch =
        app.company
          .toLowerCase()
          .includes(searchText) ||

        app.role
          .toLowerCase()
          .includes(searchText) ||

        (app.location || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        app.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });


  // =========================================
  // UPCOMING EVENTS
  // =========================================

  const upcomingEvents =
    applications
      .filter((app) => {
        if (
          !app.next_event_date
        ) {
          return false;
        }

        return (
          new Date(
            app.next_event_date
          ).getTime() >=
          Date.now()
        );
      })

      .sort(
        (a, b) =>
          new Date(
            a.next_event_date!
          ).getTime() -
          new Date(
            b.next_event_date!
          ).getTime()
      )

      .slice(0, 5);


  // =========================================
  // OFFER COMPARISON
  // =========================================

  const offerApplications =
    applications
      .filter(
        (app) =>
          app.status === "OFFER"
      )
      .sort(
        (a, b) =>
          Number(b.ctc || 0) -
          Number(a.ctc || 0)
      );


  const highestOffer =
    offerApplications.length > 0
      ? Math.max(
          ...offerApplications.map(
            (app) =>
              Number(app.ctc || 0)
          )
        )
      : 0;


  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 font-medium text-slate-600">
            Loading PlacementPro...
          </p>

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-blue-50 p-5 md:p-10">

      <div className="mx-auto max-w-7xl">


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-8 rounded-2xl border border-white bg-white/80 p-6 shadow-sm backdrop-blur">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <h1 className="text-4xl font-bold text-slate-900">

                Placement

                <span className="text-violet-600">
                  Pro
                </span>

              </h1>

              <p className="mt-2 text-slate-500">
                Smart Placement & Interview Tracker
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => {
                  if (showForm) {
                    handleCancel();
                  } else {
                    setShowForm(true);
                  }
                }}
                className="rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-700"
              >

                {showForm
                  ? "Close"
                  : "+ Add Application"}

              </button>


              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-white px-5 py-3 font-medium text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>

            </div>

          </div>

        </div>


        {/* =====================================
            APPLICATION FORM
        ===================================== */}

        {showForm && (

          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"
          >

            <h2 className="mb-6 text-xl font-semibold text-slate-900">

              {editingId !== null
                ? "Edit Application"
                : "Add Application"}

            </h2>


            <div className="grid gap-4 md:grid-cols-2">

              <input
                required
                placeholder="Company"
                value={form.company}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company:
                      e.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400"
              />


              <input
                required
                placeholder="Role"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role:
                      e.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400"
              />


              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location:
                      e.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400"
              />


              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="CTC (LPA)"
                value={form.ctc}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ctc:
                      e.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400"
              />


              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status:
                      e.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400"
              >

                {pipelineStatuses.map(
                  (status) => (

                    <option
                      key={status}
                      value={status}
                    >
                      {statusNames[status]}
                    </option>

                  )
                )}

              </select>


              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority:
                      e.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400"
              >

                <option value="HIGH">
                  High Priority
                </option>

                <option value="MEDIUM">
                  Medium Priority
                </option>

                <option value="LOW">
                  Low Priority
                </option>

              </select>


              <div>

                <label className="mb-1 block text-sm text-slate-600">
                  Applied Date
                </label>

                <input
                  required
                  type="date"
                  value={
                    form.applied_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      applied_date:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400"
                />

              </div>


              <div>

                <label className="mb-1 block text-sm text-slate-600">
                  Next Test / Interview
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.next_event_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      next_event_date:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400"
                />

              </div>


              <textarea
                rows={4}
                placeholder="Notes"
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes:
                      e.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-violet-400 md:col-span-2"
              />

            </div>


            <div className="mt-5 flex flex-wrap gap-3">

              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-700"
              >

                {editingId !== null
                  ? "Update Application"
                  : "Save Application"}

              </button>


              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-slate-200 px-6 py-3 text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

            </div>

          </form>

        )}


        {/* =====================================
            DASHBOARD CARDS
        ===================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <DashboardCard
            icon="📋"
            title="Total Applications"
            value={applications.length}
          />

          <DashboardCard
            icon="🎤"
            title="Interviews"
            value={interviews}
          />

          <DashboardCard
            icon="🎉"
            title="Offers"
            value={offers}
          />

          <DashboardCard
            icon="📝"
            title="Tests"
            value={tests}
          />

        </div>


        {/* =====================================
            ANALYTICS
        ===================================== */}

        <div className="mt-8">

          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Placement Analytics
          </h2>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <AnalyticsCard
              title="Interview Rate"
              value={`${interviewRate}%`}
            />

            <AnalyticsCard
              title="Interview → Offer"
              value={`${offerRate}%`}
            />

            <AnalyticsCard
              title="Active Applications"
              value={String(
                activeApplications
              )}
            />

            <AnalyticsCard
              title="Rejected"
              value={String(rejected)}
            />

          </div>

        </div>


        {/* =====================================
            PIPELINE + UPCOMING EVENTS
        ===================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">


          {/* PIPELINE */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              Placement Pipeline
            </h2>


            <div className="space-y-3">

              {pipelineStatuses.map(
                (status) => {

                  const count =
                    applications.filter(
                      (app) =>
                        app.status ===
                        status
                    ).length;

                  return (

                    <div
                      key={status}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                    >

                      <span className="text-slate-700">
                        {statusNames[status]}
                      </span>

                      <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                        {count}
                      </span>

                    </div>

                  );
                }
              )}

            </div>

          </div>


          {/* UPCOMING EVENTS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              Upcoming Events
            </h2>


            {upcomingEvents.length === 0 ? (

              <div className="py-10 text-center">

                <div className="text-4xl">
                  📅
                </div>

                <p className="mt-3 font-medium text-slate-700">
                  No upcoming events
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add a test or interview date.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {upcomingEvents.map(
                  (app) => (

                    <div
                      key={app.id}
                      className="rounded-xl border border-slate-100 p-4"
                    >

                      <p className="font-semibold text-slate-900">
                        {app.company}
                      </p>

                      <p className="text-sm text-slate-600">
                        {app.role}
                      </p>

                      <p className="mt-2 text-sm font-medium text-violet-700">

                        {new Date(
                          app.next_event_date!
                        ).toLocaleString()}

                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>


        {/* =====================================
            OFFER COMPARISON
        ===================================== */}

        <div className="mt-8 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-xl font-semibold text-slate-900">
                💼 Offer Comparison
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Compare your offers and identify your highest package.
              </p>

            </div>


            {offerApplications.length > 0 && (

              <div className="w-fit rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">

                {offerApplications.length}{" "}

                {offerApplications.length === 1
                  ? "Offer"
                  : "Offers"}

              </div>

            )}

          </div>


          {offerApplications.length === 0 ? (

            <div className="mt-6 rounded-2xl bg-slate-50 px-6 py-10 text-center">

              <div className="text-4xl">
                🤝
              </div>

              <p className="mt-3 font-semibold text-slate-700">
                No offers yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                When an application reaches Offer status,
                it will automatically appear here.
              </p>

            </div>

          ) : (

            <div className="mt-6 overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>

                  <tr className="border-b border-slate-200 text-left text-sm text-slate-500">

                    <th className="pb-3 font-medium">
                      Company
                    </th>

                    <th className="pb-3 font-medium">
                      Role
                    </th>

                    <th className="pb-3 font-medium">
                      Location
                    </th>

                    <th className="pb-3 font-medium">
                      CTC
                    </th>

                    <th className="pb-3 font-medium">
                      Result
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {offerApplications.map(
                    (app) => {

                      const ctc =
                        Number(
                          app.ctc || 0
                        );

                      const isHighest =
                        ctc > 0 &&
                        ctc ===
                          highestOffer;

                      return (

                        <tr
                          key={app.id}
                          className="border-b border-slate-100 last:border-0"
                        >

                          <td className="py-4 font-semibold text-slate-900">
                            {app.company}
                          </td>

                          <td className="py-4 text-slate-600">
                            {app.role}
                          </td>

                          <td className="py-4 text-slate-600">
                            {app.location ||
                              "Not specified"}
                          </td>

                          <td className="py-4 font-bold text-violet-700">

                            {app.ctc
                              ? `₹${app.ctc} LPA`
                              : "Not specified"}

                          </td>

                          <td className="py-4">

                            {isHighest ? (

                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                🏆 Highest Offer
                              </span>

                            ) : (

                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                Offer
                              </span>

                            )}

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =====================================
            APPLICATIONS
        ===================================== */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-xl font-semibold text-slate-900">
                Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track applications and prepare for each hiring process.
              </p>

            </div>


            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                placeholder="Search company, role..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-violet-400"
              />


              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-violet-400"
              >

                <option value="ALL">
                  All Status
                </option>

                {pipelineStatuses.map(
                  (status) => (

                    <option
                      key={status}
                      value={status}
                    >
                      {statusNames[status]}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          {filteredApplications.length === 0 ? (

            <div className="py-12 text-center">

              <div className="text-5xl">
                🎯
              </div>

              <p className="mt-4 text-lg font-medium text-slate-700">
                No applications found
              </p>

              <p className="mt-1 text-slate-500">
                Add your first application.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {filteredApplications.map(
                (app) => {

                  const applicationTasks =
                    getApplicationTasks(
                      app.id
                    );

                  const completedTasks =
                    applicationTasks.filter(
                      (task) =>
                        task.completed
                    ).length;

                  const readiness =
                    getReadiness(
                      app.id
                    );

                  const isPreparationOpen =
                    openPreparation[
                      app.id
                    ] ?? false;


                  return (

                    <div
                      key={app.id}
                      className="rounded-2xl border border-slate-100 p-5 transition hover:border-violet-200 hover:shadow-sm"
                    >


                      {/* APPLICATION INFO */}

                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        <div>

                          <h3 className="text-xl font-semibold text-slate-900">
                            {app.company}
                          </h3>

                          <p className="mt-1 text-slate-600">
                            {app.role}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">

                            {app.location ||
                              "Location not specified"}

                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            Applied:{" "}
                            {app.applied_date}
                          </p>

                        </div>


                        <div className="md:text-right">

                          <p className="font-semibold text-slate-900">

                            {app.ctc
                              ? `₹${app.ctc} LPA`
                              : "CTC not specified"}

                          </p>

                          <span className="mt-2 inline-block rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">

                            {statusNames[
                              app.status
                            ]}

                          </span>

                          <p className="mt-2 text-sm text-slate-500">
                            Priority:{" "}
                            {app.priority}
                          </p>

                        </div>

                      </div>


                      {/* NEXT EVENT */}

                      {app.next_event_date && (

                        <div className="mt-4 rounded-xl bg-blue-50 p-3">

                          <p className="text-sm font-medium text-blue-700">
                            📅 Next Event
                          </p>

                          <p className="mt-1 text-sm text-slate-600">

                            {new Date(
                              app.next_event_date
                            ).toLocaleString()}

                          </p>

                        </div>

                      )}


                      {/* NOTES */}

                      {app.notes && (

                        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                          {app.notes}
                        </p>

                      )}


                      {/* READINESS */}

                      <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">

                        <div className="flex items-center justify-between gap-4">

                          <div>

                            <p className="font-semibold text-slate-800">
                              Interview Readiness
                            </p>

                            <p className="mt-1 text-xs text-slate-500">

                              {applicationTasks.length === 0
                                ? "Add preparation topics to calculate readiness."
                                : `${completedTasks} of ${applicationTasks.length} topics completed`}

                            </p>

                          </div>


                          <p className="text-2xl font-bold text-violet-700">
                            {readiness}%
                          </p>

                        </div>


                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">

                          <div
                            className="h-full rounded-full bg-violet-600 transition-all duration-300"
                            style={{
                              width:
                                `${readiness}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* ACTION BUTTONS */}

                      <div className="mt-4 flex flex-wrap gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            setOpenPreparation(
                              (previous) => ({
                                ...previous,

                                [app.id]:
                                  !isPreparationOpen,
                              })
                            )
                          }
                          className="rounded-xl bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-200"
                        >

                          {isPreparationOpen
                            ? "Hide Preparation"
                            : "📚 Preparation"}

                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(app)
                          }
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              app.id
                            )
                          }
                          className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>

                      </div>


                      {/* =================================
                          PREPARATION TRACKER
                      ================================= */}

                      {isPreparationOpen && (

                        <div className="mt-5 rounded-2xl border border-violet-100 bg-white p-5">

                          <div>

                            <h4 className="font-semibold text-slate-900">
                              📚 Interview Preparation
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                              Add topics you need to prepare for {app.company}.
                            </p>

                          </div>


                          {/* ADD TOPIC */}

                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                            <input
                              value={
                                newTopics[
                                  app.id
                                ] || ""
                              }
                              onChange={(e) =>
                                setNewTopics(
                                  (previous) => ({
                                    ...previous,

                                    [app.id]:
                                      e.target.value,
                                  })
                                )
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key ===
                                  "Enter"
                                ) {
                                  e.preventDefault();

                                  handleAddTask(
                                    app.id
                                  );
                                }
                              }}
                              placeholder="Example: Python, SQL, DBMS..."
                              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-violet-400"
                            />


                            <button
                              type="button"
                              onClick={() =>
                                handleAddTask(
                                  app.id
                                )
                              }
                              className="rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-700"
                            >
                              + Add Topic
                            </button>

                          </div>


                          {/* TASK LIST */}

                          {applicationTasks.length ===
                          0 ? (

                            <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">

                              <p className="text-sm text-slate-500">
                                No preparation topics yet.
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Try adding Python, SQL, OOP or DBMS.
                              </p>

                            </div>

                          ) : (

                            <div className="mt-5 space-y-2">

                              {applicationTasks.map(
                                (task) => (

                                  <div
                                    key={task.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                                  >

                                    <label className="flex cursor-pointer items-center gap-3">

                                      <input
                                        type="checkbox"
                                        checked={
                                          task.completed
                                        }
                                        onChange={() =>
                                          handleToggleTask(
                                            task
                                          )
                                        }
                                        className="h-5 w-5 accent-violet-600"
                                      />


                                      <span
                                        className={
                                          task.completed
                                            ? "text-slate-400 line-through"
                                            : "font-medium text-slate-700"
                                        }
                                      >
                                        {task.topic}
                                      </span>

                                    </label>


                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteTask(
                                          task.id
                                        )
                                      }
                                      className="rounded-lg px-3 py-1 text-sm font-medium text-red-500 transition hover:bg-red-50"
                                    >
                                      Delete
                                    </button>

                                  </div>

                                )
                              )}

                            </div>

                          )}

                        </div>

                      )}

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}


// =========================================
// DASHBOARD CARD
// =========================================

function DashboardCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (

    <div className="rounded-2xl border border-white bg-white p-6 shadow-sm">

      <div className="text-2xl">
        {icon}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>

  );
}


// =========================================
// ANALYTICS CARD
// =========================================

function AnalyticsCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (

    <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-violet-700">
        {value}
      </p>

    </div>

  );
}