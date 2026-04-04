import { useState } from 'react'
import { MessageCircle, Trash2, Edit2, MoreHorizontal, Reply } from 'lucide-react'
import { commentService } from '../../services/commentService'
import type { Comment, User } from '../../types'
import Avatar from '../ui/Avatar'
import Modal from '../ui/Modal'
import CommentComposer from './CommentComposer'

interface CommentCardProps {
  comment: Comment
  postId: string
  currentUser?: User
  onCommentDeleted?: (commentId: string) => void
  onCommentUpdated?: (comment: Comment) => void
  onReplyAdded?: (reply: Comment) => void
  repliesCount?: number
  onLoadReplies?: () => void
  level?: number // nested level (0 = top-level)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins}m trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h trước`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d trước`
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

export default function CommentCard({
  comment,
  postId,
  currentUser,
  onCommentDeleted,
  onCommentUpdated,
  onReplyAdded,
  repliesCount = 0,
  onLoadReplies,
  level = 0,
}: CommentCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isReplying, setIsReplying] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const isAuthor = currentUser?._id === comment.author._id
  const isPostOwner = false // Would need post owner info to check this

  const handleUpdate = async () => {
    if (editContent.trim() === comment.content.trim()) {
      setIsEditing(false)
      return
    }

    try {
      setLoading(true)
      const response = await commentService.updateComment(
        comment._id,
        editContent,
      )

      if (response.success) {
        onCommentUpdated?.(response.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      const response = await commentService.deleteComment(comment._id)

      if (response.success) {
        onCommentDeleted?.(comment._id)
        setShowDeleteModal(false)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const marginLeft = level > 0 ? `ml-${Math.min(level * 4, 16)}` : ''

  return (
    <>
      <div className={`flex gap-3 py-3 ${marginLeft}`}>
        {/* Avatar */}
        <Avatar
          src={comment.author.avatarUrl}
          name={comment.author.fullName || comment.author.username}
          size="sm"
        />

        {/* Comment content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-900">
                  {comment.author.fullName || comment.author.username}
                </p>
                <p className="text-xs text-gray-500">
                  @{comment.author.username}
                </p>
                <span className="text-gray-300 text-xs">·</span>
                <p className="text-xs text-gray-500">
                  {timeAgo(comment.createdAt)}
                </p>
              </div>

              {/* Edit mode */}
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded font-semibold hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditContent(comment.content)
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded font-semibold hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            {/* Menu button */}
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-6 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden min-w-32 z-20">
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 size={14} />
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {level < 1 && repliesCount > 0 && (
              <button
                onClick={onLoadReplies}
                className="text-xs text-blue-500 hover:underline font-semibold"
              >
                <MessageCircle size={14} className="inline mr-1" />
                {repliesCount} trả lời
              </button>
            )}

            {currentUser && level < 1 && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 font-semibold transition-colors"
              >
                <Reply size={14} />
                Trả lời
              </button>
            )}
          </div>

          {/* Reply composer */}
          {isReplying && currentUser && (
            <div className="mt-3">
              <CommentComposer
                postId={postId}
                currentUser={currentUser}
                parentCommentId={comment._id}
                parentCommentAuthor={
                  comment.author.fullName || comment.author.username
                }
                onCommentCreated={(reply) => {
                  onReplyAdded?.(reply)
                  setIsReplying(false)
                }}
                onCancel={() => setIsReplying(false)}
                isReply={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xóa bình luận"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Bình luận này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:bg-red-400"
          >
            Xóa
          </button>
        </div>
      </Modal>
    </>
  )
}
