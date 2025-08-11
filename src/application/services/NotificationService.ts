export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  private constructor() {}
  
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません');
      return 'denied';
    }
    
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    
    return Notification.permission;
  }
  
  async showHydrationReminder(): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      const notification = new Notification('💧 水分補給の時間！', {
        body: '体の健康を保つために水分補給をしましょう',
        icon: '/water-icon.png', // アイコンファイルがあれば
        badge: '/water-badge.png', // バッジアイコンがあれば
        tag: 'hydration-reminder', // 重複を防ぐ
        requireInteraction: true, // ユーザーが操作するまで残る
        silent: false,
        data: {
          type: 'hydration-reminder',
          url: window.location.href
        }
      });
      
      // 通知がクリックされた時のハンドリング
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // 通知エラーハンドリング
      notification.onerror = (error) => {
        console.error('通知エラー:', error);
      };
      
      // 自動的に閉じる（オプション - 5分後）
      setTimeout(() => {
        notification.close();
      }, 300000); // 5分
    } else {
      console.warn('通知の許可が得られませんでした:', permission);
    }
  }
  
  async showRecordAdded(amount: number): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      const notification = new Notification('✅ 記録完了！', {
        body: `${amount}ml の水分補給を記録しました`,
        icon: '/water-icon.png',
        tag: 'record-added',
        requireInteraction: false,
        silent: true
      });
      
      // 3秒後に自動的に閉じる
      setTimeout(() => {
        notification.close();
      }, 3000);
    }
  }
  
  async showGoalAchievement(): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      const notification = new Notification('🎉 目標達成！', {
        body: '今日の水分補給目標を達成しました！素晴らしいです！',
        icon: '/water-icon.png',
        tag: 'goal-achievement',
        requireInteraction: false,
        silent: false
      });
      
      // 5秒後に自動的に閉じる
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }
  
  async showCustomReminder(title: string, message: string, emoji: string = '🔔'): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      const notification = new Notification(`${emoji} ${title}`, {
        body: message,
        icon: '/water-icon.png',
        tag: 'custom-reminder',
        requireInteraction: true,
        silent: false
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // 5分後に自動的に閉じる
      setTimeout(() => {
        notification.close();
      }, 300000);
    }
  }
  
  // 音を鳴らす機能
  playNotificationSound(): void {
    try {
      // Web Audio API を使用してビープ音を生成
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('サウンド再生に失敗しました:', error);
    }
  }
  
  // バイブレーション機能
  vibrate(): void {
    if ('vibrate' in navigator) {
      // パターン: 短い振動、一時停止、短い振動
      navigator.vibrate([200, 100, 200]);
    }
  }
}