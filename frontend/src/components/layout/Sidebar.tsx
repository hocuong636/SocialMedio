import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Bell,
  MessageCircle,
  Clock,
  LogOut,
  User,
  Rss,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { authService } from '../../services/authService'
import Avatar from '../ui/Avatar'

const navItems = [
  { icon: Home, label: 'Bảng tin', to: '/' },
  { icon: Bell, label: 'Thông báo', to: '/notifications' },
  { icon: MessageCircle, label: 'Tin nhắn', to: '/messages' },

  { icon: Clock, label: 'Lịch sử xem', to: '/history' },
]

export default function Sidebar() {
  const { user, setUser } = useAuthStore()
  const { addToast } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      navigate('/login')
    } catch {
      addToast('Đăng xuất thất bại', 'error')
    }
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Rss size={16} className="text-white" />
          </div>
          <span className="font-black text-xl text-gray-900">Socialify</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map(({ icon: Icon, label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User profile card */}
      {user && (
        <div className="px-3 py-3 border-t border-gray-100">
          <NavLink
            to={`/profile/${user.username}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <Avatar src={user.avatarUrl} name={user.fullName || user.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-xs text-gray-400 truncate">@{user.username}</p>
            </div>
            <User size={15} className="text-gray-400 group-hover:text-gray-600" />
          </NavLink>

          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      )}
    </aside>
  )
}
