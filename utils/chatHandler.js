module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        // Cho user join vào room riêng (dùng cho notification)
        socket.on('join_own_room', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined own room`);
        });

        // Tham gia vào phòng chat cụ thể
        socket.on('join-room', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.id} đã tham gia phòng: ${conversationId}`);
        });

        // Gửi tin nhắn
        socket.on('send-message', (data) => {
            const { conversationId, senderId, text, type } = data;

            // Phát lại tin nhắn cho tất cả mọi người trong phòng (bao gồm cả người gửi)
            io.to(conversationId).emit('receive-message', {
                conversation: conversationId,
                from: senderId,
                messageContent: { type, text },
                createdAt: new Date()
            });
        });

        // Khi người dùng ngắt kết nối
        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
};
