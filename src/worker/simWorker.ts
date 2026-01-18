import { initAgents, simulateStep } from '../sim/simulateStep'
import type { SimState } from '../sim/simulateStep'

// Worker global scope type for postMessage with transferables
interface WorkerGlobalScopeWithTransfer {
  postMessage(message: unknown, transfer: Transferable[]): void
}

const workerSelf = self as unknown as WorkerGlobalScopeWithTransfer

const AGENT_COUNT = 10_000
const TICK_INTERVAL_MS = 50 // 20 Hz

let state: SimState

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

function tick() {
  // Run simulation step
  simulateStep(state)

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

// Initialize and start loop
init()
setInterval(tick, TICK_INTERVAL_MS)
