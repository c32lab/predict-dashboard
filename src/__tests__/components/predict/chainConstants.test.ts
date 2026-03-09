import { describe, it, expect } from 'vitest'
import { NODE_COLORS, edgeWidth } from '../../../components/predict/chainConstants'

describe('chainConstants', () => {
  describe('NODE_COLORS', () => {
    it('maps ticker to blue', () => {
      expect(NODE_COLORS.ticker.border).toBe('#3b82f6')
    })

    it('maps theme to purple', () => {
      expect(NODE_COLORS.theme.border).toBe('#8b5cf6')
    })

    it('maps core to green', () => {
      expect(NODE_COLORS.core.border).toBe('#10b981')
    })

    it('maps upstream to orange', () => {
      expect(NODE_COLORS.upstream.border).toBe('#f59e0b')
    })

    it('maps downstream to cyan', () => {
      expect(NODE_COLORS.downstream.border).toBe('#06b6d4')
    })

    it('maps event to red', () => {
      expect(NODE_COLORS.event.border).toBe('#ef4444')
    })

    it('maps demand_driver to pink', () => {
      expect(NODE_COLORS.demand_driver.border).toBe('#ec4899')
    })
  })

  describe('edgeWidth', () => {
    it('returns 1 for strength 0', () => {
      expect(edgeWidth(0)).toBe(1)
    })

    it('returns 4 for strength 1', () => {
      expect(edgeWidth(1)).toBe(4)
    })

    it('returns 3 for strength 0.5', () => {
      expect(edgeWidth(0.5)).toBe(3)
    })

    it('clamps negative strength to 1', () => {
      expect(edgeWidth(-0.5)).toBe(1)
    })

    it('clamps strength > 1 to 4', () => {
      expect(edgeWidth(1.5)).toBe(4)
    })
  })
})
