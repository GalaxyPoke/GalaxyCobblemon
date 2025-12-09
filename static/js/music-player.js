// 全局背景音乐播放器
(function() {
  // 音乐列表 - 放在本地 static/music/ 文件夹
  const musicList = [
    'static/music/04. 周杰伦 - 明明就.flac'
  ];
  
  let currentTrack = parseInt(localStorage.getItem('bgMusicTrack')) || 0;
  
  // 创建播放器UI
  function createMusicPlayer() {
    // 检查是否已存在
    if (document.getElementById('globalMusicPlayer')) return;
    
    // 添加水墨风格样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes inkFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes inkPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      #globalMusicPlayer {
        position: fixed;
        bottom: 25px;
        left: 25px;
        z-index: 9999;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      #globalMusicPlayer:hover {
        transform: scale(1.1);
      }
      #globalMusicPlayer.playing .ink-circle {
        animation: inkPulse 2s ease-in-out infinite;
      }
      #globalMusicPlayer.playing {
        animation: inkFloat 3s ease-in-out infinite;
      }
      .ink-circle {
        width: 50px;
        height: 50px;
        background: radial-gradient(ellipse at 30% 30%, rgba(60,50,40,0.9) 0%, rgba(30,25,20,0.95) 50%, rgba(20,15,10,0.98) 100%);
        border-radius: 45% 55% 50% 50% / 55% 45% 55% 45%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        box-shadow: 
          0 2px 10px rgba(0,0,0,0.3),
          inset 0 0 20px rgba(212,165,116,0.1);
      }
      .ink-circle::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at 70% 70%, transparent 40%, rgba(212,165,116,0.15) 100%);
        border-radius: inherit;
      }
      .ink-circle::after {
        content: '';
        position: absolute;
        top: 5px;
        left: 10px;
        width: 15px;
        height: 8px;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
        filter: blur(2px);
      }
      .music-icon {
        color: #d4a574;
        font-size: 1.1rem;
        text-shadow: 0 0 10px rgba(212,165,116,0.5);
        z-index: 1;
      }
      .ink-splash {
        position: absolute;
        width: 60px;
        height: 60px;
        top: -5px;
        left: -5px;
        opacity: 0.3;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    
    // 创建水墨风格按钮
    const playerDiv = document.createElement('div');
    playerDiv.id = 'globalMusicPlayer';
    playerDiv.innerHTML = `
      <svg class="ink-splash" viewBox="0 0 100 100">
        <path d="M50,10 Q70,20 80,50 Q70,80 50,90 Q30,80 20,50 Q30,20 50,10" 
              fill="none" stroke="rgba(212,165,116,0.2)" stroke-width="1"/>
      </svg>
      <div class="ink-circle">
        <i class="bi bi-music-note-beamed music-icon" id="musicIcon"></i>
      </div>
    `;
    
    // 创建音频元素
    const audio = document.createElement('audio');
    audio.id = 'bgMusic';
    audio.src = musicList[currentTrack];
    
    // 恢复播放进度
    const savedTime = parseFloat(localStorage.getItem('bgMusicTime')) || 0;
    audio.currentTime = savedTime;
    
    document.body.appendChild(playerDiv);
    document.body.appendChild(audio);
    
    // 绑定点击事件（单击播放/暂停，双击切换下一首）
    playerDiv.addEventListener('click', toggleMusic);
    playerDiv.addEventListener('dblclick', nextTrack);
    
    // 歌曲播放完毕自动切换下一首
    audio.addEventListener('ended', nextTrack);
    
    // 定期保存播放进度
    audio.addEventListener('timeupdate', function() {
      localStorage.setItem('bgMusicTime', audio.currentTime);
    });
    
    // 页面关闭前保存状态
    window.addEventListener('beforeunload', function() {
      localStorage.setItem('bgMusicTime', audio.currentTime);
      localStorage.setItem('bgMusicTrack', currentTrack);
    });
    
    // 恢复音量设置
    const savedVolume = localStorage.getItem('bgMusicVolume');
    audio.volume = savedVolume ? savedVolume / 100 : 0.3;
    
    // 默认自动播放
    audio.play().then(() => {
      playerDiv.classList.add('playing');
      localStorage.setItem('bgMusicPlaying', 'true');
    }).catch(() => {
      // 浏览器阻止自动播放，等待用户点击
      console.log('等待用户交互后播放');
    });
  }
  
  // 切换播放/暂停
  window.toggleMusic = function() {
    const audio = document.getElementById('bgMusic');
    const player = document.getElementById('globalMusicPlayer');
    
    if (audio.paused) {
      audio.play().then(() => {
        player.classList.add('playing');
        localStorage.setItem('bgMusicPlaying', 'true');
      }).catch(e => {
        console.log('播放失败，需要用户交互');
      });
    } else {
      audio.pause();
      player.classList.remove('playing');
      localStorage.setItem('bgMusicPlaying', 'false');
    }
  };
  
  // 切换下一首
  function nextTrack() {
    const audio = document.getElementById('bgMusic');
    const player = document.getElementById('globalMusicPlayer');
    
    currentTrack = (currentTrack + 1) % musicList.length;
    audio.src = musicList[currentTrack];
    localStorage.setItem('bgMusicTrack', currentTrack);
    localStorage.setItem('bgMusicTime', 0);
    
    // 如果正在播放，继续播放新歌曲
    if (player.classList.contains('playing')) {
      audio.play().catch(() => {});
    }
  }
  
  // 页面加载完成后创建播放器
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createMusicPlayer);
  } else {
    createMusicPlayer();
  }
})();
