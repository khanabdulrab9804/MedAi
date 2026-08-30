const TIPS = [
  { title: 'Take medicines on time', body: 'Set reminders and keep a consistent schedule for better adherence.' },
  { title: 'Read the label', body: 'Check dosage, food instructions, and storage before each new medicine.' },
  { title: 'Ask before combining', body: 'Use the interaction checker or ask MedAi before mixing OTC and prescription drugs.' },
  { title: 'When in doubt, call your doctor', body: 'MedAi is educational only — emergencies need professional care.' },
];

const FAQS = [
  { q: 'Can MedAi diagnose me?', a: 'No. MedAi provides educational information from our medicine database and knowledge base.' },
  { q: 'Is my chat saved?', a: 'Sessions are stored locally and on the server for continuity. You can export chat history from the chat tab.' },
];

export default function HealthTips() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card p-4">
        <h2 className="mb-3 font-semibold">Health tips</h2>
        <ul className="space-y-3">
          {TIPS.map((t) => (
            <li key={t.title}>
              <p className="font-medium text-medai-700 dark:text-medai-300">{t.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="card p-4">
        <h2 className="mb-3 font-semibold">FAQs</h2>
        <dl className="space-y-3">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="text-sm text-slate-600 dark:text-slate-400">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
