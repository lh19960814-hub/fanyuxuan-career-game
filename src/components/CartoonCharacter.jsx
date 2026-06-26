import { getCurrentTitle } from '../utils/gameLogic';
import stage1 from '../assets/fanyuxuan-stage-1.png';
import stage2 from '../assets/fanyuxuan-stage-2.png';
import stage3 from '../assets/fanyuxuan-stage-3.png';
import stage4 from '../assets/fanyuxuan-stage-4.png';
import stage5 from '../assets/fanyuxuan-stage-5.png';

const characterStages = [stage1, stage2, stage3, stage4, stage5];

export default function CartoonCharacter({ player, size = 'large' }) {
  const title = getCurrentTitle(player);
  const completed = player.isCompleted;
  const stageIndex = Math.max(0, Math.min((title.appearanceStage || 1) - 1, characterStages.length - 1));
  const image = completed ? stage5 : characterStages[stageIndex];

  return (
    <div
      className={`character character--${size} character--image character--stage-${stageIndex + 1} ${completed ? 'character--complete' : ''}`}
      role="img"
      aria-label={`卡通版范宇轩，当前职级${title.name}`}
    >
      {(stageIndex >= 3 || completed) && <span className="character-glow" />}
      {completed && <span className="character-halo" />}
      <img className="character-portrait" src={image} alt="" draggable="false" />
      <span className="character-shadow" />
    </div>
  );
}
