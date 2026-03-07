import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/accuracy', label: 'Accuracy' },
  { to: '/chain', label: 'Chain' },
  { to: '/backtest', label: 'Backtest' },
] as const

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Desktop links */}
        <div className="hidden md:flex gap-4" data-testid="desktop-nav">
          {links.map(({ to, label, ...rest }) => (
            <NavLink key={to} to={to} className={navLinkClass} {...rest}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden text-gray-400 hover:text-gray-200"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          data-testid="hamburger-btn"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden flex flex-col gap-2 px-6 pb-3" data-testid="mobile-menu">
          {links.map(({ to, label, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              className={navLinkClass}
              onClick={() => setOpen(false)}
              {...rest}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
