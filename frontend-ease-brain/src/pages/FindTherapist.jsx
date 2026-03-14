import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserMd,
  FaMapMarkerAlt,
  FaVideo,
  FaCalendarCheck,
  FaStar,
  FaFilter,
  FaChevronRight,
  FaGlobe,
  FaClock,
} from "react-icons/fa";
import logo from "../assets/logo.jpg";
import Footer from "../components/Footer";
import { useGetTherapistsQuery } from "../app/therapistsApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function FindTherapist() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const specialties = [
    "Anxiety",
    "Depression",
    "Trauma",
    "Relationship",
    "Stress",
    "PTSD",
    "OCD",
    "Addiction",
    "LGBTQ+",
    "Child Therapy",
  ];

  const {
    data: therapists = [],
    isLoading,
    error,
    refetch,
  } = useGetTherapistsQuery({
    specialization: searchQuery || undefined,
    location: locationQuery || undefined,
  });

  /* -------------------- Helpers -------------------- */

  const isOnlineSession = (therapist) =>
    therapist?.online === true ||
    therapist?.mode === "online" ||
    therapist?.session_type === "virtual";

  const renderStars = (rating = 0) => {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={i < rounded ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  /* -------------------- Filtering -------------------- */

  const filteredTherapists = useMemo(() => {
    return therapists.filter((therapist) => {
      const therapistSpecialties =
        therapist.specialization
          ?.split(",")
          .map((s) => s.trim().toLowerCase()) || [];

      if (
        selectedSpecialties.length &&
        !selectedSpecialties.some((s) =>
          therapistSpecialties.includes(s.toLowerCase())
        )
      )
        return false;

      if (availabilityFilter === "online" && !isOnlineSession(therapist))
        return false;

      if (availabilityFilter === "in-person" && isOnlineSession(therapist))
        return false;

      return true;
    });
  }, [therapists, selectedSpecialties, availabilityFilter]);

  /* -------------------- Actions -------------------- */

  const handleSpecialtyToggle = (specialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleClearFilters = () => {
    setSelectedSpecialties([]);
    setAvailabilityFilter("all");
  };

  const handleSearch = () => {
    refetch();
  };

  const handleBookSession = (therapist) => {
    navigate(`/therapists/${therapist.id}`);
  };

  /* -------------------- States -------------------- */

  if (isLoading) return <LoadingSpinner />;

  if (error)
    return <ErrorMessage message="Failed to load therapists." />;

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="EaseBrain"
                className="w-14 h-14 rounded-full cursor-pointer"
                onClick={() => navigate("/")}
              />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Find Your Therapist
                </h1>
                <p className="text-teal-100">
                  Certified mental health professionals
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden md:flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full"
            >
              <FaFilter /> Filters
            </button>
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 bg-white/10 p-2 rounded-2xl">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-4 text-teal-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by specialty or name"
                className="w-full pl-12 py-3 rounded-xl"
              />
            </div>

            <div className="relative flex-1">
              <FaMapMarkerAlt className="absolute left-4 top-4 text-teal-400" />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location or online"
                className="w-full pl-12 py-3 rounded-xl"
              />
            </div>

            <button
              onClick={handleSearch}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
        {/* Filters */}
        <aside
          className={`lg:w-1/4 ${
            showFilters ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-28">
            <h2 className="text-xl font-bold mb-4 flex gap-2">
              <FaFilter /> Filters
            </h2>

            {/* Availability */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">
                <FaClock className="inline mr-2" /> Availability
              </h3>
              {["all", "online", "in-person"].map((opt) => (
                <label key={opt} className="block mb-2">
                  <input
                    type="radio"
                    checked={availabilityFilter === opt}
                    onChange={() => setAvailabilityFilter(opt)}
                  />{" "}
                  {opt}
                </label>
              ))}
            </div>

            {/* Specialties */}
            <div>
              <h3 className="font-semibold mb-2">
                <FaUserMd className="inline mr-2" /> Specialties
              </h3>
              {specialties.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpecialtyToggle(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 ${
                    selectedSpecialties.includes(s)
                      ? "bg-teal-100 text-teal-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Active Filters */}
            {selectedSpecialties.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSpecialties.map((s) => (
                  <span
                    key={s}
                    className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={handleClearFilters}
              className="mt-6 text-sm text-teal-600"
            >
              Clear all
            </button>
          </div>
        </aside>

        {/* Cards */}
        <section className="lg:w-3/4 grid md:grid-cols-2 gap-6">
          {filteredTherapists.length ? (
            filteredTherapists.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex gap-4">
                  <img
                    src={t.profileImage || "/default-avatar.png"}
                    onError={(e) =>
                      (e.currentTarget.src = "/default-avatar.png")
                    }
                    alt={t.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{t.name}</h3>
                    <p className="text-teal-600">{t.specialization}</p>

                    <div className="flex items-center gap-1 mt-2">
                      {renderStars(t.rating || 4)}
                      <span className="text-sm ml-1">
                        ({t.rating || 4})
                      </span>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600 mt-2">
                      <span>
                        <FaMapMarkerAlt className="inline mr-1" />
                        {t.location || t.city || "Remote"}
                      </span>
                      <span>
                        <FaGlobe className="inline mr-1" />
                        {t.languages || "English"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  {isOnlineSession(t) ? (
                    <span className="text-green-600 flex gap-1">
                      <FaVideo /> Online
                    </span>
                  ) : (
                    <span className="text-gray-500">In-Person</span>
                  )}

                  <button
                    onClick={() => handleBookSession(t)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full flex gap-2"
                  >
                    <FaCalendarCheck /> Book
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600">
              No therapists found
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
