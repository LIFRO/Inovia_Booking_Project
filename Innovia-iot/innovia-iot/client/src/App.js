import { computed, onMounted, onUnmounted, ref } from 'vue/dist/vue.esm-bundler.js'
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'

export default {
  setup() {
    const tenantSlug = 'innovia'
    const devices = ref([])
    const tenantId = ref('')
    const filter = ref('all')
    const loading = ref(true)
    const error = ref('')
    const liveStatus = ref('connecting')
    const currentView = ref('devices')
    const historyDevice = ref(null)
    const historyMetric = ref('both')
    const historySeries = ref([])
    const historyLoading = ref(false)
    const historyError = ref('')
    let connection
    const filteredDevices = computed(() => filter.value === 'all'
      ? devices.value
      : devices.value.filter(device => device.status?.toLowerCase() === filter.value))
    const visibleHistorySeries = computed(() => historySeries.value.filter(series =>
      historyMetric.value === 'both' || series.type?.toLowerCase() === historyMetric.value))

    async function loadDevices() {
      loading.value = true
      error.value = ''
      try {
        const tenantResponse = await fetch(`/registry/api/tenants/by-slug/${tenantSlug}`)
        if (!tenantResponse.ok) throw new Error('Could not find the Innovia tenant.')
        const tenant = await tenantResponse.json()
        tenantId.value = tenant.id
        const devicesResponse = await fetch(`/registry/api/tenants/${tenant.id}/devices`)
        if (!devicesResponse.ok) throw new Error('Could not load devices.')
        devices.value = (await devicesResponse.json()).map(device => ({ ...device, temperature: null, co2: null, updatedAt: null }))
      } catch (cause) { error.value = cause.message } finally { loading.value = false }
    }

    function updateMeasurement(measurement) {
      const device = devices.value.find(item => item.id?.toLowerCase() === measurement.deviceId?.toLowerCase())
      if (!device) return
      const type = measurement.type?.toLowerCase()
      if (type !== 'temperature' && type !== 'co2') return
      device[type] = measurement.value
      device.updatedAt = measurement.time
    }

    async function connectTelemetry() {
      connection = new HubConnectionBuilder()
        .withUrl('/telemetry/hub/telemetry')
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build()
      connection.on('measurementReceived', updateMeasurement)
      connection.onreconnecting(() => { liveStatus.value = 'reconnecting' })
      connection.onreconnected(() => { liveStatus.value = 'live' })
      connection.onclose(() => { liveStatus.value = 'offline' })
      try {
        await connection.start()
        await connection.invoke('JoinTenant', tenantSlug)
        liveStatus.value = 'live'
      } catch {
        liveStatus.value = 'offline'
      }
    }

    async function openHistory(device) {
      currentView.value = 'history'
      historyDevice.value = device
      historyMetric.value = 'both'
      historySeries.value = []
      historyError.value = ''
      historyLoading.value = true
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const to = new Date().toISOString()
      try {
        const response = await fetch(`/portal-api/portal/${tenantId.value}/devices/${device.id}/series/all?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
        if (!response.ok) throw new Error('Could not load history for this device.')
        const data = await response.json()
        historySeries.value = data.series || []
      } catch (cause) { historyError.value = cause.message } finally { historyLoading.value = false }
    }

    function closeHistory() {
      currentView.value = 'devices'
      historyDevice.value = null
    }
    function chartPath(points) {
      if (!points?.length) return ''
      const values = points.map(point => point.v)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const span = max - min || 1
      return points.map((point, index) => {
        const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100
        const y = 92 - ((point.v - min) / span) * 84
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ')
    }
    function latestPoint(series) { return series.points?.at(-1) }
    function formatMeasurement(value) {
      if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
      return Number(Number(value).toFixed(1)).toString()
    }

    onMounted(async () => { await loadDevices(); await connectTelemetry() })
    onUnmounted(() => { if (connection?.state !== HubConnectionState.Disconnected) connection?.stop() })
    return { devices, tenantId, filter, loading, error, filteredDevices, liveStatus, currentView, loadDevices, historyDevice, historyMetric, visibleHistorySeries, historyLoading, historyError, openHistory, closeHistory, chartPath, latestPoint, formatMeasurement }
  },
  template: `
    <main class="portal-shell">
      <header v-if="currentView === 'devices'" class="portal-header">
        <div><p class="eyebrow">INNOVIA · LIVE OPERATIONS</p><h1>Devices</h1><p class="subtitle">Temperature and indoor air quality across the Innovia tenant.</p></div>
        <button class="refresh-button" type="button" :disabled="loading" @click="loadDevices">{{ loading ? 'Loading…' : 'Refresh' }}</button>
      </header>
      <template v-if="currentView === 'devices'"><section class="toolbar" aria-label="Device filters"><span>Show</span><button v-for="option in ['all', 'active', 'inactive']" :key="option" class="filter-button" :class="{ selected: filter === option }" type="button" @click="filter = option">{{ option }}</button><span class="device-count"><i class="live-dot" :class="liveStatus"></i>{{ liveStatus === 'live' ? 'Live updates' : liveStatus }} · {{ filteredDevices.length }} devices</span></section>
        <p v-if="error" class="notice error">{{ error }}</p><p v-else-if="loading" class="notice">Loading the Innovia tenant…</p>
        <section v-else class="device-grid" aria-label="Innovia devices"><article v-for="device in filteredDevices" :key="device.id" class="device-card"><div class="card-heading"><div><p class="device-label">{{ device.serial || 'Unlabelled device' }}</p><h2>{{ device.model || 'Sensor' }}</h2></div><span class="status" :class="device.status?.toLowerCase()">{{ device.status || 'unknown' }}</span></div><div class="metrics"><div><span>Temperature</span><strong>{{ formatMeasurement(device.temperature) }} <small>°C</small></strong></div><div><span>CO₂</span><strong>{{ formatMeasurement(device.co2) }} <small>ppm</small></strong></div></div><div class="card-footer"><p v-if="device.updatedAt" class="updated">Updated {{ new Date(device.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}</p><button class="history-button" type="button" @click="openHistory(device)">History →</button></div></article><p v-if="filteredDevices.length === 0" class="empty-state">No devices match this filter.</p></section>
      </template>
      <section v-else-if="historyDevice" class="history-view" aria-labelledby="history-title">
          <header class="history-header"><div><button class="back-button" type="button" @click="closeHistory">← Back to devices</button><p class="eyebrow">LAST 24 HOURS</p><h1 id="history-title">{{ historyDevice.serial || historyDevice.model }} history</h1></div><span class="device-count"><i class="live-dot" :class="liveStatus"></i>{{ liveStatus === 'live' ? 'Live updates' : liveStatus }}</span></header>
          <div class="history-filters" aria-label="History metric"><button v-for="option in ['both', 'temperature', 'co2']" :key="option" class="filter-button" :class="{ selected: historyMetric === option }" type="button" @click="historyMetric = option">{{ option === 'co2' ? 'CO₂' : option }}</button></div>
          <p v-if="historyLoading" class="notice">Loading history…</p><p v-else-if="historyError" class="notice error">{{ historyError }}</p><p v-else-if="visibleHistorySeries.length === 0" class="notice">No measurements were recorded during the last 24 hours.</p>
          <div v-else class="history-charts"><article v-for="series in visibleHistorySeries" :key="series.type" class="history-chart" :class="series.type?.toLowerCase()"><div><span>{{ series.type === 'co2' ? 'CO₂' : 'Temperature' }}</span><strong>{{ formatMeasurement(latestPoint(series)?.v) }} <small>{{ series.type === 'co2' ? 'ppm' : '°C' }}</small></strong></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" :aria-label="series.type + ' trend'" class="trend"><path d="M 0 92 H 100" class="baseline"/><path :d="chartPath(series.points)"/></svg><p>{{ series.points?.length || 0 }} readings · latest value shown</p></article></div>
      </section>
    </main>`
}
