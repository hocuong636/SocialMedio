import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, Save, X } from 'lucide-react'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { authService } from '../../services/authService'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

const genderOptions = [
  { value: '', label: 'Không xác định' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
] as const

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user, setUser } = useAuthStore()
  const { addToast } = useUIStore()
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<'basic' | 'extra'>('basic')

  // Basic info form (from user schema)
  const [basicForm, setBasicForm] = useState({
    fullName: '',
    bio: '',
  })

  // Extended profile form (from userProfile schema)
  const [extraForm, setExtraForm] = useState({
    phone: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    address: '',
    website: '',
  })

  // Fetch full profile data
  const { data: profileData } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => userService.getProfile(),
    enabled: open,
  })

  // Populate forms when data loads
  useEffect(() => {
    if (user) {
      setBasicForm({
        fullName: user.fullName || '',
        bio: user.bio || '',
      })
    }
  }, [user, open])

  useEffect(() => {
    if (profileData) {
      setExtraForm({
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth
          ? profileData.dateOfBirth.slice(0, 10)
          : '',
        gender: profileData.gender || '',
        address: profileData.address || '',
        website: profileData.website || '',
      })
    }
  }, [profileData, open])

  // Refresh user in auth store
  const refreshUser = async () => {
    try {
      const updated = await authService.getMe()
      setUser(updated)
    } catch {
      // silent
    }
  }

  // Mutations
  const updateInfoMutation = useMutation({
    mutationFn: () => userService.updateInfo(basicForm),
    onSuccess: async () => {
      await refreshUser()
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
      addToast('Cập nhật thông tin thành công!', 'success')
    },
    onError: () => addToast('Cập nhật thất bại', 'error'),
  })

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      userService.updateProfile({
        ...extraForm,
        dateOfBirth: extraForm.dateOfBirth || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
      addToast('Cập nhật hồ sơ thành công!', 'success')
    },
    onError: () => addToast('Cập nhật thất bại', 'error'),
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: async () => {
      await refreshUser()
      addToast('Đã cập nhật ảnh đại diện!', 'success')
    },
    onError: () => addToast('Upload ảnh thất bại', 'error'),
  })

  const uploadCoverMutation = useMutation({
    mutationFn: (file: File) => userService.uploadCover(file),
    onSuccess: async () => {
      await refreshUser()
      addToast('Đã cập nhật ảnh bìa!', 'success')
    },
    onError: () => addToast('Upload ảnh bìa thất bại', 'error'),
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatarMutation.mutate(file)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadCoverMutation.mutate(file)
  }

  const handleSave = () => {
    if (activeTab === 'basic') {
      updateInfoMutation.mutate()
    } else {
      updateProfileMutation.mutate()
    }
  }

  const isSaving =
    updateInfoMutation.isPending ||
    updateProfileMutation.isPending ||
    uploadAvatarMutation.isPending ||
    uploadCoverMutation.isPending

  if (!user) return null

  return (
    <Modal open={open} onClose={onClose} title="Chỉnh sửa hồ sơ" size="lg">
      {/* Avatar & Cover section */}
      <div className="mb-6">
        {/* Cover */}
        <div className="relative h-28 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl overflow-hidden group">
          {user.coverUrl && (
            <img
              src={user.coverUrl}
              alt="cover"
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadCoverMutation.isPending}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all cursor-pointer"
          >
            <Camera
              size={20}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        {/* Avatar overlay */}
        <div className="flex items-end gap-4 px-4 -mt-8 relative z-10">
          <div className="relative group">
            <Avatar
              src={user.avatarUrl}
              name={user.fullName || user.username}
              size="xl"
              className="ring-4 ring-white"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadAvatarMutation.isPending}
              className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all cursor-pointer"
            >
              <Camera
                size={18}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="pb-1">
            <p className="text-sm font-bold text-gray-900">
              {user.fullName || user.username}
            </p>
            <p className="text-xs text-gray-400">
              Click vào ảnh để thay đổi
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'basic'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Thông tin cơ bản
        </button>
        <button
          onClick={() => setActiveTab('extra')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'extra'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Thông tin mở rộng
        </button>
      </div>

      {/* Basic info tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Họ và tên
            </label>
            <input
              value={basicForm.fullName}
              onChange={(e) =>
                setBasicForm((f) => ({ ...f, fullName: e.target.value }))
              }
              placeholder="Nhập họ và tên"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Tiểu sử
            </label>
            <textarea
              value={basicForm.bio}
              onChange={(e) =>
                setBasicForm((f) => ({ ...f, bio: e.target.value }))
              }
              rows={3}
              maxLength={500}
              placeholder="Giới thiệu về bản thân..."
              className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {basicForm.bio.length}/500
            </p>
          </div>
        </div>
      )}

      {/* Extended profile tab */}
      {activeTab === 'extra' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Số điện thoại
              </label>
              <input
                value={extraForm.phone}
                onChange={(e) =>
                  setExtraForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="0901234567"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Giới tính
              </label>
              <select
                value={extraForm.gender}
                onChange={(e) =>
                  setExtraForm((f) => ({
                    ...f,
                    gender: e.target.value as typeof extraForm.gender,
                  }))
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none cursor-pointer"
              >
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Ngày sinh
            </label>
            <input
              type="date"
              value={extraForm.dateOfBirth}
              onChange={(e) =>
                setExtraForm((f) => ({ ...f, dateOfBirth: e.target.value }))
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Địa chỉ
            </label>
            <input
              value={extraForm.address}
              onChange={(e) =>
                setExtraForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="TP. Hồ Chí Minh, Việt Nam"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Website
            </label>
            <input
              value={extraForm.website}
              onChange={(e) =>
                setExtraForm((f) => ({ ...f, website: e.target.value }))
              }
              placeholder="https://example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          <X size={15} />
          Hủy
        </Button>
        <Button onClick={handleSave} loading={isSaving}>
          <Save size={15} />
          Lưu thay đổi
        </Button>
      </div>
    </Modal>
  )
}
