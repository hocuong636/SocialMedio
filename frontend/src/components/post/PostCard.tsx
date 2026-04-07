import { useState, useEffect } from 'react'
import { MessageCircle, MoreHorizontal, Trash2, Bookmark, AlertCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Post } from '../../types'
import { reactionService } from '../../services/reactionService'
import { savedPostService } from '../../services/savedPostService'
import { useUIStore } from '../../store/useUIStore'
import { useAuthStore } from '../../store/useAuthStore'
import Avatar from '../ui/Avatar'
import Modal from '../ui/Modal'
import CommentSection from './CommentSection'
import ReportModal from '../report/ReportModal'
import ReactionPicker from './ReactionPicker'

interface PostCardProps {
  post: Post
  onDelete?: (id: string) => void
  currentUserId?: string
  defaultSaved?: boolean
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

export default function PostCard({ post, onDelete, currentUserId, defaultSaved = false }: PostCardProps) {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()
  const { user } = useAuthStore()
  
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [saved, setSaved] = useState(defaultSaved)
  const [likeCount, setLikeCount] = useState(post.reactionsCount)
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    reactionService.getReactionSummary(post._id).then(res => {
      if (res.success) {
        setUserReaction(res.data.userReaction)
      }
    })
  }, [post._id])

  const isOwner = currentUserId === post.author._id

  const saveMutation = useMutation({
    mutationFn: () => savedPostService.savePost(post._id),
    onSuccess: () => {
      setSaved(true)
      addToast('Đã lưu bài viết', 'success')
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] })
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        unsaveMutation.mutate()
      } else {
        addToast('Lưu bài viết thất bại', 'error')
      }
    }
  })

  const unsaveMutation = useMutation({
    mutationFn: () => savedPostService.unsavePost(post._id),
    onSuccess: () => {
      setSaved(false)
      addToast('Đã bỏ lưu bài viết', 'success')
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] })
    },
    onError: () => addToast('Bỏ lưu thất bại', 'error')
  })

  const handleSave = () => {
    if (saveMutation.isPending || unsaveMutation.isPending) return
    if (saved) {
      unsaveMutation.mutate()
    } else {
      saveMutation.mutate()
    }
  }

  return (
    <>
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar
              src={post.author.avatarUrl}
              name={post.author.fullName || post.author.username}
              size="md"
            />
            <div>
              <p className="font-bold text-sm text-gray-900">
                {post.author.fullName || post.author.username}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400">
                  @{post.author.username}
                </p>
                <span className="text-gray-300 text-xs">·</span>
                <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 cursor-pointer"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden min-w-36">
                {isOwner ? (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setConfirmDelete(true)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                    Xóa bài viết
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setShowReportModal(true)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <AlertCircle size={15} />
                    Báo cáo bài viết
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        )}

        {/* Images */}
        {post.images.length > 0 && (
          <div
            className={`grid gap-0.5 ${
              post.images.length === 1
                ? 'grid-cols-1'
                : post.images.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-2'
            }`}
          >
            {post.images.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden ${
                  post.images.length === 3 && i === 0 ? 'row-span-2' : ''
                }`}
              >
                <img
                  src={img}
                  alt={`image-${i}`}
                  className="w-full h-48 object-cover"
                />
                {i === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                    +{post.images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <ReactionPicker
              postId={post._id}
              userReaction={userReaction}
              onReactionChange={(r) => {
                const prevReaction = userReaction
                setUserReaction(r ? r.type : null)
                
                // Update likeCount locally for better UX
                if (!prevReaction && r) setLikeCount(prev => prev + 1)
                else if (prevReaction && !r) setLikeCount(prev => prev - 1)
                
                queryClient.invalidateQueries({ queryKey: ['posts'] })
              }}
            />
            <span className="text-xs font-bold text-gray-500 pr-2">
              {likeCount}
            </span>

            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                showComments ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-400'
              }`}
            >
              <MessageCircle size={17} />
              <span>{post.commentsCount}</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || unsaveMutation.isPending}
            className={`flex items-center justify-center p-2 rounded-xl transition-colors cursor-pointer ${
              saved
                ? 'text-yellow-500 bg-yellow-50'
                : 'text-gray-400 hover:bg-gray-50 hover:text-yellow-500'
            }`}
          >
            <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="border-t border-gray-50 bg-gray-50/30">
            <CommentSection postId={post._id} currentUser={user || undefined} />
          </div>
        )}
      </article>

      {/* Delete confirmation modal */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Xóa bài viết"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Bài viết này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onDelete?.(post._id)
              setConfirmDelete(false)
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </Modal>

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post._id}
      />
    </>
  )
}
