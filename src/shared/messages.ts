// Messages from main thread to worker
export type MainToWorkerMessage =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'speed'; value: number }

// Messages from worker to main thread
export type WorkerToMainMessage = {
  type: 'snapshot'
  positions: ArrayBuffer
  flags: ArrayBuffer
  n: number
}
