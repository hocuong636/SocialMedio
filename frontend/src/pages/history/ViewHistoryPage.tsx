import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { viewHistoryService } from '../../services/viewHistoryService'
import { useUIStore } from '../../store/useUIStore'
import Modal from '../../components/ui/Modal'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} ngày trước`
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

const PAGE_SIZE = 10

export default function ViewHistoryPage() {
  const [page, setPage] = useState(1)
  const [confirmClear, setConfirmClear] = useState(false)
  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['viewHistory', page],
    queryFn: () => viewHistoryService.getHistory(page, PAGE_SIZE),
  })

  const deleteOneMutation = useMutation({
    mutationFn: (id: string) => viewHistoryService.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewHistory'] })
      addToast('Đã xóa mục lịch sử', 'success')
    },
    onError: () => addToast('Xóa thất bại', 'error'),
  })

  const deleteAllMutation = useMutation({
    mutationFn: () => viewHistoryService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewHistory'] })
      setPage(1)
      addToast('Đã xóa toàn bộ lịch sử', 'success')
      setConfirmClear(false)
    },
    onError: () => addToast('Xóa thất bại', 'error'),
  })

  const histories = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Lịch sử xem</h1>
            <p className="text-sm text-gray-400">
              Các bài viết bạn đã xem gần đây
            </p>
          </div>
          {histories.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Tổng đã xem
            </p>
            <p className="text-2xl font-black text-gray-900">{total}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Trang hiện tại
            </p>
            <p className="text-2xl font-black text-gray-900">
              {page}
              <span className="text-base text-gray-400 font-normal">
                /{totalPages || 1}
              </span>
            </p>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {isLoading && (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center py-12 gap-2 text-gray-400">
              <Clock size={32} className="opacity-40" />
              <p className="text-sm">Không thể tải lịch sử xem</p>
            </div>
          )}

          {!isLoading && !isError && histories.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-3 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Clock size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-gray-700">Chưa có lịch sử</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  Các bài viết bạn đã xem sẽ xuất hiện ở đây.
                </p>
              </div>
            </div>
          )}

          {!isLoading && histories.length > 0 && (
            <ul className="divide-y divide-gray-50">
              {histories.map((item) => (
                <li
                  key={item._id}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors group"
                >
                  <Avatar
                    src={item.post?.author?.avatarUrl}
                    name={
                      item.post?.author?.fullName ||
                      item.post?.author?.username ||
                      '?'
                    }
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.post?.author?.fullName ||
                          item.post?.author?.username}
                      </p>
                      <span className="text-gray-300 text-xs">·</span>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {timeAgo(item.updatedAt ?? item.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.post?.content || (
                        <span className="italic text-gray-400">
                          [Bài viết không có nội dung văn bản]
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteOneMutation.mutate(item._id)}
                    disabled={deleteOneMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all cursor-pointer flex-shrink-0 mt-0.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600 font-semibold px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Confirm clear modal */}
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Xóa toàn bộ lịch sử"
        size="sm"
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <p className="text-sm text-gray-600">
            Toàn bộ lịch sử xem của bạn sẽ bị xóa vĩnh viễn. Hành động này
            không thể hoàn tác.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setConfirmClear(false)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => deleteAllMutation.mutate()}
            disabled={deleteAllMutation.isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {deleteAllMutation.isPending ? 'Đang xóa...' : 'Xóa tất cả'}
          </button>
        </div>
      </Modal>
    </>
  )
}
