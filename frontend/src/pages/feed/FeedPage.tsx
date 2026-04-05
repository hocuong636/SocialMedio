import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { postService } from '../../services/postService'
import PostCard from '../../components/post/PostCard'
import PostComposer from '../../components/post/PostComposer'
import Spinner from '../../components/ui/Spinner'
import type { Post } from '../../types'

export default function FeedPage() {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed'],
    queryFn: () => postService.getFeed(1, 20),
  })

  const createMutation = useMutation({
    mutationFn: ({
      content,
      visibility,
      images,
    }: {
      content: string
      visibility: 'public' | 'friends' | 'private'
      images: string[]
    }) => postService.createPost(content, visibility, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      addToast('Đã đăng bài viết!', 'success')
    },
    onError: () => {
      addToast('Không thể đăng bài – tính năng đang phát triển', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      addToast('Đã xóa bài viết', 'success')
    },
    onError: () => addToast('Xóa thất bại', 'error'),
  })

  const posts: Post[] = data?.data ?? []

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bảng tin</h1>
        <p className="text-sm text-gray-400">Xem bài viết mới nhất từ mọi người</p>
      </div>

      {/* Composer */}
      {user && (
        <PostComposer
          user={user}
          onSubmit={async (content, visibility, images) => {
            await createMutation.mutateAsync({ content, visibility, images })
          }}
        />
      )}

      {/* Feed */}
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
          <p className="font-bold text-gray-700 mb-1">Chưa thể tải bảng tin</p>
          <p className="text-sm text-gray-400">
            Tính năng bài viết đang được phát triển. Vui lòng quay lại sau.
          </p>
        </div>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageOff size={24} className="text-blue-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">Bảng tin trống</p>
          <p className="text-sm text-gray-400">
            Hãy theo dõi người dùng khác để xem bài viết của họ!
          </p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={user?._id}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ))}
    </div>
  )
}
