import axios from 'axios'
import { ref } from 'vue'

// https://json2jsonp.com/?url=http://domain.com/some/json&callback=cbfunc
// https://api.live.bilibili.com/guard/topList?roomid=23001181&ruid=1589117610&page=1
const http = axios.create({
    baseURL: './api/req',
})

http.interceptors.response.use(config => {
    const data = config.data
    return data
    // return JSON.parse(data)
})

export type GuardOption = {
    uid: number
    username: string
    face: number
    is_alive: number
    guard_level: number
    count?: number
}

const fetchGuardList = async (page = 1, refresh = false): Promise<any> => {
    const d = new Date()
    const _ = '&' + d.getFullYear() + d.getMonth() + d.getDate() + d.getHours()
    const t = refresh ? `&_=${Math.floor(Date.now() / 1000)}` : _
    return await http.get('', {
        params: {
            url: `https://api.live.bilibili.com/guard/topList?roomid=23001181&ruid=1589117610&page_size=29&page=${page}${t}`,
            callback: '_',
        }
    })
}

const fetchGuardListV2 = async (): Promise<any> => {
    const res = await fetch('https://api.vtbs.moe/v1/guard/1589117610')
    return res.json()
}

export function useGuardList() {
    const guardList = ref<GuardOption[]>([])
    const guardNum = ref<number>(0)
    const loading = ref<boolean>(false)
    const isCache = ref<boolean>(false)

    let page = 1
    let _list: any[] = []

    async function getGuardList(refresh = false) {
        const { code, data } = await fetchGuardList(page, refresh)
        if (code === -412) {
            const res = await fetchGuardListV2()
            guardList.value = res.map(({ mid, level, face, uname }: any): GuardOption => {
                return {
                    uid: mid,
                    face: face,
                    username: uname,
                    guard_level: level,
                    is_alive: 0
                }
            })
            isCache.value = true
            alert('被拦截了，用缓存数据代替')
            return 
        }
        if (code !== 0) return
        isCache.value = false
        const { info, list }: { info: any, list: GuardOption[] } = data
        if (page === 1){
            _list = list
        }else{
            _list = [..._list, ...list]
        }
        if (page === info.page) {
            _list = [...data.top3, ..._list]
            guardList.value = [..._list.filter(_ => _.is_alive === 1), ..._list.filter(_ => _.is_alive === 0)]
            page = 1
            return
        }

        guardNum.value = info.num
        page++
        await getGuardList(refresh)
    }

    const onRefresh = async (refresh = true, notLoading = false) => {
        if (loading.value) return
        if (!notLoading) {
            loading.value = true
            guardList.value = []
        }
        await getGuardList(refresh)
        loading.value = false
      }

    return {
        isCache,
        loading,
        guardNum,
        guardList,
        onRefresh
    }
}