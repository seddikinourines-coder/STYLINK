/**
 * MeasurementGuide — matches the reference design:
 * "Mesurez-vous à la maison / GUIDE DE MESURE"
 * with illustrated body figures for each measurement zone.
 */
export default function MeasurementGuide() {
  return (
    <div className="bg-background border border-border p-6 max-w-lg w-full font-sans">
      {/* Header */}
      <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">
        Mesurez-vous à la maison
      </p>
      <h2
        className="text-center font-serif text-3xl text-foreground mb-2"
        style={{ letterSpacing: "0.05em" }}
      >
        GUIDE DE MESURE
      </h2>
      <p className="text-center text-sm text-foreground/80 font-light mb-1">
        Suivez ces étapes pour envoyer vos mesures au designer.
      </p>
      <p className="text-center text-[11px] text-muted-foreground mb-6">
        Un mètre ruban souple et l'aide d'une personne sont recommandés pour la précision.
      </p>

      {/* Table */}
      <div className="border border-border overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2.5rem_1fr_6.5rem_1.2fr] bg-muted/50 border-b border-border">
          <div className="p-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center border-r border-border flex items-center justify-center">#</div>
          <div className="p-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-r border-border flex items-center">Zone de Mesure</div>
          <div className="p-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center border-r border-border flex items-center justify-center leading-tight">Instructions Visuelles</div>
          <div className="p-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center leading-tight">Comment Mesurer</div>
        </div>

        {ROWS.map((row, i) => (
          <div
            key={row.zone}
            className={`grid grid-cols-[2.5rem_1fr_6.5rem_1.2fr] border-b border-border last:border-b-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
          >
            {/* Number */}
            <div className="p-3 flex items-center justify-center border-r border-border">
              <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs text-foreground font-medium">
                {i + 1}
              </span>
            </div>
            {/* Zone name */}
            <div className="p-3 flex items-center border-r border-border">
              <span className="text-sm text-foreground font-medium">{row.zone}</span>
            </div>
            {/* Visual illustration */}
            <div className="p-2 flex items-center justify-center border-r border-border">
              <row.Illustration />
            </div>
            {/* Instructions */}
            <div className="p-3 flex items-center">
              <span className="text-xs text-foreground/80 font-light leading-relaxed">{row.instruction}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-4 bg-amber-50 border border-amber-200/60 p-3 flex gap-2">
        <span className="text-base">💡</span>
        <div>
          <p className="text-xs font-medium text-foreground mb-0.5">Astuce de Designer</p>
          <p className="text-xs text-foreground/70 font-light leading-relaxed">
            Utilisez un mètre ruban souple et faites-vous aider par quelqu'un pour une mesure
            précise. Gardez le mètre bien à plat, sans trop le serrer.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── SVG body illustrations ─── */

function BustIllustration() {
  return (
    <svg viewBox="0 0 60 80" width="48" height="64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Head */}
      <ellipse cx="30" cy="10" rx="7" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Neck */}
      <rect x="27" y="17" width="6" height="5" rx="1" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
      {/* Torso */}
      <path d="M18 22 Q30 20 42 22 L44 48 Q30 52 16 48 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Bust measurement line */}
      <path d="M16 32 Q30 30 44 32" stroke="#b45309" strokeWidth="1.5" strokeDasharray="2 1.5" fill="none"/>
      <circle cx="16" cy="32" r="2" fill="#b45309"/>
      <circle cx="44" cy="32" r="2" fill="#b45309"/>
      {/* Number dot */}
      <circle cx="44" cy="32" r="5" fill="#b45309"/>
      <text x="44" y="35" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">1</text>
    </svg>
  );
}

function WaistIllustration() {
  return (
    <svg viewBox="0 0 60 80" width="48" height="64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="30" cy="10" rx="7" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.2"/>
      <rect x="27" y="17" width="6" height="5" rx="1" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
      <path d="M18 22 Q30 20 42 22 L40 50 Q30 54 20 50 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Waist line - narrowest point */}
      <path d="M19 39 Q30 36 41 39" stroke="#b45309" strokeWidth="1.5" strokeDasharray="2 1.5" fill="none"/>
      <circle cx="19" cy="39" r="2" fill="#b45309"/>
      <circle cx="41" cy="39" r="2" fill="#b45309"/>
      <circle cx="41" cy="39" r="5" fill="#b45309"/>
      <text x="41" y="42" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">2</text>
    </svg>
  );
}

function HipsIllustration() {
  return (
    <svg viewBox="0 0 60 90" width="48" height="64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="30" cy="10" rx="7" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.2"/>
      <rect x="27" y="17" width="6" height="5" rx="1" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
      {/* Upper torso */}
      <path d="M19 22 Q30 20 41 22 L39 42 Q30 44 21 42 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Hips / lower body */}
      <path d="M21 42 Q30 44 39 42 L44 65 Q30 70 16 65 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Hips measurement line */}
      <path d="M15 55 Q30 52 45 55" stroke="#b45309" strokeWidth="1.5" strokeDasharray="2 1.5" fill="none"/>
      <circle cx="15" cy="55" r="2" fill="#b45309"/>
      <circle cx="45" cy="55" r="2" fill="#b45309"/>
      <circle cx="45" cy="55" r="5" fill="#b45309"/>
      <text x="45" y="58" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">3</text>
    </svg>
  );
}

function ArmIllustration() {
  return (
    <svg viewBox="0 0 60 80" width="48" height="64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="30" cy="10" rx="7" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.2"/>
      <rect x="27" y="17" width="6" height="5" rx="1" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
      {/* Body */}
      <path d="M22 22 Q30 20 38 22 L37 50 Q30 53 23 50 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Left arm */}
      <path d="M22 24 Q12 28 11 45 Q12 50 15 48 Q17 34 23 30" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Arm measurement */}
      <path d="M10 34 Q14 32 18 33" stroke="#b45309" strokeWidth="1.5" strokeDasharray="2 1.5" fill="none"/>
      <circle cx="10" cy="34" r="2" fill="#b45309"/>
      <circle cx="18" cy="33" r="2" fill="#b45309"/>
      <circle cx="10" cy="34" r="5" fill="#b45309"/>
      <text x="10" y="37" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">4</text>
    </svg>
  );
}

function LegIllustration() {
  return (
    <svg viewBox="0 0 60 100" width="48" height="64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="30" cy="10" rx="7" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.2"/>
      <rect x="27" y="17" width="6" height="5" rx="1" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
      {/* Torso */}
      <path d="M22 22 Q30 20 38 22 L37 46 Q30 48 23 46 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Left leg */}
      <path d="M23 46 Q20 50 19 75 Q20 80 23 80 Q26 80 26 75 L27 46" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Right leg */}
      <path d="M27 46 L28 75 Q28 80 31 80 Q34 80 34 75 Q33 50 37 46" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
      {/* Leg length line */}
      <line x1="36" y1="46" x2="36" y2="78" stroke="#b45309" strokeWidth="1.5" strokeDasharray="2 1.5"/>
      <circle cx="36" cy="46" r="2" fill="#b45309"/>
      <circle cx="36" cy="78" r="2" fill="#b45309"/>
      <circle cx="36" cy="46" r="5" fill="#b45309"/>
      <text x="36" y="49" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">5</text>
    </svg>
  );
}

const ROWS = [
  {
    zone: "Tour de poitrine",
    Illustration: BustIllustration,
    instruction: "Mesurez horizontalement autour de la partie la plus large de votre poitrine.",
  },
  {
    zone: "Tour de taille",
    Illustration: WaistIllustration,
    instruction: "Mesurez autour de la taille naturelle, là où votre corps se plie.",
  },
  {
    zone: "Tour de hanche",
    Illustration: HipsIllustration,
    instruction: "Mesurez autour de la partie la plus large des hanches et des fesses.",
  },
  {
    zone: "Tour de bras",
    Illustration: ArmIllustration,
    instruction: "Mesurez autour de la partie la plus ronde du bras, bras détendu.",
  },
  {
    zone: "Longueur de jambe",
    Illustration: LegIllustration,
    instruction: "Mesurez de la taille jusqu'à la cheville pour les pantalons.",
  },
];
