import { NavLink } from 'react-router-dom'
import { Home, Bell, MessageCircle, Clock } from 'lucide-react'

const items = [
  { icon: Home, to: '/' },
  { icon: Bell, to: '/notifications' },
  { icon: MessageCircle, to: '/messages' },

  { icon: Clock, to: '/history' },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
      <div className="flex">
        {items.map(({ icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center py-3 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Icon size={22} />
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
