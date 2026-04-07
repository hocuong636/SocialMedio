import { useEffect, useState } from 'react'
import { reportService } from '../../services/reportService'
import { useUIStore } from '../../store/useUIStore'
import type { Report } from '../../types'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'

export default function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useUIStore()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const data = await reportService.getReports()
      setReports(data)
    } catch (err) {
      addToast('Không thể tải danh sách báo cáo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'resolved' | 'rejected') => {
    try {
      await reportService.updateReportStatus(id, status)
      addToast(
        status === 'resolved' ? 'Đã xử lý báo cáo' : 'Đã từ chối báo cáo',
        'success',
      )
      // Update local state
      setReports(reports.map((r) => (r._id === id ? { ...r, status } : r)))
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" />
          Quản lý báo cáo
        </h1>
        <Badge color={reports.filter(r => r.status === 'pending').length > 0 ? 'yellow' : 'blue'}>
          {reports.filter(r => r.status === 'pending').length} đang chờ
        </Badge>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <p className="text-gray-500 font-medium">Chưa có báo cáo nào!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className={`bg-white border rounded-2xl p-6 transition-all ${
                report.status === 'pending'
                  ? 'border-blue-100 shadow-sm'
                  : 'border-gray-100 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={report.reporter.avatarUrl}
                    name={report.reporter.fullName}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {report.reporter.fullName}
                    </p>
                    <p className="text-xs text-gray-400">@{report.reporter.username}</p>
                  </div>
                </div>
                <Badge
                  color={
                    report.status === 'pending'
                      ? 'yellow'
                      : report.status === 'resolved'
                        ? 'green'
                        : 'red'
                  }
                >
                  {report.status === 'pending'
                    ? 'Đang chờ'
                    : report.status === 'resolved'
                      ? 'Đã xử lý'
                      : 'Đã từ chối'}
                </Badge>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Lý do báo cáo ({report.targetType})
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {report.reason}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus(report._id, 'rejected')}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <XCircle size={14} />
                      Từ chối
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(report._id, 'resolved')}
                    >
                      <CheckCircle size={14} />
                      Xử lý
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
