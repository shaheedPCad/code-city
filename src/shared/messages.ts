// Severity levels for alerts
export type Severity = 'critical' | 'warning' | 'info'

// Metrics data sent from worker
export interface MetricsData {
  productivity: number    // 0-100
  happiness: number       // 0-100
  burnout: number         // 0-100
  unemployment: number    // 0-100
}

// Alert data sent from worker
export interface AlertData {
  ts: number
  severity: Severity
  message: string
}

// Messages from main thread to worker
export type MainToWorkerMessage =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'speed'; value: number }
  | { type: 'optimizeProductivity' }

// Messages from worker to main thread
export type WorkerToMainMessage =
  | { type: 'snapshot'; positions: ArrayBuffer; flags: ArrayBuffer; n: number }
  | { type: 'metrics'; metrics: MetricsData }
  | { type: 'alert'; ts: number; severity: Severity; message: string }
