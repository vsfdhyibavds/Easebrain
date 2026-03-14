import React, { useEffect, useState, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FaPlus, FaBell, FaRegCommentDots, FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "@/features/auth/AuthContext";
import { authFetch } from "@/lib/api";
import { BASE_URL } from "../config/apiConfig";
import AdminLayout from "@/Layout/AdminLayout";
import CaregiverDashboard from "@/pages/CaregiverDashboard";

const defaultAvatar = "https://via.placeholder.com/150?text=Avatar";

/**
 * @typedef {Object} Dependent
 * @property {number} id
 * @property {string} name
 * @property {number} [age]
 * @property {string} [mood]
 */

/**
 * @typedef {Object} Mood
 * @property {number} id
 * @property {number} dependent_id
 * @property {string} mood
 * @property {string} created_at
 */

/**
 * @typedef {Object} Note
 * @property {number} id
 * @property {string} content
 * @property {string} created_at
 * @property {number} dependent_id
 */

function CaregiverDetailsView() {
  const auth = useAuth();
  const accessToken = auth ? auth.accessToken : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dependents, setDependents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [moods, setMoods] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteTxt, setNoteTxt] = useState("");
  const [sending, setSending] = useState(false);
  const [alerting, setAlerting] = useState(false);

  // Load dependents
  useEffect(() => {
    let mounted = true;
    async function loadDependents() {
      setLoading(true);
      try {
        const res = await authFetch(`${BASE_URL}/caregiver/dependents`);
        if (!res.ok) throw new Error("Could not load dependents");

        const data = await res.json();
        if (mounted) {
          setDependents(data || []);
          if (data.length > 0) setSelected(data[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDependents();
    return () => (mounted = false);
  }, [accessToken]);

  // Load moods + notes when selected dependent changes
  useEffect(() => {
    if (!selected) return;
    let mounted = true;

    async function loadDetails() {
      try {
        const [mRes, nRes] = await Promise.all([
          authFetch(`${BASE_URL}/dependents/${selected.id}/moods`),
          authFetch(`${BASE_URL}/dependents/${selected.id}/notes`)
        ]);

        if (!mRes.ok || !nRes.ok) throw new Error("Failed to load details");

        const moodsData = await mRes.json();
        const notesData = await nRes.json();

        if (mounted) {
          setMoods(moodsData || []);
          setNotes(notesData || []);
        }
      } catch (err) {
        setError(err.message);
      }
    }
    loadDetails();
    return () => (mounted = false);
  }, [selected]);

  // Mood summary
  const moodSummary = useMemo(() => {
    if (moods.length === 0) return { avg: null, counts: {} };
    const avg =
      (moods.reduce((sum, m) => sum + (m.level || 0), 0) / moods.length).toFixed(2);
    return { avg };
  }, [moods]);

  // Add note
  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteTxt || !selected) return;

    setSending(true);
    try {
      const payload = { content: noteTxt.trim(), author_type: "caregiver" };

      const res = await authFetch(
        `${BASE_URL}/dependents/${selected.id}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error("Failed to add note");

      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      setNoteTxt("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  // Send Emergency Alert
  async function handleSendAlert() {
    if (!selected) return;

    setAlerting(true);
    try {
      const res = await authFetch(`${BASE_URL}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dependent_id: selected.id,
          type: "emergency",
          message: "Caregiver triggered emergency"
        })
      });

      if (!res.ok) throw new Error("Failed to send alert");

      alert(`Emergency alert sent for ${selected.name}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAlerting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex justify-center items-center text-teal-700">
          Loading dependents...
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      {/* Dependent Details View */}
      <div className="py-4">
        <div className="flex flex-col md:flex-row gap-6">

          {/* LEFT: Dependents list */}
          <aside className="w-full md:w-1/4 bg-white/40 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-teal-700 font-semibold">Your Dependents</h3>
              <button
                className="text-xs bg-teal-100 px-2 py-1 rounded"
                onClick={() => {
                  const name = prompt("Dependent name:");
                  if (!name) return;
                  const temp = { id: Date.now(), name, avatar: defaultAvatar };
                  setDependents((p) => [temp, ...p]);
                  setSelected(temp);
                }}
              >
                <FaPlus /> Add
              </button>
            </div>

            <ul className="space-y-3">
              {dependents.map((d) => (
                <li
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={`p-2 rounded-lg cursor-pointer flex gap-3 items-center hover:bg-teal-50 ${
                    selected?.id === d.id ? "bg-teal-50 ring-2 ring-teal-200" : ""
                  }`}
                >
                  <img
                    src={d.avatar || defaultAvatar}
                    className="w-12 h-12 rounded-full"
                    alt=""
                  />
                  <div>
                    <div className="font-medium text-sm">{d.name}</div>
                    <div className="text-xs text-gray-600">{d.relation || ""}</div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* RIGHT: Dependent Details */}
          <section className="w-full md:w-3/4 bg-white/40 p-4 rounded-xl">
            {!selected ? (
              <div className="text-center py-20 text-gray-600">
                Select a dependent to view details
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex justify-between mb-4">
                  <div className="flex gap-4 items-center">
                    <img
                      src={selected.avatar || defaultAvatar}
                      className="w-16 h-16 rounded-full"
                      alt=""
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-teal-700">
                        {selected.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {selected.relation || "No relation set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSendAlert}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      <FaBell /> {alerting ? "Sending..." : "Emergency"}
                    </button>
                    <button className="bg-teal-600 text-white px-4 py-2 rounded-lg">
                      <FaCalendarAlt /> Schedule
                    </button>
                    <button className="bg-white/20 border px-3 py-2 rounded-lg">
                      <FaRegCommentDots /> Message
                    </button>
                  </div>
                </div>

                {/* Mood Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="col-span-2 bg-white/40 p-4 rounded-xl">
                    <div className="flex justify-between mb-3">
                      <h4 className="text-teal-700 font-semibold">Mood Timeline</h4>
                      <span>Avg: {moodSummary.avg}</span>
                    </div>
                    <div className="flex items-end gap-2 h-32">
                      {moods.length ? (
                        moods.slice(0, 12).map((m, idx) => {
                          const height = (m.level / 10) * 100;
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div
                                className={`rounded w-full ${
                                  m.level >= 7
                                    ? "bg-teal-600"
                                    : m.level >= 4
                                    ? "bg-amber-400"
                                    : "bg-red-400"
                                }`}
                                style={{ height: `${height}%` }}
                              ></div>
                              <span className="text-xs mt-1 text-gray-600">
                                {new Date(m.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p>No data</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/40 p-4 rounded-xl">
                    <h4 className="text-teal-700 font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-gray-700">Moods: {moods.length}</p>
                    <p className="text-sm text-gray-700">
                      Last:{" "}
                      {moods[0]
                        ? new Date(moods[0].timestamp).toLocaleString()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 mt-3">Notes: {notes.length}</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white/40 p-4 rounded-xl">
                  <h4 className="text-teal-700 font-semibold mb-3">Notes</h4>

                  <form onSubmit={handleAddNote}>
                    <textarea
                      rows={3}
                      value={noteTxt}
                      onChange={(e) => setNoteTxt(e.target.value)}
                      className="w-full p-3 rounded-lg border mb-2"
                      placeholder="Write a note..."
                    ></textarea>

                    <button
                      type="submit"
                      disabled={sending}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg"
                    >
                      {sending ? "Saving..." : "Add Note"}
                    </button>
                  </form>

                  <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
                    {notes.map((n, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/50 rounded-lg border"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">
                            {n.author_type === "caregiver" ? "You" : n.author_type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(n.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {error && <div className="text-red-600 mt-4">{error}</div>}
      </div>
    </>
  );
}

export default function CaregiverLayout() {
  const location = useLocation();
  const isIndex = location.pathname === "/caregiver";

  console.log("🔶 CaregiverLayout rendered, isIndex:", isIndex, "pathname:", location.pathname);

  return (
    <AdminLayout>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {isIndex ? (
          <>
            <div>🟢 About to render CaregiverDashboard</div>
            <CaregiverDashboard />
          </>
        ) : (
          <CaregiverDetailsView />
        )}
      </main>
    </AdminLayout>
  );
}
