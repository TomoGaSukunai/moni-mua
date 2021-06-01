<template>
  <div class="moni">
    <div class="guard-container">
      <div class="flex">
        <h3 class="guard-title flex-1">
          舰长总数： {{ guardNum }}
        </h3>
        <!-- <button class="btn-reload" @click="onRefresh">刷新</button> -->
        <p class="tips">每15秒刷新</p>
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
          v-show="filterNoLive ? guard.is_alive : true"
        >
          <img class="guard-face" :src="guard.face  + '@128w_128h'" alt="" @click="onSelect(guard)">
          <p class="flex-1" :class="{ 'is-black': hasBlack(guard.uid) }"  @click="onSelect(guard)">
            <span>{{ guard.is_alive ? '[在线]' : '' }}</span>
            {{ guard.username }}
          </p>
          <span class="btn-to-black" @click="addBlack(guard.uid)">[黑]</span>
        </li>
      </ul>
    </div>
    <div class="flex-1">
      <span class="btn-black" @click="onShowBlack">黑名单</span>
      <h3 class="title">朝海沫霓Moni Mua~</h3>
      <div class="container flex">
        <p style="padding: 0 20px; color:#999" v-if="!currentGuard">
          点击按钮开始抽取，再次点击停止，最终显示的则为今晚的幸运儿。
        </p>
        <template v-if="currentGuard">
          <img v-if="currentGuard.face" class="guard-face" :src="currentGuard.face + '@128w_128h'" alt="">
          <p v-if="currentGuard && currentGuard.uid">
            <span>{{ currentGuard.is_alive ? '[在线]' : '[不在]' }}</span>
            {{ currentGuard.username }}
          </p>
        </template>
      </div>
      <div>
        <p class="filter">
          <input type="checkbox" :checked="filterNoLive" @click="filterNoLive = !filterNoLive">
          <span @click="(filterNoLive = !filterNoLive)">
            过滤不在线舰长
          </span>
        </p>
        <button class="btn-mua" @click="onMua">
          {{ active ? '就Mua你了！' : 'Mua谁呢？' }}
        </button>
      </div>
      <h3 class="rank-title flex align-center">
        <p class="flex-1">刀了榜</p>
        <span class="btn-clear" @click="onClearRank">清空</span>
      </h3>
      <ul class="rank-list no-scrollbar">
        <li
          v-for="guard in rankList"
          :key="guard.uid"
          class="flex"
        >
          <img class="guard-face" :src="guard.face  + '@128w_128h'" alt="" @click="onSelect(guard)">
          <p class="flex">
            <span class="flex-1" :class="{ 'is-black': hasBlack(guard.uid) }" @click="onSelect(guard)">{{ guard.username }}</span>
            <span>{{ guard.count }} 次</span>
          </p>
          <span class="btn-to-black" @click="addBlack(guard.uid)">[黑]</span>
        </li>
      </ul>
    </div>
  </div>
  <teleport to="body">
    <div class="mark" v-show="showSetting" @click.self="onShowSetting">
      <div class="setting-container">
        <span class="close" @click="onShowSetting">x</span>
        <h4>权重设置</h4>
        <div class="flex align-center">
          <span>舰长：</span>
          <span class="flex-1" v-if="selectGuard">{{ selectGuard.username }}</span>
        </div>
        <div class="flex align-center">
          <span>权重：</span>
          <input
            class="flex-1"
            type="number"
            :min="WEIGHT_MIN"
            :max="WEIGHT_MAX"
            placeholder="15"
            v-model="selectWeight"
            @input="onWeightInput"
          >
        </div>
        <div>
          <button class="btn-submit" @click="onSubmitWeight">确认</button>
        </div>
      </div>
    </div>
  </teleport>
  <teleport to="body">
    <div class="mark" v-show="showBlack" @click.self="onShowBlack">
      <div class="black-list-container">
        <span class="close" @click="onShowBlack">x</span>
        <h4>黑名单</h4>
        <span class="btn-clear" @click="clearBlack">清空</span>
        <ul class="black-list no-scrollbar">
          <li
            v-for="guard in computedBlackList"
            :key="guard.uid"
            class="black-item flex align-center"
          >
            <p class="flex-1">{{ guard.username }}</p>
            <span @click="removeBlack(guard.uid)">删除</span>
          </li>
        </ul>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from 'vue'
import { GuardOption, useGuardList } from './hooks/guardList'
import { useRank } from './hooks/rank'
import { useRandomPick } from './hooks/randomPick'
import { useBlack } from './hooks/black'

export default defineComponent({
  name: 'App',
  setup() {
    // 舰长数据
    const { loading, guardNum, guardList,  onRefresh } = useGuardList()
    // 刀了榜
    const { rankList, getRankList, addRank, onClearRank } = useRank()
    // 黑名单
    const { blackList, addBlack, removeBlack, clearBlack, hasBlack, getBlackList } = useBlack()
    // 随机抽取
    const { weightList, currentGuard, filterNoLive, setWeight, onRandomPick, weightConfig } = useRandomPick(guardList, rankList, blackList)

    const WEIGHT_MAX = ref(weightConfig.max)
    const WEIGHT_MIN = ref(weightConfig.min)

    const computedBlackList= computed(() => {
      return getBlackList(guardList)
    })

    const showBlack = ref<boolean>(false)

    const onShowBlack = () => {
      showBlack.value = !showBlack.value
    }

    // 自动刷新 舰长数据
    async function autoRefresh() {
      await onRefresh(true, true)
      if (currentGuard.value) {
        currentGuard.value = guardList.value.find((_: GuardOption) => _.uid === currentGuard.value?.uid) || currentGuard.value
      }
      setTimeout(async () => {
        await autoRefresh()
      }, 15000)
    }

    onBeforeMount(async () => {
      getRankList()
      await onRefresh(false)
      await autoRefresh()
    })

    const active = ref<boolean>(false)
    let timer: any
    const onMua = () => {
      if (loading.value) return
      if (active.value) {
        active.value = false
        timer && clearInterval(timer)
        addRank(currentGuard.value as GuardOption)
      } else {
        active.value = true
        onRandomPick()
        timer = setInterval(() => onRandomPick(), 15)
      }
    }

    const showSetting = ref<boolean>(false)
    const selectGuard = ref<GuardOption>()
    const selectWeight = ref<number>(weightConfig.default)
    const onSelect = (guard: GuardOption) => {
      selectGuard.value = guard
      selectWeight.value = weightList.value[guard.uid] || weightConfig.default
      onShowSetting()
    }
    const onShowSetting = () => {
      showSetting.value = !showSetting.value
    }

    const onWeightInput = () => {
      if (selectWeight.value < weightConfig.min) {
        selectWeight.value = weightConfig.min
        return
      }
      if (selectWeight.value > weightConfig.max) {
        selectWeight.value = weightConfig.max
      }
    }

    const onSubmitWeight = () => {
      selectGuard.value && setWeight(selectGuard.value.uid, selectWeight.value)
      onShowSetting()
    }

    return {
      loading,
      guardNum,
      guardList,
      filterNoLive,
      currentGuard,
      onMua,
      rankList,
      onClearRank,
      active,
      weightList,
      WEIGHT_MAX,
      WEIGHT_MIN,

      computedBlackList,

      hasBlack,
      blackList,
      addBlack,
      removeBlack,
      clearBlack,
      showBlack,
      onShowBlack,

      showSetting,
      selectGuard,
      selectWeight,
      onSelect,
      onShowSetting,
      onWeightInput,
      onSubmitWeight
    }
  }
})
</script>