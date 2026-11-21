import { useEffect, useRef, useState } from 'react';
import {
  SOLUTION_CARDS,
  SOLUTION_STATS,
  type SolutionCardData,
} from '../data/mosslineData';
import { computeCardTilt } from '../utils/scrollMath';

interface SolutionsSectionProps {
  onOpenContact: (preselectedSolution?: string) => void;
}

function TiltingSolutionCard({
  card,
  selected,
  onSelect,
}: {
  card: SolutionCardData;
  selected: boolean;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const { rotateX, rotateY } = computeCardTilt(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height,
      6.5
    );
    el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = '';
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-expanded={selected}
      className={`solutions-card text-left flex flex-col justify-between group focus-visible:outline-2 focus-visible:outline-[#10291a] ${
        selected ? 'ring-2 ring-[#10291a]' : ''
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#dfe3e0]">
        <img
          src={card.image}
          alt={card.alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="p-6 flex flex-col flex-1 justify-between gap-5">
        <div>
          <p className="mono text-[#2c4434]">{card.code}</p>
          <h3 className="mt-2.5 text-[22px] font-medium tracking-[-0.025em] leading-snug text-[#10291a]">
            {card.title}
          </h3>
          <p className="mt-2.5 text-[15px] leading-relaxed text-[#2c4434]">{card.description}</p>
        </div>

        <div className="pt-4 border-t border-[#10291a]/10 flex items-center justify-between gap-2">
          <span className="mono text-[10px] tracking-[0.1em] text-[#4f8a12] font-medium whitespace-nowrap">
            {card.metric}
          </span>
          <span className="mono text-[10px] tracking-[0.1em] text-[#10291a] whitespace-nowrap shrink-0 transition-transform duration-200 group-hover:translate-x-1">
            {selected ? 'Hide specs ↑' : 'Inspect specs →'}
          </span>
        </div>
      </div>
    </button>
  );
}

export function SolutionsSection({ onOpenContact }: SolutionsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const statsContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>(SOLUTION_CARDS[0].id);
  const [statProgress, setStatProgress] = useState(0);

  useEffect(() => {
    const el = statsContainerRef.current;
    if (!el) return;

    let animated = false;
    let rafId = 0;

    const runCountUp = () => {
      if (animated) return;
      animated = true;
      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        setStatProgress(1);
        return;
      }

      const start = performance.now();
      const duration = 1100;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setStatProgress(eased);
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        }
      };
      rafId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          runCountUp();
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  const selectedCard = SOLUTION_CARDS.find((c) => c.id === selectedCardId) ?? SOLUTION_CARDS[0];

  return (
    <section
      id="solutions"
      ref={sectionRef}
      className="solutions-panel"
      aria-labelledby="solutions-heading"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-[680px]">
            <span className="chip">Solutions</span>
            <h2
              id="solutions-heading"
              className="mt-4 text-[clamp(32px,4vw,54px)] font-medium tracking-[-0.035em] leading-[1.03] text-[#10291a]"
              style={{ textWrap: 'balance' }}
            >
              Continuous ecosystem intelligence for every biome
            </h2>
          </div>
          <p className="max-w-[380px] text-[15px] leading-relaxed text-[#2c4434]">
            Autonomous field stations capture high-frequency carbon, moisture, and biodiversity
            signals — structured for corporate climate audits.
          </p>
        </div>

        {/* Three tilting image cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {SOLUTION_CARDS.map((card) => (
            <TiltingSolutionCard
              key={card.id}
              card={card}
              selected={selectedCardId === card.id}
              onSelect={() => setSelectedCardId(card.id)}
            />
          ))}
        </div>

        {/* Selected card specifications drawer */}
        <div
          className="mt-6 rounded-xl bg-[#f6f7f4] border border-[#10291a]/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          data-testid="solution-detail-panel"
        >
          <div>
            <p className="mono text-[#4f8a12]">{selectedCard.code} — Technical specification</p>
            <h3 className="mt-1.5 text-[19px] font-medium tracking-[-0.02em] text-[#10291a]">
              {selectedCard.title}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[#2c4434]">
              {selectedCard.specs.map((spec) => (
                <li key={spec} className="flex items-center gap-2">
                  <span className="text-[#4f8a12]" aria-hidden="true">
                    +
                  </span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onOpenContact(selectedCard.title)}
            className="shrink-0 inline-flex items-center gap-3 px-5 py-3 rounded bg-[#10291a] text-[#f6f7f4] hover:bg-[#2c4434] transition-colors whitespace-nowrap"
          >
            <span className="mono text-[11px] tracking-[0.14em]">Deploy {selectedCard.title.split(' ')[0]}</span>
            <span className="text-[#c6f35c]" aria-hidden="true">
              →
            </span>
          </button>
        </div>

        {/* Four count-up stats */}
        <div
          ref={statsContainerRef}
          className="mt-16 pt-12 border-t border-[#10291a]/12 grid grid-cols-2 lg:grid-cols-4 gap-8"
          data-testid="solutions-stats"
        >
          {SOLUTION_STATS.map((stat) => {
            const current = stat.target * statProgress;
            const formatted =
              stat.decimals > 0 ? current.toFixed(stat.decimals) : String(Math.round(current));
            return (
              <div key={stat.id} className="flex flex-col">
                <div className="text-[clamp(36px,4vw,52px)] font-medium tracking-[-0.04em] leading-none text-[#10291a] tabular-nums">
                  {formatted}
                  <span className="text-[#4f8a12]">{stat.suffix}</span>
                </div>
                <div className="mt-3 mono text-[#10291a]">{stat.label}</div>
                <div className="mt-1 text-[13px] text-[#2c4434]">{stat.sublabel}</div>
              </div>
            );
          })}
        </div>

        {/* Quiet footer */}
        <footer className="mt-20 pt-8 border-t border-[#10291a]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[13px] text-[#2c4434]">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#10291a] tracking-[-0.02em]">Mossline</span>
            <span aria-hidden="true">·</span>
            <span>Environmental Sensor Intelligence</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 mono text-[10.5px]">
            <a href="#story" className="hover:text-[#10291a]">
              Scroll Fly-In
            </a>
            <a href="#solutions" className="hover:text-[#10291a]">
              Solutions
            </a>
            <button type="button" onClick={() => onOpenContact()} className="mono text-[10.5px] hover:text-[#10291a]">
              Contact
            </button>
            <span className="text-[#2c4434]/70">© 2026 Mossline</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
