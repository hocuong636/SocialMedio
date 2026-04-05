module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('Một người dùng đã kết nối:', socket.id);

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
            console.log('Người dùng đã ngắt kết nối:', socket.id);
        });
    });
};
