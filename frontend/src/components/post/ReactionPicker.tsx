import { useState } from 'react'
import { reactionService } from '../../services/reactionService'
import type { Reaction } from '../../types'

interface ReactionPickerProps {
  postId: string
  onReactionChange?: (reaction: Reaction | null) => void
  userReaction?: string | null
  isLoading?: boolean
}

// Reaction icons và colors
const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Thích', color: 'text-blue-500' },
  { type: 'haha', emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  { type: 'love', emoji: '❤️', label: 'Yêu thích', color: 'text-red-500' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
  { type: 'sad', emoji: '😢', label: 'Buồn', color: 'text-blue-400' },
  { type: 'angry', emoji: '😠', label: 'Tức giận', color: 'text-red-600' },
]

export default function ReactionPicker({
  postId,
  onReactionChange,
  userReaction,
  isLoading = false,
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReactionClick = async (
    reactionType: 'like' | 'haha' | 'love' | 'wow' | 'sad' | 'angry',
  ) => {
    try {
      setLoading(true)
      const response = await reactionService.addOrUpdateReaction(
        postId,
        reactionType,
      )

      if (response.success) {
        onReactionChange?.(response.data)
        setShowPicker(false)
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentReaction = REACTIONS.find((r) => r.type === userReaction)

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        disabled={isLoading || loading}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
          userReaction
            ? `${currentReaction?.color} bg-opacity-10`
            : 'text-gray-500 hover:bg-gray-50 hover:text-red-400'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="text-lg">
          {currentReaction?.emoji || '👍'}
        </span>
        {userReaction && (
          <span className="text-xs">
            {REACTIONS.find((r) => r.type === userReaction)?.label}
          </span>
        )}
      </button>

      {/* Reaction picker dropdown */}
      {showPicker && !isLoading && !loading && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-100 rounded-xl shadow-lg p-2 flex gap-1 z-20">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() =>
                handleReactionClick(
                  reaction.type as
                    | 'like'
                    | 'haha'
                    | 'love'
                    | 'wow'
                    | 'sad'
                    | 'angry',
                )
              }
              title={reaction.label}
              className={`text-2xl p-2 rounded-lg transition-all hover:scale-125 hover:bg-gray-100 ${
                userReaction === reaction.type ? 'scale-125 bg-gray-100' : ''
              }`}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Clicking outside to close */}
      {showPicker && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
