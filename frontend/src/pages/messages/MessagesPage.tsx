import { MessageCircle, Send, Search } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Tin nhắn</h1>
        <p className="text-sm text-gray-400">Trò chuyện với bạn bè</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
              disabled
            />
          </div>
        </div>

        {/* Mock conversation list */}
        <ul className="opacity-50 pointer-events-none">
          {['Alice', 'Bob', 'Charlie'].map((name) => (
            <li
              key={name}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">5 phút</p>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  Xin chào! Bạn có khỏe không?
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Coming soon */}
        <div className="px-4 py-10 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={20} className="text-blue-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">Tin nhắn đang phát triển</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Tính năng nhắn tin theo thời gian thực sẽ sớm ra mắt!
          </p>
          <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 max-w-xs mx-auto opacity-50">
            <input
              className="flex-1 bg-transparent text-sm focus:outline-none"
              placeholder="Nhập tin nhắn..."
              disabled
            />
            <Send size={15} className="text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
