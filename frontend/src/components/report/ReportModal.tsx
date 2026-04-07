import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { reportService } from '../../services/reportService'
import { useUIStore } from '../../store/useUIStore'
import { AlertCircle, Check } from 'lucide-react'

interface ReportModalProps {
  open: boolean
  onClose: () => void
  targetType: 'post' | 'comment' | 'user'
  targetId: string
}

const REPORT_REASONS = {
  post: [
    'Spam hoặc nội dung rác',
    'Quấy rối hoặc bắt nạt',
    'Ngôn từ gây thù ghét',
    'Nội dung nhạy cảm, khiêu dâm',
    'Bạo lực hoặc gây hại',
    'Thông tin sai sự thật',
    'Vi phạm bản quyền',
    'Khác',
  ],
  comment: [
    'Spam hoặc nội dung rác',
    'Quấy rối hoặc bắt nạt',
    'Ngôn từ gây thù ghét',
    'Nội dung nhạy cảm, khiêu dâm',
    'Bạo lực hoặc gây hại',
    'Thông tin sai sự thật',
    'Khác',
  ],
  user: [
    'Tài khoản giả mạo',
    'Mạo danh người khác',
    'Đăng nội dung không phù hợp',
    'Quấy rối người khác',
    'Tên người dùng không hợp lệ',
    'Khác',
  ],
}

export default function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addToast } = useUIStore()

  const handleSubmit = async () => {
    const finalReason = selectedReason === 'Khác' ? otherReason : selectedReason
    
    if (!finalReason.trim()) {
      addToast('Vui lòng chọn hoặc nhập lý do báo cáo.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      await reportService.createReport({ 
        targetType, 
        targetId, 
        reason: finalReason 
      })
      addToast(
        'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét nội dung này.',
        'success',
      )
      onClose()
      // Reset state
      setSelectedReason('')
      setOtherReason('')
    } catch (err: any) {
      addToast(
        err.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo.',
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const targetName =
    targetType === 'post'
      ? 'bài viết'
      : targetType === 'comment'
        ? 'bình luận'
        : 'người dùng'

  const reasons = REPORT_REASONS[targetType]

  return (
    <Modal open={open} onClose={onClose} title="Báo cáo nội dung" size="md">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Tại sao bạn lại báo cáo {targetName} này? Báo cáo của bạn là ẩn danh.
          </p>
          
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedReason(r)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-left cursor-pointer
                  ${selectedReason === r 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 ring-1 ring-blue-200' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-transparent'}
                  border
                `}
              >
                {r}
                {selectedReason === r && <Check size={16} className="text-blue-500" />}
              </button>
            ))}
          </div>
        </div>

        {selectedReason === 'Khác' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <textarea
              className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all text-sm"
              placeholder="Vui lòng mô tả chi tiết lý do..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl">
          <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-blue-700 leading-tight">
            Nếu chúng tôi phát hiện hành vi vi phạm tiêu chuẩn cộng đồng, nội dung sẽ bị gỡ bỏ và tài khoản liên quan có thể bị xử lý.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!selectedReason || (selectedReason === 'Khác' && !otherReason.trim())}
          >
            Gửi báo cáo
          </Button>
        </div>
      </div>
    </Modal>
  )
}
