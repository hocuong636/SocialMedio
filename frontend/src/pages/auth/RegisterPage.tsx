import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Rss } from 'lucide-react'
import { authService } from '../../services/authService'
import { useUIStore } from '../../store/useUIStore'
import Button from '../../components/ui/Button'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addToast } = useUIStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) {
      addToast('Vui lòng nhập đầy đủ thông tin', 'error')
      return
    }
    if (form.password !== form.confirmPassword) {
      addToast('Mật khẩu xác nhận không khớp', 'error')
      return
    }
    if (form.password.length < 6) {
      addToast('Mật khẩu phải có ít nhất 6 ký tự', 'error')
      return
    }
    setLoading(true)
    try {
      await authService.register(form.username, form.password, form.email)
      addToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success')
      navigate('/login')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: string } })?.response?.data ||
        'Đăng ký thất bại'
      addToast(typeof msg === 'string' ? msg : 'Đăng ký thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Rss size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl text-gray-900">Socialify</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Đăng ký</h1>
          <p className="text-sm text-gray-500 mb-6">
            Tạo tài khoản để bắt đầu kết nối.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Tên đăng nhập
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="username"
                autoComplete="username"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input
                name="confirmPassword"
                type={showPwd ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center mt-2"
              size="lg"
            >
              Đăng ký
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
