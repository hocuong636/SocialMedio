import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { postService } from '../../services/postService'
import { userService } from '../../services/userService'
import PostCard from '../../components/post/PostCard'
import PostComposer from '../../components/post/PostComposer'
import Spinner from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import { Link } from 'react-router-dom'
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
    }: {
      content: string
      visibility: 'public' | 'friends' | 'private'
    }) => postService.createPost(content, visibility),
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

  const { data: suggestedUsers, isLoading: loadingSuggested } = useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: () => userService.getSuggestedUsers(),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột chính (Bài viết) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">Bảng tin</h1>
          <p className="text-sm text-gray-400">Xem bài viết mới nhất từ mọi người</p>
        </div>

        {/* Composer */}
        {user && (
          <PostComposer
            user={user}
            onSubmit={async (content, visibility) => {
              await createMutation.mutateAsync({ content, visibility })
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
            currentUser={user || undefined}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      {/* Cột phụ (Gợi ý kết bạn) */}
      <div className="hidden lg:block space-y-4">
         <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-4">
           <h2 className="font-black text-gray-900 mb-4">Gợi ý cho bạn</h2>
           {loadingSuggested ? (
             <div className="flex justify-center py-4"><Spinner /></div>
           ) : suggestedUsers?.length === 0 ? (
             <p className="text-sm text-gray-400 text-center py-4">Chưa có gợi ý nào</p>
           ) : (
             <ul className="space-y-4">
               {suggestedUsers?.map(su => (
                 <li key={su._id} className="flex items-center justify-between gap-2">
                   <Link to={`/profile/${su.username}`} className="flex items-center gap-2 flex-1 min-w-0 group hover:opacity-80 transition-opacity">
                      <Avatar src={su.avatarUrl} name={su.fullName || su.username} size="sm" />
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-gray-900 truncate">{su.fullName || su.username}</p>
                         <p className="text-xs text-gray-400 truncate">@{su.username}</p>
                      </div>
                   </Link>
                 </li>
               ))}
             </ul>
           )}
         </div>
      </div>
    </div>
  )
}
