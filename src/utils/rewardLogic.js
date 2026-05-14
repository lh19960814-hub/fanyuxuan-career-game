import { equipments } from '../data/equipments';
import { buffPool } from '../data/buffs';
import { gameTypes } from '../data/gameTypes';
import { advanceRound, applyLevelUp, applyStatEffect, consumeBuffs } from './gameLogic';

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

function pickMany(list, count) {
  const copied = [...list];
  const result = [];
  while (copied.length && result.length < count) {
    const index = Math.floor(Math.random() * copied.length);
    result.push(copied.splice(index, 1)[0]);
  }
  return result;
}

export function createRewardOptions(player, npc) {
  const availableEquipments = equipments.filter((item) => !player.equipments.includes(item.id));
  const equipmentChoices = pickMany(availableEquipments, 2).map((equipment) => ({
    id: `equipment-${equipment.id}`,
    type: 'equipment',
    title: equipment.name,
    desc: equipment.desc,
    payload: equipment,
    effectText: `获得装备 · ${equipment.rarity}`,
  }));

  const buffChoices = pickMany(buffPool, 1).map((buff) => ({
    id: `buff-${buff.id}`,
    type: 'buff',
    title: buff.name,
    desc: buff.desc,
    payload: buff,
    effectText: `获得 Buff · 持续 ${buff.duration} 关`,
  }));

  const statChoice = {
    id: `stat-${npc.id}`,
    type: 'stat',
    title: `${npc.role}心得`,
    desc: `吸收 ${npc.name} 的风格，获得一组属性成长。`,
    payload: npc.statReward || { reputation: 2 },
    effectText: '属性成长',
  };

  return pickMany([...equipmentChoices, ...buffChoices, statChoice], 3);
}

export function settleWin(player, gameType, npc) {
  const game = gameTypes.find((item) => item.type === gameType);
  const baseExp = game?.rewardBase || 25;
  const randomExp = Math.floor(Math.random() * 11);
  let gainedExp = baseExp + randomExp + npc.difficulty * 4;

  gainedExp += getEquipmentBonus(player, 'expBonus');
  gainedExp += Math.floor((player.reputation + player.paperwork + player.social) / 12);

  const doubleExpBuff = player.buffs.find((buff) => buff.effectType === 'doubleExp');
  const extraExpBuff = player.buffs.find((buff) => buff.effectType === 'extraExp');
  if (doubleExpBuff) gainedExp *= doubleExpBuff.effectValue;
  if (extraExpBuff) gainedExp += extraExpBuff.effectValue;

  let nextPlayer = applyStatEffect({
    ...player,
    exp: player.exp + gainedExp,
    winCount: player.winCount + 1,
    currentNpcIndex: Math.min(player.currentNpcIndex + 1, 99),
    defeatedNpcs: [...new Set([...(player.defeatedNpcs || []), npc.id])],
  }, {
    pressure: Math.max(2, npc.difficulty * 2 - 2),
    reputation: 1,
    ...(npc.statReward || {}),
  });

  nextPlayer = consumeBuffs(nextPlayer);
  nextPlayer = applyLevelUp(nextPlayer);

  return {
    player: nextPlayer,
    reward: {
      exp: gainedExp,
      rewardOptions: createRewardOptions(nextPlayer, npc),
      levelUps: nextPlayer.levelUps || [],
      text: '范宇轩沉稳发挥，成功拿下本轮考验！现在可以选择一项战利品。',
    },
  };
}

export function applyRewardChoice(player, rewardChoice) {
  let nextPlayer = { ...player };

  if (rewardChoice.type === 'equipment') {
    nextPlayer = {
      ...nextPlayer,
      equipments: [...new Set([...nextPlayer.equipments, rewardChoice.payload.id])],
    };
  }

  if (rewardChoice.type === 'buff') {
    nextPlayer = {
      ...nextPlayer,
      completedBuffCount: nextPlayer.completedBuffCount + 1,
      buffs: [
        ...nextPlayer.buffs.filter((buff) => buff.id !== rewardChoice.payload.id),
        { ...rewardChoice.payload },
      ],
    };
  }

  if (rewardChoice.type === 'stat') {
    nextPlayer = applyStatEffect(nextPlayer, rewardChoice.payload);
  }

  nextPlayer = applyLevelUp(nextPlayer);
  return advanceRound(nextPlayer);
}

export function settleLose(player, npc) {
  const penalty = npc?.id === 'li-huan'
    ? { pressure: 14, gossip: 10, reputation: -2 }
    : { pressure: 10, gossip: 3, reputation: -1 };

  return advanceRound(applyStatEffect({
    ...consumeBuffs(player),
    loseCount: player.loseCount + 1,
  }, penalty));
}
