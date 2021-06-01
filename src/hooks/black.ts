import { Ref, ref } from 'vue'
import { local } from '../util'
import { GuardOption } from './guardList'

const BLACK_KEY = 'moni/mua/blackList'

export function useBlack() {
    const blackList = ref<number[]>([])

    blackList.value = local.get(BLACK_KEY) || []

    const hasBlack = (uid: number): boolean => {
        return blackList.value.includes(uid)
    }

    const addBlack = (uid: number) => {
        if (blackList.value.includes(uid)) return
        blackList.value.push(uid)
        local.set(BLACK_KEY, blackList.value)
    }

    const removeBlack = (uid: number) => {
        const index = blackList.value.indexOf(uid)
        if (index !== -1) {
            blackList.value.splice(index, 1)
            local.set(BLACK_KEY, blackList.value)
        }
        
    }

    const clearBlack = () => {
        blackList.value = []
        local.remove(BLACK_KEY)
    }
    
    const  getBlackList = (guardList:Ref<GuardOption[]>) => {
        return guardList.value.filter(({ uid }: GuardOption) => hasBlack(uid))
    }

    return {
        blackList,
        hasBlack,
        addBlack,
        removeBlack,
        clearBlack,
        getBlackList
    }
}