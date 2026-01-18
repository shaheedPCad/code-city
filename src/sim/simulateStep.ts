// Constants
const WORLD_SIZE = 2000
const SPEED = 2 // pixels per tick

// Agent state (pre-allocated, owned by caller)
export interface SimState {
  positions: Float32Array  // [x0, y0, x1, y1, ...] length = n * 2
  velocities: Float32Array // [vx0, vy0, vx1, vy1, ...] length = n * 2
  flags: Uint8Array        // [flag0, flag1, ...] length = n
  count: number
}

// Initialize agents randomly
export function initAgents(n: number): SimState {
  const positions = new Float32Array(n * 2)
  const velocities = new Float32Array(n * 2)
  const flags = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    // Random position within world bounds
    positions[i * 2] = Math.random() * WORLD_SIZE
    positions[i * 2 + 1] = Math.random() * WORLD_SIZE

    // Random velocity direction, fixed speed
    const angle = Math.random() * Math.PI * 2
    velocities[i * 2] = Math.cos(angle) * SPEED
    velocities[i * 2 + 1] = Math.sin(angle) * SPEED

    // Assign flags: 10% burnout, 5% unemployed, 85% normal
    const roll = Math.random()
    if (roll < 0.10) {
      flags[i] = 1 // Burnout
    } else if (roll < 0.15) {
      flags[i] = 2 // Unemployed
    } else {
      flags[i] = 0 // Normal
    }
  }

  return { positions, velocities, flags, count: n }
}

// Step simulation (mutates positions in place)
export function simulateStep(state: SimState): void {
  const { positions, velocities, count } = state

  for (let i = 0; i < count; i++) {
    const xi = i * 2
    const yi = i * 2 + 1

    // Update position
    positions[xi] += velocities[xi]
    positions[yi] += velocities[yi]

    // Bounce off world bounds
    if (positions[xi] < 0) {
      positions[xi] = 0
      velocities[xi] *= -1
    } else if (positions[xi] > WORLD_SIZE) {
      positions[xi] = WORLD_SIZE
      velocities[xi] *= -1
    }

    if (positions[yi] < 0) {
      positions[yi] = 0
      velocities[yi] *= -1
    } else if (positions[yi] > WORLD_SIZE) {
      positions[yi] = WORLD_SIZE
      velocities[yi] *= -1
    }
  }
}
