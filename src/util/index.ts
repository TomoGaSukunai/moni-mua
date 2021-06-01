const localStorage = window.localStorage
const sessionStorage = window.sessionStorage

export const local = {
    get(key: string): any {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : ''
    },
    
    set(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value))
    },

    remove(key: string) {
        localStorage.removeItem(key)
    }
}

export const session = {
    get(key: string): any {
        const data = sessionStorage.getItem(key)
        return data ? JSON.parse(data) : ''
    },
    
    set(key: string, value: any) {
        sessionStorage.setItem(key, JSON.stringify(value))
    },
    remove(key: string) {
        sessionStorage.removeItem(key)
    }
}