import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Search, User, Paperclip, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import axios from 'axios'
import { useAuthStore } from '../../store/useAuthStore'
import { userService } from '../../services/userService'
import Avatar from '../../components/ui/Avatar'

// Cấu hình URL Backend
const SOCKET_URL = 'http://localhost:3000'

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)
    newSocket.on('receive-message', (message: any) => {
      setMessages((prev) => [...prev, message])
    })
    return () => { newSocket.disconnect() }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/v1/conversations')
      setConversations(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // Search users for new conversation
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true)
        try {
          const users = await userService.searchUsers(searchQuery)
          setSearchResults(users)
          setShowSearchResults(true)
        } catch (err) {
          console.error(err)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const startConversation = async (recipientId: string) => {
    try {
      const res = await axios.post('/api/v1/conversations', { recipientId })
      const newConv = res.data
      
      // Update conversations list if not present
      if (!conversations.find(c => c._id === newConv._id)) {
        setConversations(prev => [newConv, ...prev])
      }
      
      selectChat(newConv)
      setSearchQuery('')
      setShowSearchResults(false)
    } catch (err) {
      console.error(err)
    }
  }

  const selectChat = async (conv: any) => {
    setSelectedConversation(conv)
    socket?.emit('join-room', conv._id)
    try {
      const res = await axios.get(`/api/v1/messages/${conv._id}`)
      setMessages(res.data)
    } catch (err) { console.error(err) }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return
    const messageData = {
      conversationId: selectedConversation._id,
      type: 'text',
      text: newMessage,
      senderId: user._id
    }
    socket?.emit('send-message', messageData)
    try {
      await axios.post('/api/v1/messages', messageData)
      setNewMessage('')
    } catch (err) { console.error(err) }
  }

  // Hàm xử lý upload file và gửi tin nhắn
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'file') => {
    const file = e.target.files?.[0]
    if (!file || !selectedConversation || !user) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append(fileType === 'image' ? 'image' : 'document', file)

    try {
      const endpoint = fileType === 'image' ? '/api/v1/upload/image' : '/api/v1/upload/document'
      const res = await axios.post(endpoint, formData)
      const fileUrl = res.data.url

      const messageData = {
        conversationId: selectedConversation._id,
        type: fileType,
        text: fileUrl,
        senderId: user._id
      }

      socket?.emit('send-message', messageData)
      await axios.post('/api/v1/messages', messageData)
    } catch (err) {
      console.error('Lỗi upload:', err)
      alert('Không thể tải file lên. Vui lòng kiểm tra lại.')
    } finally {
      setIsUploading(false)
      e.target.value = '' // Reset input
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="flex h-full">
        
        {/* SIDEBAR */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
          <div className="p-4 bg-white border-b border-gray-100 relative">
            <h1 className="text-xl font-black text-gray-900 mb-4">Tin nhắn</h1>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Search size={15} className="text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm người dùng..." 
                className="flex-1 bg-transparent text-sm focus:outline-none" 
              />
              {isSearching && <Loader2 size={14} className="animate-spin text-blue-500" />}
            </div>

            {/* Search Results Overlay */}
            {showSearchResults && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto m-2">
                {searchResults.length > 0 ? (
                  searchResults.map(u => (
                    <div 
                      key={u._id} 
                      onClick={() => startConversation(u._id)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none"
                    >
                      <Avatar src={u.avatarUrl} name={u.fullName || u.username} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{u.fullName || u.username}</p>
                        <p className="text-[10px] text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">Không tìm thấy kết quả</div>
                )}
              </div>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.map((conv) => {
              const recipient = conv.participants.find((p: any) => p._id !== user?._id)
              return (
                <div key={conv._id} onClick={() => selectChat(conv)} className={`flex items-center gap-3 p-4 hover:bg-white cursor-pointer border-b border-gray-50 ${selectedConversation?._id === conv._id ? 'bg-white shadow-[inset_4px_0_0_0_#3b82f6]' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                    {recipient?.avatarUrl ? <img src={recipient.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{recipient?.fullName || recipient?.username}</p>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage?.messageContent?.text || 'Bắt đầu chat...'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className="flex-1 flex flex-col bg-gray-25/50 relative">
          {isUploading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
               <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 text-sm font-bold">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Đang tải file lên...
               </div>
            </div>
          )}

          {selectedConversation ? (
            <>
              <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-[10px] font-bold">LIVE</div>
                 <p className="font-bold text-sm text-gray-900">{selectedConversation.participants.find((p: any) => p._id !== user?._id)?.fullName || 'Hội thoại'}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
                  const isMe = msg.from === user?._id || (msg.from?._id === user?._id)
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                        {msg.type === 'image' || msg.messageContent?.type === 'image' ? (
                          <img src={msg.text || msg.messageContent?.text} alt="" className="rounded-lg max-h-60 object-contain" />
                        ) : msg.type === 'file' || msg.messageContent?.type === 'file' ? (
                          <a href={msg.text || msg.messageContent?.text} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
                            <FileText size={16} /> Xem tài liệu
                          </a>
                        ) : (
                          msg.text || msg.messageContent?.text
                        )}
                        <p className={`text-[9px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT AREA */}
              <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
                <label className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors">
                  <ImageIcon size={20} className="text-gray-400" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                </label>
                <label className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors">
                  <Paperclip size={20} className="text-gray-400" />
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'file')} />
                </label>
                <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2">
                  <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-transparent text-sm focus:outline-none" placeholder="Viết tin nhắn..." />
                  <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 rounded-xl text-white">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
              <MessageCircle size={40} className="mb-4 opacity-20" />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
