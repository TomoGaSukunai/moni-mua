import { Ref, ref, watch } from 'vue';
import { GuardOption } from './guardList';
import { session } from '../util'

// 权重与重复抽取次数， [0, 1] 描述的是 大于0且小于等于0次
const weightConfig = {
    default: 15,
    max: 99,
    min: 1,
    list: [ // 权重与重复抽取次数， [0, 1] 描述的是 大于0且小于等于0次
        { weight: 8, area: [0, 1] }, // 合理
        { weight: 6, area: [1, 3] }, // 阿这
        { weight: 4, area: [3, 5] }, // 你很串，所以我要限制你
        { weight: 2, area: [5, 7] }, // 要啥自行车！！！
        { weight: 1, area: [7, Number.MAX_SAFE_INTEGER] } // 欧吃矛！
    ]
}

const WEIGHT_KEY = 'moni/mua/weight'

const SESSION_KEY = 'moni/mua/session/time'

export function useRandomPick(guardList: Ref<GuardOption[]>, rankList: Ref<GuardOption[]>, blackList: Ref<number[]>) {
    const weightList = ref<Record<string, number>>({})
    const currentGuard = ref<GuardOption>()
    const filterNoLive = ref<boolean>(false)
    const _weightList: Record<string, number> = {}
    let randomList: Record<number, GuardOption> = {}
    let randomLen = 0

    const time = session.get(SESSION_KEY) || Date.now()

    // 为会话有效期为2个小时，超过两小时全部清空
    // 但是如果一直停留在当前页的话，会话未关闭不算失效
    if (time - Date.now() > 2 * 60 * 60 * 1000) {
        session.remove(SESSION_KEY)
        session.remove(WEIGHT_KEY)
    }

    // 从会话中获取 自定义的权重数据
    // 这部分权重仅在会话期间有效， 不会再下次重新打开网页时生效
    weightList.value = session.get(WEIGHT_KEY) || {}

    watch([guardList, rankList, weightList, blackList, filterNoLive], () => {
        guardList.value.forEach((guard: GuardOption) => {
            const rank = rankList.value.find((rank: GuardOption) => rank.uid === guard.uid)
            if (rank) {
                _weightList[guard.uid] = getWeight(rank.count || 0)
            }
            // 优先沫沫自己设置的权重， 然后是排行榜上的权重，最后是默认权重
            _weightList[guard.uid] = weightList.value[guard.uid] || _weightList[guard.uid] || weightConfig.default
        })
        randomList = {}
        let uuid: number = 0;
        guardList.value.forEach((guard: GuardOption) => {
            // 黑名单，过滤掉！
            if (blackList.value.includes(guard.uid)) return
            // 是否过滤掉不在线的人
            if (filterNoLive.value && !guard.is_alive) return
            const weight = _weightList[guard.uid]
            new Array(weight).fill(0).forEach(() => {
                randomList[uuid] = guard
                uuid++
            })
        })
        randomLen = Object.keys(randomList).length - 1
    })

    const onRandomPick = () => {
        const index = Math.floor(Math.random() * randomLen)
        currentGuard.value = randomList[index]
    }

    const setWeight = (uid: number , weight: number) => {
        if (weight < weightConfig.min || weight > weightConfig.max) {
            weight = weightConfig.default
        }
        weightList.value[uid] = weight
        session.set(WEIGHT_KEY, { ...weightList.value })
    }

    const resetWeight = (uid?: number) => {
        if (uid) {
            weightList.value[uid] = weightConfig.default
        } else {
            weightList.value = {}
        }
        session.set(WEIGHT_KEY, { ...weightList.value })
    }

    return {
        weightList,
        currentGuard,
        filterNoLive,
        onRandomPick,
        setWeight,
        resetWeight,
        weightConfig
    }
}

export function getWeight(count: number): number {
    for (let i = 0, l = weightConfig.list.length; i < l; i++) {
        const { weight, area } = weightConfig.list[i]
        const [min, max] = area
        if (count > min && count <= max) {
            return weight
        }
    }
    return weightConfig.default
}