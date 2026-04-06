import { useState, useEffect } from 'react'
import { Search, UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../../services/userService'
import { followService } from '../../services/followService'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import Avatar from '../../components/ui/Avatar'
import { Link } from 'react-router-dom'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const { user: currentUser } = useAuthStore()
  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isLoading } = useQuery({
    queryKey: ['search-users', debouncedQuery],
    queryFn: () => userService.searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  // We need follow status for each found user
  const { data: followingData } = useQuery({
    queryKey: ['following'],
    queryFn: () => followService.getFollowing(1, 100),
    enabled: !!currentUser,
  })

  const followingIds = new Set(followingData?.data.map((f: any) => f.following._id))

  const followMutation = useMutation({
    mutationFn: (userId: string) => followService.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] })
      addToast('Đã theo dõi người dùng', 'success')
    },
    onError: () => addToast('Theo dõi thất bại', 'error'),
  })

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => followService.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] })
      addToast('Đã bỏ theo dõi', 'success')
    },
    onError: () => addToast('Bỏ theo dõi thất bại', 'error'),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Tìm kiếm</h1>
        <p className="text-sm text-gray-400">Khám phá và kết nối với mọi người</p>
      </div>

      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên hoặc username..."
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
        {isLoading && debouncedQuery && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <Loader2 size={18} className="text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {!debouncedQuery && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-50 border-dashed">
            <p className="text-sm text-gray-400 font-medium">Nhập tên người dùng để bắt đầu tìm kiếm</p>
          </div>
        )}

        {debouncedQuery && results?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Không tìm thấy người dùng nào phù hợp</p>
          </div>
        )}

        {results?.map((user) => (
          <div key={user._id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-blue-100 transition-all shadow-sm">
            <Link to={`/profile/${user.username}`} className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.fullName || user.username} size="lg" />
              <div>
                <p className="font-bold text-gray-900">{user.fullName || user.username}</p>
                <p className="text-xs text-gray-400">@{user.username}</p>
              </div>
            </Link>

            {followingIds.has(user._id) ? (
              <button
                onClick={() => unfollowMutation.mutate(user._id)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                disabled={unfollowMutation.isPending}
              >
                <UserCheck size={16} />
                Đang theo dõi
              </button>
            ) : (
              <button
                onClick={() => followMutation.mutate(user._id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                disabled={followMutation.isPending}
              >
                <UserPlus size={16} />
                Theo dõi
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
