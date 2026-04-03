import { Bookmark } from 'lucide-react'

export default function SavedPostsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bài viết đã lưu</h1>
        <p className="text-sm text-gray-400">Các bài viết bạn đã đánh dấu lưu lại</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bookmark size={24} className="text-blue-400" />
        </div>
        <p className="font-bold text-gray-700 mb-1">Tính năng đang phát triển</p>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          Bạn sẽ sớm có thể lưu những bài viết hay để đọc lại sau. Vui lòng
          quay lại sau!
        </p>
      </div>
    </div>
  )
}
