/**
 * 弹幕系统模块
 * 可接入真实玩家留言API
 * 特性：防重叠检测、随机速度、轨道管理
 */

const DanmakuSystem = {
  container: document.getElementById('danmakuContainer'),
  tracks: 8,                    // 弹幕轨道数量
  trackData: [],                // 每个轨道的详细状态
  interval: 2500,               // 弹幕发送间隔(ms)
  minSpeed: 10,                 // 最小速度(秒)
  maxSpeed: 18,                 // 最大速度(秒)
  trackHeight: 8,               // 每个轨道高度(vh)
  startOffset: 12,              // 起始偏移(vh)
  isPageVisible: true,          // 页面是否可见
  lastSendTime: 0,              // 上次发送时间
  timerId: null,                // 定时器ID
  
  // ========================================
  // 示例留言数据 - 未来可替换为API获取
  // ========================================
  messages: [
    { name: '李太白', msg: '此地甚妙，宛如仙境！', avatar: 'MHF_Steve' },
    { name: '杜子美', msg: '官府清明，百姓安乐', avatar: 'MHF_Alex' },
    { name: '白乐天', msg: '在此三载，甚是稳当', avatar: 'Notch' },
    { name: '王摩诘', msg: '行云流水，畅快淋漓', avatar: 'Dream' },
    { name: '新入城者', msg: '初来乍到，已得高人指点', avatar: 'MHF_Steve' },
    { name: '匠人张', msg: '此乃建造者之福地也', avatar: 'MHF_Alex' },
    { name: '书生陈', msg: '盛世长安，名不虚传', avatar: 'Notch' },
    { name: '侠客刘', msg: '江湖儿女，齐聚于此', avatar: 'Dream' },
  ],
  
  // ========================================
  // 初始化
  // ========================================
  init() {
    // 初始化轨道数据
    for (let i = 0; i < this.tracks; i++) {
      this.trackData[i] = {
        occupied: false,      // 是否被占用
        lastSpeed: 0,         // 上一条弹幕的速度
        releaseTime: 0        // 释放时间戳
      };
    }
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时暂停
        this.isPageVisible = false;
        this.stop();
      } else {
        // 页面显示时恢复
        this.isPageVisible = true;
        // 重置所有轨道状态，清除积压
        this.resetTracks();
        // 延迟一点再开始，避免立即涌出
        setTimeout(() => this.start(), 500);
      }
    });
    
    // 开始发送弹幕
    this.start();
  },
  
  // ========================================
  // 重置轨道状态
  // ========================================
  resetTracks() {
    for (let i = 0; i < this.tracks; i++) {
      this.trackData[i].occupied = false;
      this.trackData[i].releaseTime = 0;
    }
    this.lastSendTime = Date.now();
  },
  
  // ========================================
  // 停止弹幕
  // ========================================
  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  },
  
  // ========================================
  // 生成随机速度（确保与同轨道上一条不同）
  // ========================================
  getRandomSpeed(trackIndex) {
    const lastSpeed = this.trackData[trackIndex].lastSpeed;
    let speed;
    let attempts = 0;
    
    do {
      speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
      attempts++;
      // 确保速度差异至少2秒，最多尝试10次
    } while (Math.abs(speed - lastSpeed) < 2 && attempts < 10);
    
    return speed;
  },
  
  // ========================================
  // 检查轨道是否可用（防重叠）
  // ========================================
  isTrackAvailable(trackIndex) {
    const track = this.trackData[trackIndex];
    const now = Date.now();
    
    // 如果轨道未被占用，可用
    if (!track.occupied) return true;
    
    // 如果已过释放时间，可用
    if (now >= track.releaseTime) {
      track.occupied = false;
      return true;
    }
    
    return false;
  },
  
  // ========================================
  // 获取空闲轨道
  // ========================================
  getFreeTrack() {
    const freeTracks = [];
    
    for (let i = 0; i < this.tracks; i++) {
      if (this.isTrackAvailable(i)) {
        freeTracks.push(i);
      }
    }
    
    if (freeTracks.length === 0) return -1;
    
    // 随机选择一个空闲轨道
    return freeTracks[Math.floor(Math.random() * freeTracks.length)];
  },
  
  // ========================================
  // 计算弹幕宽度（用于防重叠）
  // ========================================
  estimateWidth(text) {
    // 估算弹幕宽度：头像32px + 间距 + 文字
    return 32 + 16 + (text.length * 14) + 32;
  },
  
  // ========================================
  // 发送一条弹幕
  // ========================================
  send(data) {
    const track = this.getFreeTrack();
    if (track === -1) return false; // 没有空闲轨道
    
    // 生成随机速度
    const speed = this.getRandomSpeed(track);
    
    // 估算弹幕宽度
    const width = this.estimateWidth(data.name + data.msg);
    
    // 计算轨道释放时间（弹幕完全进入屏幕后释放）
    // 释放时间 = 弹幕宽度穿过屏幕右边缘的时间
    const screenWidth = window.innerWidth;
    const releaseDelay = (width / (screenWidth + width)) * speed * 1000;
    
    // 更新轨道状态
    this.trackData[track].occupied = true;
    this.trackData[track].lastSpeed = speed;
    this.trackData[track].releaseTime = Date.now() + releaseDelay + 500; // 额外500ms安全间隔
    
    // 创建弹幕元素
    const item = document.createElement('div');
    item.className = 'danmaku-item';
    item.innerHTML = `
      <img src="https://mc-heads.net/avatar/${data.avatar || 'MHF_Steve'}/32" alt="头像">
      <span class="danmaku-name">${data.name}</span>
      <span class="danmaku-msg">${data.msg}</span>
    `;
    
    // 设置位置和速度
    const top = this.startOffset + (track * this.trackHeight);
    item.style.top = top + 'vh';
    item.style.animationDuration = speed + 's';
    
    this.container.appendChild(item);
    
    // 动画结束后移除元素
    item.addEventListener('animationend', () => item.remove());
    
    return true;
  },
  
  // ========================================
  // 发送随机示例弹幕
  // ========================================
  sendRandom() {
    const msg = this.messages[Math.floor(Math.random() * this.messages.length)];
    this.send(msg);
  },
  
  // ========================================
  // 开始弹幕
  // ========================================
  start() {
    // 如果已经在运行，先停止
    this.stop();
    
    // 如果页面不可见，不启动
    if (!this.isPageVisible) return;
    
    // 初始发送几条（错开时间）
    setTimeout(() => {
      if (this.isPageVisible) this.sendRandom();
    }, 300);
    setTimeout(() => {
      if (this.isPageVisible) this.sendRandom();
    }, 1200);
    setTimeout(() => {
      if (this.isPageVisible) this.sendRandom();
    }, 2400);
    
    // 持续发送（使用可控的定时器）
    const sendWithRandomInterval = () => {
      // 检查页面是否可见
      if (!this.isPageVisible) return;
      
      // 检查距离上次发送是否足够间隔（防止积压）
      const now = Date.now();
      if (now - this.lastSendTime >= this.interval) {
        this.sendRandom();
        this.lastSendTime = now;
      }
      
      // 随机间隔 2.5-4秒
      const nextInterval = this.interval + Math.random() * 1500;
      this.timerId = setTimeout(sendWithRandomInterval, nextInterval);
    };
    
    this.timerId = setTimeout(sendWithRandomInterval, 3500);
  },
  
  // ========================================
  // 从API加载留言（示例方法）
  // ========================================
  async loadFromAPI(apiUrl) {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      this.messages = data;
    } catch (error) {
      console.error('加载弹幕数据失败:', error);
    }
  }
};

// 初始化弹幕系统
DanmakuSystem.init();
