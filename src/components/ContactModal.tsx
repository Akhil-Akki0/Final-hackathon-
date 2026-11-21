import { useEffect, useState } from 'react';

interface ContactModalProps {
  open: boolean;
  initialTopic?: string;
  onClose: () => void;
}

export function ContactModal({ open, initialTopic, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [topic, setTopic] = useState(initialTopic || 'Ecological Carbon Accounting');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid work email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#10291a]/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="w-full max-w-[480px] rounded-2xl bg-[#f6f7f4] text-[#10291a] border border-[#10291a]/15 p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="chip">Field deployment</span>
            <h2
              id="contact-modal-title"
              className="mt-3 text-[26px] font-medium tracking-[-0.03em] leading-tight"
            >
              Start a field sensor pilot
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close contact dialog"
            className="w-9 h-9 rounded-lg border border-[#10291a]/15 flex items-center justify-center text-[#2c4434] hover:bg-[#e7ebe8]"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-xl bg-white border border-[#10291a]/12 p-5" data-testid="contact-confirmation">
            <p className="mono text-[#4f8a12]">Request logged</p>
            <p className="mt-2 text-[15px] leading-relaxed text-[#2c4434]">
              Thank you, <strong className="text-[#10291a]">{name}</strong>. Our field science team
              will follow up at <strong className="text-[#10291a]">{email}</strong> regarding{' '}
              <strong className="text-[#10291a]">{topic}</strong>.
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="mt-5 w-full py-2.5 px-4 rounded bg-[#10291a] text-[#f6f7f4] mono text-[11px]"
            >
              Return to page
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="ml-name" className="block mono text-[#2c4434] mb-1.5">
                Full name *
              </label>
              <input
                id="ml-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Linnea Lindqvist"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#10291a]/18 text-[14px] focus:outline-none focus:border-[#10291a]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ml-email" className="block mono text-[#2c4434] mb-1.5">
                  Work email *
                </label>
                <input
                  id="ml-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="linnea@boreal-fund.org"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#10291a]/18 text-[14px] focus:outline-none focus:border-[#10291a]"
                />
              </div>
              <div>
                <label htmlFor="ml-org" className="block mono text-[#2c4434] mb-1.5">
                  Organization
                </label>
                <input
                  id="ml-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Boreal Stewardship"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#10291a]/18 text-[14px] focus:outline-none focus:border-[#10291a]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ml-topic" className="block mono text-[#2c4434] mb-1.5">
                Measurement program
              </label>
              <select
                id="ml-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#10291a]/18 text-[14px] focus:outline-none focus:border-[#10291a]"
              >
                <option value="Ecological Carbon Accounting">Ecological Carbon Accounting</option>
                <option value="Living Biome Intelligence">Living Biome Intelligence</option>
                <option value="Verifiable Climate MRV">Verifiable Climate MRV</option>
                <option value="Field Station 07 Telemetry">Field Station 07 Telemetry</option>
              </select>
            </div>

            <div>
              <label htmlFor="ml-notes" className="block mono text-[#2c4434] mb-1.5">
                Site notes
              </label>
              <textarea
                id="ml-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Biome type, approximate hectares, or reporting timeline..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#10291a]/18 text-[14px] focus:outline-none focus:border-[#10291a]"
              />
            </div>

            {error && (
              <p className="text-[13px] text-[#991b1b] bg-[#fee2e2] px-3 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-1 w-full py-3 px-5 rounded-lg bg-[#c6f35c] hover:bg-[#a9dd3a] text-[#10291a] mono font-medium transition-colors"
            >
              Request station briefing →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
