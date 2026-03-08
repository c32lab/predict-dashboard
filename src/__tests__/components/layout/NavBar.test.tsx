import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavBar from '../../../components/layout/NavBar'

function renderNavBar() {
  return render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  )
}

describe('NavBar', () => {
  it('renders desktop navigation links', () => {
    renderNavBar()
    const desktopNav = screen.getByTestId('desktop-nav')
    expect(desktopNav).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText('Decay')).toBeInTheDocument()
    expect(screen.getByText('Chain')).toBeInTheDocument()
    expect(screen.getByText('Backtest')).toBeInTheDocument()
  })

  it('renders hamburger button', () => {
    renderNavBar()
    expect(screen.getByTestId('hamburger-btn')).toBeInTheDocument()
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('does not show mobile menu initially', () => {
    renderNavBar()
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('opens mobile menu on hamburger click', () => {
    renderNavBar()
    fireEvent.click(screen.getByTestId('hamburger-btn'))
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
  })

  it('closes mobile menu on second hamburger click', () => {
    renderNavBar()
    fireEvent.click(screen.getByTestId('hamburger-btn'))
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('hamburger-btn'))
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('closes mobile menu when a link is clicked', () => {
    renderNavBar()
    fireEvent.click(screen.getByTestId('hamburger-btn'))
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()

    const mobileLinks = screen.getByTestId('mobile-menu').querySelectorAll('a')
    fireEvent.click(mobileLinks[1]) // click Accuracy
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('renders correct link hrefs', () => {
    renderNavBar()
    const links = screen.getAllByRole('link')
    const hrefs = links.map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/accuracy')
    expect(hrefs).toContain('/quality')
    expect(hrefs).toContain('/decay')
    expect(hrefs).toContain('/chain')
    expect(hrefs).toContain('/backtest')
  })
})
