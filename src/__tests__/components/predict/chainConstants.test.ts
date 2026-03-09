import { describe, it, expect } from 'vitest'
import { NODE_COLORS, edgeWidth } from '../../../components/predict/chainConstants'

describe('chainConstants', () => {
  describe('NODE_COLORS', () => {
    it('maps core to blue', () => {
      expect(NODE_COLORS.core.border).toBe('#3b82f6')
    })

    it('maps ticker to green', () => {
      expect(NODE_COLORS.ticker.border).toBe('#22c55e')
    })

    it('maps theme to purple', () => {
      expect(NODE_COLORS.theme.border).toBe('#a855f7')
    })

    it('maps upstream to teal', () => {
      expect(NODE_COLORS.upstream.border).toBe('#14b8a6')
    })

    it('maps downstream to cyan', () => {
      expect(NODE_COLORS.downstream.border).toBe('#06b6d4')
    })

    it('maps demand_driver to yellow', () => {
      expect(NODE_COLORS.demand_driver.border).toBe('#eab308')
    })

    it('maps event to orange', () => {
      expect(NODE_COLORS.event.border).toBe('#f97316')
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
