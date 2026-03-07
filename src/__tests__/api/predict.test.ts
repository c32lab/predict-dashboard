import { describe, it, expect, vi, beforeEach } from 'vitest'
import { predictApi } from '../../api/predict'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

function mockOkResponse(data: unknown) {
  return mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

function mockErrorResponse(status: number, statusText: string) {
  return mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
  })
}

describe('predictApi', () => {
  describe('health', () => {
    it('calls /api/health and returns data', async () => {
      mockOkResponse({ status: 'ok' })
      const result = await predictApi.health()
      expect(result).toEqual({ status: 'ok' })
      expect(mockFetch).toHaveBeenCalledWith('/api/health')
    })

    it('throws on non-ok response', async () => {
      mockErrorResponse(500, 'Internal Server Error')
      await expect(predictApi.health()).rejects.toThrow('API error: 500 Internal Server Error')
    })
  })

  describe('prediction', () => {
    it('calls /api/prediction', async () => {
      mockOkResponse({ macro: {}, predictions: {} })
      await predictApi.prediction()
      expect(mockFetch).toHaveBeenCalledWith('/api/prediction')
    })
  })

  describe('predictions', () => {
    it('builds query params correctly', async () => {
      mockOkResponse({ predictions: [], total: 0 })
      await predictApi.predictions({ status: 'active', limit: 10, offset: 20 })
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('status=active')
      expect(url).toContain('limit=10')
      expect(url).toContain('offset=20')
    })

    it('handles no params', async () => {
      mockOkResponse({ predictions: [], total: 0 })
      await predictApi.predictions()
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('/api/predictions?')
    })

    it('omits undefined params', async () => {
      mockOkResponse({ predictions: [], total: 0 })
      await predictApi.predictions({ status: 'active' })
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('status=active')
      expect(url).not.toContain('limit=')
      expect(url).not.toContain('offset=')
    })
  })

  describe('events', () => {
    it('builds query params for events', async () => {
      mockOkResponse([])
      await predictApi.events({ limit: 20, pattern: 'whale' })
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('limit=20')
      expect(url).toContain('pattern=whale')
    })
  })

  describe('macroHistory', () => {
    it('defaults limit to 100', async () => {
      mockOkResponse([])
      await predictApi.macroHistory()
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('limit=100')
    })

    it('accepts custom limit', async () => {
      mockOkResponse([])
      await predictApi.macroHistory(50)
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('limit=50')
    })
  })

  describe('trends', () => {
    it('builds query params for trends', async () => {
      mockOkResponse([])
      await predictApi.trends({ limit: 10, min_events: 3, window_hours: 48 })
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('limit=10')
      expect(url).toContain('min_events=3')
      expect(url).toContain('window_hours=48')
    })
  })

  describe('industryChain', () => {
    it('calls /api/industry-chain', async () => {
      mockOkResponse({ nodes: [], edges: [] })
      await predictApi.industryChain()
      expect(mockFetch).toHaveBeenCalledWith('/api/industry-chain')
    })
  })

  describe('eventMatch', () => {
    it('encodes text parameter', async () => {
      mockOkResponse([])
      await predictApi.eventMatch('BTC whale dump', 5, 0.3)
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('text=BTC%20whale%20dump')
      expect(url).toContain('top_k=5')
      expect(url).toContain('threshold=0.3')
    })
  })

  describe('eventChainLinks', () => {
    it('passes event_id as query param', async () => {
      mockOkResponse({})
      await predictApi.eventChainLinks(42)
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('event_id=42')
    })
  })

  describe('predictAccuracy', () => {
    it('calls /api/predict-accuracy', async () => {
      mockOkResponse({ accuracy: {}, recent_validations: [] })
      await predictApi.predictAccuracy()
      expect(mockFetch).toHaveBeenCalledWith('/api/predict-accuracy')
    })
  })

  describe('predictionDetail', () => {
    it('calls /api/predictions/:id', async () => {
      mockOkResponse({ id: 1 })
      await predictApi.predictionDetail(1)
      expect(mockFetch).toHaveBeenCalledWith('/api/predictions/1')
    })
  })

  describe('reasoningGraph', () => {
    it('calls /api/predictions/:id/reasoning-graph', async () => {
      mockOkResponse({ nodes: [], edges: [] })
      await predictApi.reasoningGraph(5)
      expect(mockFetch).toHaveBeenCalledWith('/api/predictions/5/reasoning-graph')
    })
  })

  describe('openInterest', () => {
    it('uses default params', async () => {
      mockOkResponse([])
      await predictApi.openInterest()
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('symbol=BTC%2FUSDT')
      expect(url).toContain('limit=24')
    })
  })

  describe('longShortRatio', () => {
    it('uses custom params', async () => {
      mockOkResponse([])
      await predictApi.longShortRatio('ETH/USDT', 48)
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('symbol=ETH%2FUSDT')
      expect(url).toContain('limit=48')
    })
  })

  describe('takerVolume', () => {
    it('calls with correct URL', async () => {
      mockOkResponse([])
      await predictApi.takerVolume('SOL/USDT', 12)
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('/data-api/api/taker-volume')
      expect(url).toContain('symbol=SOL%2FUSDT')
      expect(url).toContain('limit=12')
    })
  })
})
