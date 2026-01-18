import { initAgents, simulateStep } from '../sim/simulateStep'
import type { SimState } from '../sim/simulateStep'
import type { MainToWorkerMessage } from '../shared/messages'

// Worker global scope type for postMessage with transferables
interface WorkerGlobalScopeWithTransfer {
  postMessage(message: unknown, transfer: Transferable[]): void
}

const workerSelf = self as unknown as WorkerGlobalScopeWithTransfer

const AGENT_COUNT = 10_000
const BASE_TICK_MS = 50 // 20 Hz base rate

let state: SimState
let isRunning = false
let speedMultiplier = 1
let tickInterval: ReturnType<typeof setInterval> | null = null

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
  simulateStep(state)
  postSnapshot()
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
      break
    case 'pause':
      isRunning = false
      stopLoop()
      break
    case 'speed':
      speedMultiplier = msg.value
      restartLoop()
      break
  }
}

// Initialize and send initial snapshot
init()
console.log('[Worker] Initialized, posting initial snapshot')
postSnapshot()
