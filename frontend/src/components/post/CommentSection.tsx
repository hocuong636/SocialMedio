import { useState, useEffect } from 'react'
import { ChevronDown, Loader } from 'lucide-react'
import { commentService } from '../../services/commentService'
import type { Comment, User } from '../../types'
import CommentComposer from './CommentComposer'
import CommentCard from './CommentCard'

interface CommentSectionProps {
  postId: string
  currentUser?: User
  commentsCount?: number
}

export default function CommentSection({
  postId,
  currentUser,
  commentsCount = 0,
}: CommentSectionProps) {
  const [comments, setComments] = useState<(Comment & { repliesCount?: number })[]>([])
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: string]: (Comment & { repliesCount?: number })[]
  }>({})
  const [loadingReplies, setLoadingReplies] = useState<{ [key: string]: boolean }>({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: commentsCount,
    pages: Math.ceil(commentsCount / 10),
  })
  const [loading, setLoading] = useState(false)
  const [showComposer, setShowComposer] = useState(false)

  // Load comments on mount
  useEffect(() => {
    if (postId) {
      loadComments(1)
    }
  }, [postId])

  const loadComments = async (page: number) => {
    try {
      setLoading(true)
      const response = await commentService.getCommentsByPost(
        postId,
        page,
        10,
      )

      if (response.success) {
        setComments(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (commentId: string) => {
    // If already loaded, toggle visibility
    if (expandedReplies[commentId]) {
      setExpandedReplies((prev) => {
        const newState = { ...prev }
        delete newState[commentId]
        return newState
      })
      return
    }

    try {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }))
      const response = await commentService.getReplies(commentId, 1, 50)

      if (response.success) {
        setExpandedReplies((prev) => ({
          ...prev,
          [commentId]: response.data,
        }))
      }
    } catch (error) {
      console.error('Error loading replies:', error)
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  const handleCommentCreated = (comment: Comment) => {
    // If it's a reply, add to expandedReplies
    if (comment.parentComment) {
      const parentId = comment.parentComment as string
      setExpandedReplies((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), comment],
      }))
      // Update repliesCount
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, repliesCount: (c.repliesCount || 0) + 1 }
            : c,
        ),
      )
    } else {
      // Top-level comment
      setComments((prev) => [comment as any, ...prev])
    }
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId))
  }

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((c) => (c._id === updatedComment._id ? (updatedComment as any) : c)),
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">
          Bình luận ({pagination.total})
        </h3>
      </div>

      {/* Comment composer */}
      {currentUser && (
        <div className="mb-4">
          {!showComposer && (
            <button
              onClick={() => setShowComposer(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Viết bình luận của bạn...
            </button>
          )}

          {showComposer && (
            <div className="mb-4">
              <CommentComposer
                postId={postId}
                currentUser={currentUser}
                onCommentCreated={(comment) => {
                  handleCommentCreated(comment)
                  setShowComposer(false)
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-8 flex items-center justify-center">
          <Loader size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Comments list */}
      {!loading && comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment._id}>
              {/* Main comment */}
              <CommentCard
                comment={comment}
                postId={postId}
                currentUser={currentUser}
                onCommentDeleted={handleCommentDeleted}
                onCommentUpdated={handleCommentUpdated}
                onReplyAdded={handleCommentCreated}
                repliesCount={comment.repliesCount}
                onLoadReplies={() => loadReplies(comment._id)}
                level={0}
              />

              {/* Replies */}
              {expandedReplies[comment._id] && (
                <div className="space-y-2">
                  {expandedReplies[comment._id].map((reply) => (
                    <CommentCard
                      key={reply._id}
                      comment={reply}
                      postId={postId}
                      currentUser={currentUser}
                      onCommentDeleted={handleCommentDeleted}
                      onCommentUpdated={handleCommentUpdated}
                      onReplyAdded={handleCommentCreated}
                      level={1}
                    />
                  ))}
                </div>
              )}

              {/* Loading indicator for replies */}
              {loadingReplies[comment._id] && (
                <div className="ml-8 py-2 flex items-center gap-2 text-sm text-gray-500">
                  <Loader size={14} className="animate-spin" />
                  Đang tải trả lời...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && comments.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p className="text-sm">Chưa có bình luận nào</p>
          {currentUser && (
            <p className="text-xs mt-2">Hãy là người đầu tiên bình luận!</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && pagination.page < pagination.pages && (
        <button
          onClick={() => loadComments(pagination.page + 1)}
          className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ChevronDown size={16} />
          Xem thêm bình luận
        </button>
      )}
    </div>
  )
}
