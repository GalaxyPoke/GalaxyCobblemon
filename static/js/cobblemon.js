// Cobblemon 百科 JavaScript

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  AOS.init({ duration: 800, once: true });
  initParticles();
  initTabs();
  initFilters();
  initSearch();
  
  // 页面加载完成后隐藏加载动画
  window.addEventListener('load', function() {
    setTimeout(function() {
      document.getElementById('pageLoader').classList.add('hidden');
    }, 500);
  });
});

// 粒子背景
function initParticles() {
  particlesJS('particles-js', {
    particles: {
      number: { value: 30, density: { enable: true, value_area: 800 } },
      color: { value: '#8b7355' },
      shape: { type: 'circle' },
      opacity: { value: 0.3, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#8b7355', opacity: 0.2, width: 1 },
      move: { enable: true, speed: 1, direction: 'none', random: true, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, resize: true },
      modes: { grab: { distance: 180, line_linked: { opacity: 0.3 } } }
    }
  });
}

// 标签页切换
function initTabs() {
  const tabs = document.querySelectorAll('.cobblemon-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function switchTab(target) {
  document.querySelectorAll('.cobblemon-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${target}"]`).classList.add('active');
  
  document.querySelectorAll('.cobblemon-panel').forEach(p => {
    p.classList.remove('active');
    if (p.dataset.panel === target) {
      p.classList.add('active');
      loadPanelData(target);
    }
  });
}

// 加载面板数据
function loadPanelData(panel) {
  switch(panel) {
    case 'biomes': loadBiomes(); break;
    case 'items': loadItems(); break;
    case 'evolution': loadEvolutions(); break;
    case 'mounts': loadMounts(); break;
    case 'cooking': loadRecipes(); break;
    case 'models': loadModels(); break;
  }
}

// 生物群系数据
const biomeData = [
  { id: 'plains', name: '平原', nameEn: 'Plains', category: 'plains', pokemon: ['皮卡丘', '小拉达', '波波', '尼多兰', '尼多朗', '拉达', '烈雀'] },
  { id: 'sunflower_plains', name: '向日葵平原', nameEn: 'Sunflower Plains', category: 'plains', pokemon: ['向日种子', '向日花怪', '皮卡丘', '伊布'] },
  { id: 'forest', name: '森林', nameEn: 'Forest', category: 'forest', pokemon: ['绿毛虫', '独角虫', '皮丘', '走路草', '派拉斯', '毛球'] },
  { id: 'flower_forest', name: '繁花森林', nameEn: 'Flower Forest', category: 'forest', pokemon: ['妙蛙种子', '走路草', '蔓藤怪', '美丽花', '蝴蝶'] },
  { id: 'birch_forest', name: '白桦森林', nameEn: 'Birch Forest', category: 'forest', pokemon: ['喇叭芽', '臭臭花', '蔓藤怪', '毽子草'] },
  { id: 'dark_forest', name: '黑森林', nameEn: 'Dark Forest', category: 'forest', pokemon: ['鬼斯', '鬼斯通', '梦妖', '黑暗鸦', '蘑蘑菇'] },
  { id: 'taiga', name: '针叶林', nameEn: 'Taiga', category: 'forest', pokemon: ['六尾', '伊布', '熊宝宝', '圈圈熊'] },
  { id: 'snowy_taiga', name: '积雪针叶林', nameEn: 'Snowy Taiga', category: 'snow', pokemon: ['六尾(阿罗拉)', '冰伊布', '信使鸟', '雪童子'] },
  { id: 'mountains', name: '山地', nameEn: 'Mountains', category: 'mountain', pokemon: ['小拳石', '隆隆石', '大岩蛇', '超音蝠', '地鼠'] },
  { id: 'snowy_mountains', name: '雪山', nameEn: 'Snowy Mountains', category: 'snow', pokemon: ['雪童子', '冰鬼护', '暴雪王', '冰伊布'] },
  { id: 'ocean', name: '海洋', nameEn: 'Ocean', category: 'ocean', pokemon: ['玛瑙水母', '墨海马', '角金鱼', '鲤鱼王', '铁炮鱼'] },
  { id: 'deep_ocean', name: '深海', nameEn: 'Deep Ocean', category: 'ocean', pokemon: ['暴鲤龙', '乘龙', '铁炮鱼', '章鱼桶'] },
  { id: 'warm_ocean', name: '暖水海洋', nameEn: 'Warm Ocean', category: 'ocean', pokemon: ['太阳珊瑚', '爱心鱼', '珍珠贝', '海星星'] },
  { id: 'beach', name: '沙滩', nameEn: 'Beach', category: 'ocean', pokemon: ['可达鸭', '大舌贝', '海星星', '呆呆兽'] },
  { id: 'desert', name: '沙漠', nameEn: 'Desert', category: 'desert', pokemon: ['穿山鼠', '地鼠', '沙漠奈亚', '龙地鼠'] },
  { id: 'badlands', name: '恶地', nameEn: 'Badlands', category: 'desert', pokemon: ['小火马', '卡蒂狗', '熔岩虫', '煤炭龟'] },
  { id: 'swamp', name: '沼泽', nameEn: 'Swamp', category: 'plains', pokemon: ['蚊香蝌蚪', '臭泥', '毒刺水母', '泥泥鳅'] },
  { id: 'jungle', name: '丛林', nameEn: 'Jungle', category: 'forest', pokemon: ['猴怪', '大食花', '毽子草', '热带龙'] },
  { id: 'savanna', name: '热带草原', nameEn: 'Savanna', category: 'plains', pokemon: ['长颈鹿', '顿甲', '土台龟', '斑斑马'] },
  { id: 'ice_spikes', name: '冰刺平原', nameEn: 'Ice Spikes', category: 'snow', pokemon: ['海豹球', '白海狮', '冰伊布', '冰鬼护'] },
  { id: 'dripstone_caves', name: '溶洞', nameEn: 'Dripstone Caves', category: 'cave', pokemon: ['超音蝠', '大嘴蝠', '小拳石', '隆隆石'] },
  { id: 'lush_caves', name: '繁茂洞穴', nameEn: 'Lush Caves', category: 'cave', pokemon: ['派拉斯', '宝芽', '木守宫', '蘑蘑菇'] },
  { id: 'deep_dark', name: '深暗之域', nameEn: 'Deep Dark', category: 'cave', pokemon: ['鬼斯', '耿鬼', '黑暗鸦', '勾魂眼'] }
];

function loadBiomes() {
  const grid = document.getElementById('biomeGrid');
  if (grid.children.length > 0) return;
  
  grid.innerHTML = biomeData.map(biome => `
    <div class="biome-card" data-category="${biome.category}" onclick="showBiomeDetail('${biome.id}')">
      <div class="biome-name">${biome.name}</div>
      <div class="biome-count">${biome.nameEn} · ${biome.pokemon.length} 种宝可梦</div>
    </div>
  `).join('');
}

function showBiomeDetail(biomeId) {
  const biome = biomeData.find(b => b.id === biomeId);
  if (!biome) return;
  
  // 创建或获取模态框
  let modal = document.getElementById('biomeDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'biomeDetailModal';
    modal.className = 'item-modal';
    modal.innerHTML = `
      <div class="item-modal-backdrop" onclick="closeBiomeModal()"></div>
      <div class="item-modal-content">
        <button class="item-modal-close" onclick="closeBiomeModal()"><i class="bi bi-x-lg"></i></button>
        <div class="item-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // 生成宝可梦列表HTML
  const pokemonListHtml = biome.pokemon.map(p => `<span class="biome-pokemon-tag">${p}</span>`).join('');
  
  const categoryNames = {
    plains: '平原类',
    forest: '森林类', 
    mountain: '山地类',
    ocean: '海洋类',
    desert: '沙漠类',
    snow: '雪地类',
    cave: '洞穴类'
  };
  
  modal.querySelector('.item-modal-body').innerHTML = `
    <div class="item-detail-header">
      <div class="biome-icon-box">
        <i class="bi bi-map"></i>
      </div>
      <div class="item-detail-title">
        <h3>${biome.name}</h3>
        <span class="item-detail-en">${biome.nameEn}</span>
      </div>
    </div>
    <div class="item-detail-stats">
      <div class="item-stat">
        <span class="item-stat-label">群系类型</span>
        <span class="item-stat-value">${categoryNames[biome.category] || biome.category}</span>
      </div>
      <div class="item-stat">
        <span class="item-stat-label">可捕获数量</span>
        <span class="item-stat-value catch-rate">${biome.pokemon.length} 种</span>
      </div>
    </div>
    <div class="item-detail-desc">
      <h4><i class="bi bi-stars"></i> 可捕获的宝可梦</h4>
      <div class="biome-pokemon-list">${pokemonListHtml}</div>
    </div>
  `;
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeBiomeModal() {
  const modal = document.getElementById('biomeDetailModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// 物品数据 - Cobblemon 本地图标（含详细说明）
const ITEM_SPRITE_URL = 'static/image/items/';
const MATERIAL_SPRITE_URL = 'static/image/materials/';

// 材料图标映射 - 全部使用本地贴图
const materialIcons = {
  // 球果 (Cobblemon)
  'red_apricorn': { name: '红色球果', file: 'red_apricorn.png' },
  'blue_apricorn': { name: '蓝色球果', file: 'blue_apricorn.png' },
  'yellow_apricorn': { name: '黄色球果', file: 'yellow_apricorn.png' },
  'green_apricorn': { name: '绿色球果', file: 'green_apricorn.png' },
  'pink_apricorn': { name: '粉色球果', file: 'pink_apricorn.png' },
  'black_apricorn': { name: '黑色球果', file: 'black_apricorn.png' },
  'white_apricorn': { name: '白色球果', file: 'white_apricorn.png' },
  // 滚石 (Cobblemon)
  'tumblestone': { name: '滚石', file: 'tumblestone.png' },
  'black_tumblestone': { name: '黑滚石', file: 'black_tumblestone.png' },
  'sky_tumblestone': { name: '天空滚石', file: 'sky_tumblestone.png' },
  // Minecraft原版材料 - 使用本地贴图
  'copper_ingot': { name: '铜锭', file: 'copper_ingot.png' },
  'iron_ingot': { name: '铁锭', file: 'iron_ingot.png' },
  'gold_ingot': { name: '金锭', file: 'gold_ingot.png' },
  'diamond': { name: '钻石', file: 'diamond.png' },
  'netherite_ingot': { name: '下界合金锭', file: 'netherite_ingot.png' },
  'nether_star': { name: '下界之星', file: 'nether_star.png' },
  'shulker_shell': { name: '潜影壳', file: 'shulker_shell.png' },
  'echo_shard': { name: '回响碎片', file: 'echo_shard.png' }
};

// 生成材料图标HTML
function getMaterialIcon(materialKey, count = 1) {
  const material = materialIcons[materialKey];
  if (!material) return `<span class="craft-text">${materialKey}</span>`;
  
  const imgSrc = MATERIAL_SPRITE_URL + material.file;
  return `
    <div class="craft-item" title="${material.name}">
      <img src="${imgSrc}" alt="${material.name}" onerror="this.parentElement.innerHTML='<span class=\\'craft-text\\'>${material.name}</span>'">
      ${count > 1 ? `<span class="craft-count">×${count}</span>` : ''}
    </div>
  `;
}

// 生成合成配方HTML - 3x3工作台格式
function getCraftRecipeHtml(craftGrid, resultItem) {
  if (!craftGrid || craftGrid.length === 0) return '<p>暂无合成配方</p>';
  
  // craftGrid是一个9格数组，表示3x3工作台的位置 [0-8]
  // 位置: 0 1 2
  //       3 4 5
  //       6 7 8
  
  let gridHtml = '';
  for (let i = 0; i < 9; i++) {
    const slot = craftGrid[i];
    if (slot && slot.material) {
      gridHtml += getMaterialIcon(slot.material, slot.count || 1);
    } else {
      gridHtml += '<div class="craft-slot empty"></div>';
    }
  }
  
  return `
    <div class="crafting-table-container">
      <div class="crafting-grid">
        ${gridHtml}
      </div>
      <div class="crafting-arrow">
        <i class="bi bi-arrow-right"></i>
      </div>
      <div class="crafting-result">
        ${resultItem ? `<img src="${ITEM_SPRITE_URL}${resultItem}.png" alt="结果" class="result-icon">` : ''}
      </div>
    </div>
  `;
}

// 旧版简单配方格式转换为3x3格式
function convertToGrid(craftItems) {
  if (!craftItems || craftItems.length === 0) return null;
  
  // 简单的转换逻辑：将材料按顺序放入格子
  const grid = new Array(9).fill(null);
  let pos = 0;
  
  craftItems.forEach(item => {
    const count = item.count || 1;
    // 如果数量大于1，尝试填充多个格子
    if (count <= 4) {
      // 对于4个相同材料，放在四角
      if (count === 4) {
        grid[0] = { material: item.material, count: 1 };
        grid[2] = { material: item.material, count: 1 };
        grid[6] = { material: item.material, count: 1 };
        grid[8] = { material: item.material, count: 1 };
      } else if (count === 2) {
        grid[pos] = { material: item.material, count: 1 };
        grid[pos + 1] = { material: item.material, count: 1 };
        pos += 2;
      } else {
        grid[pos] = { material: item.material, count: 1 };
        pos++;
      }
    } else {
      grid[pos] = { material: item.material, count: count };
      pos++;
    }
  });
  
  return grid;
}
const itemData = [
  // 精灵球 - 含捕获率和特殊效果说明（craftGrid为3x3工作台格式）
  // 工作台位置: 0 1 2 / 3 4 5 / 6 7 8
  { name: '精灵球', file: 'poke_ball', category: 'pokeball', nameEn: 'Poké Ball', tier: '基础', catchRate: '1×', desc: '每位训练家的起点！这是最经典的红白配色精灵球，虽然捕获率不高，但胜在制作简单、成本低廉。刚开始冒险时，建议多准备一些，遇到心仪的宝可梦时先用招式削弱它的HP，再投掷精灵球，成功率会大大提升哦！', craft: '红色球果 + 铜锭', 
    craftGrid: [
      {material: 'red_apricorn'}, {material: 'red_apricorn'}, {material: 'red_apricorn'},
      {material: 'red_apricorn'}, {material: 'copper_ingot'}, {material: 'red_apricorn'},
      {material: 'red_apricorn'}, {material: 'red_apricorn'}, {material: 'red_apricorn'}
    ] },
  { name: '超级球', file: 'great_ball', category: 'pokeball', nameEn: 'Great Ball', tier: '二阶', catchRate: '1.5×', desc: '蓝色条纹的升级版精灵球！捕获率比普通精灵球高出50%，是中期冒险的得力助手。当你开始挑战更强的宝可梦时，超级球会成为你背包里的常客。性价比很高，推荐大量制作备用！', craft: '蓝色球果 + 红色球果 + 铁锭',
    craftGrid: [
      {material: 'blue_apricorn'}, {material: 'red_apricorn'}, {material: 'blue_apricorn'},
      {material: 'red_apricorn'}, {material: 'iron_ingot'}, {material: 'red_apricorn'},
      {material: 'blue_apricorn'}, {material: 'red_apricorn'}, {material: 'blue_apricorn'}
    ] },
  { name: '高级球', file: 'ultra_ball', category: 'pokeball', nameEn: 'Ultra Ball', tier: '三阶', catchRate: '2×', desc: '黑黄配色的高端精灵球，捕获率是普通精灵球的两倍！当你在野外遇到稀有宝可梦或者高等级的强敌时，高级球是最可靠的选择。虽然需要金锭来制作，但绝对物有所值。建议随身携带10个以上，以备不时之需！', craft: '黑色球果 + 黄色球果 + 金锭',
    craftGrid: [
      {material: 'black_apricorn'}, {material: 'yellow_apricorn'}, {material: 'black_apricorn'},
      {material: 'yellow_apricorn'}, {material: 'gold_ingot'}, {material: 'yellow_apricorn'},
      {material: 'black_apricorn'}, {material: 'yellow_apricorn'}, {material: 'black_apricorn'}
    ] },
  { name: '大师球', file: 'master_ball', category: 'pokeball', nameEn: 'Master Ball', tier: '最高', catchRate: '100%', desc: '传说中的究极精灵球！紫色的神秘外观下蕴含着100%的捕获率，无论多么强大的宝可梦都无法逃脱。但制作它需要击败凋灵获得下界之星、收集大量潜影壳，还要用到珍贵的下界合金锭。请务必把它留给最特别的宝可梦——比如传说中的神兽或者那只让你心跳加速的闪光宝可梦！另外，由于使用了下界合金，即使掉进岩浆也不会烧毁哦~', craft: '下界之星 + 潜影壳 + 下界合金锭',
    craftGrid: [
      {material: 'shulker_shell'}, {material: 'nether_star'}, {material: 'shulker_shell'},
      {material: 'shulker_shell'}, {material: 'netherite_ingot'}, {material: 'shulker_shell'},
      {material: 'shulker_shell'}, {material: 'shulker_shell'}, {material: 'shulker_shell'}
    ] },
  { name: '快速球', file: 'quick_ball', category: 'pokeball', nameEn: 'Quick Ball', tier: '三阶', catchRate: '5×/1×', desc: '速度就是一切！这个蓝黄相间的精灵球在战斗开始的第一回合拥有惊人的5倍捕获率。秘诀是：遇到宝可梦后不要犹豫，立刻投掷！如果第一回合没抓到，之后就会变成普通的1倍捕获率。刷图鉴、抓Pokemon的效率神器，强烈推荐大量携带！', craft: '蓝色球果 + 黄色球果 + 金锭',
    craftGrid: [
      {material: 'blue_apricorn'}, {material: 'yellow_apricorn'}, {material: 'blue_apricorn'},
      {material: 'yellow_apricorn'}, {material: 'gold_ingot'}, {material: 'yellow_apricorn'},
      {material: 'blue_apricorn'}, {material: 'yellow_apricorn'}, {material: 'blue_apricorn'}
    ] },
  { name: '黑暗球', file: 'dusk_ball', category: 'pokeball', nameEn: 'Dusk Ball', tier: '三阶', catchRate: '3~3.5×', desc: '黑夜与洞穴的守护者！这个墨绿色的精灵球在黑暗环境中会发挥出惊人的实力。当你在伸手不见五指的矿洞深处探险，或者在月黑风高的夜晚狩猎时，黑暗球的捕获率可以达到3.5倍！光照越低效果越好，是洞穴探险和夜间冒险的必备神器。', craft: '黑色球果 + 绿色球果 + 金锭',
    craftGrid: [
      {material: 'black_apricorn'}, {material: 'green_apricorn'}, {material: 'black_apricorn'},
      {material: 'green_apricorn'}, {material: 'gold_ingot'}, {material: 'green_apricorn'},
      {material: 'black_apricorn'}, {material: 'green_apricorn'}, {material: 'black_apricorn'}
    ] },
  { name: '潜水球', file: 'dive_ball', category: 'pokeball', nameEn: 'Dive Ball', tier: '二阶', catchRate: '3.5×', desc: '深海探险家的最佳伙伴！这个蓝粉配色的精灵球专为水下捕捉而设计。当你潜入海底寻找水系宝可梦时，潜水球的捕获率高达3.5倍！更神奇的是，它在水下投掷时完全不受水的阻力影响，飞行轨迹和在陆地上一模一样。探索海洋时记得多带几个！', craft: '蓝色球果 + 粉色球果 + 铁锭',
    craftGrid: [
      {material: 'blue_apricorn'}, {material: 'pink_apricorn'}, {material: 'blue_apricorn'},
      {material: 'pink_apricorn'}, {material: 'iron_ingot'}, {material: 'pink_apricorn'},
      {material: 'blue_apricorn'}, {material: 'pink_apricorn'}, {material: 'blue_apricorn'}
    ] },
  { name: '巢穴球', file: 'nest_ball', category: 'pokeball', nameEn: 'Nest Ball', tier: '二阶', catchRate: '1~4×', desc: '新手宝可梦的温柔捕手！这个绿色的精灵球对低等级的宝可梦特别有效。目标等级越低，捕获率越高，最高可达4倍！当你刚开始冒险，想要收集一些低等级的宝可梦来培养时，巢穴球是绝佳选择。不过要注意，对30级以上的宝可梦效果就不明显了。', craft: '绿色球果 + 红色球果 + 铁锭',
    craftGrid: [
      {material: 'green_apricorn'}, {material: 'red_apricorn'}, {material: 'green_apricorn'},
      {material: 'red_apricorn'}, {material: 'iron_ingot'}, {material: 'red_apricorn'},
      {material: 'green_apricorn'}, {material: 'red_apricorn'}, {material: 'green_apricorn'}
    ] },
  { name: '计时球', file: 'timer_ball', category: 'pokeball', nameEn: 'Timer Ball', tier: '三阶', catchRate: '1~4×', desc: '耐心的回报！这个红白相间的精灵球会随着战斗时间的增加而变得更强。每过一个回合，捕获率就会提升一点，最高可达4倍！当你遇到一只特别难抓的宝可梦，打了很久还没抓到时，计时球就是你的救星。记住：战斗越久，效果越好！', craft: '红色球果 + 白色球果 + 金锭',
    craftGrid: [
      {material: 'red_apricorn'}, {material: 'white_apricorn'}, {material: 'red_apricorn'},
      {material: 'white_apricorn'}, {material: 'gold_ingot'}, {material: 'white_apricorn'},
      {material: 'red_apricorn'}, {material: 'white_apricorn'}, {material: 'red_apricorn'}
    ] },
  { name: '重复球', file: 'repeat_ball', category: 'pokeball', nameEn: 'Repeat Ball', tier: '三阶', catchRate: '3.5×/1×', desc: '图鉴收集家的好帮手！如果你已经抓到过某种宝可梦，再次遇到同类时使用重复球，捕获率会高达3.5倍！这对于刷闪光宝可梦、刷特定性格或者收集多只同样的宝可梦来说简直是神器。刷闪党必备！', craft: '红色球果 + 黄色球果 + 金锭',
    craftGrid: [
      {material: 'red_apricorn'}, {material: 'yellow_apricorn'}, {material: 'red_apricorn'},
      {material: 'yellow_apricorn'}, {material: 'gold_ingot'}, {material: 'yellow_apricorn'},
      {material: 'red_apricorn'}, {material: 'yellow_apricorn'}, {material: 'red_apricorn'}
    ] },
  { name: '豪华球', file: 'luxury_ball', category: 'pokeball', nameEn: 'Luxury Ball', tier: '三阶', catchRate: '1×', desc: '尊贵的宝可梦之家！这个黑金配色的精灵球虽然捕获率普通，但它有一个特殊能力：用它捕获的宝可梦亲密度提升速度会翻倍！如果你想要培养需要高亲密度才能进化的宝可梦（比如伊布进化成仙子伊布或月亮伊布），豪华球是最明智的选择！', craft: '红色球果 + 黑色球果 + 金锭',
    craftGrid: [
      {material: 'red_apricorn'}, {material: 'black_apricorn'}, {material: 'red_apricorn'},
      {material: 'black_apricorn'}, {material: 'gold_ingot'}, {material: 'black_apricorn'},
      {material: 'red_apricorn'}, {material: 'black_apricorn'}, {material: 'red_apricorn'}
    ] },
  { name: '先机球', file: 'premier_ball', category: 'pokeball', nameEn: 'Premier Ball', tier: '基础', catchRate: '1×', desc: '纯白如雪的精灵球！虽然捕获率和普通精灵球一样，但它的纯白外观让很多训练家爱不释手。在Cobblemon中，你可以直接用白色球果合成，不像原作那样需要购买。很多人喜欢用它来捕捉闪光宝可梦，因为白色和闪光很配哦！', craft: '白色球果 + 铜锭',
    craftGrid: [
      {material: 'white_apricorn'}, {material: 'white_apricorn'}, {material: 'white_apricorn'},
      {material: 'white_apricorn'}, {material: 'copper_ingot'}, {material: 'white_apricorn'},
      {material: 'white_apricorn'}, {material: 'white_apricorn'}, {material: 'white_apricorn'}
    ] },
  { name: '治愈球', file: 'heal_ball', category: 'pokeball', nameEn: 'Heal Ball', tier: '一阶', catchRate: '1×', desc: '温柔的治愈之球！这个粉白配色的精灵球有一个贴心的功能：捕获成功后，宝可梦的HP、PP和所有异常状态都会立即完全恢复！在野外长时间探险时特别有用，抓到就能立刻上场战斗，不需要回家恢复。对新手来说是非常友好的选择！', craft: '粉色球果 + 白色球果',
    craftGrid: [
      {material: 'pink_apricorn'}, {material: 'white_apricorn'}, {material: 'pink_apricorn'},
      {material: 'white_apricorn'}, null, {material: 'white_apricorn'},
      {material: 'pink_apricorn'}, {material: 'white_apricorn'}, {material: 'pink_apricorn'}
    ] },
  { name: '网球', file: 'net_ball', category: 'pokeball', nameEn: 'Net Ball', tier: '二阶', catchRate: '3×', desc: '虫系和水系的克星！这个蓝黑网状设计的精灵球对虫系和水系宝可梦有着3倍捕获率！当你在森林里抓虫子，或者在河边抓鱼时，网球是最靠谱的选择。建议探索水域和森林时多带一些！', craft: '蓝色球果 + 黑色球果 + 铁锭',
    craftGrid: [
      {material: 'blue_apricorn'}, {material: 'black_apricorn'}, {material: 'blue_apricorn'},
      {material: 'black_apricorn'}, {material: 'iron_ingot'}, {material: 'black_apricorn'},
      {material: 'blue_apricorn'}, {material: 'black_apricorn'}, {material: 'blue_apricorn'}
    ] },
  { name: '月亮球', file: 'moon_ball', category: 'pokeball', nameEn: 'Moon Ball', tier: '二阶', catchRate: '1~4×', desc: '月光的祝福！这个神秘的蓝黄色精灵球与月亮有着奇妙的联系。在夜晚使用时，月相越接近满月，捕获率越高，最高可达4倍！满月之夜是使用月亮球的最佳时机。注意：只在夜间有效，白天使用就是普通捕获率哦！', craft: '蓝色球果 + 黄色球果 + 铁锭',
    craftGrid: [
      {material: 'blue_apricorn'}, {material: 'yellow_apricorn'}, {material: 'blue_apricorn'},
      {material: 'yellow_apricorn'}, {material: 'iron_ingot'}, {material: 'yellow_apricorn'},
      {material: 'blue_apricorn'}, {material: 'yellow_apricorn'}, {material: 'blue_apricorn'}
    ] },
  { name: '友友球', file: 'friend_ball', category: 'pokeball', nameEn: 'Friend Ball', tier: '二阶', catchRate: '1×', desc: '友谊的起点！这个绿黄配色的精灵球虽然捕获率普通，但用它捕获的宝可梦一开始就会对你充满好感！初始亲密度高达150，这对于需要高亲密度进化的宝可梦来说简直是天大的福音。想要快速培养伊布进化成仙子伊布或月亮伊布？用友友球就对了！', craft: '绿色球果 + 黄色球果 + 铁锭',
    craftGrid: [
      {material: 'green_apricorn'}, {material: 'yellow_apricorn'}, {material: 'green_apricorn'},
      {material: 'yellow_apricorn'}, {material: 'iron_ingot'}, {material: 'yellow_apricorn'},
      {material: 'green_apricorn'}, {material: 'yellow_apricorn'}, {material: 'green_apricorn'}
    ] },
  { name: '等级球', file: 'level_ball', category: 'pokeball', nameEn: 'Level Ball', tier: '二阶', catchRate: '1~4×', desc: '你的宝可梦等级越高于目标，效果越好。等级4倍以上时捕获率4倍，2倍以上3倍，高于目标2倍。', craft: '红色球果 + 黄色球果 + 铁锭',
    craftGrid: [
      {material: 'red_apricorn'}, {material: 'yellow_apricorn'}, {material: 'red_apricorn'},
      {material: 'yellow_apricorn'}, {material: 'iron_ingot'}, {material: 'yellow_apricorn'},
      {material: 'red_apricorn'}, {material: 'yellow_apricorn'}, {material: 'red_apricorn'}
    ] },
  { name: '诱饵球', file: 'lure_ball', category: 'pokeball', nameEn: 'Lure Ball', tier: '二阶', catchRate: '2×', desc: '对通过钓鱼竿钓上来的宝可梦捕获率2倍。钓鱼爱好者必备！', craft: '多色球果 + 铁锭', craftItems: [{material: 'blue_apricorn', count: 2}, {material: 'red_apricorn', count: 1}, {material: 'iron_ingot', count: 1}] },
  { name: '速度球', file: 'fast_ball', category: 'pokeball', nameEn: 'Fast Ball', tier: '二阶', catchRate: '4×/1×', desc: '对基础速度100以上的宝可梦捕获率4倍！抓高速宝可梦的神器。', craft: '多色球果 + 铁锭', craftItems: [{material: 'yellow_apricorn', count: 2}, {material: 'red_apricorn', count: 1}, {material: 'iron_ingot', count: 1}] },
  { name: '沉重球', file: 'heavy_ball', category: 'pokeball', nameEn: 'Heavy Ball', tier: '二阶', catchRate: '1~4×', desc: '目标越重效果越好。300kg以上4倍，200-299kg 2.5倍，100-199kg 1.5倍。抓大型宝可梦专用！', craft: '多色球果 + 铁锭', craftItems: [{material: 'black_apricorn', count: 2}, {material: 'blue_apricorn', count: 1}, {material: 'iron_ingot', count: 1}] },
  { name: '甜蜜球', file: 'love_ball', category: 'pokeball', nameEn: 'Love Ball', tier: '三阶', catchRate: '8×/1×', desc: '如果目标与你的宝可梦同种且异性，捕获率高达8倍！否则只有1倍。', craft: '多色球果 + 金锭', craftItems: [{material: 'pink_apricorn', count: 2}, {material: 'red_apricorn', count: 1}, {material: 'gold_ingot', count: 1}] },
  { name: '梦境球', file: 'dream_ball', category: 'pokeball', nameEn: 'Dream Ball', tier: '四阶', catchRate: '4×/1×', desc: '对睡眠状态的宝可梦捕获率4倍。需要钻石合成的高级球！', craft: '多色球果 + 钻石', craftItems: [{material: 'pink_apricorn', count: 1}, {material: 'white_apricorn', count: 1}, {material: 'diamond', count: 1}] },
  { name: '野兽球', file: 'beast_ball', category: 'pokeball', nameEn: 'Beast Ball', tier: '四阶', catchRate: '5×/0.1×', desc: '专门用于捕获究极异兽，对它们捕获率5倍。但对普通宝可梦只有0.1倍！其他球对究极异兽也只有0.1倍。', craft: '回响碎片 + 金锭 + 钻石', craftItems: [{material: 'echo_shard', count: 1}, {material: 'gold_ingot', count: 1}, {material: 'diamond', count: 1}] },
  { name: '珍藏球', file: 'cherish_ball', category: 'pokeball', nameEn: 'Cherish Ball', tier: '特殊', catchRate: '1×', desc: '无法通过正常方式获得的特殊球。通常用于服务器活动分发的特殊宝可梦。', craft: '无法合成' },
  { name: '狩猎球', file: 'safari_ball', category: 'pokeball', nameEn: 'Safari Ball', tier: '一阶', catchRate: '1.5×', desc: '在战斗外使用时捕获率1.5倍。直接投掷不进入战斗！', craft: '多色球果', craftItems: [{material: 'green_apricorn', count: 2}, {material: 'yellow_apricorn', count: 1}] },
  { name: '公园球', file: 'park_ball', category: 'pokeball', nameEn: 'Park Ball', tier: '二阶', catchRate: '2.5×/1×', desc: '在森林或平原生物群系中使用时捕获率2.5倍。设计灵感来自动画第161集！', craft: '多色球果 + 铁锭', craftItems: [{material: 'green_apricorn', count: 1}, {material: 'yellow_apricorn', count: 1}, {material: 'iron_ingot', count: 1}] },
  { name: '竞技球', file: 'sport_ball', category: 'pokeball', nameEn: 'Sport Ball', tier: '二阶', catchRate: '1.5×', desc: '捕获率1.5倍的竞技用球。功能可能在未来更新中调整。', craft: '多色球果 + 铁锭', craftItems: [{material: 'red_apricorn', count: 1}, {material: 'white_apricorn', count: 1}, {material: 'iron_ingot', count: 1}] },
  { name: '蔚蓝球', file: 'azure_ball', category: 'pokeball', nameEn: 'Azure Ball', tier: '基础', catchRate: '1×', desc: 'Cobblemon原创球种！需要4个蓝色球果和铜锭合成。', craft: '4蓝色球果 + 铜锭', craftItems: [{material: 'blue_apricorn', count: 4}, {material: 'copper_ingot', count: 1}] },
  { name: '黄晶球', file: 'citrine_ball', category: 'pokeball', nameEn: 'Citrine Ball', tier: '基础', catchRate: '1×', desc: 'Cobblemon原创球种！需要4个黄色球果和铜锭合成。', craft: '4黄色球果 + 铜锭', craftItems: [{material: 'yellow_apricorn', count: 4}, {material: 'copper_ingot', count: 1}] },
  { name: '玫瑰球', file: 'roseate_ball', category: 'pokeball', nameEn: 'Roseate Ball', tier: '基础', catchRate: '1×', desc: 'Cobblemon原创球种！需要4个粉色球果和铜锭合成。', craft: '4粉色球果 + 铜锭', craftItems: [{material: 'pink_apricorn', count: 4}, {material: 'copper_ingot', count: 1}] },
  { name: '石板球', file: 'slate_ball', category: 'pokeball', nameEn: 'Slate Ball', tier: '基础', catchRate: '1×', desc: 'Cobblemon原创球种！需要4个黑色球果和铜锭合成。', craft: '4黑色球果 + 铜锭', craftItems: [{material: 'black_apricorn', count: 4}, {material: 'copper_ingot', count: 1}] },
  { name: '翠绿球', file: 'verdant_ball', category: 'pokeball', nameEn: 'Verdant Ball', tier: '基础', catchRate: '1×', desc: 'Cobblemon原创球种！需要4个绿色球果和铜锭合成。', craft: '4绿色球果 + 铜锭', craftItems: [{material: 'green_apricorn', count: 4}, {material: 'copper_ingot', count: 1}] },
  { name: '远古精灵球', file: 'ancient_poke_ball', category: 'pokeball', nameEn: 'Ancient Poké Ball', tier: '远古', catchRate: '1×', desc: '洗翠地区风格的远古精灵球，木质外观设计。', craft: '特殊配方', craftItems: [{material: 'red_apricorn', count: 1}, {material: 'tumblestone', count: 1}] },
  { name: '远古超级球', file: 'ancient_great_ball', category: 'pokeball', nameEn: 'Ancient Great Ball', tier: '远古', catchRate: '1.5×', desc: '洗翠地区风格的远古超级球。', craft: '特殊配方', craftItems: [{material: 'red_apricorn', count: 1}, {material: 'tumblestone', count: 1}, {material: 'iron_ingot', count: 1}] },
  { name: '远古高级球', file: 'ancient_ultra_ball', category: 'pokeball', nameEn: 'Ancient Ultra Ball', tier: '远古', catchRate: '2×', desc: '洗翠地区风格的远古高级球。', craft: '特殊配方', craftItems: [{material: 'red_apricorn', count: 1}, {material: 'tumblestone', count: 1}, {material: 'gold_ingot', count: 1}] },
  { name: '远古沉重球', file: 'ancient_heavy_ball', category: 'pokeball', nameEn: 'Ancient Heavy Ball', tier: '远古', catchRate: '特殊', desc: '洗翠地区风格的远古沉重球，对重型宝可梦效果更好。', craft: '特殊配方', craftItems: [{material: 'black_apricorn', count: 1}, {material: 'black_tumblestone', count: 1}] },
  { name: '远古飞翼球', file: 'ancient_wing_ball', category: 'pokeball', nameEn: 'Ancient Wing Ball', tier: '远古', catchRate: '特殊', desc: '洗翠地区风格的远古飞翼球，投掷距离更远。', craft: '特殊配方', craftItems: [{material: 'blue_apricorn', count: 1}, {material: 'sky_tumblestone', count: 1}] },
  { name: '远古羽毛球', file: 'ancient_feather_ball', category: 'pokeball', nameEn: 'Ancient Feather Ball', tier: '远古', catchRate: '特殊', desc: '洗翠地区风格的远古羽毛球，飞行速度更快。', craft: '特殊配方', craftItems: [{material: 'white_apricorn', count: 1}, {material: 'sky_tumblestone', count: 1}] },
  { name: '远古起源球', file: 'ancient_origin_ball', category: 'pokeball', nameEn: 'Ancient Origin Ball', tier: '远古', catchRate: '特殊', desc: '洗翠地区风格的起源球，传说级精灵球。', craft: '特殊配方' },
  // 进化道具 - 含进化对象说明（包含图鉴编号用于获取精灵图片）
  { name: '火之石', file: 'fire_stone', category: 'evolution', nameEn: 'Fire Stone', desc: '燃烧着烈焰的神秘石头！这块散发着火焰能量的石头可以让特定的宝可梦触发进化。你可以在地下矿洞中找到进化石矿石，用镐头挖掘就能获得。小贴士：给镐头附魔时运可以增加产量哦！使用时只需要对着目标宝可梦右键，就能见证它们华丽的进化瞬间！', 
    evolvesData: [
      { from: '六尾', fromId: 37, to: '九尾', toId: 38 },
      { from: '卡蒂狗', fromId: 58, to: '风速狗', toId: 59 },
      { from: '伊布', fromId: 133, to: '火伊布', toId: 136 },
      { from: '暖暖猪', fromId: 513, to: '爆香猿', toId: 514 }
    ] },
  { name: '水之石', file: 'water_stone', category: 'evolution', nameEn: 'Water Stone', desc: '波光粜粜的水属性石头！这块蓝色的石头内部仿佛流淌着水的能量，可以让特定的水系宝可梦触发进化。比如想要一只优雅的水伊布？用水之石对着伊布右键就行啦！同样可以在地下矿洞中挖掘获得。', 
    evolvesData: [
      { from: '蚊香蝌蚪', fromId: 61, to: '蚊香泳士', toId: 62 },
      { from: '海星星', fromId: 120, to: '宝石海星', toId: 121 },
      { from: '伊布', fromId: 133, to: '水伊布', toId: 134 },
      { from: '莲叶童子', fromId: 271, to: '乐天河童', toId: 272 }
    ] },
  { name: '雷之石', file: 'thunder_stone', category: 'evolution', nameEn: 'Thunder Stone', desc: '电光闪烁的雷属性石头！这块黄色的石头不时迸发出电火花，蓄积着强大的雷电能量。想要让你的皮卡丘进化成威风凛凛的雷丘吗？雷之石就是关键！在地下矿洞中寻找进化石矿石，挖掘后就能获得这块神奇的石头。', 
    evolvesData: [
      { from: '皮卡丘', fromId: 25, to: '雷丘', toId: 26 },
      { from: '伊布', fromId: 133, to: '雷伊布', toId: 135 },
      { from: '电电虫', fromId: 595, to: '电蜘蛛', toId: 596 },
      { from: '麻麻小鱼', fromId: 602, to: '麻麻鳗', toId: 603 }
    ] },
  { name: '叶之石', file: 'leaf_stone', category: 'evolution', nameEn: 'Leaf Stone', desc: '散发着森林气息的绿色石头！这块石头仿佛封印着大自然的力量，可以让特定的草系宝可梦触发进化。想要让臭臭花进化成霸王花，或者让口呆花进化成大食花？叶之石就是你需要的！同样可以在矿洞中挖掘获得。', 
    evolvesData: [
      { from: '臭臭花', fromId: 44, to: '霸王花', toId: 45 },
      { from: '口呆花', fromId: 70, to: '大食花', toId: 71 },
      { from: '蛋蛋', fromId: 102, to: '椰蛋树', toId: 103 },
      { from: '天然雀', fromId: 177, to: '天然鸟', toId: 178 }
    ] },
  { name: '月之石', file: 'moon_stone', category: 'evolution', nameEn: 'Moon Stone', desc: '散发着神秘月光的石头！这块石头仿佛凝结了月亮的精华，在黑暗中会发出淡淡的光芒。它可以让皮皮进化成皮可西，让胖丁进化成胖可丁，还能让尼多娜和尼多力诺进化成尼多后和尼多王！这些可爱的宝可梦都在等待月之石的唤醒。', 
    evolvesData: [
      { from: '皮皮', fromId: 35, to: '皮可西', toId: 36 },
      { from: '胖丁', fromId: 39, to: '胖可丁', toId: 40 },
      { from: '尼多娜', fromId: 30, to: '尼多后', toId: 31 },
      { from: '尼多力诺', fromId: 33, to: '尼多王', toId: 34 },
      { from: '向尾喵', fromId: 300, to: '优雅猫', toId: 301 }
    ] },
  { name: '日之石', file: 'sun_stone', category: 'evolution', nameEn: 'Sun Stone', desc: '蕴含着太阳能量的金色石头！这块石头仿佛封印着一缕阳光，温暖而明亮。它可以让向日种子进化成向日花怪，让臭臭花进化成美丽花（而不是霸王花）。如果你想要一只优雅的美丽花而不是霸气的霸王花，记得用日之石哦！', 
    evolvesData: [
      { from: '臭臭花', fromId: 44, to: '美丽花', toId: 182 },
      { from: '向日种子', fromId: 191, to: '向日花怪', toId: 192 },
      { from: '木棉球', fromId: 546, to: '风妖精', toId: 547 },
      { from: '百合根娃娃', fromId: 548, to: '裙儿小姐', toId: 549 }
    ] },
  { name: '光之石', file: 'shiny_stone', category: 'evolution', nameEn: 'Shiny Stone', desc: '闪耀着耀眼光芒的神奇石头！这块石头散发着纯净的光芒，仿佛凝结了星光的精华。它可以让波克基古进化成优雅的波克基斯，让泡沫栗鼠进化成奇诺栗鼠，还能让毒蔷薇进化成罗丝雷朵！如果你想要一只能飞的波克基斯，光之石是必不可少的！', 
    evolvesData: [
      { from: '波克基古', fromId: 176, to: '波克基斯', toId: 468 },
      { from: '花蓓蓓', fromId: 670, to: '花洁夫人', toId: 671 },
      { from: '泡沫栗鼠', fromId: 572, to: '奇诺栗鼠', toId: 573 },
      { from: '毒蔷薇', fromId: 315, to: '罗丝雷朵', toId: 407 }
    ] },
  { name: '暗之石', file: 'dusk_stone', category: 'evolution', nameEn: 'Dusk Stone', desc: '散发着黑暗气息的神秘石头！这块深紫色的石头仿佛吸收着周围的光线，蕴含着黑暗的力量。它可以让梦妖进化成梦妖魔，让黑暗鸦进化成乌鸦头头，还能让灯火幽灵进化成水晶灯火灵！幽灵系和恶系宝可梦的进化必备。', 
    evolvesData: [
      { from: '梦妖', fromId: 200, to: '梦妖魔', toId: 429 },
      { from: '黑暗鸦', fromId: 198, to: '乌鸦头头', toId: 430 },
      { from: '双剑鞘', fromId: 680, to: '坚盾剑怪', toId: 681 },
      { from: '灯火幽灵', fromId: 608, to: '水晶灯火灵', toId: 609 }
    ] },
  { name: '冰之石', file: 'ice_stone', category: 'evolution', nameEn: 'Ice Stone', desc: '散发着寒冷气息的冰冻石头！这块淡蓝色的石头永远保持着低温，触摸时会感到丝丝凉意。它可以让伊布进化成优雅的冰伊布，还能让阿罗拉地区的六尾和穿山鼠进化成阿罗拉九尾和阿罗拉穿山王！想要一只冰系伊布进化形态？冰之石就是答案！', 
    evolvesData: [
      { from: '阿罗拉六尾', fromId: 37, to: '阿罗拉九尾', toId: 38 },
      { from: '阿罗拉穿山鼠', fromId: 27, to: '阿罗拉穿山王', toId: 28 },
      { from: '伊布', fromId: 133, to: '冰伊布', toId: 471 }
    ] },
  { name: '觉醒之石', file: 'dawn_stone', category: 'evolution', nameEn: 'Dawn Stone', desc: '闪耀着黎明光芒的特殊石头！这块石头散发着柔和的光芒，仿佛黎明的第一缕阳光。它很特殊，只对特定性别的宝可梦有效：雄性的奇鲁莉安可以进化成帅气的艾路雷朵，雌性的雪童子可以进化成美丽的雪妖女。记住要检查性别再使用哦！', 
    evolvesData: [
      { from: '奇鲁莉安♂', fromId: 281, to: '艾路雷朵', toId: 475 },
      { from: '雪童子♀', fromId: 361, to: '雪妖女', toId: 478 }
    ] },
  { name: '王者之证', file: 'kings_rock', category: 'evolution', nameEn: "King's Rock", desc: '携带后通过交换可使特定宝可梦进化。战斗中有几率使对手畏缩。', evolves: '呆呆兽→呆呆王、蚊香君→牛蛙君' },
  { name: '金属膜', file: 'metal_coat', category: 'evolution', nameEn: 'Metal Coat', desc: '携带后通过交换可使特定宝可梦进化。提升钢系招式威力。', evolves: '大岩蛇→大钢蛇、飞天螳螂→巨钳螳螂' },
  { name: '龙之鳞', file: 'dragon_scale', category: 'evolution', nameEn: 'Dragon Scale', desc: '携带后通过交换可使特定宝可梦进化。', evolves: '墨海马→刺龙王' },
  { name: '升级数据', file: 'upgrade', category: 'evolution', nameEn: 'Upgrade', desc: '携带后通过交换可使多边兽进化。', evolves: '多边兽→多边兽2' },
  { name: '可疑光碟', file: 'dubious_disc', category: 'evolution', nameEn: 'Dubious Disc', desc: '携带后通过交换可使多边兽2进化。', evolves: '多边兽2→多边兽Z' },
  { name: '电力增幅器', file: 'electirizer', category: 'evolution', nameEn: 'Electirizer', desc: '携带后通过交换可使电击兽进化。', evolves: '电击兽→电击魔兽' },
  { name: '熔岩增幅器', file: 'magmarizer', category: 'evolution', nameEn: 'Magmarizer', desc: '携带后通过交换可使鸭嘴火兽进化。', evolves: '鸭嘴火兽→鸭嘴炎兽' },
  { name: '锐利之爪', file: 'razor_claw', category: 'evolution', nameEn: 'Razor Claw', desc: '携带后夜间升级可使特定宝可梦进化。提高暴击率。', evolves: '狃拉→玛狃拉' },
  { name: '锐利之牙', file: 'razor_fang', category: 'evolution', nameEn: 'Razor Fang', desc: '携带后夜间升级可使特定宝可梦进化。攻击时有几率使对手畏缩。', evolves: '天蝎→天蝎王' },
  { name: '深海之鳞', file: 'deep_sea_scale', category: 'evolution', nameEn: 'Deep Sea Scale', desc: '携带后通过交换可使珍珠贝进化。珍珠贝携带时特防翻倍。', evolves: '珍珠贝→樱花鱼' },
  { name: '深海之牙', file: 'deep_sea_tooth', category: 'evolution', nameEn: 'Deep Sea Tooth', desc: '携带后通过交换可使珍珠贝进化。珍珠贝携带时特攻翻倍。', evolves: '珍珠贝→猎斑鱼' },
  { name: '灵界之布', file: 'reaper_cloth', category: 'evolution', nameEn: 'Reaper Cloth', desc: '携带后通过交换可使彷徨夜灵进化。', evolves: '彷徨夜灵→黑夜魔灵' },
  { name: '护具', file: 'protector', category: 'evolution', nameEn: 'Protector', desc: '携带后通过交换可使隆隆石进化。', evolves: '隆隆石→超甲狂犀' },
  { name: '美丽鳞片', file: 'prism_scale', category: 'evolution', nameEn: 'Prism Scale', desc: '携带后通过交换可使丑丑鱼进化。', evolves: '丑丑鱼→美纳斯' },
  { name: '香袋', file: 'sachet', category: 'evolution', nameEn: 'Sachet', desc: '携带后通过交换可使粉香香进化。', evolves: '粉香香→芳香精' },
  { name: '鲜奶油', file: 'whipped_dream', category: 'evolution', nameEn: 'Whipped Dream', desc: '携带后通过交换可使绵绵泡芙进化。', evolves: '绵绵泡芙→胖甜妮' },
  { name: '连接绳', file: 'link_cable', category: 'evolution', nameEn: 'Link Cable', desc: 'Cobblemon特有道具！可替代交换进化，直接使用即可让需要交换进化的宝可梦进化。', evolves: '所有交换进化宝可梦' },
  { name: '椭圆石', file: 'oval_stone', category: 'evolution', nameEn: 'Oval Stone', desc: '携带后白天升级可使特定宝可梦进化。', evolves: '好运蛋→吉利蛋' },
  { name: '黑奥古玛', file: 'black_augurite', category: 'evolution', nameEn: 'Black Augurite', desc: '使用后可使特定宝可梦进化。洗翠地区特有道具。', evolves: '飞天螳螂→劈斧螳螂' },
  { name: '泥炭块', file: 'peat_block', category: 'evolution', nameEn: 'Peat Block', desc: '使用后可使特定宝可梦进化。洗翠地区特有道具。', evolves: '乌波→洗翠大尾狸' },
  { name: '甜苹果', file: 'sweet_apple', category: 'evolution', nameEn: 'Sweet Apple', desc: '使用后可使啃果虫进化。', evolves: '啃果虫→苹裹龙' },
  { name: '酸苹果', file: 'tart_apple', category: 'evolution', nameEn: 'Tart Apple', desc: '使用后可使啃果虫进化。', evolves: '啃果虫→丰蜜龙' },
  { name: '破裂的茶壶', file: 'cracked_pot', category: 'evolution', nameEn: 'Cracked Pot', desc: '使用后可使来悲茶（赝品形态）进化。', evolves: '来悲茶→怖思壶' },
  { name: '缺损的茶壶', file: 'chipped_pot', category: 'evolution', nameEn: 'Chipped Pot', desc: '使用后可使来悲茶（真品形态）进化。', evolves: '来悲茶→怖思壶' },
  { name: '伽勒豆蔻手环', file: 'galarica_cuff', category: 'evolution', nameEn: 'Galarica Cuff', desc: '使用后可使伽勒尔呆呆兽进化。', evolves: '伽勒尔呆呆兽→伽勒尔呆壳兽' },
  { name: '伽勒豆蔻花环', file: 'galarica_wreath', category: 'evolution', nameEn: 'Galarica Wreath', desc: '使用后可使伽勒尔呆呆兽进化。', evolves: '伽勒尔呆呆兽→伽勒尔呆呆王' },
  // 携带物品 - 含详细战斗效果和使用建议
  { name: '讲究头带', file: 'choice_band', category: 'held', nameEn: 'Choice Band', desc: '物理攻击手的终极武器！携带后攻击力提升1.5倍，但代价是只能使用第一个选择的招式，直到换下场为止。适合那些只需要一招打天下的物攻手，比如逆鳞龙、地震手等。使用时要谨慎预判对手的换人！' },
  { name: '讲究眼镜', file: 'choice_specs', category: 'held', nameEn: 'Choice Specs', desc: '特攻手的梦想装备！携带后特攻提升1.5倍，但同样只能使用一个招式。适合高特攻的宝可梦，比如喷火龙、耿鬼等。配合高威力的特攻招式，可以一击秒杀很多对手！' },
  { name: '讲究围巾', file: 'choice_scarf', category: 'held', nameEn: 'Choice Scarf', desc: '速度就是生命！携带后速度提升1.5倍，让原本速度一般的宝可梦也能抢到先手。适合那些速度差一点就能先手的宝可梦，或者用来出其不意反杀对手。对战中的常客！' },
  { name: '气势披带', file: 'focus_sash', category: 'held', nameEn: 'Focus Sash', desc: '脆皮宝可梦的保命符！当HP满的时候，即使受到致命伤害也会保留1HP存活。这让很多脆皮但高攻的宝可梦有了出场的机会。注意：只能用一次，而且必须是满HP状态才有效，被天气或钉子伤害后就失效了！' },
  { name: '生命宝珠', file: 'life_orb', category: 'held', nameEn: 'Life Orb', desc: '高风险高回报的选择！所有攻击招式威力提升1.3倍，但每次攻击后会损失最大HP的10%。适合那些想要最大化输出、不在乎自身消耗的宝可梦。配合魔法守护特性可以免除HP损失！' },
  { name: '剩饭', file: 'leftovers', category: 'held', nameEn: 'Leftovers', desc: '最经典的回复道具！每回合结束时恢复最大HP的1/16。看起来不多，但积少成多，对于耐久型宝可梦来说非常可观。几乎所有坦克型宝可梦的标配，让你在持久战中占据优势！' },
  { name: '黑色淤泥', file: 'black_sludge', category: 'held', nameEn: 'Black Sludge', desc: '毒系宝可梦的专属剩饭！毒系宝可梦携带时每回合恢复1/16HP，效果和剩饭一样。但如果被戏法/交换等招式换给非毒系宝可梦，对方反而会每回合损失1/16HP！既能回血又能坑对手，一举两得。' },
  { name: '突击背心', file: 'assault_vest', category: 'held', nameEn: 'Assault Vest', desc: '纯输出型宝可梦的防御神器！特防提升1.5倍，但代价是无法使用变化招式（如剑舞、保护等）。适合那些本身就不需要变化招式的纯输出手，让它们在面对特攻手时也能扛住几下。' },
  { name: '进化奇石', file: 'eviolite', category: 'held', nameEn: 'Eviolite', desc: '未进化宝可梦的逆袭神器！只对还能继续进化的宝可梦有效，让它们的防御和特防都提升1.5倍。这让一些中间形态的宝可梦（如波克基古、拉鲁拉丝）变得比最终进化形态还要耐打！' },
  { name: '气球', file: 'air_balloon', category: 'held', nameEn: 'Air Balloon', desc: '对付地面系的秘密武器！携带后可以免疫地面系招式，但一旦受到任何攻击（包括非地面系），气球就会破裂失效。适合那些怕地面系的钢系、火系、电系宝可梦，给它们一个安全入场的机会。' },
  { name: '凸凸头盔', file: 'rocky_helmet', category: 'held', nameEn: 'Rocky Helmet', desc: '物理盾的反击利器！当受到接触类招式攻击时，攻击者会损失最大HP的1/6。配合高物防的宝可梦，可以让对手在攻击你的同时自己也掉血。对付那些喜欢用接触招式的物攻手特别有效！' },
  { name: '幸运蛋', file: 'lucky_egg', category: 'held', nameEn: 'Lucky Egg', desc: '练级党的最爱！携带者获得的经验值提升1.5倍。当你想快速培养一只新宝可梦时，给它带上幸运蛋，升级速度会快很多。可以从吉利蛋身上获得，虽然掉落率不高，但绝对值得！' },
  { name: '学习装置', file: 'exp_share', category: 'held', nameEn: 'Exp. Share', desc: '队伍练级的好帮手！携带者即使不参加战斗也能获得经验值。想要练一只低等级的宝可梦？让它带着学习装置待在队伍里，用高等级宝可梦战斗，它也能分到经验值！' },
  { name: '特性护具', file: 'ability_shield', category: 'held', nameEn: 'Ability Shield', desc: '保护携带者的特性不被改变或无效化。' },
  { name: '吸收球根', file: 'absorb_bulb', category: 'held', nameEn: 'Absorb Bulb', desc: '受到水系招式攻击时，特攻提升1级。一次性道具。' },
  { name: '护符金币', file: 'amulet_coin', category: 'held', nameEn: 'Amulet Coin', desc: '携带者参战后，获得的金钱翻倍。赚钱神器！' },
  { name: '大根茎', file: 'big_root', category: 'held', nameEn: 'Big Root', desc: '吸取HP的招式效果提升30%。吸血流必备！' },
  { name: '黑带', file: 'black_belt', category: 'held', nameEn: 'Black Belt', desc: '格斗系招式威力提升20%。' },
  { name: '黑色眼镜', file: 'black_glasses', category: 'held', nameEn: 'Black Glasses', desc: '恶系招式威力提升20%。' },
  { name: '光粉', file: 'bright_powder', category: 'held', nameEn: 'Bright Powder', desc: '提高携带者的闪避率。' },
  { name: '充电电池', file: 'cell_battery', category: 'held', nameEn: 'Cell Battery', desc: '受到电系招式攻击时，攻击提升1级。一次性道具。' },
  { name: '木炭', file: 'charcoal', category: 'held', nameEn: 'Charcoal', desc: '火系招式威力提升20%。' },
  { name: '净化之符', file: 'cleanse_tag', category: 'held', nameEn: 'Cleanse Tag', desc: '降低野生宝可梦的遇敲率。' },
  { name: '隐秘斗篷', file: 'covert_cloak', category: 'held', nameEn: 'Covert Cloak', desc: '保护携带者免受招式的追加效果。' },
  { name: '潮湿岩石', file: 'damp_rock', category: 'held', nameEn: 'Damp Rock', desc: '使用求雨时，雨天持续8回合而非5回合。' },
  { name: '命运之结', file: 'destiny_knot', category: 'held', nameEn: 'Destiny Knot', desc: '繁殖时可以遗传5项个体值。孕育神器！' },
  { name: '龙之牙', file: 'dragon_fang', category: 'held', nameEn: 'Dragon Fang', desc: '龙系招式威力提升20%。' },
  { name: '弹出按钮', file: 'eject_button', category: 'held', nameEn: 'Eject Button', desc: '受到攻击时强制替换下场。一次性道具。' },
  { name: '弹出包', file: 'eject_pack', category: 'held', nameEn: 'Eject Pack', desc: '能力下降时强制替换下场。一次性道具。' },
  { name: '电气种子', file: 'electric_seed', category: 'held', nameEn: 'Electric Seed', desc: '电气场地时防御提升1级。一次性道具。' },
  { name: '不变之石', file: 'everstone', category: 'held', nameEn: 'Everstone', desc: '阻止携带者进化。繁殖时可遗传性格。' },
  { name: '达人带', file: 'expert_belt', category: 'held', nameEn: 'Expert Belt', desc: '效果绝佳的招式威力提升20%。' },
  { name: '妖精羽毛', file: 'fairy_feather', category: 'held', nameEn: 'Fairy Feather', desc: '妖精系招式威力提升20%。' },
  { name: '火焰宝珠', file: 'flame_orb', category: 'held', nameEn: 'Flame Orb', desc: '回合结束时使携带者烧伤。配合毒疗/根性特性使用！' },
  { name: '轻石', file: 'float_stone', category: 'held', nameEn: 'Float Stone', desc: '携带者体重减卍。' },
  { name: '气合头带', file: 'focus_band', category: 'held', nameEn: 'Focus Band', desc: '有10%几率在受到致命伤害时保留1HP。' },
  { name: '青草种子', file: 'grassy_seed', category: 'held', nameEn: 'Grassy Seed', desc: '青草场地时防御提升1级。一次性道具。' },
  { name: '硬石头', file: 'hard_stone', category: 'held', nameEn: 'Hard Stone', desc: '岩石系招式威力提升20%。' },
  { name: '热力岩石', file: 'heat_rock', category: 'held', nameEn: 'Heat Rock', desc: '使用大晴天时，晴天持续8回合而非5回合。' },
  { name: '厚底靴', file: 'heavy_duty_boots', category: 'held', nameEn: 'Heavy-Duty Boots', desc: '免疫入场时的场地伤害（隐形岩、毒菱等）。实用神器！' },
  { name: '冰冷岩石', file: 'icy_rock', category: 'held', nameEn: 'Icy Rock', desc: '使用冰雹时，冰雹持续8回合而非5回合。' },
  { name: '黑铁球', file: 'iron_ball', category: 'held', nameEn: 'Iron Ball', desc: '速度减卍，飞行系/漂浮特性可被地面系命中。配合戴给使用！' },
  { name: '电球', file: 'light_ball', category: 'held', nameEn: 'Light Ball', desc: '皮卡丘专属！攻击和特攻翻倍。' },
  { name: '光之黏土', file: 'light_clay', category: 'held', nameEn: 'Light Clay', desc: '光墙和反射壁持续8回合而非5回合。' },
  { name: '千载骰', file: 'loaded_dice', category: 'held', nameEn: 'Loaded Dice', desc: '多次攻击招式至少攻击4次。' },
  { name: '磁铁', file: 'magnet', category: 'held', nameEn: 'Magnet', desc: '电系招式威力提升20%。' },
  { name: '心灵香草', file: 'mental_herb', category: 'held', nameEn: 'Mental Herb', desc: '解除着迷、挑拨、封印等状态。一次性道具。' },
  { name: '金属粉', file: 'metal_powder', category: 'held', nameEn: 'Metal Powder', desc: '百变怪专属！防御翻倍。' },
  { name: '节拍器', file: 'metronome', category: 'held', nameEn: 'Metronome', desc: '连续使用同一招式时威力逐渐提升，最高2倍。' },
  { name: '奇迹种子', file: 'miracle_seed', category: 'held', nameEn: 'Miracle Seed', desc: '草系招式威力提升20%。' },
  { name: '镜子香草', file: 'mirror_herb', category: 'held', nameEn: 'Mirror Herb', desc: '复制对手的能力提升。一次性道具。' },
  { name: '薄雾种子', file: 'misty_seed', category: 'held', nameEn: 'Misty Seed', desc: '薄雾场地时特防提升1级。一次性道具。' },
  { name: '力量头带', file: 'muscle_band', category: 'held', nameEn: 'Muscle Band', desc: '物理招式威力提升10%。' },
  { name: '神秘水滴', file: 'mystic_water', category: 'held', nameEn: 'Mystic Water', desc: '水系招式威力提升20%。' },
  { name: '不融冰', file: 'never_melt_ice', category: 'held', nameEn: 'Never-Melt Ice', desc: '冰系招式威力提升20%。' },
  { name: '毒针', file: 'poison_barb', category: 'held', nameEn: 'Poison Barb', desc: '毒系招式威力提升20%。' },
  { name: '力量护踝', file: 'power_anklet', category: 'held' },
  { name: '力量束带', file: 'power_band', category: 'held' },
  { name: '力量腰带', file: 'power_belt', category: 'held' },
  { name: '力量护腕', file: 'power_bracer', category: 'held' },
  { name: '力量香草', file: 'power_herb', category: 'held' },
  { name: '力量镜片', file: 'power_lens', category: 'held' },
  { name: '力量负重', file: 'power_weight', category: 'held' },
  { name: '保护垫', file: 'protective_pads', category: 'held' },
  { name: '精神种子', file: 'psychic_seed', category: 'held' },
  { name: '拳击手套', file: 'punching_glove', category: 'held' },
  { name: '先制之爪', file: 'quick_claw', category: 'held' },
  { name: '速度粉', file: 'quick_powder', category: 'held' },
  { name: '红牌', file: 'red_card', category: 'held' },
  { name: '标靶', file: 'ring_target', category: 'held' },
  { name: '客房服务', file: 'room_service', category: 'held' },
  { name: '安全护目镜', file: 'safety_goggles', category: 'held' },
  { name: '焦点镜', file: 'scope_lens', category: 'held' },
  { name: '锐利鸟嘴', file: 'sharp_beak', category: 'held' },
  { name: '脱壳', file: 'shed_shell', category: 'held' },
  { name: '贝壳之铃', file: 'shell_bell', category: 'held' },
  { name: '丝绸围巾', file: 'silk_scarf', category: 'held' },
  { name: '银粉', file: 'silver_powder', category: 'held' },
  { name: '烟雾球', file: 'smoke_ball', category: 'held' },
  { name: '光滑岩石', file: 'smooth_rock', category: 'held' },
  { name: '柔软沙子', file: 'soft_sand', category: 'held' },
  { name: '安抚之铃', file: 'soothe_bell', category: 'held' },
  { name: '咒语之符', file: 'spell_tag', category: 'held' },
  { name: '附着针', file: 'sticky_barb', category: 'held' },
  { name: '场地延长器', file: 'terrain_extender', category: 'held' },
  { name: '喉咙喷雾', file: 'throat_spray', category: 'held' },
  { name: '剧毒宝珠', file: 'toxic_orb', category: 'held' },
  { name: '弯曲汤匙', file: 'twisted_spoon', category: 'held' },
  { name: '万能伞', file: 'utility_umbrella', category: 'held' },
  { name: '弱点保险', file: 'weakness_policy', category: 'held' },
  { name: '白色香草', file: 'white_herb', category: 'held' },
  { name: '广角镜', file: 'wide_lens', category: 'held' },
  { name: '博识眼镜', file: 'wise_glasses', category: 'held' },
  { name: '对焦镜', file: 'zoom_lens', category: 'held' },
  // 药品 - 含详细效果和使用建议
  { name: '伤药', file: 'potion', category: 'medicine', nameEn: 'Potion', desc: '恢复20HP。【获取方式】商店购买或合成。【使用建议】新手期过渡用，后期基本不用。战斗外对宝可梦使用。' },
  { name: '好伤药', file: 'super_potion', category: 'medicine', nameEn: 'Super Potion', desc: '恢复60HP。【使用建议】中期过渡药品，性价比一般。' },
  { name: '厉害伤药', file: 'hyper_potion', category: 'medicine', nameEn: 'Hyper Potion', desc: '恢复120HP。【使用建议】后期常用药品，探险必备。' },
  { name: '全满药', file: 'max_potion', category: 'medicine', nameEn: 'Max Potion', desc: '完全恢复HP。【使用建议】Boss战前必备！不治疗异常状态。' },
  { name: '全复药', file: 'full_restore', category: 'medicine', nameEn: 'Full Restore', desc: '完全恢复HP并治愈所有异常状态。【使用建议】最强恢复道具！传说宝可梦战斗必备，一瓶解决所有问题。' },
  { name: '复活药', file: 'revive', category: 'medicine', nameEn: 'Revive', desc: '使濒死的宝可梦复活，恢复一半HP。【使用建议】战斗中救急用，复活后建议再用伤药补满。' },
  { name: '活力碎片', file: 'max_revive', category: 'medicine', nameEn: 'Max Revive', desc: '使濒死的宝可梦复活，完全恢复HP。【使用建议】珍贵道具！建议留给主力宝可梦使用。' },
  { name: '万灵药', file: 'full_heal', category: 'medicine', nameEn: 'Full Heal', desc: '治愈所有异常状态。【使用建议】不恢复HP，专门解除中毒、麻痹、烧伤等状态。' },
  { name: '解毒药', file: 'antidote', category: 'medicine', nameEn: 'Antidote', desc: '治愈中毒状态。【使用建议】探索毒系宝可梦区域时多带几个。' },
  { name: '烧伤药', file: 'burn_heal', category: 'medicine', nameEn: 'Burn Heal', desc: '治愈烧伤状态。【使用建议】烧伤会持续扣血且降低攻击，及时治疗！' },
  { name: '解冻药', file: 'ice_heal', category: 'medicine', nameEn: 'Ice Heal', desc: '治愈冰冻状态。【使用建议】冰冻会导致无法行动，必须治疗。' },
  { name: '解麻药', file: 'paralyze_heal', category: 'medicine', nameEn: 'Paralyze Heal', desc: '治愈麻痹状态。【使用建议】麻痹降低速度且可能无法行动，建议及时治疗。' },
  { name: '元气药', file: 'awakening', category: 'medicine', nameEn: 'Awakening', desc: '治愈睡眠状态。【使用建议】睡眠会导致无法行动，但几回合后会自然醒来。' },
  { name: 'PP单项小补剂', file: 'ether', category: 'medicine', nameEn: 'Ether', desc: '恢复一个招式10PP。【使用建议】长时间探险时补充主力招式PP。' },
  { name: 'PP单项全补剂', file: 'max_ether', category: 'medicine', nameEn: 'Max Ether', desc: '完全恢复一个招式的PP。【使用建议】珍贵道具，建议用于PP较少的强力招式。' },
  { name: 'PP多项小补剂', file: 'elixir', category: 'medicine', nameEn: 'Elixir', desc: '恢复所有招式10PP。【使用建议】一次性补充所有招式，效率高。' },
  { name: 'PP多项全补剂', file: 'max_elixir', category: 'medicine', nameEn: 'Max Elixir', desc: '完全恢复所有招式的PP。【使用建议】极其珍贵！建议只在关键战斗前使用。' },
  { name: 'PP提升剂', file: 'pp_up', category: 'medicine', nameEn: 'PP Up', desc: '永久提升一个招式的PP上限20%。【使用建议】培养宝可梦必备！优先用于PP较少的强力招式。' },
  { name: 'PP极限提升剂', file: 'pp_max', category: 'medicine', nameEn: 'PP Max', desc: '将一个招式的PP上限提升到最大(160%)。【使用建议】极其珍贵！建议用于主力宝可梦的核心招式。' },
  { name: 'HP增强剂', file: 'hp_up', category: 'medicine', nameEn: 'HP Up', desc: '提升10点HP努力值(EV)。【使用建议】努力值培养用，每项最多252点。配合力量道具效率更高。' },
  { name: '攻击增强剂', file: 'protein', category: 'medicine', nameEn: 'Protein', desc: '提升10点攻击努力值(EV)。【使用建议】物攻手培养必备！' },
  { name: '防御增强剂', file: 'iron', category: 'medicine', nameEn: 'Iron', desc: '提升10点防御努力值(EV)。【使用建议】坦克型宝可梦培养用。' },
  { name: '特攻增强剂', file: 'calcium', category: 'medicine', nameEn: 'Calcium', desc: '提升10点特攻努力值(EV)。【使用建议】特攻手培养必备！' },
  { name: '特防增强剂', file: 'zinc', category: 'medicine', nameEn: 'Zinc', desc: '提升10点特防努力值(EV)。【使用建议】特殊坦克培养用。' },
  { name: '速度增强剂', file: 'carbos', category: 'medicine', nameEn: 'Carbos', desc: '提升10点速度努力值(EV)。【使用建议】速度型宝可梦培养必备！先手优势很重要。' },
  { name: '活力根', file: 'energy_root', category: 'medicine', nameEn: 'Energy Root', desc: '恢复120HP，但会降低亲密度。【使用建议】便宜的替代品，不在乎亲密度时使用。' },
  { name: '回复药', file: 'heal_powder', category: 'medicine', nameEn: 'Heal Powder', desc: '治愈所有异常状态，但会降低亲密度。【使用建议】便宜的万灵药替代品。' },
  // 树果 - 含详细效果和使用建议
  { name: '橙橙果', file: 'oran_berry', category: 'berry', nameEn: 'Oran Berry', desc: '新手训练家的好伙伴！当宝可梦HP低于一半时，会自动吃掉这颗橙色的小果子，恢复10点HP。虽然恢复量不多，但在冒险初期非常实用。你可以在野外的树果树上采集到它，也可以自己种植。随着冒险深入，建议换成效果更好的文柚果哦！' },
  { name: '文柚果', file: 'sitrus_berry', category: 'berry', nameEn: 'Sitrus Berry', desc: '对战中最受欢迎的树果！当HP低于一半时，自动恢复最大HP的1/4。不管你的宝可梦HP有多高，都能恢复相当可观的血量。几乎所有宝可梦都适合携带，是对战和冒险中的万能选择。强烈建议多种植一些备用！' },
  { name: '桃桃果', file: 'pecha_berry', category: 'berry', nameEn: 'Pecha Berry', desc: '粉嫩可爱的解毒小能手！当宝可梦中毒时，会自动吃掉这颗桃子般的果实来治愈毒素。如果你要去探索毒系宝可梦出没的区域，或者你的宝可梦经常被毒到，记得给它带上桃桃果。中毒可是会持续掉血的，及时治愈很重要！' },
  { name: '莓莓果', file: 'rawst_berry', category: 'berry', nameEn: 'Rawst Berry', desc: '物理攻击手的护身符！当宝可梦被烧伤时，会自动吃掉这颗蓝色的果实来治愈烧伤。烧伤不仅会持续掉血，还会让物理攻击力减半！对于物攻手来说，烧伤简直是噩梦。给你的物攻宝可梦带上莓莓果，让它们远离烧伤的困扰。' },
  { name: '樱子果', file: 'cheri_berry', category: 'berry', nameEn: 'Cheri Berry', desc: '速度型宝可梦的救星！当宝可梦被麻痹时，会自动吃掉这颗红色的小樱桃来治愈麻痹。麻痹会让速度降低75%，还有25%几率无法行动。对于那些靠速度吃饭的宝可梦来说，麻痹简直是致命的。樱子果能让它们重获自由！' },
  { name: '零余果', file: 'chesto_berry', category: 'berry', nameEn: 'Chesto Berry', desc: '睡眠战术的完美搭档！当宝可梦陷入睡眠时，会自动吃掉这颗果实立即醒来。最经典的用法是配合"睡眠"招式：先用睡眠回满HP，然后零余果让你立刻醒来，相当于免费回满血！这个组合在对战中非常实用。' },
  { name: '柿仔果', file: 'persim_berry', category: 'berry', nameEn: 'Persim Berry', desc: '混乱克星！当宝可梦陷入混乱时，会自动吃掉这颗果实来恢复清醒。如果你的宝可梦会使用"逆鳞"、"花瓣舞"等连续攻击后会混乱的招式，柿仔果是最好的搭档。再也不用担心混乱后打自己了！' },
  { name: '苹野果', file: 'leppa_berry', category: 'berry', nameEn: 'Leppa Berry', desc: '练级党的最爱！当某个招式的PP耗尽时，会自动恢复10点PP。在野外长时间刷怪练级时特别有用，不用频繁回家补充PP。给你的主力宝可梦带上苹野果，让它可以持续战斗更长时间！' },
  { name: '木子果', file: 'lum_berry', category: 'berry', nameEn: 'Lum Berry', desc: '万能的状态治愈果！无论是中毒、烧伤、麻痹、睡眠还是混乱，木子果都能治愈。当你不确定对手会用什么状态招式时，木子果是最稳妥的选择。虽然只能用一次，但关键时刻能救命！对战中的热门选择。' },
  { name: '芒芒果', file: 'mago_berry', category: 'berry', nameEn: 'Mago Berry', desc: 'HP回复树果之一！当HP低于1/4时，自动恢复最大HP的1/3。但如果宝可梦不喜欢甜味，吃了会陷入混乱。适合喜欢甜味的性格（固执、调皮、勇敢、孤僻）的宝可梦使用。' },
  { name: '异奇果', file: 'enigma_berry', category: 'berry', nameEn: 'Enigma Berry', desc: '神秘的稀有树果！当受到效果绝佳的招式攻击时，自动恢复最大HP的1/4。对于弱点多的宝可梦来说是救命稻草，但获取难度较高。' },
  { name: '勿花果', file: 'aguav_berry', category: 'berry', nameEn: 'Aguav Berry', desc: 'HP回复树果之一！当HP低于1/4时，自动恢复最大HP的1/3。但如果宝可梦不喜欢苦味，吃了会陷入混乱。适合喜欢苦味的性格的宝可梦使用。' },
  { name: '芭亚果', file: 'figy_berry', category: 'berry', nameEn: 'Figy Berry', desc: 'HP回复树果之一！当HP低于1/4时，自动恢复最大HP的1/3。但如果宝可梦不喜欢辣味，吃了会陷入混乱。适合喜欢辣味的性格的宝可梦使用。' },
  { name: '芝芝果', file: 'wiki_berry', category: 'berry', nameEn: 'Wiki Berry', desc: 'HP回复树果之一！当HP低于1/4时，自动恢复最大HP的1/3。但如果宝可梦不喜欢涩味，吃了会陷入混乱。适合喜欢涩味的性格的宝可梦使用。' },
  { name: '椰木果', file: 'iapapa_berry', category: 'berry', nameEn: 'Iapapa Berry', desc: 'HP回复树果之一！当HP低于1/4时，自动恢复最大HP的1/3。但如果宝可梦不喜欢酸味，吃了会陷入混乱。适合喜欢酸味的性格的宝可梦使用。' },
  { name: '利木果', file: 'aspear_berry', category: 'berry', nameEn: 'Aspear Berry', desc: '冰冻状态的克星！当宝可梦被冰冻时，会自动吃掉这颗果实来解冻。冰冻是最烦人的状态之一，因为它会让你完全无法行动。给怕冰系的宝可梦带上利木果，以防万一！' },
  { name: '蔓莓果', file: 'razz_berry', category: 'berry', nameEn: 'Razz Berry', desc: '甜美的红色树果！主要用于制作宝可方块或宝芬。在Cobblemon中也可以用于烹饪。味道偏辣，可以用来培养宝可梦的某些属性。' },
  { name: '蓝莓果', file: 'bluk_berry', category: 'berry', nameEn: 'Bluk Berry', desc: '深蓝色的神秘树果！主要用于制作宝可方块或宝芬。在Cobblemon中也可以用于烹饪。味道偏涩，可以用来培养宝可梦的某些属性。' },
  { name: '蕉香果', file: 'nanab_berry', category: 'berry', nameEn: 'Nanab Berry', desc: '香蕉形状的可爱树果！主要用于制作宝可方块或宝芬。在Cobblemon中也可以用于烹饪。味道偏甜，可以用来培养宝可梦的某些属性。' },
  { name: '凰梨果', file: 'pinap_berry', category: 'berry', nameEn: 'Pinap Berry', desc: '菠萝形状的热带树果！主要用于制作宝可方块或宝芬。在Cobblemon中也可以用于烹饪。味道偏苦，可以用来培养宝可梦的某些属性。' },
  { name: '石榴果', file: 'pomeg_berry', category: 'berry', nameEn: 'Pomeg Berry', desc: '努力值调整树果！给宝可梦吃下后，可以降低10点HP努力值(EV)，同时提升亲密度。当你想重新分配努力值时非常有用，是培养宝可梦的好帮手！' },
  { name: '藻根果', file: 'kelpsy_berry', category: 'berry', nameEn: 'Kelpsy Berry', desc: '努力值调整树果！给宝可梦吃下后，可以降低10点攻击努力值(EV)，同时提升亲密度。想要把物攻努力值洗掉重新分配？藻根果就是答案！' },
  { name: '比巴果', file: 'qualot_berry', category: 'berry', nameEn: 'Qualot Berry', desc: '努力值调整树果！给宝可梦吃下后，可以降低10点防御努力值(EV)，同时提升亲密度。重新规划防御努力值时使用。' },
  { name: '哈密果', file: 'hondew_berry', category: 'berry', nameEn: 'Hondew Berry', desc: '努力值调整树果！给宝可梦吃下后，可以降低10点特攻努力值(EV)，同时提升亲密度。想要调整特攻努力值分配时使用。' },
  { name: '萄葡果', file: 'grepa_berry', category: 'berry', nameEn: 'Grepa Berry', desc: '努力值调整树果！给宝可梦吃下后，可以降低10点特防努力值(EV)，同时提升亲密度。重新规划特防努力值时使用。' },
  { name: '番荔果', file: 'tamato_berry', category: 'berry', nameEn: 'Tamato Berry', desc: '努力值调整树果！给宝可梦吃下后，可以降低10点速度努力值(EV)，同时提升亲密度。想要调整速度努力值分配时使用。' },
  { name: '巧可果', file: 'occa_berry', category: 'berry', nameEn: 'Occa Berry', desc: '属性抗性树果！当受到效果绝佳的火系招式攻击时，伤害减半。对于弱火系的宝可梦来说是保命神器！用完即消失，关键时刻能救命。' },
  { name: '千香果', file: 'passho_berry', category: 'berry', nameEn: 'Passho Berry', desc: '属性抗性树果！当受到效果绝佳的水系招式攻击时，伤害减半。对于弱水系的宝可梦来说非常实用，尤其是火系和地面系宝可梦。' },
  { name: '烛木果', file: 'wacan_berry', category: 'berry', nameEn: 'Wacan Berry', desc: '属性抗性树果！当受到效果绝佳的电系招式攻击时，伤害减半。水系和飞行系宝可梦的好伙伴，让它们不再那么怕电系招式。' },
  { name: '罗子果', file: 'rindo_berry', category: 'berry', nameEn: 'Rindo Berry', desc: '属性抗性树果！当受到效果绝佳的草系招式攻击时，伤害减半。水系、地面系和岩石系宝可梦的保护伞。' },
  { name: '雅次果', file: 'yache_berry', category: 'berry', nameEn: 'Yache Berry', desc: '属性抗性树果！当受到效果绝佳的冰系招式攻击时，伤害减半。龙系、飞行系、草系和地面系宝可梦的救星，让它们不再惧怕冰系招式！' },
  { name: '莲蒲果', file: 'chople_berry', category: 'berry', nameEn: 'Chople Berry', desc: '属性抗性树果！当受到效果绝佳的格斗系招式攻击时，伤害减半。一般系、岩石系、钢系、冰系和恶系宝可梦的好帮手。' },
  { name: '通通果', file: 'kebia_berry', category: 'berry', nameEn: 'Kebia Berry', desc: '属性抗性树果！当受到效果绝佳的毒系招式攻击时，伤害减半。草系和妖精系宝可梦的保护者。' },
  { name: '腰木果', file: 'shuca_berry', category: 'berry', nameEn: 'Shuca Berry', desc: '属性抗性树果！当受到效果绝佳的地面系招式攻击时，伤害减半。火系、电系、毒系、岩石系和钢系宝可梦的救命果！' },
  { name: '诺果果', file: 'coba_berry', category: 'berry', nameEn: 'Coba Berry', desc: '属性抗性树果！当受到效果绝佳的飞行系招式攻击时，伤害减半。格斗系、草系和虫系宝可梦的保护伞。' },
  { name: '福禄果', file: 'payapa_berry', category: 'berry', nameEn: 'Payapa Berry', desc: '属性抗性树果！当受到效果绝佳的超能力系招式攻击时，伤害减半。格斗系和毒系宝可梦的好伙伴。' },
  { name: '扁樱果', file: 'tanga_berry', category: 'berry', nameEn: 'Tanga Berry', desc: '属性抗性树果！当受到效果绝佳的虫系招式攻击时，伤害减半。草系、超能力系和恶系宝可梦的保护者。' },
  { name: '草蚕果', file: 'charti_berry', category: 'berry', nameEn: 'Charti Berry', desc: '属性抗性树果！当受到效果绝佳的岩石系招式攻击时，伤害减半。火系、冰系、飞行系和虫系宝可梦的救星！' },
  { name: '佛柑果', file: 'kasib_berry', category: 'berry', nameEn: 'Kasib Berry', desc: '属性抗性树果！当受到效果绝佳的幽灵系招式攻击时，伤害减半。幽灵系和超能力系宝可梦的保护伞。' },
  { name: '龙睛果', file: 'haban_berry', category: 'berry', nameEn: 'Haban Berry', desc: '属性抗性树果！当受到效果绝佳的龙系招式攻击时，伤害减半。龙系宝可梦对战的必备道具，让你的龙不再怕其他龙！' },
  { name: '月桃果', file: 'colbur_berry', category: 'berry', nameEn: 'Colbur Berry', desc: '属性抗性树果！当受到效果绝佳的恶系招式攻击时，伤害减半。超能力系和幽灵系宝可梦的保护者。' },
  { name: '芭芭果', file: 'babiri_berry', category: 'berry', nameEn: 'Babiri Berry', desc: '属性抗性树果！当受到效果绝佳的钢系招式攻击时，伤害减半。岩石系、冰系和妖精系宝可梦的好帮手。' },
  { name: '奇秘果', file: 'chilan_berry', category: 'berry', nameEn: 'Chilan Berry', desc: '特殊的抗性树果！当受到一般系招式攻击时，伤害减半。虽然一般系招式通常没有效果绝佳，但这颗果实可以减少任何一般系招式的伤害。' },
  { name: '蔷薇果', file: 'roseli_berry', category: 'berry', nameEn: 'Roseli Berry', desc: '属性抗性树果！当受到效果绝佳的妖精系招式攻击时，伤害减半。龙系、格斗系和恶系宝可梦的救星！' },
  { name: '释陀果', file: 'liechi_berry', category: 'berry', nameEn: 'Liechi Berry', desc: '能力提升树果！当HP低于1/4时，攻击力提升1级。适合物理攻击手在危急时刻爆发使用，配合气势披带效果更佳！' },
  { name: '龙火果', file: 'ganlon_berry', category: 'berry', nameEn: 'Ganlon Berry', desc: '能力提升树果！当HP低于1/4时，防御力提升1级。适合坦克型宝可梦在危急时刻提升生存能力。' },
  { name: '沙鳞果', file: 'salac_berry', category: 'berry', nameEn: 'Salac Berry', desc: '能力提升树果！当HP低于1/4时，速度提升1级。适合速度型宝可梦在危急时刻抢到先手，配合替身战术效果绝佳！' },
  { name: '杏仔果', file: 'petaya_berry', category: 'berry', nameEn: 'Petaya Berry', desc: '能力提升树果！当HP低于1/4时，特攻提升1级。适合特攻手在危急时刻爆发使用。' },
  { name: '西梅果', file: 'apicot_berry', category: 'berry', nameEn: 'Apicot Berry', desc: '能力提升树果！当HP低于1/4时，特防提升1级。适合特殊坦克在危急时刻提升抗性。' },
  { name: '兰萨果', file: 'lansat_berry', category: 'berry', nameEn: 'Lansat Berry', desc: '稀有的能力提升树果！当HP低于1/4时，暴击率大幅提升。配合高攻击力的宝可梦使用，可以在危急时刻打出致命一击！' },
  { name: '星桃果', file: 'starf_berry', category: 'berry', nameEn: 'Starf Berry', desc: '最稀有的树果之一！当HP低于1/4时，随机大幅提升一项能力（攻击、防御、特攻、特防或速度）2级。运气好的话可以逆转战局！' },
  { name: '奇迹果', file: 'micle_berry', category: 'berry', nameEn: 'Micle Berry', desc: '稀有的能力提升树果！当HP低于1/4时，下一次攻击的命中率提升。适合使用高威力但命中率不稳定的招式时使用。' },
  { name: '枝荔果', file: 'custap_berry', category: 'berry', nameEn: 'Custap Berry', desc: '稀有的先制树果！当HP低于1/4时，下一回合可以先手行动。适合在危急时刻抢先使用关键招式，可能逆转战局！' },
  { name: '嘉珍果', file: 'jaboca_berry', category: 'berry', nameEn: 'Jaboca Berry', desc: '反击型树果！当受到物理招式攻击时，对攻击者造成其最大HP的1/8伤害。让物理攻击手在攻击你时也要付出代价！' },
  { name: '雾莲果', file: 'rowap_berry', category: 'berry', nameEn: 'Rowap Berry', desc: '反击型树果！当受到特殊招式攻击时，对攻击者造成其最大HP的1/8伤害。让特攻手在攻击你时也要付出代价！' },
  { name: '奇果果', file: 'kee_berry', category: 'berry', nameEn: 'Kee Berry', desc: '防御型树果！当受到物理招式攻击时，防御力提升1级。适合物理坦克在受到攻击后变得更加坚固。' },
  { name: '玛仑果', file: 'maranga_berry', category: 'berry', nameEn: 'Maranga Berry', desc: '防御型树果！当受到特殊招式攻击时，特防提升1级。适合特殊坦克在受到攻击后变得更加坚固。' }
];

function loadItems() {
  const grid = document.getElementById('itemGrid');
  if (grid.children.length > 0) return;
  
  grid.innerHTML = itemData.map((item, index) => `
    <div class="item-card" data-category="${item.category}" onclick="showItemDetail(${index})">
      <img class="item-icon" src="${ITEM_SPRITE_URL}${item.file}.png" alt="${item.name}" onerror="this.style.display='none'">
      <div class="item-name">${item.name}</div>
    </div>
  `).join('');
}

// 显示物品详情弹窗
function showItemDetail(index) {
  const item = itemData[index];
  if (!item) return;
  
  // 创建或获取模态框
  let modal = document.getElementById('itemDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'itemDetailModal';
    modal.className = 'item-modal';
    modal.innerHTML = `
      <div class="item-modal-backdrop" onclick="closeItemModal()"></div>
      <div class="item-modal-content">
        <button class="item-modal-close" onclick="closeItemModal()"><i class="bi bi-x-lg"></i></button>
        <div class="item-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // 根据物品类型生成不同内容
  let detailHtml = '';
  
  if (item.category === 'pokeball') {
    // 精灵球详情
    detailHtml = `
      <div class="item-detail-header">
        <img class="item-detail-icon" src="${ITEM_SPRITE_URL}${item.file}.png" alt="${item.name}" onerror="this.src='static/image/items/poke_ball.png'">
        <div class="item-detail-title">
          <h3>${item.name}</h3>
          <span class="item-detail-en">${item.nameEn || ''}</span>
        </div>
      </div>
      <div class="item-detail-stats">
        <div class="item-stat">
          <span class="item-stat-label">等级</span>
          <span class="item-stat-value">${item.tier || '基础'}</span>
        </div>
        <div class="item-stat">
          <span class="item-stat-label">捕获率</span>
          <span class="item-stat-value catch-rate">${item.catchRate || '1×'}</span>
        </div>
      </div>
      <div class="item-detail-desc">
        <h4><i class="bi bi-info-circle"></i> 说明</h4>
        <p>${item.desc || '暂无说明'}</p>
      </div>
      ${item.craft ? `
      <div class="item-detail-craft">
        <h4><i class="bi bi-hammer"></i> 合成配方</h4>
        ${item.craftGrid ? getCraftRecipeHtml(item.craftGrid, item.file) : 
          (item.craftItems ? getCraftRecipeHtml(convertToGrid(item.craftItems), item.file) : `<p>${item.craft}</p>`)}
      </div>
      ` : ''}
    `;
  } else if (item.category === 'evolution') {
    // 进化道具详情 - 支持结构化进化数据，带宝可梦图片
    const POKE_SPRITE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
    let evolvesHtml = '';
    if (item.evolvesData && item.evolvesData.length > 0) {
      evolvesHtml = item.evolvesData.map(e => `
        <div class="evolve-pair-with-img">
          <div class="evolve-pokemon">
            <img src="${POKE_SPRITE_URL}${e.fromId}.png" alt="${e.from}" onerror="this.style.display='none'">
            <span>${e.from}</span>
          </div>
          <i class="bi bi-arrow-right evolve-arrow"></i>
          <div class="evolve-pokemon">
            <img src="${POKE_SPRITE_URL}${e.toId}.png" alt="${e.to}" onerror="this.style.display='none'">
            <span>${e.to}</span>
          </div>
        </div>
      `).join('');
    } else if (item.evolves) {
      evolvesHtml = `<p>${item.evolves}</p>`;
    }
    
    detailHtml = `
      <div class="item-detail-header">
        <img class="item-detail-icon" src="${ITEM_SPRITE_URL}${item.file}.png" alt="${item.name}" onerror="this.src='static/image/items/fire_stone.png'">
        <div class="item-detail-title">
          <h3>${item.name}</h3>
          <span class="item-detail-en">${item.nameEn || ''}</span>
        </div>
      </div>
      <div class="item-detail-desc">
        <h4><i class="bi bi-info-circle"></i> 说明</h4>
        <p>${item.desc || '使特定宝可梦进化的道具。'}</p>
      </div>
      ${evolvesHtml ? `
      <div class="item-detail-evolves">
        <h4><i class="bi bi-arrow-repeat"></i> 可进化的宝可梦</h4>
        <div class="evolves-list-img">${evolvesHtml}</div>
      </div>
      ` : ''}
    `;
  } else if (item.category === 'held') {
    // 携带物品详情
    detailHtml = `
      <div class="item-detail-header">
        <img class="item-detail-icon" src="${ITEM_SPRITE_URL}${item.file}.png" alt="${item.name}" onerror="this.src='static/image/items/leftovers.png'">
        <div class="item-detail-title">
          <h3>${item.name}</h3>
          <span class="item-detail-en">${item.nameEn || ''}</span>
        </div>
      </div>
      <div class="item-detail-desc">
        <h4><i class="bi bi-shield-check"></i> 战斗效果</h4>
        <p>${item.desc || '携带后在战斗中发挥效果的道具。'}</p>
      </div>
    `;
  } else if (item.category === 'medicine') {
    // 药品详情
    detailHtml = `
      <div class="item-detail-header">
        <img class="item-detail-icon" src="${ITEM_SPRITE_URL}${item.file}.png" alt="${item.name}" onerror="this.src='static/image/items/potion.png'">
        <div class="item-detail-title">
          <h3>${item.name}</h3>
          <span class="item-detail-en">${item.nameEn || ''}</span>
        </div>
      </div>
      <div class="item-detail-desc">
        <h4><i class="bi bi-heart-pulse"></i> 效果</h4>
        <p>${item.desc || '用于恢复宝可梦状态的药品。'}</p>
      </div>
    `;
  } else if (item.category === 'berry') {
    // 树果详情
    detailHtml = `
      <div class="item-detail-header">
        <img class="item-detail-icon" src="${ITEM_SPRITE_URL}${item.file}.png" alt="${item.name}" onerror="this.src='static/image/items/oran_berry.png'">
        <div class="item-detail-title">
          <h3>${item.name}</h3>
          <span class="item-detail-en">${item.nameEn || ''}</span>
        </div>
      </div>
      <div class="item-detail-desc">
        <h4><i class="bi bi-flower1"></i> 效果</h4>
        <p>${item.desc || '可以种植或让宝可梦携带的树果。'}</p>
      </div>
    `;
  } else {
    // 默认详情
    detailHtml = `
      <div class="item-detail-header">
        <img class="item-detail-icon" src="${ITEM_SPRITE_URL}${item.file}.png" alt="${item.name}">
        <div class="item-detail-title">
          <h3>${item.name}</h3>
          <span class="item-detail-en">${item.nameEn || ''}</span>
        </div>
      </div>
      <div class="item-detail-desc">
        <h4><i class="bi bi-info-circle"></i> 说明</h4>
        <p>${item.desc || '暂无详细说明。'}</p>
      </div>
    `;
  }
  
  modal.querySelector('.item-modal-body').innerHTML = detailHtml;
  modal.classList.add('show');
  document.body.style.paddingRight = '17px';
  document.body.style.overflow = 'hidden';
}

// 关闭物品详情弹窗
function closeItemModal() {
  const modal = document.getElementById('itemDetailModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
  }
}

// ESC键关闭弹窗
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeItemModal();
    closeBiomeModal();
    closeMountModal();
    closeRecipeModal();
  }
});

// 进化数据
const evolutionData = [
  { pokemon: ['妙蛙种子', '妙蛙草', '妙蛙花'], ids: [1, 2, 3], conditions: ['Lv.16', 'Lv.32'], type: 'level' },
  { pokemon: ['小火龙', '火恐龙', '喷火龙'], ids: [4, 5, 6], conditions: ['Lv.16', 'Lv.36'], type: 'level' },
  { pokemon: ['杰尼龟', '卡咪龟', '水箭龟'], ids: [7, 8, 9], conditions: ['Lv.16', 'Lv.36'], type: 'level' },
  { pokemon: ['绿毛虫', '铁甲蛹', '巴大蝶'], ids: [10, 11, 12], conditions: ['Lv.7', 'Lv.10'], type: 'level' },
  { pokemon: ['皮丘', '皮卡丘', '雷丘'], ids: [172, 25, 26], conditions: ['亲密度', '雷之石'], type: 'stone' },
  { pokemon: ['伊布', '水伊布'], ids: [133, 134], conditions: ['水之石'], type: 'stone' },
  { pokemon: ['伊布', '火伊布'], ids: [133, 136], conditions: ['火之石'], type: 'stone' },
  { pokemon: ['伊布', '雷伊布'], ids: [133, 135], conditions: ['雷之石'], type: 'stone' },
  { pokemon: ['伊布', '太阳伊布'], ids: [133, 196], conditions: ['白天+亲密度'], type: 'friendship' },
  { pokemon: ['伊布', '月亮伊布'], ids: [133, 197], conditions: ['夜晚+亲密度'], type: 'friendship' },
  { pokemon: ['鬼斯', '鬼斯通', '耿鬼'], ids: [92, 93, 94], conditions: ['Lv.25', '交换'], type: 'trade' },
  { pokemon: ['凯西', '勇基拉', '胡地'], ids: [63, 64, 65], conditions: ['Lv.16', '交换'], type: 'trade' },
  { pokemon: ['腕力', '豪力', '怪力'], ids: [66, 67, 68], conditions: ['Lv.28', '交换'], type: 'trade' },
  { pokemon: ['小拳石', '隆隆石', '隆隆岩'], ids: [74, 75, 76], conditions: ['Lv.25', '交换'], type: 'trade' },
  { pokemon: ['皮皮', '皮可西'], ids: [35, 36], conditions: ['月之石'], type: 'stone' },
  { pokemon: ['六尾', '九尾'], ids: [37, 38], conditions: ['火之石'], type: 'stone' },
  { pokemon: ['走路草', '臭臭花', '霸王花'], ids: [43, 44, 45], conditions: ['Lv.21', '叶之石'], type: 'stone' }
];

function loadEvolutions() {
  const list = document.getElementById('evolutionList');
  if (list.children.length > 0) return;
  
  list.innerHTML = evolutionData.map(evo => `
    <div class="evolution-chain" data-category="${evo.type}">
      ${evo.pokemon.map((p, i) => `
        <div class="evolution-pokemon">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.ids[i]}.png" alt="${p}">
          <div class="evolution-pokemon-name">${p}</div>
        </div>
        ${i < evo.pokemon.length - 1 ? `
          <div>
            <div class="evolution-arrow">→</div>
            <div class="evolution-condition">${evo.conditions[i]}</div>
          </div>
        ` : ''}
      `).join('')}
    </div>
  `).join('');
}

// 骑乘数据 - 完整版
const mountData = [
  // 陆地骑乘
  { name: '烈焰马', nameEn: 'Rapidash', type: 'land', id: 78, desc: '速度极快的火焰马，奔跑时鬃毛会燃烧得更旺。' },
  { name: '伽勒尔烈焰马', nameEn: 'Galarian Rapidash', type: 'land', id: 78, desc: '伽勒尔地区的妖精系烈焰马，优雅而神秘。' },
  { name: '风速狗', nameEn: 'Arcanine', type: 'land', id: 59, desc: '传说中的宝可梦，奔跑速度极快，忠诚可靠。' },
  { name: '肯泰罗', nameEn: 'Tauros', type: 'land', id: 128, desc: '暴躁的公牛宝可梦，骑乘时需要小心。' },
  { name: '钻角犀兽', nameEn: 'Rhydon', type: 'land', id: 112, desc: '皮肤坚硬如岩石，可以在崎岖地形行走。' },
  { name: '坐骑山羊', nameEn: 'Gogoat', type: 'land', id: 673, desc: '温顺的山羊宝可梦，非常适合骑乘。' },
  { name: '象牙猪', nameEn: 'Mamoswine', type: 'land', id: 473, desc: '冰河时代的巨兽，可以在雪地中自由行动。' },
  { name: '超甲狂犀', nameEn: 'Rhyperior', type: 'land', id: 464, desc: '钻角犀兽的进化形态，更加强壮。' },
  { name: '大王铜象', nameEn: 'Copperajah', type: 'land', id: 879, desc: '巨大的铜象宝可梦，力大无穷。' },
  { name: '铁甲犀牛', nameEn: 'Rhyhorn', type: 'land', id: 111, desc: '虽然速度不快，但非常稳定。' },
  { name: '地鼠', nameEn: 'Donphan', type: 'land', id: 232, desc: '可以卷成球滚动前进。' },
  { name: '爆焰龟兽', nameEn: 'Coalossal', type: 'land', id: 839, desc: '背上燃烧着煤炭，可以在寒冷地区取暖。' },
  { name: '毛毛角羊', nameEn: 'Dubwool', type: 'land', id: 832, desc: '毛茸茸的羊，骑乘非常舒适。' },
  { name: '雷电斑马', nameEn: 'Zebstrika', type: 'land', id: 523, desc: '电系斑马，奔跑时会产生电火花。' },
  { name: '烈咬陆鲨', nameEn: 'Garchomp', type: 'land', id: 445, desc: '可以高速奔跑的龙系宝可梦。' },
  { name: '班基拉斯', nameEn: 'Tyranitar', type: 'land', id: 248, desc: '强大的岩石恐龙，行走时地动山摇。' },
  { name: '巨金怪', nameEn: 'Metagross', type: 'land', id: 376, desc: '四足钢系宝可梦，可以悬浮行走。' },
  { name: '索罗亚克', nameEn: 'Zoroark', type: 'land', id: 571, desc: '可以制造幻象的狐狸宝可梦。' },
  { name: '路卡利欧', nameEn: 'Lucario', type: 'land', id: 448, desc: '可以感知波导的格斗系宝可梦。' },
  // 水上骑乘
  { name: '暴鲤龙', nameEn: 'Gyarados', type: 'water', id: 130, desc: '凶猛的海龙，可以在水面上高速移动。' },
  { name: '乘龙', nameEn: 'Lapras', type: 'water', id: 131, desc: '温柔的海上旅行者，最经典的水上坐骑。' },
  { name: '巨翅飞鱼', nameEn: 'Mantine', type: 'water', id: 226, desc: '可以在水面上滑翔的飞鱼。' },
  { name: '帝牙海狮', nameEn: 'Walrein', type: 'water', id: 365, desc: '冰系海狮，可以在冰冷的水域中游泳。' },
  { name: '水箭龟', nameEn: 'Blastoise', type: 'water', id: 9, desc: '背上有水炮的巨龟，非常稳定。' },
  { name: '巨沼怪', nameEn: 'Swampert', type: 'water', id: 260, desc: '水地双系，可以在沼泽中自由行动。' },
  { name: '帝王拿波', nameEn: 'Empoleon', type: 'water', id: 395, desc: '帝王企鹅，游泳速度极快。' },
  { name: '大剑鬼', nameEn: 'Samurott', type: 'water', id: 503, desc: '武士海獭，可以在水中战斗。' },
  { name: '轰隆雉鸡', nameEn: 'Sharpedo', type: 'water', id: 319, desc: '凶猛的鲨鱼，水中速度极快。' },
  { name: '古空棘鱼', nameEn: 'Relicanth', type: 'water', id: 369, desc: '古老的深海鱼，可以潜入深水。' },
  { name: '海魔狮', nameEn: 'Sealeo', type: 'water', id: 364, desc: '可爱的海狮，游泳稳定。' },
  { name: '铁炮鱼', nameEn: 'Remoraid', type: 'water', id: 223, desc: '小型水系宝可梦，适合短途。' },
  { name: '吼鲸王', nameEn: 'Wailord', type: 'water', id: 321, desc: '巨大的鲸鱼，可以载多人。' },
  { name: '海兔兽', nameEn: 'Gastrodon', type: 'water', id: 423, desc: '软体海兔，可以在浅水区移动。' },
  // 飞行骑乘
  { name: '比雕', nameEn: 'Pidgeot', type: 'fly', id: 18, desc: '经典的飞行坐骑，速度和稳定性兼备。' },
  { name: '大嘴雀', nameEn: 'Fearow', type: 'fly', id: 22, desc: '长嘴鸟，飞行耐力强。' },
  { name: '化石翼龙', nameEn: 'Aerodactyl', type: 'fly', id: 142, desc: '远古翼龙，飞行速度极快。' },
  { name: '快龙', nameEn: 'Dragonite', type: 'fly', id: 149, desc: '温柔的龙，可以环游世界。' },
  { name: '喷火龙', nameEn: 'Charizard', type: 'fly', id: 6, desc: '最受欢迎的飞行坐骑之一。' },
  { name: '勇士雄鹰', nameEn: 'Braviary', type: 'fly', id: 628, desc: '勇敢的雄鹰，飞行姿态优美。' },
  { name: '钢铠鸦', nameEn: 'Corviknight', type: 'fly', id: 823, desc: '伽勒尔地区的出租车鸟。' },
  { name: '姆克鹰', nameEn: 'Staraptor', type: 'fly', id: 398, desc: '凶猛的猛禽，飞行速度快。' },
  { name: '大王燕', nameEn: 'Swellow', type: 'fly', id: 277, desc: '优雅的燕子，飞行技巧高超。' },
  { name: '暴飞龙', nameEn: 'Salamence', type: 'fly', id: 373, desc: '梦想成真的飞龙，飞行能力强大。' },
  { name: '七夕青鸟', nameEn: 'Altaria', type: 'fly', id: 334, desc: '云朵般的翅膀，飞行非常舒适。' },
  { name: '音波龙', nameEn: 'Noivern', type: 'fly', id: 715, desc: '蝙蝠龙，可以在黑暗中飞行。' },
  { name: '烈箭鹰', nameEn: 'Talonflame', type: 'fly', id: 663, desc: '火焰猎鹰，飞行速度极快。' },
  { name: '战骑帅', nameEn: 'Skarmory', type: 'fly', id: 227, desc: '钢铁之鸟，防御力强。' },
  { name: '闪电鸟', nameEn: 'Zapdos', type: 'fly', id: 145, desc: '传说中的雷电之鸟。' },
  { name: '火焰鸟', nameEn: 'Moltres', type: 'fly', id: 146, desc: '传说中的火焰之鸟。' },
  { name: '急冻鸟', nameEn: 'Articuno', type: 'fly', id: 144, desc: '传说中的冰雪之鸟。' },
  { name: '洛奇亚', nameEn: 'Lugia', type: 'fly', id: 249, desc: '海之神，可以在海上飞行。' },
  { name: '凤王', nameEn: 'Ho-Oh', type: 'fly', id: 250, desc: '彩虹之鸟，传说中的神兽。' },
  { name: '裂空座', nameEn: 'Rayquaza', type: 'fly', id: 384, desc: '天空之龙，可以在大气层飞行。' }
];

function loadMounts() {
  const grid = document.getElementById('mountGrid');
  if (grid.children.length > 0) return;
  
  grid.innerHTML = mountData.map((mount, index) => `
    <div class="mount-card" data-category="${mount.type}" onclick="showMountDetail(${index})">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mount.id}.png" alt="${mount.name}">
      <div class="mount-name">${mount.name}</div>
      <span class="mount-type ${mount.type}">${mount.type === 'land' ? '陆地' : mount.type === 'water' ? '水上' : '飞行'}</span>
    </div>
  `).join('');
}

// 显示骑乘详情弹窗
function showMountDetail(index) {
  const mount = mountData[index];
  if (!mount) return;
  
  let modal = document.getElementById('mountDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mountDetailModal';
    modal.className = 'item-modal';
    modal.innerHTML = `
      <div class="item-modal-backdrop" onclick="closeMountModal()"></div>
      <div class="item-modal-content">
        <button class="item-modal-close" onclick="closeMountModal()"><i class="bi bi-x-lg"></i></button>
        <div class="item-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const typeNames = { land: '陆地骑乘', water: '水上骑乘', fly: '飞行骑乘' };
  const typeIcons = { land: 'bi-signpost-2', water: 'bi-water', fly: 'bi-cloud' };
  const typeDescs = {
    land: '可以在陆地上骑乘，提高移动速度。',
    water: '可以在水面上骑乘，快速穿越海洋和河流。',
    fly: '可以在空中飞行骑乘，自由翱翔天际！'
  };
  
  modal.querySelector('.item-modal-body').innerHTML = `
    <div class="item-detail-header">
      <img class="item-detail-icon" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mount.id}.png" 
           alt="${mount.name}" style="background: transparent;" 
           onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mount.id}.png'">
      <div class="item-detail-title">
        <h3>${mount.name}</h3>
        <span class="item-detail-en">${mount.nameEn}</span>
      </div>
    </div>
    <div class="item-detail-stats">
      <div class="item-stat">
        <span class="item-stat-label">骑乘类型</span>
        <span class="item-stat-value"><i class="bi ${typeIcons[mount.type]}"></i> ${typeNames[mount.type]}</span>
      </div>
      <div class="item-stat">
        <span class="item-stat-label">图鉴编号</span>
        <span class="item-stat-value catch-rate">#${String(mount.id).padStart(3, '0')}</span>
      </div>
    </div>
    <div class="item-detail-desc">
      <h4><i class="bi bi-bicycle"></i> 骑乘说明</h4>
      <p>${typeDescs[mount.type]} 在Cobblemon 1.7.0版本中新增的骑乘功能，让你可以骑乘宝可梦探索世界！</p>
    </div>
  `;
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeMountModal() {
  const modal = document.getElementById('mountDetailModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// 食谱数据
const recipeData = [
  { name: '甜蜜 Poké Snack', category: 'snack', ingredients: ['甜浆果', '蜂蜜'], result: '吸引草系/虫系宝可梦', icon: '🍬' },
  { name: '辛辣 Poké Snack', category: 'snack', ingredients: ['辣浆果', '火药粉'], result: '吸引火系宝可梦', icon: '🌶️' },
  { name: '酸涩 Poké Snack', category: 'snack', ingredients: ['酸浆果', '柠檬'], result: '吸引电系宝可梦', icon: '🍋' },
  { name: '苦涩 Poké Snack', category: 'snack', ingredients: ['苦浆果', '可可豆'], result: '吸引毒系/幽灵系宝可梦', icon: '🍫' },
  { name: '咸味 Poké Snack', category: 'snack', ingredients: ['咸浆果', '海盐'], result: '吸引水系/岩石系宝可梦', icon: '🧂' },
  { name: '浆果咖喱', category: 'curry', ingredients: ['米饭', '咖喱粉', '浆果'], result: '恢复宝可梦体力', icon: '🍛' },
  { name: '蘑菇咖喱', category: 'curry', ingredients: ['米饭', '咖喱粉', '蘑菇'], result: '恢复体力+状态', icon: '🍄' },
  { name: '肉类咖喱', category: 'curry', ingredients: ['米饭', '咖喱粉', '肉'], result: '大幅恢复体力', icon: '🥩' },
  { name: '浆果汤', category: 'soup', ingredients: ['水', '混合浆果'], result: '恢复少量体力', icon: '🍵' },
  { name: '蘑菇汤', category: 'soup', ingredients: ['水', '蘑菇', '香草'], result: '治愈异常状态', icon: '🥣' }
];

function loadRecipes() {
  const grid = document.getElementById('recipeGrid');
  if (grid.children.length > 0) return;
  
  grid.innerHTML = recipeData.map((recipe, index) => `
    <div class="recipe-card" data-category="${recipe.category}" onclick="showRecipeDetail(${index})">
      <div class="recipe-title"><span>${recipe.icon}</span> ${recipe.name}</div>
      <div class="recipe-ingredients">
        ${recipe.ingredients.map(ing => `<span class="recipe-ingredient">${ing}</span>`).join('')}
      </div>
      <div class="recipe-result"><i class="bi bi-arrow-right"></i> ${recipe.result}</div>
    </div>
  `).join('');
}

// 显示食谱详情弹窗
function showRecipeDetail(index) {
  const recipe = recipeData[index];
  if (!recipe) return;
  
  let modal = document.getElementById('recipeDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'recipeDetailModal';
    modal.className = 'item-modal';
    modal.innerHTML = `
      <div class="item-modal-backdrop" onclick="closeRecipeModal()"></div>
      <div class="item-modal-content">
        <button class="item-modal-close" onclick="closeRecipeModal()"><i class="bi bi-x-lg"></i></button>
        <div class="item-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const categoryNames = { snack: 'Poké Snacks', curry: '咖喱料理', soup: '汤品料理' };
  const categoryDescs = {
    snack: '使用篝火锅制作的小食，可以吸引特定属性的野生宝可梦出现。',
    curry: '使用篝火锅制作的咖喱料理，可以恢复宝可梦的体力和状态。',
    soup: '使用篝火锅制作的汤品，具有治愈效果。'
  };
  
  const ingredientsHtml = recipe.ingredients.map(ing => `<span class="biome-pokemon-tag">${ing}</span>`).join('');
  
  modal.querySelector('.item-modal-body').innerHTML = `
    <div class="item-detail-header">
      <div class="biome-icon-box" style="font-size: 3rem;">
        ${recipe.icon}
      </div>
      <div class="item-detail-title">
        <h3>${recipe.name}</h3>
        <span class="item-detail-en">${categoryNames[recipe.category]}</span>
      </div>
    </div>
    <div class="item-detail-stats">
      <div class="item-stat">
        <span class="item-stat-label">料理类型</span>
        <span class="item-stat-value">${categoryNames[recipe.category]}</span>
      </div>
      <div class="item-stat">
        <span class="item-stat-label">材料数量</span>
        <span class="item-stat-value catch-rate">${recipe.ingredients.length} 种</span>
      </div>
    </div>
    <div class="item-detail-craft">
      <h4><i class="bi bi-basket"></i> 所需材料</h4>
      <div class="biome-pokemon-list">${ingredientsHtml}</div>
    </div>
    <div class="item-detail-evolves">
      <h4><i class="bi bi-magic"></i> 料理效果</h4>
      <p>${recipe.result}</p>
    </div>
    <div class="item-detail-desc">
      <h4><i class="bi bi-info-circle"></i> 说明</h4>
      <p>${categoryDescs[recipe.category]} 这是Cobblemon 1.7.0版本新增的篝火锅烹饪系统！</p>
    </div>
  `;
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
  const modal = document.getElementById('recipeDetailModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// 分类筛选
function initFilters() {
  document.querySelectorAll('.category-filters').forEach(container => {
    container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const panel = btn.closest('.cobblemon-panel').dataset.panel;
        filterData(panel, btn.dataset.category);
      });
    });
  });
}

function filterData(panel, category) {
  const selectors = {
    biomes: '#biomeGrid .biome-card',
    items: '#itemGrid .item-card',
    evolution: '#evolutionList .evolution-chain',
    mounts: '#mountGrid .mount-card',
    cooking: '#recipeGrid .recipe-card'
  };
  
  document.querySelectorAll(selectors[panel]).forEach(item => {
    item.style.display = (category === 'all' || item.dataset.category === category) ? '' : 'none';
  });
}

// 搜索功能
function initSearch() {
  document.querySelectorAll('.cobblemon-search-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const panel = input.closest('.cobblemon-panel').dataset.panel;
      searchData(panel, query);
    });
  });
}

function searchData(panel, query) {
  const selectors = {
    biomes: '#biomeGrid .biome-card',
    items: '#itemGrid .item-card',
    evolution: '#evolutionList .evolution-chain',
    mounts: '#mountGrid .mount-card',
    cooking: '#recipeGrid .recipe-card',
    models: '#modelList .model-item'
  };
  
  document.querySelectorAll(selectors[panel]).forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? '' : 'none';
  });
}

// 3D 模型查看器
let modelScene, modelCamera, modelRenderer, modelControls, currentModel;
let modelViewerInitialized = false;

// 可用的模型列表
const availableModels = [
  { name: 'pikachu', file: 'pikachu.glb' },
  { name: 'bulbasaur', file: 'bulbasaur.geo.glb' }
];

function loadModels() {
  const list = document.getElementById('modelList');
  if (list.children.length > 0) return;
  
  list.innerHTML = availableModels.map((m, i) => `
    <div class="model-item" data-model="${m.file}" onclick="loadModel('${m.file}', '${m.name}')">
      ${m.name}
    </div>
  `).join('');
}

async function initModelViewer() {
  if (modelViewerInitialized) return;
  
  const container = document.getElementById('modelViewer');
  const placeholder = container.querySelector('.model-placeholder');
  if (placeholder) placeholder.remove();
  
  // 动态导入 Three.js
  const THREE = await import('three');
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  
  // 保存到全局
  window.THREE = THREE;
  window.OrbitControls = OrbitControls;
  window.GLTFLoader = GLTFLoader;
  
  // 场景
  modelScene = new THREE.Scene();
  modelScene.background = new THREE.Color(0x1c1814);
  
  // 相机
  modelCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  modelCamera.position.set(0, 100, -300);
  
  // 渲染器
  modelRenderer = new THREE.WebGLRenderer({ antialias: true });
  modelRenderer.setSize(container.clientWidth, container.clientHeight);
  modelRenderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(modelRenderer.domElement);
  
  // 控制器
  modelControls = new OrbitControls(modelCamera, modelRenderer.domElement);
  modelControls.enableDamping = true;
  modelControls.dampingFactor = 0.05;
  modelControls.target.set(0, 60, 0);
  modelControls.enableZoom = true;
  modelControls.minDistance = 50;
  modelControls.maxDistance = 500;
  
  // 灯光
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  modelScene.add(ambient);
  
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(10, 20, 10);
  modelScene.add(directional);
  
  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-10, 10, -10);
  modelScene.add(backLight);
  
  // 添加控制提示
  const controls = document.createElement('div');
  controls.className = 'model-controls';
  controls.textContent = '🖱️ 拖动旋转 | 滚轮缩放';
  container.appendChild(controls);
  
  // 动画循环
  function animate() {
    requestAnimationFrame(animate);
    modelControls.update();
    modelRenderer.render(modelScene, modelCamera);
  }
  animate();
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    modelCamera.aspect = w / h;
    modelCamera.updateProjectionMatrix();
    modelRenderer.setSize(w, h);
  });
  
  modelViewerInitialized = true;
}

async function loadModel(file, name) {
  await initModelViewer();
  
  const THREE = window.THREE;
  const GLTFLoader = window.GLTFLoader;
  
  // 更新选中状态
  document.querySelectorAll('.model-item').forEach(item => {
    item.classList.toggle('active', item.dataset.model === file);
  });
  
  // 移除旧模型
  if (currentModel) {
    modelScene.remove(currentModel);
  }
  
  // 移除旧的信息
  const oldInfo = document.querySelector('.model-info');
  if (oldInfo) oldInfo.remove();
  
  // 加载新模型
  const loader = new GLTFLoader();
  loader.load(
    `./static/models/${file}`,
    (gltf) => {
      currentModel = gltf.scene;
      
      // 计算边界并缩放
      const box = new THREE.Box3().setFromObject(currentModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 150 / maxDim;
      currentModel.scale.set(scale, scale, scale);
      
      // 重新计算中心
      const newBox = new THREE.Box3().setFromObject(currentModel);
      const newCenter = newBox.getCenter(new THREE.Vector3());
      
      // 调整相机
      modelControls.target.copy(newCenter);
      modelCamera.position.set(newCenter.x, newCenter.y + 30, newCenter.z - 280);
      
      // 像素风格贴图
      currentModel.traverse((child) => {
        if (child.isMesh && child.material.map) {
          child.material.map.magFilter = THREE.NearestFilter;
          child.material.map.minFilter = THREE.NearestFilter;
        }
      });
      
      modelScene.add(currentModel);
      
      // 显示模型名称
      const info = document.createElement('div');
      info.className = 'model-info';
      info.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      document.getElementById('modelViewer').appendChild(info);
    },
    undefined,
    (error) => {
      console.error('模型加载失败:', error);
    }
  );
}

// ========== 招式图鉴 (使用 PokeAPI) ==========
let allMoves = [];
let movesLoaded = false;
let movesLoading = false;
let movesDisplayCount = 50; // 每次显示数量
let currentMoveFilter = []; // 当前筛选结果

let allAbilities = [];
let abilitiesLoaded = false;
let abilitiesLoading = false;
let abilitiesDisplayCount = 50; // 每次显示数量
let currentAbilityFilter = []; // 当前筛选结果

const typeColors = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC'
};

const typeNames = {
  normal: '一般', fire: '火', water: '水', electric: '电', grass: '草',
  ice: '冰', fighting: '格斗', poison: '毒', ground: '地面', flying: '飞行',
  psychic: '超能力', bug: '虫', rock: '岩石', ghost: '幽灵', dragon: '龙',
  dark: '恶', steel: '钢', fairy: '妖精'
};

const typeOrder = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

// 生成属性图标HTML（使用精灵图）
function typeIcon(type, size = '') {
  return `<span class="type-icon ${type} ${size}" title="${typeNames[type] || type}"></span>`;
}

// ========== 招式图鉴 ==========
async function loadMoves() {
  const list = document.getElementById('moveList');
  if (!list) return;
  
  if (movesLoaded) {
    renderMoves(allMoves.slice(0, movesDisplayCount));
    return;
  }
  
  if (movesLoading) return;
  movesLoading = true;
  
  list.innerHTML = '<div class="loading-indicator"><div class="loading-icon"><i class="bi bi-lightning-charge"></i></div><p>招式图鉴</p><p class="loading-progress">0 / 900+</p></div>';
  
  try {
    // 获取所有招式列表
    const response = await fetch('https://pokeapi.co/api/v2/move?limit=1000');
    const data = await response.json();
    
    // 批量获取招式详情（分批处理避免请求过多）
    const batchSize = 50;
    const moves = [];
    
    for (let i = 0; i < Math.min(data.results.length, 500); i += batchSize) {
      const batch = data.results.slice(i, i + batchSize);
      const batchPromises = batch.map(async (move) => {
        try {
          const moveData = await fetch(move.url).then(r => r.json());
          const zhName = moveData.names?.find(n => n.language.name === 'zh-Hans')?.name || 
                         moveData.names?.find(n => n.language.name === 'zh-Hant')?.name || 
                         moveData.name;
          return {
            id: moveData.id,
            name: zhName,
            nameEn: moveData.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: moveData.type?.name || 'normal',
            category: moveData.damage_class?.name || 'status',
            power: moveData.power || '-',
            accuracy: moveData.accuracy || '-',
            pp: moveData.pp || '-',
            desc: moveData.flavor_text_entries?.find(e => e.language.name === 'zh-Hans')?.flavor_text ||
                  moveData.flavor_text_entries?.find(e => e.language.name === 'zh-Hant')?.flavor_text ||
                  moveData.flavor_text_entries?.find(e => e.language.name === 'en')?.flavor_text || ''
          };
        } catch (e) {
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      moves.push(...batchResults.filter(m => m !== null));
      
      // 更新进度
      const progress = document.querySelector('.loading-progress');
      if (progress) progress.textContent = `${moves.length} / ${Math.min(data.results.length, 500)}`;
    }
    
    allMoves = moves.sort((a, b) => a.id - b.id);
    movesLoaded = true;
    movesLoading = false;
    
    renderMoves(allMoves.slice(0, movesDisplayCount));
    initMoveFilters();
    
  } catch (error) {
    console.error('加载招式失败:', error);
    list.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i> 加载失败，请刷新重试</div>';
    movesLoading = false;
  }
}

function renderMoves(moves) {
  const list = document.getElementById('moveList');
  if (!list) return;
  
  if (moves.length === 0) {
    list.innerHTML = '<div class="empty-message">没有找到匹配的招式</div>';
    return;
  }
  
  list.innerHTML = moves.map(move => `
    <div class="move-card" data-type="${move.type}" data-category="${move.category}">
      <div class="move-info">
        <span class="move-name">${move.name}</span>
        <span class="move-name-en">${move.nameEn}</span>
      </div>
      ${typeIcon(move.type, 'small')}
      <span class="move-category ${move.category}">${move.category === 'physical' ? '物理' : move.category === 'special' ? '特殊' : '变化'}</span>
      <div class="move-stats">
        <div class="move-stat"><span class="move-stat-label">威力</span><span class="move-stat-value">${move.power}</span></div>
        <div class="move-stat"><span class="move-stat-label">命中</span><span class="move-stat-value">${move.accuracy}</span></div>
        <div class="move-stat"><span class="move-stat-label">PP</span><span class="move-stat-value">${move.pp}</span></div>
      </div>
    </div>
  `).join('');
  
  // 显示总数和加载更多按钮
  const total = currentMoveFilter.length || allMoves.length;
  const countInfo = document.querySelector('[data-panel="moves"] .result-count');
  if (!countInfo) {
    const panel = document.querySelector('[data-panel="moves"]');
    const info = document.createElement('div');
    info.className = 'result-count';
    info.textContent = `显示 ${moves.length} / ${total} 个招式`;
    panel.querySelector('.cobblemon-search').after(info);
  } else {
    countInfo.textContent = `显示 ${moves.length} / ${total} 个招式`;
  }
  
  // 显示/隐藏加载更多按钮
  const loadMoreBtn = document.getElementById('moveLoadMore');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = moves.length < total ? 'block' : 'none';
  }
}

// 加载更多招式
function loadMoreMoves() {
  movesDisplayCount += 50;
  const data = currentMoveFilter.length > 0 ? currentMoveFilter : allMoves;
  renderMoves(data.slice(0, movesDisplayCount));
}

function initMoveFilters() {
  const panel = document.querySelector('[data-panel="moves"]');
  if (!panel) return;
  
  // 生成属性筛选图标按钮
  const typeFilters = document.getElementById('moveTypeFilters');
  if (typeFilters && typeFilters.children.length === 0) {
    typeFilters.innerHTML = typeOrder.map(type => `
      <button class="type-btn-icon" data-type="${type}" title="${typeNames[type]}">
        ${typeIcon(type)}
      </button>
    `).join('');
  }
  
  // 分类筛选
  panel.querySelectorAll('.category-btn').forEach(btn => {
    btn.removeEventListener('click', handleMoveCategoryClick);
    btn.addEventListener('click', handleMoveCategoryClick);
  });
  
  // 属性筛选
  panel.querySelectorAll('.type-btn-icon').forEach(btn => {
    btn.removeEventListener('click', handleMoveTypeClick);
    btn.addEventListener('click', handleMoveTypeClick);
  });
  
  // 搜索
  const searchInput = document.getElementById('moveSearch');
  searchInput.removeEventListener('input', filterMoves);
  searchInput.addEventListener('input', filterMoves);
}

function handleMoveCategoryClick(e) {
  const panel = document.querySelector('[data-panel="moves"]');
  panel.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  filterMoves();
}

function handleMoveTypeClick(e) {
  const btn = e.target.closest('.type-btn-icon');
  if (!btn) return;
  
  const panel = document.querySelector('[data-panel="moves"]');
  const wasActive = btn.classList.contains('active');
  
  // 单选模式：先取消所有，再选中当前（如果之前未选中）
  panel.querySelectorAll('.type-btn-icon').forEach(b => b.classList.remove('active'));
  if (!wasActive) btn.classList.add('active');
  
  filterMoves();
}

function filterMoves() {
  if (!movesLoaded) return;
  
  const panel = document.querySelector('[data-panel="moves"]');
  const category = panel.querySelector('.category-btn.active')?.dataset.category || 'all';
  const activeTypes = [...panel.querySelectorAll('.type-btn-icon.active')].map(b => b.dataset.type);
  const search = document.getElementById('moveSearch').value.toLowerCase();
  
  let filtered = allMoves;
  if (category !== 'all') filtered = filtered.filter(m => m.category === category);
  if (activeTypes.length > 0) filtered = filtered.filter(m => activeTypes.includes(m.type));
  if (search) filtered = filtered.filter(m => 
    m.name.toLowerCase().includes(search) || 
    m.nameEn.toLowerCase().includes(search)
  );
  
  currentMoveFilter = filtered;
  movesDisplayCount = 50; // 重置显示数量
  renderMoves(filtered.slice(0, movesDisplayCount));
}

// ========== 特性图鉴 ==========
async function loadAbilities() {
  const list = document.getElementById('abilityList');
  if (!list) return;
  
  if (abilitiesLoaded) {
    renderAbilities(allAbilities.slice(0, abilitiesDisplayCount));
    return;
  }
  
  if (abilitiesLoading) return;
  abilitiesLoading = true;
  
  list.innerHTML = '<div class="loading-indicator"><div class="loading-icon"><i class="bi bi-star"></i></div><p>特性图鉴</p><p class="loading-progress">0 / 300+</p></div>';
  
  try {
    const response = await fetch('https://pokeapi.co/api/v2/ability?limit=400');
    const data = await response.json();
    
    const batchSize = 30;
    const abilities = [];
    
    for (let i = 0; i < data.results.length; i += batchSize) {
      const batch = data.results.slice(i, i + batchSize);
      const batchPromises = batch.map(async (ability) => {
        try {
          const abilityData = await fetch(ability.url).then(r => r.json());
          const zhName = abilityData.names?.find(n => n.language.name === 'zh-Hans')?.name ||
                         abilityData.names?.find(n => n.language.name === 'zh-Hant')?.name ||
                         abilityData.name;
          const desc = abilityData.flavor_text_entries?.find(e => e.language.name === 'zh-Hans')?.flavor_text ||
                       abilityData.flavor_text_entries?.find(e => e.language.name === 'zh-Hant')?.flavor_text ||
                       abilityData.flavor_text_entries?.find(e => e.language.name === 'en')?.flavor_text || '';
          
          return {
            id: abilityData.id,
            name: zhName,
            nameEn: abilityData.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            desc: desc.replace(/\n/g, ' ')
          };
        } catch (e) {
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      abilities.push(...batchResults.filter(a => a !== null));
      
      const progress = document.querySelector('.loading-progress');
      if (progress) progress.textContent = `${abilities.length} / ${data.results.length}`;
    }
    
    allAbilities = abilities.sort((a, b) => a.id - b.id);
    abilitiesLoaded = true;
    abilitiesLoading = false;
    
    renderAbilities(allAbilities.slice(0, abilitiesDisplayCount));
    initAbilityFilters();
    
  } catch (error) {
    console.error('加载特性失败:', error);
    list.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i> 加载失败，请刷新重试</div>';
    abilitiesLoading = false;
  }
}

function renderAbilities(abilities) {
  const list = document.getElementById('abilityList');
  if (!list) return;
  
  if (abilities.length === 0) {
    list.innerHTML = '<div class="empty-message">没有找到匹配的特性</div>';
    return;
  }
  
  list.innerHTML = abilities.map(ability => `
    <div class="ability-card">
      <div class="ability-header">
        <span><span class="ability-name">${ability.name}</span><span class="ability-name-en">${ability.nameEn}</span></span>
      </div>
      <div class="ability-desc">${ability.desc}</div>
    </div>
  `).join('');
  
  // 显示总数和加载更多按钮
  const total = currentAbilityFilter.length || allAbilities.length;
  const countInfo = document.querySelector('[data-panel="abilities"] .result-count');
  if (!countInfo) {
    const panel = document.querySelector('[data-panel="abilities"]');
    const info = document.createElement('div');
    info.className = 'result-count';
    info.textContent = `显示 ${abilities.length} / ${total} 个特性`;
    panel.querySelector('.cobblemon-search').after(info);
  } else {
    countInfo.textContent = `显示 ${abilities.length} / ${total} 个特性`;
  }
  
  // 显示/隐藏加载更多按钮
  const loadMoreBtn = document.getElementById('abilityLoadMore');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = abilities.length < total ? 'block' : 'none';
  }
}

// 加载更多特性
function loadMoreAbilities() {
  abilitiesDisplayCount += 50;
  const data = currentAbilityFilter.length > 0 ? currentAbilityFilter : allAbilities;
  renderAbilities(data.slice(0, abilitiesDisplayCount));
}

function initAbilityFilters() {
  const searchInput = document.getElementById('abilitySearch');
  if (!searchInput) return;
  searchInput.removeEventListener('input', filterAbilities);
  searchInput.addEventListener('input', filterAbilities);
}

function filterAbilities() {
  if (!abilitiesLoaded) return;
  
  const search = document.getElementById('abilitySearch').value.toLowerCase();
  
  let filtered = allAbilities;
  if (search) filtered = filtered.filter(a => 
    a.name.toLowerCase().includes(search) || 
    a.nameEn.toLowerCase().includes(search) ||
    a.desc.toLowerCase().includes(search)
  );
  
  currentAbilityFilter = filtered;
  abilitiesDisplayCount = 50; // 重置显示数量
  renderAbilities(filtered.slice(0, abilitiesDisplayCount));
}

// ========== 属性相克表 ==========
const typeChart = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// 已选属性列表
let selectedTypes = [];

function loadTypeChart() {
  initTypeChartButtons();
  renderTypeChartTable();
}

function initTypeChartButtons() {
  const container = document.getElementById('typeChartButtons');
  if (!container || container.children.length > 0) return;
  
  container.innerHTML = typeOrder.map(type => `
    <button class="type-btn-img" data-type="${type}" onclick="toggleTypeSelection('${type}')">${typeIcon(type)}</button>
  `).join('');
}

// 切换属性选择
function toggleTypeSelection(type) {
  const index = selectedTypes.indexOf(type);
  
  if (index > -1) {
    // 已选中，取消选择
    selectedTypes.splice(index, 1);
  } else if (selectedTypes.length < 2) {
    // 未选中且不超过2个，添加
    selectedTypes.push(type);
  } else {
    // 已有2个，替换第二个
    selectedTypes[1] = type;
  }
  
  updateTypeSelection();
  showTypeResult();
}

// 清除选择
function clearTypeSelection() {
  selectedTypes = [];
  updateTypeSelection();
  document.getElementById('typeChartResult').innerHTML = `
    <div class="typechart-placeholder">
      <i class="bi bi-hand-index"></i>
      <p>点击上方属性按钮开始查询</p>
    </div>
  `;
}

// 更新选择显示
function updateTypeSelection() {
  // 更新按钮状态
  document.querySelectorAll('#typeChartButtons .type-btn-img').forEach(btn => {
    btn.classList.toggle('selected', selectedTypes.includes(btn.dataset.type));
  });
  
  // 更新已选显示
  const display = document.getElementById('selectedTypes');
  const clearBtn = document.getElementById('clearTypesBtn');
  
  if (selectedTypes.length === 0) {
    display.innerHTML = '<span class="selected-label">已选：</span><span class="selected-none">未选择</span>';
    clearBtn.style.display = 'none';
  } else {
    display.innerHTML = '<span class="selected-label">已选：</span>' + 
      selectedTypes.map(t => typeIcon(t)).join(' <span style="color:var(--gray)">+</span> ');
    clearBtn.style.display = 'block';
  }
}

// 计算双属性防御倍率
function getDefenseMultiplier(attackType, defenseTypes) {
  let multiplier = 1;
  defenseTypes.forEach(defType => {
    const eff = typeChart[attackType]?.[defType];
    if (eff !== undefined) multiplier *= eff;
  });
  return multiplier;
}

function showTypeResult() {
  if (selectedTypes.length === 0) return;
  
  const result = document.getElementById('typeChartResult');
  const types = selectedTypes;
  const isSingle = types.length === 1;
  
  // 计算防御倍率
  const weak4x = [], weak2x = [], resist025x = [], resist05x = [], immune = [];
  typeOrder.forEach(attackType => {
    const mult = getDefenseMultiplier(attackType, types);
    if (mult === 0) immune.push(attackType);
    else if (mult === 4) weak4x.push(attackType);
    else if (mult === 2) weak2x.push(attackType);
    else if (mult === 0.5) resist05x.push(attackType);
    else if (mult === 0.25) resist025x.push(attackType);
  });
  
  const typeTitle = types.map(t => typeNames[t]).join(' / ');
  const typeIcons = types.map(t => typeIcon(t)).join(' ');
  
  result.innerHTML = `
    <div class="type-result-header">
      ${typeIcons}
      <span class="type-result-title">${typeTitle} 防御相克</span>
    </div>
    ${weak4x.length ? `
    <div class="type-result-section">
      <h4><i class="bi bi-exclamation-triangle"></i> 4× 超级弱点</h4>
      <div class="type-result-tags">
        ${weak4x.map(t => `<span class="type-result-tag">${typeIcon(t)}</span>`).join('')}
      </div>
    </div>` : ''}
    <div class="type-result-section">
      <h4><i class="bi bi-shield-exclamation"></i> 2× 弱点</h4>
      <div class="type-result-tags">
        ${weak2x.length ? weak2x.map(t => `<span class="type-result-tag">${typeIcon(t)}</span>`).join('') : '<span class="type-result-empty">无</span>'}
      </div>
    </div>
    <div class="type-result-section">
      <h4><i class="bi bi-shield-check"></i> 0.5× 抗性</h4>
      <div class="type-result-tags">
        ${resist05x.length ? resist05x.map(t => `<span class="type-result-tag">${typeIcon(t)}</span>`).join('') : '<span class="type-result-empty">无</span>'}
      </div>
    </div>
    ${resist025x.length ? `
    <div class="type-result-section">
      <h4><i class="bi bi-shield-fill-check"></i> 0.25× 双重抗性</h4>
      <div class="type-result-tags">
        ${resist025x.map(t => `<span class="type-result-tag">${typeIcon(t)}</span>`).join('')}
      </div>
    </div>` : ''}
    <div class="type-result-section">
      <h4><i class="bi bi-shield-x"></i> 0× 免疫</h4>
      <div class="type-result-tags">
        ${immune.length ? immune.map(t => `<span class="type-result-tag">${typeIcon(t)}</span>`).join('') : '<span class="type-result-empty">无</span>'}
      </div>
    </div>
  `;
}

function renderTypeChartTable() {
  const table = document.getElementById('typeChartTable');
  if (!table || table.children.length > 0) return;
  
  let html = '<div class="typechart-cell header"></div>';
  typeOrder.forEach(t => {
    html += `<div class="typechart-cell header">${typeIcon(t)}</div>`;
  });
  
  typeOrder.forEach(attacker => {
    html += `<div class="typechart-cell header">${typeIcon(attacker)}</div>`;
    typeOrder.forEach(defender => {
      const eff = typeChart[attacker]?.[defender] ?? 1;
      let cls = 'normal';
      let text = '';
      if (eff === 2) { cls = 'super'; text = '2'; }
      else if (eff === 0.5) { cls = 'not-very'; text = '½'; }
      else if (eff === 0) { cls = 'immune'; text = '0'; }
      html += `<div class="typechart-cell ${cls}">${text}</div>`;
    });
  });
  
  table.innerHTML = html;
}

// 更新 loadPanelData 函数以支持新面板
const originalLoadPanelData = loadPanelData;
loadPanelData = function(panel) {
  switch(panel) {
    case 'moves': loadMoves(); break;
    case 'abilities': loadAbilities(); break;
    case 'typechart': loadTypeChart(); break;
    default: originalLoadPanelData(panel);
  }
};
