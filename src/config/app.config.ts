export const APP_CONFIG = {
    HTTP_BASE: 'http://127.0.0.1:8000',
    API_PREFIX: '/api/',
    get API_BASE() {
        return `${this.HTTP_BASE}${this.API_PREFIX}`
    },
    get WS_BASE() {
        return this.HTTP_BASE.replace(/^http/, 'ws')
    },
}