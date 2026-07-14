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

app.get("/", (req, res) => {
  res.send("VibeCash Voice Server Running");
});

io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

  // ======================
  // JOIN ROOM
  // ======================
  socket.on("join", (data) => {

    socket.join(data.roomId);

    socket.roomId = data.roomId;
    socket.userId = data.userId;

    if (!rooms[data.roomId]) {
      rooms[data.roomId] = {};
    }

    rooms[data.roomId][socket.id] = data.userId;

    console.log(
      "User Joined:",
      data.userId,
      "Room:",
      data.roomId
    );

    socket.emit("joined", {
      roomId: data.roomId
    });

    socket.to(data.roomId).emit(
      "user_joined",
      {
        userId: data.userId
      }
    );
  });

  // ======================
  // CHAT
  // ======================
  socket.on("chat", (data) => {

    socket.to(socket.roomId).emit(
      "chat",
      {
        userId: socket.userId,
        message: data.message
      }
    );

  });

  // ======================
  // OFFER
  // ======================
  socket.on("offer", (data) => {

    socket.to(data.roomId).emit(
      "offer",
      {
        sdp: data.sdp,
        userId: data.userId
      }
    );

  });

  // ======================
  // ANSWER
  // ======================
  socket.on("answer", (data) => {

    socket.to(data.roomId).emit(
      "answer",
      {
        sdp: data.sdp,
        userId: data.userId
      }
    );

  });

  // ======================
  // ICE CANDIDATE
  // ======================
  socket.on("ice-candidate", (data) => {

    socket.to(data.roomId).emit(
      "ice-candidate",
      {
        candidate: data.candidate,
        sdpMid: data.sdpMid,
        sdpMLineIndex: data.sdpMLineIndex,
        userId: data.userId
      }
    );

  });

  // ======================
  // VOICE
  // ======================
  socket.on(
    "voice",
    (
      roomId,
      userId,
      audio
    ) => {

      socket.to(roomId).emit(
        "voice",
        roomId,
        userId,
        audio
      );

    }
  );

  // ======================
  // DISCONNECT
  // ======================
  socket.on("disconnect", () => {

    console.log(
      "Disconnected:",
      socket.id
    );

    if (
      socket.roomId &&
      rooms[socket.roomId]
    ) {

      delete rooms[socket.roomId][socket.id];

      socket.to(
        socket.roomId
      ).emit(
        "user_left",
        {
          userId: socket.userId
        }
      );

      if (
        Object.keys(
          rooms[socket.roomId]
        ).length === 0
      ) {
        delete rooms[socket.roomId];
      }
    }

  });

});

const PORT =
  process.env.PORT || 3000;

server.listen(
  PORT,
  () => {

    console.log(
      "VibeCash Voice Server Started On Port " +
      PORT
    );

  }
);
