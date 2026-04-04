import { Bell, Heart, MessageCircle, UserPlus, FileText, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../../services/notificationService'
import Spinner from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'

const typeConfig = {
  reaction: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50', label: 'thích bài viết của bạn' },
  comment: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'bình luận bài viết của bạn' },
  follow: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50', label: 'đã theo dõi bạn' },
  message: { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50', label: 'đã nhắn tin cho bạn' },
  post: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50', label: 'đã đăng bài viết mới' },
  report_resolved: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50', label: 'báo cáo đã được xử lý' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} ngày trước`
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(1, 50),
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const readAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = data?.data ?? []

  const handleNotificationClick = async (notif: any) => {
    // 1. Đánh dấu đã đọc nếu chưa đọc
    if (!notif.isRead) {
      await readMutation.mutateAsync(notif._id)
    }
    
    // 2. Chuyển hướng
    switch (notif.refModel) {
      case 'post':
      case 'comment':
        navigate(`/post/${notif.refId}`)
        break
      case 'user':
        navigate(`/profile/${notif.refId}`)
        break
      case 'message':
        navigate(`/messages/${notif.refId}`)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Thông báo</h1>
        <p className="text-sm text-gray-400">Xem các hoạt động gần đây</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mới nhất</p>
          <button 
            onClick={() => readAllMutation.mutate()}
            className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className="py-10 text-center text-gray-500">
            Có lỗi xảy ra khi tải thông báo.
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Bell size={20} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-700 mb-1">Không có thông báo nào</p>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Khi có người tương tác với bạn, thông báo sẽ xuất hiện tại đây.
            </p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <ul>
            {notifications.map((notif: any) => {
              const config = typeConfig[notif.type as keyof typeof typeConfig] || typeConfig['post']
              
              return (
                <li
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 last:border-none cursor-pointer transition-colors hover:bg-gray-50 ${
                    notif.isRead ? 'opacity-60 bg-white' : 'bg-blue-50/30'
                  }`}
                >
                  <div className="relative mt-0.5 mt-1 hover:opacity-80">
                    <Avatar 
                      src={notif.sender?.avatarUrl} 
                      name={notif.sender?.username || 'User'} 
                      size="sm" 
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${config.bg} rounded-full flex items-center justify-center border-2 border-white`}>
                      <config.icon size={10} className={config.color} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">{notif.sender?.username || 'Người dùng ẩn danh'}</span>{' '}
                      {notif.content || config.label}
                    </p>
                    <p className={`text-xs mt-1 ${notif.isRead ? 'text-gray-400' : 'text-blue-500 font-medium'}`}>
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMutation.mutate(notif._id)
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-0.5"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
