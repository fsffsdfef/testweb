enum CacheType {
    Local,
    Session
}

class Cache{

    storage: Storage

    constructor(type: CacheType) {
        this.storage = type === CacheType.Local ? localStorage : sessionStorage
    }
    // 设置缓存
    setCache(key: string, value: any){
        if (value){
            this.storage.setItem(key, JSON.stringify(value))
        }
    }

    // 获取缓存
    getCache(key: string){
        const value = this.storage.getItem(key)
        if(value){
            return JSON.parse(value)
        }
    }

    // 删除缓存
    removeCache(key: string){
        this.storage.removeItem(key)
    }

    // 清理缓存
    clearCache(){
        this.storage.clear()
    }
}

const localCache = new Cache(CacheType.Local)
const sessCache = new Cache(CacheType.Session)
export {
    localCache,
    sessCache
}