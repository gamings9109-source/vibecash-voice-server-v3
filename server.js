const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const rooms = {};

io.on("connection", (socket) => {

    console.log("User Connected : " + socket.id);

    socket.on("join-room", (roomId, userId) => {

        socket.join(roomId);

        socket.roomId = roomId;
        socket.userId = userId;

        if (!rooms[roomId]) {
            rooms[roomId] = {};
        }

        rooms[roomId][socket.id] = userId;

        socket.to(roomId).emit("user-joined", userId);

        io.to(roomId).emit("user-list", Object.values(rooms[roomId]));

        console.log(userId + " Joined " + roomId);
    });

    socket.on("disconnect", () => {

        if (socket.roomId && rooms[socket.roomId]) {

            delete rooms[socket.roomId][socket.id];

            io.to(socket.roomId).emit(
                "user-left",
                socket.userId
            );

            io.to(socket.roomId).emit(
                "user-list",
                Object.values(rooms[socket.roomId])
            );

            if (
                Object.keys(rooms[socket.roomId]).length === 0
            ) {
                delete rooms[socket.roomId];
            }
        }

        console.log("Disconnected");
    });

});

server.listen(3000, () => {
    console.log("Voice Server Started");
});
