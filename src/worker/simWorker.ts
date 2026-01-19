import { initAgents, simulateStep } from '../sim/simulateStep'
import type { SimState } from '../sim/simulateStep'
import type { MainToWorkerMessage, MetricsData, Severity } from '../shared/messages'

// Worker global scope type for postMessage with transferables
interface WorkerGlobalScopeWithTransfer {
  postMessage(message: unknown, transfer?: Transferable[]): void
}

const workerSelf = self as unknown as WorkerGlobalScopeWithTransfer

const AGENT_COUNT = 10_000
const BASE_TICK_MS = 50 // 20 Hz base rate
const PHASE1_TICKS = 300 // 15 seconds at 20 Hz

let state: SimState
let isRunning = false
let speedMultiplier = 1
let tickInterval: ReturnType<typeof setInterval> | null = null

// Optimize mode state
let optimizeMode = false
let optimizeStartTick = 0
let tickCounter = 0

// Alert tracking to fire only once per threshold
const firedAlerts = new Set<string>()

// Double-buffering: two sets of buffers to avoid allocation
let bufferA = {
  positions: new Float32Array(AGENT_COUNT * 2),
  flags: new Uint8Array(AGENT_COUNT)
}
let bufferB = {
  positions: new Float32Array(AGENT_COUNT * 2),
  flags: new Uint8Array(AGENT_COUNT)
}
let useBufferA = true

function init() {
  state = initAgents(AGENT_COUNT)
}

// Fire an alert (only once per key)
function fireAlert(key: string, severity: Severity, message: string) {
  if (firedAlerts.has(key)) return
  firedAlerts.add(key)
  workerSelf.postMessage({
    type: 'alert',
    ts: Date.now(),
    severity,
    message
  })
}

// Compute metrics from agent flags
function computeMetrics(): MetricsData {
  const { flags, count } = state
  let normal = 0
  let burnout = 0
  let unemployed = 0

  for (let i = 0; i < count; i++) {
    switch (flags[i]) {
      case 0: normal++; break
      case 1: burnout++; break
      case 2: unemployed++; break
    }
  }

  const burnoutPct = (burnout / count) * 100
  const unemploymentPct = (unemployed / count) * 100
  // Burnout workers contribute at 30% productivity
  const productivity = ((normal + burnout * 0.3) / count) * 100
  const happiness = Math.max(0, 100 - burnoutPct * 1.5 - unemploymentPct * 0.5)

  return { productivity, happiness, burnout: burnoutPct, unemployment: unemploymentPct }
}

// Check thresholds and fire alerts
function checkAlerts(metrics: MetricsData, inPhase2: boolean) {
  if (metrics.productivity > 90) {
    fireAlert('prod90', 'info', 'Output exceeding expectations. Commendations pending.')
  }
  if (inPhase2 && !firedAlerts.has('phase2')) {
    fireAlert('phase2', 'warning', 'Anomalous behavior detected. Investigating.')
  }
  if (metrics.burnout > 30) {
    fireAlert('burnout30', 'warning', 'Wellness metrics suboptimal. Coffee rations increased.')
  }
  if (metrics.burnout > 50) {
    fireAlert('burnout50', 'critical', 'Burnout cluster expanding. HR notified.')
  }
  if (metrics.unemployment > 15) {
    fireAlert('unemp15', 'warning', 'Workforce contraction detected.')
  }
  if (metrics.unemployment > 25) {
    fireAlert('unemp25', 'critical', 'Mass termination event in progress.')
  }
  if (metrics.happiness < 20) {
    fireAlert('happy20', 'critical', 'Morale critical. Mandatory fun scheduled.')
  }
  if (metrics.productivity < 50) {
    fireAlert('prod50', 'critical', 'SYSTEM FAILURE: Productivity protocol counterproductive.')
  }
}

// Apply optimize mode effects to agent flags
function applyOptimizeEffects(ticksSinceStart: number) {
  const { flags, count } = state
  const inPhase1 = ticksSinceStart < PHASE1_TICKS

  if (inPhase1) {
    // Phase 1: "Recovery" - convert burnout/unemployed to normal
    if (ticksSinceStart % 20 === 0) {
      // Convert 0.5% of burnout to normal
      const burnoutToConvert = Math.floor(count * 0.005)
      let converted = 0
      for (let i = 0; i < count && converted < burnoutToConvert; i++) {
        if (flags[i] === 1) {
          flags[i] = 0
          converted++
        }
      }
      // Convert 0.25% of unemployed to normal
      const unempToConvert = Math.floor(count * 0.0025)
      converted = 0
      for (let i = 0; i < count && converted < unempToConvert; i++) {
        if (flags[i] === 2) {
          flags[i] = 0
          converted++
        }
      }
    }
  } else {
    // Phase 2: Collapse - convert normal to burnout/unemployed
    if (ticksSinceStart % 10 === 0) {
      // Acceleration factor based on time in phase 2
      const phase2Ticks = ticksSinceStart - PHASE1_TICKS
      const acceleration = Math.min(2, 1 + phase2Ticks / 600)

      // Convert 0.2-0.4% normal to burnout
      const burnoutRate = 0.002 * acceleration
      const toBurnout = Math.floor(count * burnoutRate)
      let converted = 0
      for (let i = 0; i < count && converted < toBurnout; i++) {
        if (flags[i] === 0) {
          flags[i] = 1
          converted++
        }
      }

      // Convert 0.1-0.2% normal to unemployed
      const unempRate = 0.001 * acceleration
      const toUnemp = Math.floor(count * unempRate)
      converted = 0
      for (let i = 0; i < count && converted < toUnemp; i++) {
        if (flags[i] === 0) {
          flags[i] = 2
          converted++
        }
      }
    }
  }
}

function postSnapshot() {
  // Pick transfer buffer
  const transferBuffer = useBufferA ? bufferA : bufferB
  useBufferA = !useBufferA

  // Copy state to transfer buffer
  transferBuffer.positions.set(state.positions)
  transferBuffer.flags.set(state.flags)

  // Post snapshot (transfer ownership of underlying ArrayBuffers)
  workerSelf.postMessage(
    {
      type: 'snapshot',
      positions: transferBuffer.positions.buffer,
      flags: transferBuffer.flags.buffer,
      n: state.count
    },
    [transferBuffer.positions.buffer, transferBuffer.flags.buffer]
  )

  // Re-create the transferred buffer for next use
  if (useBufferA) {
    bufferB = {
      positions: new Float32Array(AGENT_COUNT * 2),
      flags: new Uint8Array(AGENT_COUNT)
    }
  } else {
    bufferA = {
      positions: new Float32Array(AGENT_COUNT * 2),
      flags: new Uint8Array(AGENT_COUNT)
    }
  }
}

function tick() {
  tickCounter++
  simulateStep(state)

  // Apply optimize mode effects
  if (optimizeMode) {
    const ticksSinceStart = tickCounter - optimizeStartTick
    applyOptimizeEffects(ticksSinceStart)
  }

  postSnapshot()

  // Send metrics at 2 Hz (every 10 ticks)
  if (tickCounter % 10 === 0) {
    const metrics = computeMetrics()
    console.log('[Worker] Posting metrics:', metrics.productivity.toFixed(1))
    workerSelf.postMessage({ type: 'metrics', metrics })

    // Check alert thresholds
    if (optimizeMode) {
      const ticksSinceStart = tickCounter - optimizeStartTick
      const inPhase2 = ticksSinceStart >= PHASE1_TICKS
      checkAlerts(metrics, inPhase2)
    }
  }
}

function startLoop() {
  if (tickInterval !== null) return
  tickInterval = setInterval(tick, BASE_TICK_MS / speedMultiplier)
}

function stopLoop() {
  if (tickInterval !== null) {
    clearInterval(tickInterval)
    tickInterval = null
  }
}

function restartLoop() {
  stopLoop()
  if (isRunning) startLoop()
}

self.onmessage = (e: MessageEvent<MainToWorkerMessage>) => {
  const msg = e.data
  switch (msg.type) {
    case 'start':
      isRunning = true
      startLoop()
      // Send metrics immediately so UI updates right away
      console.log('[Worker] Start received, posting metrics')
      workerSelf.postMessage({ type: 'metrics', metrics: computeMetrics() })
      break
    case 'pause':
      isRunning = false
      stopLoop()
      break
    case 'speed':
      speedMultiplier = msg.value
      restartLoop()
      break
    case 'optimizeProductivity':
      if (!optimizeMode) {
        optimizeMode = true
        optimizeStartTick = tickCounter
        firedAlerts.clear()
        fireAlert('optimize', 'warning', 'PRODUCTIVITY OPTIMIZATION PROTOCOL INITIATED')
      }
      break
  }
}

// Initialize and send initial snapshot + metrics
init()
console.log('[Worker] Initialized, posting initial snapshot')
postSnapshot()
workerSelf.postMessage({ type: 'metrics', metrics: computeMetrics() })
