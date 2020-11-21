const express = require("express");
const app = express();
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const { addUser, removeUser, getUser, users } = require("./users.js");
const { isError } = require("util");
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name }, callback) => {
    const { error, user } = addUser({ id: socket.id, name });
  
    if (error) return callback(error);

    // socket.emit("message", {
    //   user: "Kent",
    //   text: `${user.name}, welcome to Shoutouts. Get ready to have some fun.`,
    // });

    const capitalizedName = user.name.charAt(0).toUpperCase() + user.name.slice(1)

    socket.emit("welcomeMessage", {
      sender: "Kent",
      text: `${capitalizedName}, welcome to Shoutouts. Get ready to have some fun.`,
    });

    socket.broadcast
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.emit('roomData', users);

    callback();
  });

  socket.on("sendShoutout", (shoutout, callback) => {
    const user = getUser(socket.id);

    io.emit("shoutout", { user: user.name, ...shoutout });
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
