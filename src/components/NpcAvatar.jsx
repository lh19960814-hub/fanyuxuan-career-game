import liHuanAvatar from '../assets/npcs/li-huan.png';
import sunTianyiAvatar from '../assets/npcs/sun-tianyi.png';
import heSanjiangAvatar from '../assets/npcs/he-sanjiang.png';
import renXingyunAvatar from '../assets/npcs/ren-xingyun.png';
import guoPengqiangAvatar from '../assets/npcs/guo-pengqiang.png';
import zhangNianjieAvatar from '../assets/npcs/zhang-nianjie.png';
import yinYuanAvatar from '../assets/npcs/yin-yuan.png';
import leaderLiAvatar from '../assets/npcs/leader-li.png';
import xuChaochaoAvatar from '../assets/npcs/xu-chaochao.png';
import gaoLaoshiAvatar from '../assets/npcs/gao-laoshi.png';
import gaoZijianAvatar from '../assets/npcs/gao-zijian.png';
import zhaoQianhongAvatar from '../assets/npcs/zhao-qianhong.png';
import gongQinglinAvatar from '../assets/npcs/gong-qinglin.png';
import yangShuyuanAvatar from '../assets/npcs/yang-shuyuan.png';

const npcAvatarMap = {
  'li-huan': liHuanAvatar,
  'sun-tianyi': sunTianyiAvatar,
  'he-sanjiang': heSanjiangAvatar,
  'ren-xingyun': renXingyunAvatar,
  'guo-pengqiang': guoPengqiangAvatar,
  'zhang-nianjie': zhangNianjieAvatar,
  'yin-yuan': yinYuanAvatar,
  'leader-li': leaderLiAvatar,
  'xu-chaochao': xuChaochaoAvatar,
  'gao-laoshi': gaoLaoshiAvatar,
  'gao-zijian': gaoZijianAvatar,
  'zhao-qianhong': zhaoQianhongAvatar,
  'gong-qinglin': gongQinglinAvatar,
  'yang-shuyuan': yangShuyuanAvatar,
};

export default function NpcAvatar({ npc, size = 'normal' }) {
  const avatar = npcAvatarMap[npc.id];

  return (
    <div className={`quiz-npc-avatar quiz-npc-avatar--${size} quiz-npc-avatar--${npc.visualStyle} ${avatar ? 'quiz-npc-avatar--image' : ''}`}>
      {avatar ? <img src={avatar} alt="" draggable="false" /> : npc.name.slice(0, 1)}
    </div>
  );
}
