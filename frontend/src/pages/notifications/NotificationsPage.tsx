import { Bell, Heart, MessageCircle, UserPlus, FileText } from 'lucide-react'

const typeConfig = {
  reaction: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50', label: 'thích bài viết của bạn' },
  comment: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'bình luận bài viết của bạn' },
  follow: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50', label: 'đã theo dõi bạn' },
  message: { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50', label: 'đã nhắn tin cho bạn' },
  post: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50', label: 'đã đăng bài viết mới' },
  report_resolved: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50', label: 'báo cáo đã được xử lý' },
}

export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Thông báo</h1>
        <p className="text-sm text-gray-400">Xem các hoạt động gần đây</p>
      </div>

      {/* Coming soon placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Preview items */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hôm nay</p>
          <button className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Notification type previews */}
        <ul>
          {(Object.entries(typeConfig) as [keyof typeof typeConfig, typeof typeConfig[keyof typeof typeConfig]][]).map(
            ([type, config]) => (
              <li
                key={type}
                className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 last:border-none opacity-40"
              >
                <div
                  className={`w-8 h-8 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <config.icon size={15} className={config.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Người dùng</span>{' '}
                    {config.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">vừa xong</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              </li>
            ),
          )}
        </ul>

        {/* Coming soon overlay */}
        <div className="px-4 py-8 text-center border-t border-gray-100">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Bell size={20} className="text-blue-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">Tính năng đang phát triển</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Thông báo thời gian thực sẽ sớm ra mắt. Vui lòng quay lại sau!
          </p>
        </div>
      </div>
    </div>
  )
}
