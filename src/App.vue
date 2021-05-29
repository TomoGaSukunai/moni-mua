<template>
  <div class="moni">
    <div class="guard-container">
      <div class="flex">
        <h3 class="guard-title flex-1">
          舰长总数： {{ guardNum }}
        </h3>
        <button class="btn-reload" @click="onRefresh">刷新</button>
      </div>
      <ul class="guard-list no-scrollbar">
        <li v-if="loading">
          获取舰长数据中...
        </li>
        <li
          v-for="guard in guardList"
          :key="guard.uid"
          class="guard-item"
          :class="guard.is_alive ? 'alive' : ''"
        >
          <img class="guard-face" :src="guard.face  + '@128w_128h'" alt="">
          <p>
            <span>{{ guard.is_alive ? '[在线]' : '' }}</span>
            {{ guard.username }}
          </p>
        </li>
      </ul>
    </div>
    <div class="flex-1">
      <h3 class="title">朝海沫霓Moni Mua~</h3>
      <div class="container flex">
        <img v-if="currentGuard.face" class="guard-face" :src="currentGuard.face + '@128w_128h'" alt="">
        <p v-if="currentGuard && currentGuard.uid">
          <span>{{ currentGuard.is_alive ? '[在线]' : '[不在]' }}</span>
          {{ currentGuard.username }}
        </p>
      </div>
      <div>
        <button class="btn-mua" @click="onMua">Mua~</button>
      </div>
      <h3 class="rank-title">刀了榜</h3>
      <ul class="rank-list no-scrollbar">
        <li
          v-for="guard in rankList"
          :key="guard.uid"
          class="flex"
        >
          <img class="guard-face" :src="guard.face  + '@128w_128h'" alt="">
          <p class="flex">
            <span class="flex-1">{{ guard.username }}</span>
            <span>{{ guard.count }} 次</span>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue'
import {useGuardList } from './hooks/guardList'
const localStorage = window.localStorage
const storage = {
  get(key: string): any {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : ''
    } catch {
      return ''
    }
  },
  
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export default defineComponent({
  name: 'App',
  setup() {
    const { guardNum, guardList,  getGuardList, getRandomGuard } = useGuardList()
    const loading = ref<boolean>(false)

    const onRefresh = async (refresh = true) => {
      if (loading.value) return
      loading.value = true
      guardList.value = []
      await getGuardList(refresh)
      loading.value = false
    }

    onBeforeMount(async () => {
      await onRefresh(false)
    })

    const currentGuard = ref({})
    const active = ref(false)

    const rankList = ref<any[]>([])

    rankList.value = storage.get('moni/rank/mua') || []

    let timer: any
    const onMua = () => {
      if (loading.value) return
      if (active.value) {
        active.value = false
        timer && clearInterval(timer)
      } else {
        active.value = true
        currentGuard.value = getRandomGuard()
        const index = rankList.value.findIndex((item: any) => item.uid === (currentGuard.value as any).uid)

        if (index === -1) {
          rankList.value.push({ ...currentGuard.value,  count: 1})
        } else {
          rankList.value[index].count = rankList.value[index].count + 1
        }

        rankList.value = rankList.value.sort((left: any, right: any) => {
          return left.count - right.count
        })
        storage.set('moni/rank/mua', rankList.value.map(({ uid, username, face, count, is_alive }) => {
          return { uid, username, face, count, is_alive }
        }))

        timer = setInterval(() => {
          currentGuard.value = getRandomGuard()
        }, 10)
      }
    }

    return {
      loading,
      guardNum,
      guardList,
      onRefresh,
      currentGuard,
      onMua,
      rankList
    }
  }
})
</script>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
html,body {
  min-height: 100vh;
}
html {
  background-color: #f9f9f9;
}
#app {
  font-family: ST heiti, Avenir, Helvetica, Arial, sans-serif;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 60px;
}

body {
  padding-top: 40px
}

ul, li {
  list-style: none;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.title {
  font-size: 28px;
  text-align: center;
}

.guard-face {
  display: inline-block;
  width: 32px;
  height: 32px;
  background-position: 0 0;
  background-size: contain;
  background-repeat: no-repeat;
  border-radius: 50%;
  margin-right: 10px;
}

.moni {
  width: 800px;
  height: 600px;
  margin: auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 4px 4px #eee;
  display: flex;
}

.guard-title {
  height: 30px;
  line-height: 30px;
}
.guard-list {
  width: 300px;
  height: 530px;
  border-right: 1px solid #ccc;
  overflow-y: auto;
}

.guard-item {
  display: flex;
  align-items: center;
  padding: 3px 0;
  color: #999;
}

.guard-item.alive {
  color: black;
}

.guard-item p span {
  color: #999;
}

.no-scrollbar::-webkit-scrollbar,
.no-scrollbar::-webkit-scrollbar-thumb {
  width: 0;
  height: 0;
  background-color: transparent;
}

.btn-reload {
  padding: 4px 10px;
  margin-right: 20px;
  border: none;
  background-color: #10B981;
  color: #fff;
  border-radius: 4px;
  outline: 0;
  cursor: pointer;
}

.container {
  height: 300px;
  align-items: center;
  justify-content: center;
}

.container img {
  width: 128px;
  height: 128px;  
}

.container p {
  font-size: 24px;
  font-weight: 500;
}

.btn-mua {
  width: 80%;
  padding: 6px 0;
  margin-left: 10%;
  border: none;
  background-color: #10B981;
  color: #fff;
  border-radius: 4px;
  outline: 0;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s;
}

.btn-mua:active {
  background-color: #059669;
}

.rank-title {
  padding-top: 20px;
  text-align: center;
}
.rank-list {
  padding: 20px;
  width: 100%;
  height: 150px;
  overflow-y: auto;
}

.rank-list li {
  align-items: center;
  padding: 3px 0;
  font-weight: 500;
}

.rank-list li p {
  flex: 1;
  justify-content: space-between;
}

.rank-list li p span {
  display: inline-block;
}
</style>