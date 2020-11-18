const express = require("express");
const app = express();
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const { addUser, removeUser, getUser, users } = require("./users.js");
const { isError } = require("util");
const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN || "http://localhost:3000"

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name }, callback) => {
    const { error, user } = addUser({ id: socket.id, name });
  
    if (error) return callback(error);

    socket.emit("message", {
      user: "Kent",
      text: `${user.name}, welcome to Shoutouts. Get ready to have some fun.`,
    });

    socket.broadcast
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.emit('roomData', users);

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.emit("message", { user: user.name, text: message });
    // what is rommData??
    io.emit('roomData', users);

    callback();
  });


  // socket.on("disconnect", () => {
  //   const user = removeUser(socket.id);

  //   if (user) {
  //     io.to(user.room).emit("message", {
  //       user: "Admin",
  //       text: `${user.name} has left.`,
  //     });
  //     io.to(user.room).emit("roomData", {
  //       room: user.room,
  //       users: getUsersInRoom(user.room),
  //     });
  //   }
  // });
});

app.use(router);

server.listen(PORT, () =>
  console.log(`*** Server has started on port ${PORT} ***`)
);
