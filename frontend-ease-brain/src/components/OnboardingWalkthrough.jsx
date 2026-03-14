import React, { useState, useEffect } from 'react';
import { Tooltip } from './ui/tooltip';


const walkthroughSteps = [
  {
    selector: '#nav-home',
    content: 'This is your dashboard. Access all your projects and updates here.'
  },
  {
    selector: '#nav-create',
    content: 'Create a new project and start collaborating instantly.'
  },
  {
    selector: '#nav-profile',
    content: 'Manage your profile, settings, and preferences.'
  }
];

const OnboardingWalkthrough = () => {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    // Attach tooltip to the current step's selector
    const { selector, content } = walkthroughSteps[step];
    const el = document.querySelector(selector);
    if (el) {
      el.setAttribute('data-tip', content);
      el.setAttribute('data-for', 'walkthrough-tooltip');
      el.classList.add('onboarding-highlight');
    }
    // Remove highlight from previous step
    return () => {
      if (el) {
        el.removeAttribute('data-tip');
        el.removeAttribute('data-for');
        el.classList.remove('onboarding-highlight');
      }
    };
  }, [step]);

  const _nextStep = () => {
    if (step < walkthroughSteps.length - 1) {
      setStep(step + 1);
    } else {
      setStep(step + 1); // Move to feedback step
    }
  };

  const handleFeedbackSubmit = () => {
    // Here you could send feedback to backend or analytics
    setFeedbackSubmitted(true);
    setActive(false);
  };

  if (!active && !feedbackSubmitted) return null;

  return (
    <>
      <Tooltip
        id="walkthrough-tooltip"
        place="bottom"
        effect="solid"
        isOpen={true}
        clickable={true}
        className="z-50 bg-indigo-700 text-white px-4 py-2 rounded shadow-lg"
      />
  {/* Next button removed for production use */}
      {step === walkthroughSteps.length && !feedbackSubmitted && (
        <div className="fixed bottom-8 right-8 z-50 w-96 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">We'd love your feedback!</h3>
          <p className="mb-2">How was your onboarding experience?</p>
          <textarea
            className="w-full border rounded p-2 mb-2"
            placeholder="Share your thoughts..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
          <div className="flex gap-2 mb-2">
            {[1,2,3,4,5].map(rating => (
              <button
                key={rating}
                className={`px-3 py-1 rounded border ${selectedRating === rating ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onClick={() => setSelectedRating(rating)}
              >{rating}</button>
            ))}
          </div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleFeedbackSubmit}
          >Submit Feedback</button>
        </div>
      )}
      <style>{`
        .onboarding-highlight {
          box-shadow: 0 0 0 4px #6366f1;
          border-radius: 8px;
          position: relative;
          z-index: 1001;
        }
      `}</style>
    </>
  );
};

export default OnboardingWalkthrough;
