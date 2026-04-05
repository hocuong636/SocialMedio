import { useState } from 'react'
import { Send, X } from 'lucide-react'
import { commentService } from '../../services/commentService'
import type { Comment, User } from '../../types'
import Avatar from '../ui/Avatar'

interface CommentComposerProps {
  postId: string
  currentUser?: User
  parentCommentId?: string
  parentCommentAuthor?: string
  onCommentCreated?: (comment: Comment) => void
  onCancel?: () => void
  isReply?: boolean
}

export default function CommentComposer({
  postId,
  currentUser,
  parentCommentId,
  parentCommentAuthor,
  onCommentCreated,
  onCancel,
  isReply = false,
}: CommentComposerProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const characterCount = content.length
  const maxCharacters = 500
  const isValid = characterCount > 0 && characterCount <= maxCharacters

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) return

    try {
      setLoading(true)
      setError('')

      const response = await commentService.createComment(
        postId,
        content,
        parentCommentId,
      )

      if (response.success) {
        onCommentCreated?.(response.data)
        setContent('')
      } else {
        setError(response.message || 'Có lỗi khi tạo bình luận')
      }
    } catch (err) {
      console.error('Error creating comment:', err)
      setError('Có lỗi khi tạo bình luận')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        {currentUser && (
          <Avatar
            src={currentUser.avatarUrl}
            name={currentUser.fullName || currentUser.username}
            size="sm"
          />
        )}

        {/* Input area */}
        <div className="flex-1">
          {/* Reply to info */}
          {isReply && parentCommentAuthor && (
            <p className="text-xs text-gray-500 mb-1">
              Trả lời <span className="font-semibold">{parentCommentAuthor}</span>
            </p>
          )}

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isReply ? 'Viết trả lời...' : 'Viết bình luận của bạn...'
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm disabled:bg-gray-50"
            rows={isReply ? 2 : 3}
          />

          {/* Character count */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-400">
              {characterCount}/{maxCharacters}
            </div>

            {/* Error message */}
            {error && <div className="text-xs text-red-500">{error}</div>}
          </div>

          {/* Character bar */}
          {characterCount > 0 && (
            <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  characterCount > maxCharacters
                    ? 'bg-red-500'
                    : characterCount > maxCharacters * 0.8
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(
                    (characterCount / maxCharacters) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={!isValid || loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send size={15} />
              {isReply ? 'Trả lời' : 'Bình luận'}
            </button>

            {isReply && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={15} />
                Hủy
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
