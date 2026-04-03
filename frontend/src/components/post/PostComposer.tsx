import { useState } from 'react'
import { ImagePlus, Globe, Users, Lock, Send } from 'lucide-react'
import type { User } from '../../types'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

interface PostComposerProps {
  user: User
  onSubmit: (content: string, visibility: 'public' | 'friends' | 'private') => Promise<void>
}

const visibilityOptions = [
  { value: 'public' as const, label: 'Công khai', icon: Globe },
  { value: 'friends' as const, label: 'Bạn bè', icon: Users },
  { value: 'private' as const, label: 'Chỉ mình tôi', icon: Lock },
]

export default function PostComposer({ user, onSubmit }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await onSubmit(content, visibility)
      setContent('')
    } finally {
      setLoading(false)
    }
  }

  const currentVisibility = visibilityOptions.find((o) => o.value === visibility)!

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        <Avatar
          src={user.avatarUrl}
          name={user.fullName || user.username}
          size="md"
        />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Bạn đang nghĩ gì?"
              className="w-full resize-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {/* Image attach (UI only – upload API is a stub) */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Đính kèm ảnh"
                >
                  <ImagePlus size={15} />
                  Ảnh
                </button>

                {/* Visibility selector */}
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <currentVisibility.icon size={14} />
                    {currentVisibility.label}
                  </button>
                  <div className="absolute left-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg z-10 hidden group-hover:block min-w-40">
                    {visibilityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setVisibility(opt.value)}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                          visibility === opt.value
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <opt.icon size={13} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                loading={loading}
                disabled={!content.trim()}
              >
                <Send size={14} />
                Đăng
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
