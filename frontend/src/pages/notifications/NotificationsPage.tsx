import { useState, useEffect } from 'react'
import { Bell, Heart, MessageCircle, UserPlus, FileText, Loader2, CheckCheck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../../services/notificationService'
import { io } from 'socket.io-client'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import Avatar from '../../components/ui/Avatar'
import { Link } from 'react-router-dom'

const typeConfig = {
  reaction: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  comment: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  follow: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50' },
  message: { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
  post: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
  report_resolved: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return
    const socket = io('http://localhost:3000')
    socket.emit('join-room', user._id)
    
    socket.on('new_notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    })

    return () => { socket.disconnect() }
  }, [user, queryClient])

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(1, 50),
    enabled: !!user,
  })

  const readAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
      addToast('Đã đọc tất cả', 'success')
    }
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    }
  })

  const notifications = data?.data ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Thông báo</h1>
          <p className="text-sm text-gray-400">Xem các tương tác gần đây của bạn</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <CheckCheck size={18} />
            Đọc tất cả
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : notifications.length > 0 ? (
          <ul className="divide-y divide-gray-50">
            {notifications.map((notif) => {
              const config = typeConfig[notif.type as keyof typeof typeConfig] || typeConfig.report_resolved
              return (
                <li
                  key={notif._id}
                  onClick={() => !notif.isRead && readMutation.mutate(notif._id)}
                  className={`flex items-start gap-3 px-4 py-4 transition-colors cursor-pointer group ${!notif.isRead ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative">
                    <Avatar src={notif.sender.avatarUrl} name={notif.sender.username} size="md" />
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 ${config.bg} rounded-full flex items-center justify-center border-2 border-white`}
                    >
                      <config.icon size={10} className={config.color} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-tight">
                      <span className="font-bold">@{notif.sender.username}</span>{' '}
                      {notif.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-700">Chưa có thông báo nào</p>
            <p className="text-sm text-gray-400">Các hoạt động mới sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>
    </div>
  )
}
