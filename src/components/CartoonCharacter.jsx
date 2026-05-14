import { equipments } from '../data/equipments';
import { getCurrentTitle } from '../utils/gameLogic';
import fanyuxuanHead from '../assets/fanyuxuan-head.png';

function hasVisual(player, visual) {
  return player.equipments.some((id) => {
    const item = equipments.find((equipment) => equipment.id === id);
    return item?.visualUnlock === visual;
  });
}

export default function CartoonCharacter({ player, size = 'large' }) {
  const title = getCurrentTitle(player);
  const stage = title.appearanceStage;
  const completed = player.isCompleted;
  const showBadge = stage >= 2 || hasVisual(player, 'badge');
  const showWatch = stage >= 2 || hasVisual(player, 'watch');
  const showGlasses = stage >= 3 || hasVisual(player, 'glasses');
  const showBriefcase = stage >= 3 || hasVisual(player, 'briefcase');
  const showThermos = hasVisual(player, 'thermos') || stage >= 4;
  const showSuit = stage >= 3 || hasVisual(player, 'suit');
  const showAura = stage >= 4 || hasVisual(player, 'aura') || completed;
  const shoeColor = hasVisual(player, 'shoes') || stage >= 3 ? '#1f2937' : '#475569';
  const shirtColor = stage === 1 ? '#16181f' : stage === 2 ? '#315c9e' : '#26364f';
  const jacketColor = completed ? '#25304a' : stage >= 4 ? '#2f3f5f' : '#384b70';
  const badgeText = completed ? '厅' : title.name.slice(0, 1);

  return (
    <div className={`character character--${size} ${completed ? 'character--complete' : ''}`}>
      <svg viewBox="0 0 280 340" role="img" aria-label={`卡通版范宇轩，当前职级${title.name}`}>
        <defs>
          <clipPath id="fanyuxuan-photo-head">
            <path d="M83 70 C88 32 112 17 145 20 C179 23 201 47 197 83 C194 118 171 138 137 136 C103 134 78 108 83 70 Z" />
          </clipPath>
        </defs>

        {showAura && (
          <g className="character-aura">
            <ellipse cx="140" cy="177" rx="98" ry="132" fill={completed ? '#f7c948' : '#93c5fd'} opacity="0.18" />
            <path d="M58 282 C74 220 206 220 222 282 Z" fill={completed ? '#d8a528' : '#5b7cb3'} opacity="0.16" />
            {completed && <circle cx="140" cy="70" r="48" fill="none" stroke="#f7c948" strokeWidth="8" opacity="0.42" />}
          </g>
        )}

        <ellipse cx="140" cy="315" rx="72" ry="14" fill="#475569" opacity="0.16" />

        <g className="character-body">
          <path d="M88 142 C92 118 114 102 140 102 C166 102 188 118 192 142 L204 254 C206 276 191 292 169 292 L111 292 C89 292 74 276 76 254 Z" fill={showSuit ? jacketColor : shirtColor} />
          <path d="M112 142 L140 206 L168 142 Z" fill={showSuit ? '#f8fafc' : '#22252c'} opacity={showSuit ? 1 : 0.28} />
          {showSuit && <path d="M135 152 L145 152 L151 214 L140 232 L129 214 Z" fill={completed ? '#b8860b' : '#1d4ed8'} />}
          <path d="M92 152 C60 174 54 222 73 238" fill="none" stroke="#f1bd8a" strokeWidth="22" strokeLinecap="round" />
          <path d="M188 152 C221 175 224 219 205 238" fill="none" stroke="#f1bd8a" strokeWidth="22" strokeLinecap="round" />
          <circle cx="73" cy="239" r="13" fill="#f1bd8a" />
          <circle cx="205" cy="239" r="13" fill="#f1bd8a" />
          {showWatch && <rect x="190" y="226" width="24" height="9" rx="4" fill="#111827" />}
          {showBadge && (
            <g>
              <rect x="159" y="168" width="28" height="34" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
              <rect x="164" y="174" width="18" height="7" rx="2" fill="#60a5fa" />
              <text x="173" y="195" fontSize="13" textAnchor="middle" fill="#334155" fontWeight="700">{badgeText}</text>
            </g>
          )}
        </g>

        <g className="character-head">
          <path d="M83 70 C88 32 112 17 145 20 C179 23 201 47 197 83 C194 118 171 138 137 136 C103 134 78 108 83 70 Z" fill="#f2bd8f" />
          <image
            href={fanyuxuanHead}
            x="72"
            y="0"
            width="138"
            height="150"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#fanyuxuan-photo-head)"
          />
          <path
            d="M83 70 C88 32 112 17 145 20 C179 23 201 47 197 83 C194 118 171 138 137 136 C103 134 78 108 83 70 Z"
            fill="none"
            stroke={completed ? '#f7c948' : '#2f3f5f'}
            strokeWidth="5"
            opacity="0.9"
          />
          <path d="M88 74 C94 38 122 20 151 24 C178 29 194 49 198 75" fill="none" stroke="#111827" strokeWidth="9" strokeLinecap="round" opacity="0.58" />
          {showGlasses && (
            <g fill="none" stroke="#111827" strokeWidth="4">
              <rect x="102" y="78" width="34" height="24" rx="9" />
              <rect x="148" y="78" width="34" height="24" rx="9" />
              <path d="M136 90 L148 90" />
            </g>
          )}
        </g>

        {showThermos && (
          <g className="item-pop">
            <rect x="46" y="218" width="26" height="54" rx="9" fill="#d9e2ec" stroke="#64748b" strokeWidth="3" />
            <rect x="49" y="211" width="20" height="12" rx="4" fill="#94a3b8" />
            <path d="M55 238 L67 238" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {showBriefcase && (
          <g className="item-pop">
            <rect x="198" y="234" width="54" height="43" rx="8" fill="#111827" />
            <rect x="216" y="224" width="18" height="14" rx="4" fill="none" stroke="#111827" strokeWidth="5" />
            <rect x="220" y="251" width="10" height="7" rx="2" fill="#d4af37" />
          </g>
        )}

        <g>
          <path d="M108 290 L107 315" stroke="#1f2937" strokeWidth="17" strokeLinecap="round" />
          <path d="M172 290 L173 315" stroke="#1f2937" strokeWidth="17" strokeLinecap="round" />
          <path d="M91 318 L123 318" stroke={shoeColor} strokeWidth="13" strokeLinecap="round" />
          <path d="M157 318 L190 318" stroke={shoeColor} strokeWidth="13" strokeLinecap="round" />
        </g>

        <g className="rank-medal">
          <circle cx="218" cy="104" r="24" fill={completed ? '#f7c948' : '#dbeafe'} stroke={completed ? '#b7791f' : '#60a5fa'} strokeWidth="4" />
          <text x="218" y="111" fontSize="18" textAnchor="middle" fill={completed ? '#6b3f00' : '#1d4ed8'} fontWeight="800">{badgeText}</text>
        </g>
      </svg>
    </div>
  );
}
