import { ref } from 'vue';
import { GuardOption } from './guardList';
import { local } from '../util'

const RANK_KEY = 'moni/rank/mua'
export function useRank() {
    const rankList = ref<GuardOption[]>([])

    const getRankList = () => {
        rankList.value = (local.get(RANK_KEY) || []).sort((left: any, right: any) => {
            return right.count - left.count
        })
    }

    const addRank = (guard: GuardOption) => {
        if (!guard) return
        const index = rankList.value.findIndex((item: any) => item.uid === guard.uid)

        if (index === -1) {
          rankList.value.push({ ...guard,  count: 1})
        } else {
          rankList.value[index].count = (rankList.value[index].count || 0) + 1
        }

        rankList.value = [...rankList.value.sort((left: any, right: any) => {
          return right.count - left.count
        })]
        local.set(RANK_KEY, rankList.value.map(({ uid, username, face, count, is_alive }) => {
          return { uid, username, face, count, is_alive }
        }))
    }

    const onClearRank = () => {
        rankList.value = []
        local.remove(RANK_KEY)
    }

    return {
        rankList,
        getRankList,
        addRank,
        onClearRank
    }
}