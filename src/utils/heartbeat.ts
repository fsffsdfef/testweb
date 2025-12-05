// 心跳状态枚举
export enum HeartbeatState {
    ACTIVE = 'active',
    IDLE = 'idle',
    TIMEOUT = 'timeout'
}

// 配置选项接口
export interface HeartbeatOptions {
    timeout?: number; // 超时时间（毫秒）
    checkInterval?: number; // 检查间隔（毫秒）
    events?: string[]; // 监听的事件类型
}

// 监听器回调类型
type HeartbeatListener = (state: HeartbeatState) => void;

export default class HeartbeatMonitor {
    private options: Required<HeartbeatOptions>;
    private lastActiveTime: number;
    private state: HeartbeatState;
    private timer: number | null;
    private listeners: HeartbeatListener[];

    constructor(options: HeartbeatOptions = {}) {
        // 默认配置
        this.options = {
            timeout: 300000, // 5分钟
            checkInterval: 60000, // 1分钟
            events: ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'],
            ...options
        };

        // 初始化状态
        this.lastActiveTime = Date.now();
        this.state = HeartbeatState.ACTIVE;
        this.timer = null;
        this.listeners = [];

        // 初始化事件监听
        this.initEventListeners();
        this.startTimer();
    }

    // 初始化事件监听器
    private initEventListeners(): void {
        this.options.events.forEach(event => {
            window.addEventListener(event, this.updateActivity.bind(this), { passive: true });
        });

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // 更新活动时间
    private updateActivity(): void {
        this.lastActiveTime = Date.now();
        if (this.state !== HeartbeatState.ACTIVE) {
            this.setState(HeartbeatState.ACTIVE);
        }
    }

    // 处理页面可见性变化
    private handleVisibilityChange(): void {
        if (document.visibilityState === 'visible') {
            this.updateActivity();
        }
    }

    // 启动定时器
    private startTimer(): void {
        this.timer = window.setInterval(() => {
            this.checkActivity();
        }, this.options.checkInterval);
    }

    // 检查活动状态
    private checkActivity(): void {
        const currentTime = Date.now();
        const inactiveDuration = currentTime - this.lastActiveTime;

        if (inactiveDuration > this.options.timeout) {
            this.setState(HeartbeatState.TIMEOUT);
        } else if (inactiveDuration > this.options.timeout / 2) {
            this.setState(HeartbeatState.IDLE);
        } else {
            this.setState(HeartbeatState.ACTIVE);
        }
    }

    // 设置状态并通知监听器
    private setState(newState: HeartbeatState): void {
        if (this.state !== newState) {
            this.state = newState;
            this.notifyListeners(newState);
        }
    }

    // 添加状态监听器
    public addListener(callback: HeartbeatListener): void {
        this.listeners.push(callback);
        // 立即返回当前状态
        callback(this.state);
    }

    // 移除监听器
    public removeListener(callback: HeartbeatListener): void {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // 通知所有监听器
    private notifyListeners(state: HeartbeatState): void {
        this.listeners.forEach(callback => callback(state));
    }

    // 手动重置活动时间
    public resetActivity(): void {
        this.updateActivity();
    }

    // 销毁实例
    public destroy(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.options.events.forEach(event => {
            window.removeEventListener(event, this.updateActivity);
        });

        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        this.listeners = [];
    }

    // 获取当前状态
    public getState(): HeartbeatState {
        return this.state;
    }

    // 获取最后活动时间
    public getLastActiveTime(): number {
        return this.lastActiveTime;
    }
}
