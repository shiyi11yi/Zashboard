import { useNotification } from '@/composables/notification'
import {
  NOT_CONNECTED,
  PROXY_CHAIN_DIRECTION,
  PROXY_SORT_TYPE,
  PROXY_TYPE,
  ROUTE_NAME,
} from '@/constant'
import { timeSaved } from '@/store/overview'
import { getLatencyByName, hiddenGroupMap, proxiesFilter, proxyMap } from '@/store/proxies'
import {
  customThemes,
  hideUnavailableProxies,
  lowLatency,
  mediumLatency,
  proxyChainDirection,
  proxySortType,
  splitOverviewPage,
} from '@/store/settings'
import type { Connection } from '@/types'
import dayjs from 'dayjs'
import { computed } from 'vue'
import { prettyBytesHelper } from './utils'

export const isProxyGroup = (name: string) => {
  const proxyNode = proxyMap.value[name]

  if (!proxyNode) {
    return false
  }

  return [
    PROXY_TYPE.Dns,
    PROXY_TYPE.Compatible,
    PROXY_TYPE.Direct,
    PROXY_TYPE.Reject,
    PROXY_TYPE.RejectDrop,
    PROXY_TYPE.Pass,
    PROXY_TYPE.Fallback,
    PROXY_TYPE.URLTest,
    PROXY_TYPE.LoadBalance,
    PROXY_TYPE.Selector,
  ].includes(proxyNode.type.toLowerCase() as PROXY_TYPE)
}

export const sortAndFilterProxyNodes = (proxies: string[], groupName?: string) => {
  const latencyMap = new Map<string, number>()
  const getLatencyForSort = (name: string) => {
    if (isProxyGroup(name)) {
      return -1
    }
    const latency = latencyMap.get(name)!

    return latency === 0 ? Infinity : latency
  }

  proxies = [...proxies]
  proxies.forEach((name) => {
    latencyMap.set(name, getLatencyByName(name, groupName))
  })

  if (hideUnavailableProxies.value) {
    proxies = proxies.filter((name) => {
      return isProxyGroup(name) || latencyMap.get(name)! > 0
    })
  }

  if (proxiesFilter.value) {
    proxies = proxies.filter((name) => {
      return name.toLowerCase().includes(proxiesFilter.value.toLowerCase())
    })
  }

  switch (proxySortType.value) {
    case PROXY_SORT_TYPE.DEFAULT:
      return proxies
    case PROXY_SORT_TYPE.NAME_ASC:
      return proxies.sort((prev, next) => prev.localeCompare(next))
    case PROXY_SORT_TYPE.NAME_DESC:
      return proxies.sort((prev, next) => next.localeCompare(prev))
    case PROXY_SORT_TYPE.LATENCY_ASC:
      return proxies.sort((prev, next) => getLatencyForSort(prev) - getLatencyForSort(next))
    case PROXY_SORT_TYPE.LATENCY_DESC:
      return proxies.sort((prev, next) => getLatencyForSort(next) - getLatencyForSort(prev))
  }
}

export const getHostFromConnection = (connection: Connection) => {
  return `${connection.metadata.host || connection.metadata.sniffHost || connection.metadata.destinationIP}:${
    connection.metadata.destinationPort
  }`
}

export const getProcessFromConnection = (connection: Connection) => {
  return (
    connection.metadata.process ||
    connection.metadata.processPath.replace(/^.*[/\\](.*)$/, '$1') ||
    '-'
  )
}

export const getDestinationFromConnection = (connection: Connection) => {
  return connection.metadata.destinationIP || connection.metadata.host
}

export const getDestinationTypeFromConnection = (connection: Connection) => {
  const destinationIP = connection.metadata.destinationIP

  if (!destinationIP) {
    return 'FQDN'
  } else if (destinationIP.includes(':')) {
    return 'IPv6'
  } else {
    return 'IPv4'
  }
}

export const getChainsStringFromConnection = (connection: Connection) => {
  const chains = [...connection.chains]

  if (proxyChainDirection.value === PROXY_CHAIN_DIRECTION.NORMAL) {
    chains.reverse()
  }

  return chains.join('')
}

export const getNetworkTypeFromConnection = (connection: Connection) => {
  return `${connection.metadata.type} | ${connection.metadata.network}`
}

export const getInboundUserFromConnection = (connection: Connection) => {
  return (
    connection.metadata.inboundUser ||
    connection.metadata.inboundName ||
    connection.metadata.inboundPort ||
    '-'
  )
}

export const getToolTipForParams = (
  params: ToolTipParams,
  config: {
    suffix: string
    binary: boolean
  },
) => {
  const { suffix = '', binary = false } = config

  // fake data
  if (params.data.name < timeSaved + 1) {
    return ``
  }
  return `
    <div class="flex items-center my-2 gap-1">
      <div class="w-4 h-4 rounded-full" style="background-color: ${params.color}"></div>
      ${params.seriesName}
      (${dayjs(params.data.name).format('HH:mm:ss')}): ${prettyBytesHelper(params.data.value, {
        binary: binary,
      })}${suffix}
    </div>`
}

export const getColorForLatency = (latency: number) => {
  if (latency === NOT_CONNECTED) {
    return ''
  } else if (latency < lowLatency.value) {
    return 'text-green-500'
  } else if (latency < mediumLatency.value) {
    return 'text-yellow-500'
  } else {
    return 'text-red-500'
  }
}

export const renderRoutes = computed(() => {
  return Object.values(ROUTE_NAME).filter((r) => {
    return ![ROUTE_NAME.setup, !splitOverviewPage.value && ROUTE_NAME.overview].includes(r)
  })
})

export const applyCustomThemes = () => {
  document.querySelectorAll('.custom-theme').forEach((style) => {
    style.remove()
  })
  customThemes.value.forEach((theme) => {
    const style = document.createElement('style')
    const styleString = Object.entries(theme)
      .filter(([key]) => !['prefersdark', 'default', 'name', 'type', 'id'].includes(key))
      .map(([key, value]) => `${key}:${value}`)
      .join(';')

    style.innerHTML = `[data-theme="${theme.name}"] {
      ${styleString} 
    }`

    style.className = `custom-theme ${theme.name}`
    document.head.appendChild(style)
  })
}

export const isHiddenGroup = (group: string) => {
  if (Reflect.has(hiddenGroupMap.value, group)) {
    return hiddenGroupMap.value[group]
  }

  return proxyMap.value[group]?.hidden
}

export const handlerUpgradeSuccess = () => {
  const { showNotification } = useNotification()

  showNotification({
    content: 'upgradeSuccess',
    type: 'alert-success',
  })
}
