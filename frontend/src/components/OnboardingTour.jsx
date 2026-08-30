import { useState } from 'react';

const STEPS = [
  'Welcome to MedAi — search medicines in the sidebar or ask a question in chat.',
  'Select a medicine to get dosage, side effects, and safety information.',
  'Use reminders to track when to take your medicines (in-app notifications).',
  'Upload prescriptions from the Upload tab for your records.',
  'Always consult a healthcare professional for medical decisions.',
];

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const done = step >= STEPS.length - 1;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-medai-200 bg-white p-4 shadow-lg dark:border-medai-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-medai-600">Step {step + 1} of {STEPS.length}</p>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{STEPS[step]}</p>
      <div className="mt-3 flex gap-2">
        {step > 0 && (
          <button type="button" className="btn-secondary text-xs" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        <button
          type="button"
          className="btn-primary text-xs"
          onClick={() => {
            if (done) onComplete?.();
            else setStep((s) => s + 1);
          }}
        >
          {done ? 'Got it' : 'Next'}
        </button>
        <button type="button" className="text-xs text-slate-500 underline" onClick={onComplete}>
          Skip
        </button>
      </div>
    </div>
  );
}
