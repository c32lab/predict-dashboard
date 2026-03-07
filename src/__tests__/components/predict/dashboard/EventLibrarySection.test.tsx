import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../../../../components/predict', () => ({
  EventTable: () => <div>EventTable</div>,
}))

import { EventLibrarySection } from '../../../../components/predict/dashboard/EventLibrarySection'

describe('EventLibrarySection', () => {
  it('renders section heading', () => {
    render(<EventLibrarySection events={[]} />)
    expect(screen.getByText(/Event Library/)).toBeInTheDocument()
  })

  it('shows empty message when no events', () => {
    render(<EventLibrarySection events={[]} />)
    expect(screen.getByText('No events')).toBeInTheDocument()
  })
})
