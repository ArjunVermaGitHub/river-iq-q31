import bullImg from '../assets/bull.png';
import tigerImg from '../assets/tiger.png';

const ENTITY_COLORS = {
  bull: '#8B4513',
  tiger: '#FF8C00',
  cheese: '#FFD700',
  poison: '#9B59B6',
  hay: '#DAA520',
  boat: '#5D4037',
  guy: '#F8FAFC',
};

export function EntityIcon({ type, size = 48, inBoat = false }) {
  const s = size;
  const half = s / 2;

  switch (type) {
    case 'bull':
      return (
        <img
          src={bullImg}
          width={s}
          height={s}
          alt="bull"
          className="entity-icon-img"
          draggable={false}
        />
      );

    case 'tiger':
      return (
        <img
          src={tigerImg}
          width={s}
          height={s}
          alt="tiger"
          className="entity-icon-img"
          draggable={false}
        />
      );

    case 'cheese':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" aria-label="cheese">
          <path d="M8 36 L24 8 L40 36 Z" fill={ENTITY_COLORS.cheese} stroke="#C9A800" strokeWidth="1.5" />
          <circle cx="20" cy="26" r="3" fill="#FFF8DC" opacity="0.7" />
          <circle cx="30" cy="30" r="2" fill="#FFF8DC" opacity="0.7" />
        </svg>
      );

    case 'poison':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" aria-label="poison">
          <path d="M8 36 L24 8 L40 36 Z" fill={ENTITY_COLORS.poison} stroke="#7B1FA2" strokeWidth="1.5" />
          <circle cx="18" cy="28" r="3.5" fill="#2D1B4E" />
          <circle cx="28" cy="32" r="2.5" fill="#2D1B4E" />
          <circle cx="32" cy="24" r="2" fill="#2D1B4E" />
          <circle cx="22" cy="22" r="1.5" fill="#2D1B4E" />
        </svg>
      );

    case 'hay':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" aria-label="hay">
          <rect x="10" y="20" width="28" height="18" rx="3" fill="#C4A035" stroke="#8B6914" strokeWidth="1.5" />
          <line x1="12" y1="24" x2="36" y2="24" stroke="#E8C547" strokeWidth="1.5" opacity="0.7" />
          <line x1="12" y1="28" x2="36" y2="28" stroke="#B8860B" strokeWidth="1.5" opacity="0.7" />
          <line x1="12" y1="32" x2="36" y2="32" stroke="#E8C547" strokeWidth="1.5" opacity="0.7" />
          <line x1="12" y1="36" x2="36" y2="36" stroke="#B8860B" strokeWidth="1.5" opacity="0.7" />
          <ellipse cx="24" cy="20" rx="14" ry="5" fill="#DAA520" />
          <path
            d="M12 18 Q14 10 16 18 M18 17 Q20 8 22 17 M24 16 Q26 7 28 16 M30 17 Q32 9 34 17 M36 18 Q38 11 38 18"
            stroke="#E8C547"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="22" y="19" width="4" height="20" fill="#8B6914" opacity="0.5" rx="1" />
        </svg>
      );

    case 'boat':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" aria-label="boat">
          <path d="M6 30 Q24 42 42 30 L38 26 L10 26 Z" fill={ENTITY_COLORS.boat} stroke="#3E2723" strokeWidth="1.5" />
          <rect x="22" y="14" width="4" height="14" fill="#6D4C41" />
          <path d="M22 14 L30 18 L22 18 Z" fill="#ECEFF1" stroke="#90A4AE" strokeWidth="1" />
        </svg>
      );

    case 'guy':
      return (
        <svg width={s} height={s * 1.1} viewBox="0 0 48 52" aria-label="boatman">
          <circle cx="24" cy="10" r="6" fill="none" stroke={ENTITY_COLORS.guy} strokeWidth="2.5" />
          <line x1="24" y1="16" x2="24" y2="32" stroke={ENTITY_COLORS.guy} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="20" x2="36" y2="20" stroke={ENTITY_COLORS.guy} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="32" x2="14" y2="46" stroke={ENTITY_COLORS.guy} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="32" x2="34" y2="46" stroke={ENTITY_COLORS.guy} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx={half} cy={half} r={half - 4} fill="#ccc" />
        </svg>
      );
  }
}

export function BoatWithCargo({
  passengers = [],
  size = 100,
  scale = 1,
  showGuy = true,
  passengerAnim = '',
}) {
  const boatW = size;
  const guySize = Math.round(34 * scale);
  const passengerSize = Math.round(30 * scale);
  const passengerClass = passengerAnim
    ? `boat-passengers boat-passengers--${passengerAnim}`
    : 'boat-passengers';

  return (
    <div className="boat-group" style={{ width: boatW, '--scene-scale': scale }}>
      <div className="boat-hull">
        <EntityIcon type="boat" size={boatW} />
      </div>
      {showGuy && (
        <div className="boat-guy">
          <EntityIcon type="guy" size={guySize} />
        </div>
      )}
      {passengers.length > 0 && (
        <div className={passengerClass}>
          <EntityIcon type={passengers[0]} size={passengerSize} inBoat />
        </div>
      )}
    </div>
  );
}
