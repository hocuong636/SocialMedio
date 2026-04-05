import { useState, useRef } from 'react'
import { ImagePlus, Globe, Users, Lock, Send, X } from 'lucide-react'
import type { User } from '../../types'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import api from '../../api/axiosConfig'

interface PostComposerProps {
  user: User
  onSubmit: (content: string, visibility: 'public' | 'friends' | 'private', images: string[]) => Promise<void>
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
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('image', file)
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setImages((prev) => [...prev, res.data.url])
      }
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0) return
    setLoading(true)
    try {
      await onSubmit(content, visibility, images)
      setContent('')
      setImages([])
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
                {/* Image attach */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Đính kèm ảnh"
                >
                  <ImagePlus size={15} />
                  {uploading ? 'Đang tải...' : 'Ảnh'}
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
                disabled={!content.trim() && images.length === 0}
              >
                <Send size={14} />
                Đăng
              </Button>
            </div>

            {/* Image preview */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
