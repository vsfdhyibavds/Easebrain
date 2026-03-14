import React, { useState, useEffect } from "react";
import { Plus, Share2, Shield, Users, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

export default function SafetyPlans() {
  const _user = useAuth().user;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/safety-plans/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data.safety_plans);
      }
    } catch {
      setError("Failed to load safety plans");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-red-600" />
            <h1 className="text-4xl font-bold text-red-900">Safety Plans</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create personalized safety plans to manage crisis situations and share them with trusted caregivers
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Create Plan Button */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mx-auto block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full flex items-center gap-2 transition shadow-lg mb-8"
          >
            <Plus className="w-5 h-5" />
            Create Safety Plan
          </button>
        )}

        {/* Create Plan Form */}
        {showCreateForm && (
          <CreatePlanForm
            onSuccess={() => {
              setShowCreateForm(false);
              fetchPlans();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Safety Plans List */}
        {plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">
              You haven't created a safety plan yet
            </p>
            <p className="text-gray-500 mb-6">
              A safety plan helps you prepare for crisis situations and gives your caregivers important information
            </p>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Create Your First Safety Plan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <SafetyPlanCard
                key={plan.id}
                plan={plan}
                expanded={expandedPlan === plan.id}
                onToggle={() =>
                  setExpandedPlan(
                    expandedPlan === plan.id ? null : plan.id
                  )
                }
                onRefresh={fetchPlans}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Safety Plan Card Component
function SafetyPlanCard({ plan, expanded, onToggle, onRefresh }) {
  const [fullPlan, setFullPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [caregivers, setCaregivers] = useState([]);

  useEffect(() => {
    if (expanded && !fullPlan) {
      fetchFullPlan();
    }
  }, [expanded]);

  const fetchFullPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/safety-plans/${plan.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFullPlan(data);
      }
    } catch (err) {
      console.error("Failed to fetch full plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaregivers = async () => {
    try {
      const response = await fetch("/api/caregivers/connections", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCaregivers(data.caregivers);
      }
    } catch (err) {
      console.error("Failed to fetch caregivers:", err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition">
        <button
          onClick={onToggle}
          className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-start gap-4 flex-1">
            <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.title}
              </h3>
              {plan.description && (
                <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Last updated: {new Date(plan.last_updated).toLocaleDateString()}</span>
                {plan.shared_with_caregivers && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <Users className="w-4 h-4" />
                    Shared with {plan.caregiver_count} caregiver(s)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
                fetchCaregivers();
              }}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
              title="Share safety plan"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {expanded ? (
              <ChevronUp className="w-6 h-6 text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            {loading ? (
              <LoadingSpinner />
            ) : fullPlan ? (
              <SafetyPlanContent plan={fullPlan} />
            ) : null}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SharePlanModal
          planId={plan.id}
          caregivers={caregivers}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            setShowShareModal(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

// Safety Plan Content Component
function SafetyPlanContent({ plan }) {
  return (
    <div className="space-y-8">
      {plan.description && (
        <section>
          <h4 className="font-bold text-gray-900 mb-3">Overview</h4>
          <p className="text-gray-700">{plan.description}</p>
        </section>
      )}

      {plan.warning_signs && plan.warning_signs.length > 0 && (
        <section>
          <h4 className="font-bold text-gray-900 mb-3">Warning Signs</h4>
          <div className="space-y-2">
            {plan.warning_signs.map((sign, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                {sign}
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.internal_coping && plan.internal_coping.length > 0 && (
        <section>
          <h4 className="font-bold text-gray-900 mb-3">Internal Coping Strategies</h4>
          <div className="space-y-2">
            {plan.internal_coping.map((strategy, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                {strategy}
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.people_to_talk_to && plan.people_to_talk_to.length > 0 && (
        <section>
          <h4 className="font-bold text-gray-900 mb-3">People to Talk To</h4>
          <div className="space-y-2">
            {plan.people_to_talk_to.map((person, i) => (
              <div key={i} className="text-gray-700 bg-white p-3 rounded-lg">
                {person}
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.professional_contacts && plan.professional_contacts.length > 0 && (
        <section>
          <h4 className="font-bold text-gray-900 mb-3">Professional Contacts</h4>
          <div className="space-y-2">
            {plan.professional_contacts.map((contact, i) => (
              <div key={i} className="text-gray-700 bg-white p-3 rounded-lg">
                {contact}
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.crisis_hotlines && plan.crisis_hotlines.length > 0 && (
        <section className="bg-red-100 p-4 rounded-lg border-2 border-red-300">
          <h4 className="font-bold text-red-900 mb-3">Crisis Hotlines</h4>
          <div className="space-y-2">
            {plan.crisis_hotlines.map((hotline, i) => (
              <div key={i} className="text-red-900 font-semibold">
                {hotline}
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.means_restriction && (
        <section>
          <h4 className="font-bold text-gray-900 mb-3">Means Restriction</h4>
          <p className="text-gray-700">{plan.means_restriction}</p>
        </section>
      )}

      {plan.after_crisis_plan && (
        <section>
          <h4 className="font-bold text-gray-900 mb-3">After-Crisis Plan</h4>
          <p className="text-gray-700">{plan.after_crisis_plan}</p>
        </section>
      )}
    </div>
  );
}

// Share Plan Modal
function SharePlanModal({ planId, caregivers, onClose, onSuccess }) {
  const [selectedCaregivers, setSelectedCaregivers] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleToggleCaregiver = (caregiverId) => {
    setSelectedCaregivers((prev) =>
      prev.includes(caregiverId)
        ? prev.filter((id) => id !== caregiverId)
        : [...prev, caregiverId]
    );
  };

  const handleShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/safety-plans/${planId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          caregiver_ids: selectedCaregivers,
          can_edit: canEdit,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share safety plan");
      }

      alert("Safety plan shared successfully!");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Share Safety Plan
        </h2>

        {error && <ErrorMessage message={error} />}

        <p className="text-gray-600 mb-4">
          Select which caregivers should have access to this safety plan
        </p>

        {caregivers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              You haven't added any caregivers yet.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Add caregivers in your caregiver connections
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {caregivers.map((caregiver) => (
                <label
                  key={caregiver.id}
                  className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCaregivers.includes(caregiver.id)}
                    onChange={() => handleToggleCaregiver(caregiver.id)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {caregiver.caregiver_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {caregiver.relationship}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <label className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={canEdit}
                onChange={(e) => setCanEdit(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-gray-700">
                Allow caregivers to suggest edits
              </span>
            </label>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading || selectedCaregivers.length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Safety Plan Form
function CreatePlanForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "My Safety Plan",
    description: "",
    warning_signs: [""],
    internal_coping: [""],
    people_to_talk_to: [""],
    professional_contacts: [""],
    crisis_hotlines: [""],
    means_restriction: "",
    after_crisis_plan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [selectedCaregivers, setSelectedCaregivers] = useState([]);
  const [loadingCaregivers, setLoadingCaregivers] = useState(true);
  const [shareOnCreate, setShareOnCreate] = useState(false);
  const [canEditAccess, setCanEditAccess] = useState(false);

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      setLoadingCaregivers(true);
      const response = await fetch("/api/caregivers/connections", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCaregivers(data.caregivers || []);
      }
    } catch (err) {
      console.error("Failed to fetch caregivers:", err);
    } finally {
      setLoadingCaregivers(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const handleAddArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const handleToggleCaregiver = (caregiverId) => {
    setSelectedCaregivers((prev) =>
      prev.includes(caregiverId)
        ? prev.filter((id) => id !== caregiverId)
        : [...prev, caregiverId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty strings
      const cleanData = {
        ...formData,
        warning_signs: formData.warning_signs.filter((s) => s.trim()),
        internal_coping: formData.internal_coping.filter((s) => s.trim()),
        people_to_talk_to: formData.people_to_talk_to.filter((s) => s.trim()),
        professional_contacts: formData.professional_contacts.filter((s) => s.trim()),
        crisis_hotlines: formData.crisis_hotlines.filter((s) => s.trim()),
      };

      const response = await fetch("/api/safety-plans/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error("Failed to create safety plan");
      }

      const createdPlan = await response.json();
      const planId = createdPlan.safety_plan?.id || createdPlan.id;

      // If caregivers selected, share the plan
      if (shareOnCreate && selectedCaregivers.length > 0 && planId) {
        const shareResponse = await fetch(`/api/safety-plans/${planId}/share`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            caregiver_ids: selectedCaregivers,
            can_edit: canEditAccess,
          }),
        });

        if (!shareResponse.ok) {
          console.warn("Failed to share plan with caregivers, but plan was created");
        }
      }

      alert("Safety plan created successfully!" + (shareOnCreate && selectedCaregivers.length > 0 ? " Shared with caregivers." : ""));
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Safety Plan</h2>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Plan Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Overview of your safety plan..."
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <ArrayField
          label="Warning Signs"
          value={formData.warning_signs}
          onChange={(index, val) => handleArrayChange("warning_signs", index, val)}
          onAdd={() => handleAddArrayItem("warning_signs")}
          onRemove={(index) => handleRemoveArrayItem("warning_signs", index)}
          placeholder="e.g., increased anxiety, withdrawal, difficulty sleeping"
        />

        <ArrayField
          label="Internal Coping Strategies"
          value={formData.internal_coping}
          onChange={(index, val) => handleArrayChange("internal_coping", index, val)}
          onAdd={() => handleAddArrayItem("internal_coping")}
          onRemove={(index) => handleRemoveArrayItem("internal_coping", index)}
          placeholder="e.g., deep breathing, journaling, meditation"
        />

        <ArrayField
          label="People to Talk To"
          value={formData.people_to_talk_to}
          onChange={(index, val) => handleArrayChange("people_to_talk_to", index, val)}
          onAdd={() => handleAddArrayItem("people_to_talk_to")}
          onRemove={(index) => handleRemoveArrayItem("people_to_talk_to", index)}
          placeholder="e.g., Friend's name, Family member"
        />

        <ArrayField
          label="Professional Contacts"
          value={formData.professional_contacts}
          onChange={(index, val) => handleArrayChange("professional_contacts", index, val)}
          onAdd={() => handleAddArrayItem("professional_contacts")}
          onRemove={(index) => handleRemoveArrayItem("professional_contacts", index)}
          placeholder="e.g., Dr. Smith (555-1234), Therapist"
        />

        <ArrayField
          label="Crisis Hotlines"
          value={formData.crisis_hotlines}
          onChange={(index, val) => handleArrayChange("crisis_hotlines", index, val)}
          onAdd={() => handleAddArrayItem("crisis_hotlines")}
          onRemove={(index) => handleRemoveArrayItem("crisis_hotlines", index)}
          placeholder="e.g., National Suicide Prevention Lifeline: 988"
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Means Restriction
          </label>
          <textarea
            name="means_restriction"
            value={formData.means_restriction}
            onChange={handleChange}
            placeholder="How to reduce access to means of harm..."
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            After-Crisis Plan
          </label>
          <textarea
            name="after_crisis_plan"
            value={formData.after_crisis_plan}
            onChange={handleChange}
            placeholder="Steps to take after a crisis..."
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        {/* Share with Caregivers Section */}
        <div className="border-t-2 border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            Share with Caregivers (Optional)
          </h3>

          {!loadingCaregivers ? (
            caregivers.length > 0 ? (
              <>
                <div className="mb-4">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareOnCreate}
                      onChange={(e) => setShareOnCreate(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-700 font-semibold">
                      Share this safety plan with caregivers now
                    </span>
                  </label>
                </div>

                {shareOnCreate && (
                  <>
                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto p-4 border-2 border-gray-200 rounded-lg">
                      {caregivers.map((caregiver) => (
                        <label
                          key={caregiver.id}
                          className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-red-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCaregivers.includes(caregiver.id)}
                            onChange={() => handleToggleCaregiver(caregiver.id)}
                            className="w-4 h-4 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {caregiver.caregiver_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {caregiver.relationship}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canEditAccess}
                        onChange={(e) => setCanEditAccess(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-gray-700">
                        Allow caregivers to suggest edits
                      </span>
                    </label>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  You haven't added any caregivers yet.
                </p>
                <p className="text-sm text-gray-500">
                  Add caregivers in your caregiver connections to share this plan
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-4 text-gray-500">Loading caregivers...</div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Safety Plan"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Array Field Component
function ArrayField({
  label,
  value,
  onChange,
  onAdd,
  onRemove,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
            />
            {value.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 text-red-600 hover:text-red-700 font-semibold text-sm"
      >
        + Add more
      </button>
    </div>
  );
}
