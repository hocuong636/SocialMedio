import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, ImageOff } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { savedPostService } from '../../services/savedPostService'
import PostCard from '../../components/post/PostCard'
import Spinner from '../../components/ui/Spinner'

export default function SavedPostsPage() {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['saved-posts'],
    queryFn: () => savedPostService.getSaved(1, 50),
  })

  const unsaveMutation = useMutation({
    mutationFn: (postId: string) => savedPostService.unsavePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] })
      addToast('Đã bỏ lưu bài viết', 'success')
    },
    onError: () => addToast('Bỏ lưu thất bại', 'error'),
  })

  const savedPosts = data?.data ?? []

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
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageOff size={24} className="text-gray-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">Chưa thể tải bài viết đã lưu</p>
          <p className="text-sm text-gray-400">Vui lòng thử lại sau.</p>
        </div>
      )}

      {!isLoading && !isError && savedPosts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark size={24} className="text-blue-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">Chưa có bài viết nào được lưu</p>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Nhấn nút bookmark trên bài viết để lưu lại đọc sau!
          </p>
        </div>
      )}

      {savedPosts.map((sp) => (
        <PostCard
          key={sp._id}
          post={sp.post}
          currentUserId={user?._id}
          onDelete={(postId) => unsaveMutation.mutate(postId)}
          defaultSaved={true}
        />
      ))}
    </div>
  )
}
