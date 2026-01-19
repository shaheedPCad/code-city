import { Application, Container, Graphics } from 'pixi.js'

// Constants
const WORLD_SIZE = 2000
const GRID_SIZE = 50
const GRID_COLOR = 0x1a1a1a
const GRID_ALPHA = 0.3
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3.0
const ZOOM_SPEED = 0.001

// Agent rendering
const AGENT_RADIUS = 3
const AGENT_COLORS = {
  NORMAL: 0x34d399,    // emerald-400
  BURNOUT: 0xf87171,   // red-400
  UNEMPLOYED: 0xfbbf24 // amber-400
}

// District definitions (12 rectangles with muted dystopian colors)
const DISTRICTS = [
  { x: 100, y: 100, w: 300, h: 250, color: 0x1e3a5f },  // industrial blue
  { x: 450, y: 80, w: 280, h: 200, color: 0x2d4a3e },   // muted green
  { x: 800, y: 150, w: 350, h: 280, color: 0x4a3b2d },  // brown
  { x: 100, y: 400, w: 250, h: 300, color: 0x3d2d4a },  // purple
  { x: 400, y: 350, w: 320, h: 250, color: 0x2d3d4a },  // slate
  { x: 780, y: 480, w: 300, h: 220, color: 0x4a2d2d },  // dark red
  { x: 1150, y: 100, w: 280, h: 350, color: 0x2d4a4a }, // teal
  { x: 1200, y: 500, w: 320, h: 280, color: 0x3d3d2d }, // olive
  { x: 100, y: 750, w: 400, h: 200, color: 0x2d2d3d },  // dark blue
  { x: 550, y: 700, w: 300, h: 250, color: 0x3d2d2d },  // maroon
  { x: 900, y: 750, w: 350, h: 220, color: 0x2d3d2d },  // forest
  { x: 1300, y: 820, w: 280, h: 180, color: 0x4a4a2d }, // khaki
]

export function createCityRenderer(container: HTMLDivElement): {
  destroy: () => void
  setAgents: (positions: Float32Array, flags?: Uint8Array) => void
} {
  const app = new Application()
  let initialized = false

  // World container for camera transforms
  const world = new Container()

  // Agents container and graphics
  const agentsContainer = new Container()
  const agentsGraphics = new Graphics()
  agentsContainer.addChild(agentsGraphics)

  // Camera state
  let isDragging = false
  let dragStart = { x: 0, y: 0 }
  let worldStart = { x: 0, y: 0 }

  const initPromise = app.init({
    background: 0x080a0e,
    resizeTo: container,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  }).then(() => {
    initialized = true
    container.appendChild(app.canvas)
    app.stage.addChild(world)

    // Center world initially
    world.x = app.screen.width / 2 - WORLD_SIZE / 2
    world.y = app.screen.height / 2 - WORLD_SIZE / 2

    drawGrid()
    drawDistricts()
    world.addChild(agentsContainer)
    setupInteraction()
  })

  function drawGrid() {
    const grid = new Graphics()
    grid.setStrokeStyle({ width: 1, color: GRID_COLOR, alpha: GRID_ALPHA })

    for (let x = 0; x <= WORLD_SIZE; x += GRID_SIZE) {
      grid.moveTo(x, 0)
      grid.lineTo(x, WORLD_SIZE)
    }
    for (let y = 0; y <= WORLD_SIZE; y += GRID_SIZE) {
      grid.moveTo(0, y)
      grid.lineTo(WORLD_SIZE, y)
    }
    grid.stroke()
    world.addChild(grid)
  }

  function drawDistricts() {
    const districtsContainer = new Graphics()

    for (const d of DISTRICTS) {
      // Fill
      districtsContainer.rect(d.x, d.y, d.w, d.h)
      districtsContainer.fill({ color: d.color, alpha: 0.4 })

      // Border
      districtsContainer.rect(d.x, d.y, d.w, d.h)
      districtsContainer.stroke({ width: 1, color: 0x333333, alpha: 0.6 })
    }

    world.addChild(districtsContainer)
  }

  function setupInteraction() {
    const canvas = app.canvas

    // Mouse wheel zoom (around cursor)
    canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault()

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // World position under cursor before zoom
      const worldXBefore = (mouseX - world.x) / world.scale.x
      const worldYBefore = (mouseY - world.y) / world.scale.y

      // Apply zoom
      const zoomDelta = -e.deltaY * ZOOM_SPEED
      const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, world.scale.x + zoomDelta))
      world.scale.set(newScale)

      // Adjust position to zoom toward cursor
      world.x = mouseX - worldXBefore * newScale
      world.y = mouseY - worldYBefore * newScale
    }, { passive: false })

    // Pan: mouse down
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true
      dragStart = { x: e.clientX, y: e.clientY }
      worldStart = { x: world.x, y: world.y }
      canvas.style.cursor = 'grabbing'
    })

    // Pan: mouse move
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      world.x = worldStart.x + dx
      world.y = worldStart.y + dy
    })

    // Pan: mouse up
    const handleMouseUp = () => {
      isDragging = false
      canvas.style.cursor = 'grab'
    }
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)

    // Default cursor
    canvas.style.cursor = 'grab'
  }

  // ResizeObserver for responsive canvas
  const resizeObserver = new ResizeObserver(() => {
    if (initialized) {
      app.resize()
    }
  })
  resizeObserver.observe(container)

  function setAgents(positions: Float32Array, flags?: Uint8Array): void {
    agentsGraphics.clear()
    const agentCount = positions.length / 2

    // Group agents by flag for batched drawing (reduces draw calls and prevents state accumulation)
    const groups: { [key: number]: number[] } = { 0: [], 1: [], 2: [] }

    for (let i = 0; i < agentCount; i++) {
      const flag = flags ? flags[i] : 0
      groups[flag].push(i)
    }

    // Draw each group with its color
    for (const [flag, indices] of Object.entries(groups)) {
      const color = Number(flag) === 1 ? AGENT_COLORS.BURNOUT
                  : Number(flag) === 2 ? AGENT_COLORS.UNEMPLOYED
                  : AGENT_COLORS.NORMAL

      for (const i of indices) {
        agentsGraphics.circle(positions[i * 2], positions[i * 2 + 1], AGENT_RADIUS)
      }
      agentsGraphics.fill({ color, alpha: 0.9 })
    }
  }

  return {
    destroy: () => {
      resizeObserver.disconnect()
      initPromise.then(() => {
        app.destroy(true, { children: true })
      })
    },
    setAgents
  }
}
