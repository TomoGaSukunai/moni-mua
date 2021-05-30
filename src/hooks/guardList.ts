import axios from 'axios'
import { ref } from 'vue'

// https://json2jsonp.com/?url=http://domain.com/some/json&callback=cbfunc
// https://api.live.bilibili.com/guard/topList?roomid=23001181&ruid=1589117610&page=1
const http = axios.create({
    baseURL: 'https://json2jsonp.com',
})

http.interceptors.response.use(config => {
    const data = config.data
    return JSON.parse(data.replace(/^_(?:_jsonp)?\((.*)\)$/, '$1'))
})


const fetchGuardList = async (page = 1, refresh = false): Promise<any> => {
    const t = refresh ? `&t=${Date.now()}` : ''
    return await http.get('', {
        params: {
            url: `https://api.live.bilibili.com/guard/topList?roomid=23001181&page_size=29&ruid=1589117610&page=${page}${t}`,
            callback: '_',
        }
    })
}

export function useGuardList() {
    const guardList = ref<any>([])
    const guardNum = ref<number>(0)
    let page = 1
    let _list: any[] = []

    async function getGuardList(refresh = false) {
        const { code, data } = await fetchGuardList(page, refresh)
        if (code !== 0) return
        const { info, list } = data
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

    function getRandomGuard() {
        const index = Math.floor(Math.random() * (guardList.value.length - 1))
        return guardList.value[index]
    }

    return {
        guardNum,
        guardList,
        getGuardList,
        getRandomGuard
    }
}