import React, { useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaStar, FaCalendar, FaFolderOpen, FaTimes, FaCheck, FaHome, FaBook, FaCalendarAlt, FaCommentAlt, FaUsers, FaCog, FaArrowLeft, FaComments } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  useGetNotesQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from "@/app/notesApi";
import Footer from "@/components/Footer";

const sidebarLinks = [
  { icon: <FaHome />, label: 'Dashboard', to: '/easebrain/dashboard' },
  { icon: <FaBook />, label: 'Notes', to: '/easebrain/notes' },
  { icon: <FaCalendarAlt />, label: 'Reminders', to: '/easebrain/reminders' },
  { icon: <FaCommentAlt />, label: 'Messages', to: '/easebrain/messages' },
  { icon: <FaUsers />, label: 'Community', to: '/easebrain/community' },
  { icon: <FaCog />, label: 'Settings', to: '/easebrain/settings' },

];

export default function Notes() {
  const { data: notesRaw, refetch, isLoading, isError, _error } = useGetNotesQuery();
  const notes = Array.isArray(notesRaw) ? notesRaw : (notesRaw?.length ? notesRaw : []);
  const [addNote, { isLoading: isAdding }] = useAddNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [deleteNote, { isLoading: _isDeleting }] = useDeleteNoteMutation();

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    note: "",
    category: "personal",
    caregiver_id: "",
    user_id: ""
  });

  const categories = [
    { id: "personal", label: "Personal", color: "bg-blue-100 text-blue-700" },
    { id: "health", label: "Health", color: "bg-red-100 text-red-700" },
    { id: "goals", label: "Goals", color: "bg-green-100 text-green-700" },
    { id: "therapy", label: "Therapy", color: "bg-purple-100 text-purple-700" },
    { id: "family", label: "Family", color: "bg-pink-100 text-pink-700" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOpenModal = (noteToEdit = null) => {
    if (noteToEdit) {
      setEditId(noteToEdit.id);
      setForm({
        title: noteToEdit.title || "",
        note: noteToEdit.note || "",
        category: noteToEdit.category || "personal",
        caregiver_id: noteToEdit.caregiver_id || "",
        user_id: noteToEdit.user_id || ""
      });
    } else {
      setEditId(null);
      setForm({ title: "", note: "", category: "personal", caregiver_id: "", user_id: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ title: "", note: "", category: "personal", caregiver_id: "", user_id: "" });
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.note.trim()) {
      setFeedback("Title and note content are required");
      setFeedbackType("error");
      setTimeout(() => setFeedback(""), 3000);
      return;
    }

    try {
      if (editId) {
        await updateNote({ id: editId, ...form }).unwrap();
        setFeedback("Note updated successfully! ✓");
      } else {
        await addNote(form).unwrap();
        setFeedback("Note created successfully! ✓");
      }
      setFeedbackType("success");
      handleCloseModal();
      refetch();
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback(editId ? "Failed to update note" : "Failed to create note");
      setFeedbackType("error");
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(id).unwrap();
        setFeedback("Note deleted successfully ✓");
        setFeedbackType("success");
        refetch();
        setTimeout(() => setFeedback(""), 3000);
      } catch {
        setFeedback("Failed to delete note");
        setFeedbackType("error");
        setTimeout(() => setFeedback(""), 3000);
      }
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.note?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } bg-teal-900 dark:bg-slate-950 text-white transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-teal-700 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {!collapsed && <span className="text-2xl font-extrabold dark:text-teal-300">Ease Brain</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white p-1 rounded hover:bg-teal-700 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map(link => {
            const isActiveBase = location.pathname.startsWith(link.to);
            const isExact = location.pathname === link.to;
            return (
              <li
                key={link.label}
                className={`px-6 py-3 flex items-center gap-3 text-lg font-medium cursor-pointer transition-colors duration-150 rounded-lg ${isActiveBase ? 'bg-teal-800 dark:bg-teal-700 text-yellow-300' : 'hover:bg-teal-700 dark:hover:bg-slate-800'}`}
                title={collapsed ? link.label : ""}
              >
                <Link to={link.to} className="flex items-center gap-3 w-full">
                  <span className="inline-block w-6 text-center text-xl flex-shrink-0">
                    {link.icon}
                  </span>
                  {!collapsed && link.label}
                </Link>
                {!collapsed && isActiveBase && !isExact && (
                  <button
                    className="ml-2 text-white p-1 rounded hover:bg-teal-700 dark:hover:bg-slate-800"
                    onClick={() => navigate(link.to)}
                    aria-label={`Back to ${link.label}`}
                    title={`Back to ${link.label}`}
                  >
                    <FaArrowLeft />
                  </button>
                )}
              </li>
            );
          })}
        </nav>
        <div className={`px-6 py-4 text-xs text-gray-300 dark:text-gray-500 ${collapsed ? 'hidden' : ''}`}>© 2025 Ease Brain. All rights reserved.</div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl font-bold text-teal-900">Notes</h1>
                </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <FaPlus /> New Note
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded transition ${viewMode === "grid" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  ⊞ Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded transition ${viewMode === "list" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  ☰ List
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === "all"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Notes
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    selectedCategory === cat.id
                      ? `${cat.color} ring-2 ring-offset-2 ring-teal-600`
                      : `${cat.color} hover:opacity-80`
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 flex-1 overflow-y-auto">

      {/* Feedback Messages */}
      {feedback && (
        <div className={`fixed top-40 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
          feedbackType === "success"
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-800 border border-red-300"
        }`}>
          {feedbackType === "success" ? <FaCheck /> : "⚠"}
          {feedback}
        </div>
      )}

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-3 border-teal-400 border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your notes...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
            <p className="font-semibold mb-2">Failed to load notes</p>
            <p className="text-sm">Unknown error</p>
          </div>
        )}

        {/* Notes Grid/List */}
        {!isLoading && !isError && (
          <>
            {filteredNotes.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes.map(note => {
                    const cat = categories.find(c => c.id === note.category);
                    return (
                      <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                        {/* Category Badge */}
                        <div className={`${cat?.color} px-4 py-2 text-sm font-semibold`}>
                          {cat?.label || "Uncategorized"}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">{note.title || note.note?.split('\n')[0]}</h3>
                          <p className="text-gray-700 text-sm mb-4 line-clamp-4 flex-1">{note.note}</p>

                          {/* Metadata */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <FaCalendar className="w-3 h-3" />
                              {new Date().toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-200 px-6 py-3 flex gap-3 justify-end">
                          <button
                            onClick={() => handleOpenModal(note)}
                            className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 transition"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotes.map(note => {
                    const cat = categories.find(c => c.id === note.category);
                    return (
                      <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cat?.color}`}>
                              {cat?.label || "Uncategorized"}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <FaCalendar className="w-3 h-3" />
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{note.title || note.note?.split('\n')[0]}</h3>
                          <p className="text-gray-700 text-sm line-clamp-2">{note.note}</p>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleOpenModal(note)}
                            className="text-teal-600 hover:text-teal-700 font-semibold p-2 hover:bg-teal-50 rounded transition"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="text-red-600 hover:text-red-700 font-semibold p-2 hover:bg-red-50 rounded transition"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No notes found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? "Try adjusting your search" : "Create your first note to get started"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <FaPlus /> Create a Note
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Create/Edit Note */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-50 to-green-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0">
              <h2 className="text-2xl font-bold text-teal-900">
                {editId ? "Edit Note" : "Create New Note"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveNote} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Note title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  disabled={isAdding || isUpdating}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  disabled={isAdding || isUpdating}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Note Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note Content <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Write your note here..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
                  disabled={isAdding || isUpdating}
                />
              </div>

              {/* Optional: IDs (for backend compatibility) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caregiver ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="caregiver_id"
                    value={form.caregiver_id}
                    onChange={handleChange}
                    placeholder="Caregiver ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    disabled={isAdding || isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    User ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    placeholder="User ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    disabled={isAdding || isUpdating}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  disabled={isAdding || isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isAdding || isUpdating}
                >
                  {isAdding || isUpdating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      {editId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <FaCheck /> {editId ? "Update Note" : "Create Note"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
