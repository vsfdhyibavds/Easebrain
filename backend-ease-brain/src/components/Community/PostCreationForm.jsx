import { useState } from 'react';
import { useCreatePostMutation } from '../../app/communityApi';

export default function PostCreationForm({ communityId, onPostCreated, onCancel }) {
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: 'discussion',
    hasTriggerWarning: false,
    triggerWarningText: '',
    isAnonymous: false,
  });
  const [errors, setErrors] = useState({});

  const postTypes = [
    { value: 'discussion', label: 'Discussion', desc: 'Share experiences and get feedback' },
    { value: 'question', label: 'Question', desc: 'Ask for advice or help' },
    { value: 'tip', label: 'Tip/Resource', desc: 'Share helpful resources or strategies' },
    { value: 'support', label: 'Support Request', desc: 'Ask for emotional support' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (formData.content.length < 20) newErrors.content = 'Content must be at least 20 characters';
    if (formData.hasTriggerWarning && !formData.triggerWarningText.trim()) {
      newErrors.triggerWarningText = 'Please specify the trigger warning';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await createPost({
        communityId,
        title: formData.title,
        content: formData.content,
        postType: formData.postType,
        hasTriggerWarning: formData.hasTriggerWarning,
        triggerWarningText: formData.triggerWarningText,
        isAnonymous: formData.isAnonymous,
      }).unwrap();

      onPostCreated?.(result);
      setFormData({
        title: '',
        content: '',
        postType: 'discussion',
        hasTriggerWarning: false,
        triggerWarningText: '',
        isAnonymous: false,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Create a Post</h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            placeholder="What's your post about?"
            maxLength={200}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-2">
            {errors.title && <span className="text-sm text-red-600">{errors.title}</span>}
            <span className="text-xs text-gray-500 ml-auto">{formData.title.length}/200</span>
          </div>
        </div>

        {/* Post Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Post Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {postTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, postType: type.value })}
                className={`p-3 text-left rounded-lg border-2 transition-colors ${
                  formData.postType === type.value
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-600">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => {
              setFormData({ ...formData, content: e.target.value });
              if (errors.content) setErrors({ ...errors, content: '' });
            }}
            placeholder="Share your thoughts, experiences, or ask for advice..."
            rows={6}
            maxLength={5000}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-2">
            {errors.content && <span className="text-sm text-red-600">{errors.content}</span>}
            <span className="text-xs text-gray-500 ml-auto">{formData.content.length}/5000</span>
          </div>
        </div>

        {/* Trigger Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.hasTriggerWarning}
              onChange={(e) => setFormData({ ...formData, hasTriggerWarning: e.target.checked })}
              className="mt-1 w-4 h-4"
            />
            <div>
              <span className="font-medium text-gray-900">This post contains a trigger warning</span>
              <p className="text-sm text-gray-600 mt-1">
                Let readers know about sensitive content so they can decide whether to read it
              </p>
            </div>
          </label>

          {formData.hasTriggerWarning && (
            <div className="mt-3">
              <input
                type="text"
                value={formData.triggerWarningText}
                onChange={(e) => {
                  setFormData({ ...formData, triggerWarningText: e.target.value });
                  if (errors.triggerWarningText) setErrors({ ...errors, triggerWarningText: '' });
                }}
                placeholder="e.g., 'Mentions of panic attacks', 'Discussion of depression'"
                maxLength={100}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.triggerWarningText ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.triggerWarningText && (
                <p className="text-sm text-red-600 mt-1">{errors.triggerWarningText}</p>
              )}
            </div>
          )}
        </div>

        {/* Anonymous Posting */}
        <div>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <span className="font-medium text-gray-900">Post anonymously</span>
              <p className="text-sm text-gray-600">Your name won't be shown to other members</p>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
