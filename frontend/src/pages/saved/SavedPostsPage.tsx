import { useQuery } from '@tanstack/react-query'
import { Bookmark } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { savedPostService } from '../../services/savedPostService'
import PostCard from '../../components/post/PostCard'
import Spinner from '../../components/ui/Spinner'

export default function SavedPostsPage() {
  const { user } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['savedPosts'],
    queryFn: () => savedPostService.getSaved(1, 20),
  })

  // trích xuất mảng 'post' nằm bên trong từng object SavedPost
  const savedItems = data?.data ?? []
  
  // Hack nhỏ: Gắn luôn isSaved = true cho các post lấy từ danh sách này!
  const posts = savedItems.map(item => ({ ...item.post, isSaved: true }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bài viết đã lưu</h1>
        <p className="text-sm text-gray-400">Các bài viết bạn đã đánh dấu lưu lại</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="font-bold text-gray-700 mb-1">Lỗi tải dữ liệu</p>
          <p className="text-sm text-gray-400">Không thể lấy danh sách bài đã lưu.</p>
        </div>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark size={24} className="text-blue-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">Danh sách trống</p>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Bạn chưa lưu bài viết nào. Hãy bấm lưu bài viết trên bảng tin nhé!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={user || undefined}
            // Không hỗ trợ xóa bài viết người khác ở đây
          />
        ))}
      </div>
    </div>
  )
}
