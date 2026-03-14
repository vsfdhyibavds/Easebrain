import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Share2, MessageCircle, Zap } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

export default function StoriesOfHope() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchStories();
  }, [selectedCategory, page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/stories/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch {
      console.error("Failed to fetch categories");
    }
  };

  const fetchStories = async () => {
    try {
      setLoading(true);
      let url = `/api/stories?page=${page}&per_page=6`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
      }
    } catch {
      setError("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (storyId) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/like`, {
        method: "POST",
      });
      if (response.ok) {
        fetchStories();
      }
    } catch {
      console.error("Failed to like story");
    }
  };

  const handleShare = async (storyId) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/share`, {
        method: "POST",
      });
      if (response.ok) {
        alert("Story shared!");
      }
    } catch {
      console.error("Failed to share story");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-teal-900 mb-4">
            Stories of Hope & Recovery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover inspiring journeys of recovery, breakthrough moments, and
            everyday victories from our community members.
          </p>
        </div>

        {/* Create Story Button */}
        {false && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mx-auto block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-full transition shadow-lg"
          >
            + Share Your Story
          </button>
        )}

        {/* Create Story Form */}
        {showCreateForm && (
          <CreateStoryForm onSuccess={() => setShowCreateForm(false)} />
        )}
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex gap-3 overflow-x-auto pb-4">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setPage(1);
            }}
            className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
              selectedCategory === null
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50"
            }`}
          >
            All Stories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-teal-600 text-white"
                  : "bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Stories Grid */}
      <div className="max-w-6xl mx-auto">
        {stories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No stories yet. Be the first to share your journey!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
                onClick={() => navigate(`/stories/${story.id}`)}
              >
                {/* Featured Image */}
                {story.featured_image_url && (
                  <img
                    src={story.featured_image_url}
                    alt={story.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                {/* Category Badge */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {story.category}
                    </span>
                    {story.is_featured && (
                      <Zap className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>

                  {/* Story Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {story.title}
                  </h3>

                  {/* Story Preview */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {story.content}
                  </p>

                  {/* Author and Date */}
                  <div className="text-sm text-gray-500 mb-4">
                    <p className="font-medium">{story.author_name}</p>
                    <p>
                      {new Date(story.published_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Engagement Stats and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex gap-6 text-gray-600 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(story.id);
                        }}
                        className="flex items-center gap-2 hover:text-red-500 transition"
                      >
                        <Heart className="w-4 h-4" />
                        {story.likes}
                      </button>
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {story.comments?.length || 0}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(story.id);
                      }}
                      className="text-gray-600 hover:text-teal-600 transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {stories.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12 flex justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-6 py-2 bg-white border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-6 py-2 text-gray-700 font-medium">
            Page {page}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Create Story Form Component
function CreateStoryForm({ onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit story");
      }

      alert("Story submitted for review! Thank you for sharing.");
      setFormData({
        title: "",
        content: "",
        category: "General",
        tags: "",
      });
      onSuccess();
    } catch (_err) {
      setError(_err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-teal-900 mb-6">
        Share Your Story
      </h2>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Story Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your story a compelling title..."
            required
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Story
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your journey, breakthrough, or inspiration... (500+ words recommended)"
            required
            rows={8}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:outline-none"
            >
              <option>Recovery</option>
              <option>Coping</option>
              <option>Breakthrough</option>
              <option>Daily Life</option>
              <option>Family Support</option>
              <option>General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., anxiety, recovery, meditation"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Your story will be reviewed by our moderation
            team to ensure it follows community guidelines before being published.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Story"}
          </button>
          <button
            type="button"
            onClick={() => onSuccess()}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
