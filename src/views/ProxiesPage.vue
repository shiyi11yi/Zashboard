<template>
  <div
    class="max-sm:scrollbar-hidden h-full overflow-y-scroll p-2 sm:pr-1"
    ref="proxiesRef"
    @scroll.passive="handleScroll"
  >
    <template v-if="displayTwoColumns">
      <div class="grid grid-cols-2 gap-1">
        <div
          v-for="idx in [0, 1]"
          :key="idx"
          class="flex flex-1 flex-col gap-1"
        >
          <component
            v-for="name in filterContent(renderGroups, idx)"
            :is="renderComponent"
            :key="name"
            :name="name"
          />
        </div>
      </div>
    </template>
    <div
      class="grid grid-cols-1 gap-1"
      v-else
    >
      <component
        v-for="name in renderGroups"
        :is="renderComponent"
        :key="name"
        :name="name"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProxyGroup from '@/components/proxies/ProxyGroup.vue'
import ProxyGroupForMobile from '@/components/proxies/ProxyGroupForMobile.vue'
import ProxyProvider from '@/components/proxies/ProxyProvider.vue'
import { renderGroups } from '@/composables/proxies'
import { PROXY_TAB_TYPE } from '@/constant'
import { isMiddleScreen } from '@/helper/utils'
import { fetchProxies, proxiesTabShow } from '@/store/proxies'
import { twoColumnProxyGroup } from '@/store/settings'
import { useElementSize, useSessionStorage } from '@vueuse/core'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const proxiesRef = ref()
const { width } = useElementSize(proxiesRef)
const scrollStatus = useSessionStorage('cache/proxies-scroll-status', {
  [PROXY_TAB_TYPE.PROVIDER]: 0,
  [PROXY_TAB_TYPE.PROXIES]: 0,
})

const handleScroll = () => {
  scrollStatus.value[proxiesTabShow.value] = proxiesRef.value.scrollTop
}

const waitTickUntilReady = (startTime = performance.now()) => {
  if (
    performance.now() - startTime > 300 ||
    proxiesRef.value.scrollHeight > scrollStatus.value[proxiesTabShow.value]
  ) {
    proxiesRef.value.scrollTop = scrollStatus.value[proxiesTabShow.value]
  } else {
    requestAnimationFrame(() => {
      waitTickUntilReady(startTime)
    })
  }
}

watch(proxiesTabShow, () =>
  nextTick(() => {
    waitTickUntilReady()
  }),
)

onMounted(() => {
  waitTickUntilReady()
})

const isSmallScreen = computed(() => {
  return width.value < 640 && isMiddleScreen.value
})
const isWidthEnough = computed(() => {
  return width.value > 720
})

const renderComponent = computed(() => {
  if (proxiesTabShow.value === PROXY_TAB_TYPE.PROVIDER) {
    return ProxyProvider
  }

  if (isSmallScreen.value && displayTwoColumns.value) {
    return ProxyGroupForMobile
  }

  return ProxyGroup
})

const displayTwoColumns = computed(() => {
  if (renderGroups.value.length < 2 || !twoColumnProxyGroup.value) {
    return false
  }
  return (
    isWidthEnough.value || (isSmallScreen.value && proxiesTabShow.value === PROXY_TAB_TYPE.PROXIES)
  )
})

const filterContent: <T>(all: T[], target: number) => T[] = (all, target) => {
  return all.filter((_, index: number) => index % 2 === target)
}

fetchProxies()
</script>
