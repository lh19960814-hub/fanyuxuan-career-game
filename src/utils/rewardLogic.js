import { equipments } from '../data/equipments';
import { buffPool } from '../data/buffs';
import { gameTypes } from '../data/gameTypes';
import { applyLevelUp, consumeBuffs } from './gameLogic';

function getEquipmentBonus(player, effectType) {
  return player.equipments.reduce((sum, id) => {
    const equipment = equipments.find((item) => item.id === id);
    if (!equipment) return sum;
    if (equipment.effectType === effectType || equipment.effectType === 'allBonus') {
      return sum + equipment.effectValue;
    }
    return sum;
  }, 0);
}

function pickEquipment(player) {
  const available = equipments.filter((item) => !player.equipments.includes(item.id));
  if (!available.length) return null;

  const chance = player.winCount >= 7 ? 0.58 : 0.42;
  if (Math.random() > chance) return null;

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

function pickBuff(player) {
  const chance = 0.45;
  if (Math.random() > chance) return null;

  const pool = buffPool.filter((buff) => !player.buffs.some((active) => active.id === buff.id));
  if (!pool.length) return null;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function settleWin(player, gameType, npc) {
  const game = gameTypes.find((item) => item.type === gameType);
  const baseExp = game?.rewardBase || 25;
  const randomExp = Math.floor(Math.random() * 11);
  let gainedExp = baseExp + randomExp + npc.difficulty * 2;

  gainedExp += getEquipmentBonus(player, 'expBonus');

  const doubleExpBuff = player.buffs.find((buff) => buff.effectType === 'doubleExp');
  const extraExpBuff = player.buffs.find((buff) => buff.effectType === 'extraExp');
  if (doubleExpBuff) gainedExp *= doubleExpBuff.effectValue;
  if (extraExpBuff) gainedExp += extraExpBuff.effectValue;

  const equipment = pickEquipment(player);
  const buff = pickBuff(player);

  let nextPlayer = {
    ...player,
    exp: player.exp + gainedExp,
    winCount: player.winCount + 1,
    currentNpcIndex: Math.min(player.currentNpcIndex + 1, 7),
    completedBuffCount: player.completedBuffCount + (buff ? 1 : 0),
    equipments: equipment ? [...player.equipments, equipment.id] : player.equipments,
    buffs: buff ? [...player.buffs, { ...buff }] : player.buffs,
  };

  nextPlayer = consumeBuffs(nextPlayer);
  nextPlayer = applyLevelUp(nextPlayer);

  return {
    player: nextPlayer,
    reward: {
      exp: gainedExp,
      equipment,
      buff,
      levelUps: nextPlayer.levelUps || [],
      text: '范宇轩沉稳发挥，成功拿下本轮考验！气质发生了微妙变化。',
    },
  };
}

export function settleLose(player) {
  return {
    ...consumeBuffs(player),
    loseCount: player.loseCount + 1,
  };
}
