const express = require("express");
const app = express();
require("socket.io");
const http = require("http");
const router = require("./router");
const { addUser, removeUser, getUser, users } = require("./users.js");
require("util");
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const capitalizedName = (name) => name.charAt(0).toUpperCase() + name.slice(1)


io.on("connection", (socket) => {
  socket.on("join", ({ name }, callback) => {
    const { error, user } = addUser({ id: socket.id, name });

    if (error) return callback(error);

    socket.emit("adminMessage", {
      author: "Kent",
      text: `${capitalizedName(user.name)}, welcome to Shoutouts. Get ready to have some fun.`,
      type: "message"
    });

    socket.broadcast.emit("adminMessage", {
        author: "Admin",
        text: `${capitalizedName(user.name)} has joined!`,
        type: "message"
    });

    // io.emit('roomData', users);

    // if everyone joins at more-or-less the same time, then sending to individuals rather than broadcasting should be fine
    setInterval(() => {
      socket.emit('adminMessage', {
        author: "Kent",
        text: "Hey, team! Check out our new branching strategy.",
        type: "message"
      });
      // TODO: increase time of interval
    }, 100000);

    callback();
  });

  // problem: doesn't know when to start interval so executes multiple instances at once
  // const sendBranchingStrategyMessage = () => {
  //   setInterval(() => {
  //     socket.broadcast.emit('adminMessage', {
  //       author: "Kent",
  //       text: "Hey, team! Check out our new branching strategy.",
  //       type: "message"
  //     });
  //   }, 10000);
  // }
  // sendBranchingStrategyMessage();

  socket.on("sendShoutout", (shoutout, callback) => {
    const user = getUser(socket.id);

    io.emit("shoutout", { user: user.name, type: "shoutout", ...shoutout });
    // what is rommData??
    io.emit('roomData', users);

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.emit("adminMessage", {
        author: "Admin",
        text: `${capitalizedName(user.name)} has left.`,
        type: "message"
      });
    }
  });
});

app.use(router);

server.listen(PORT, () =>
  console.log(`*** Server has started on port ${PORT} ***`)
);
