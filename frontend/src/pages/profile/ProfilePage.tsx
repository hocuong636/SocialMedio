import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserPlus,
  UserCheck,
  Link2,
  Calendar,
  Users,
  Pencil,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { followService } from '../../services/followService'
import { userService } from '../../services/userService'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EditProfileModal from '../../components/profile/EditProfileModal'
import ReportModal from '../../components/report/ReportModal'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  })
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuthStore()
  const { addToast } = useUIStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'posts' | 'following' | 'followers'>('posts')
  const [editOpen, setEditOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  const isOwnProfile = currentUser?.username === username

  // Fetch other user's data by username
  const { data: fetchedUser, isLoading: loadingUser } = useQuery({
    queryKey: ['user', username],
    queryFn: () => userService.getUserByUsername(username!),
    enabled: !isOwnProfile && !!username,
  })

  const profileUser = isOwnProfile ? currentUser : fetchedUser ?? null

  // Followers & following — own profile uses own endpoints, other profile uses userId endpoints
  const { data: followingData, isLoading: loadingFollowing } = useQuery({
    queryKey: ['following', profileUser?._id],
    queryFn: () =>
      isOwnProfile
        ? followService.getFollowing(1, 50)
        : followService.getUserFollowing(profileUser!._id, 1, 50),
    enabled: !!profileUser,
  })

  const { data: followersData, isLoading: loadingFollowers } = useQuery({
    queryKey: ['followers', profileUser?._id],
    queryFn: () =>
      isOwnProfile
        ? followService.getFollowers(1, 50)
        : followService.getUserFollowers(profileUser!._id, 1, 50),
    enabled: !!profileUser,
  })

  // Check if following this user (only for other profiles)
  const { data: isFollowing } = useQuery({
    queryKey: ['isFollowing', profileUser?._id],
    queryFn: () => followService.checkFollowing(profileUser!._id),
    enabled: !isOwnProfile && !!profileUser,
  })

  const followMutation = useMutation({
    mutationFn: () => followService.follow(profileUser!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', profileUser?._id] })
      queryClient.invalidateQueries({ queryKey: ['followers', profileUser?._id] })
      addToast('Đã theo dõi!', 'success')
    },
    onError: () => addToast('Không thể theo dõi', 'error'),
  })

  const unfollowMutation = useMutation({
    mutationFn: () => followService.unfollow(profileUser!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', profileUser?._id] })
      queryClient.invalidateQueries({ queryKey: ['followers', profileUser?._id] })
      addToast('Đã hủy theo dõi', 'info')
    },
    onError: () => addToast('Không thể hủy theo dõi', 'error'),
  })

  if (!isOwnProfile && loadingUser) return <Spinner />

  if (!profileUser) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <p className="font-bold text-gray-700 mb-1">Không tìm thấy người dùng</p>
        <p className="text-sm text-gray-400">
          Người dùng không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-4">
      {/* Cover + Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Cover */}
        <div className="h-36 bg-linear-to-r from-blue-500 to-blue-700 relative">
          {profileUser.coverUrl && (
            <img
              src={profileUser.coverUrl}
              alt="cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Avatar + info */}
        <div className="px-5 pb-5 relative z-10">
          <div className="flex items-end justify-between -mt-12 mb-3">
            <Avatar
              src={profileUser.avatarUrl}
              name={profileUser.fullName || profileUser.username}
              size="xl"
              className="ring-4 ring-white"
            />
            {isOwnProfile ? (
              <div className="pt-14">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil size={15} />
                  Chỉnh sửa
                </Button>
              </div>
            ) : (
              <div className="pt-14 flex gap-2">
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                  loading={followMutation.isPending || unfollowMutation.isPending}
                  onClick={() =>
                    isFollowing
                      ? unfollowMutation.mutate()
                      : followMutation.mutate()
                  }
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={15} /> Đang theo dõi
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} /> Theo dõi
                    </>
                  )}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportModalOpen(true)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <AlertCircle size={15} />
                    Báo cáo
                  </Button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900">
                {profileUser.fullName || profileUser.username}
              </h1>
            </div>
            <p className="text-sm text-gray-400">@{profileUser.username}</p>
            {profileUser.bio && (
              <p className="text-sm text-gray-700 mt-2">{profileUser.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                Tham gia {formatDate(profileUser.createdAt)}
              </span>
              {profileUser.email && (
                <span className="flex items-center gap-1">
                  <Link2 size={13} />
                  {profileUser.email}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('following')}
              className="text-center cursor-pointer hover:opacity-75 transition-opacity"
            >
              <p className="text-base font-black text-gray-900">
                {followingData?.total ?? 0}
              </p>
              <p className="text-xs text-gray-400">Đang theo dõi</p>
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className="text-center cursor-pointer hover:opacity-75 transition-opacity"
            >
              <p className="text-base font-black text-gray-900">
                {followersData?.total ?? 0}
              </p>
              <p className="text-xs text-gray-400">Người theo dõi</p>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'posts', label: 'Bài viết' },
            { key: 'following', label: 'Đang theo dõi' },
            { key: 'followers', label: 'Người theo dõi' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'posts' && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                Tính năng bài viết đang được phát triển.
              </p>
            </div>
          )}

          {activeTab === 'following' && (
            <div>
              {loadingFollowing ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : followingData?.data.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">
                  Chưa theo dõi ai.
                </p>
              ) : (
                <ul className="space-y-3">
                  {followingData?.data.map((f) => (
                    <li key={f._id}>
                      <Link
                        to={`/profile/${f.following.username}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <Avatar
                          src={f.following.avatarUrl}
                          name={f.following.fullName || f.following.username}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {f.following.fullName || f.following.username}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            @{f.following.username}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div>
              {loadingFollowers ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : followersData?.data.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">
                  Chưa có người theo dõi.
                </p>
              ) : (
                <ul className="space-y-3">
                  {followersData?.data.map((f) => (
                    <li key={f._id}>
                      <Link
                        to={`/profile/${f.follower.username}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <Avatar
                          src={f.follower.avatarUrl}
                          name={f.follower.fullName || f.follower.username}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {f.follower.fullName || f.follower.username}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            @{f.follower.username}
                          </p>
                        </div>
                        <Users size={14} className="text-gray-300 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Edit profile modal */}
      {isOwnProfile && (
        <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      )}

      {profileUser && (
        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="user"
          targetId={profileUser._id}
        />
      )}
    </>
  )
}
