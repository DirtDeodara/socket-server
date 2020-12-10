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

io.on("connection", (socket) => {
  socket.on("join", ({ name }, callback) => {
    const { error, user } = addUser({ id: socket.id, name });

    if (error) return callback(error);

    socket.emit("chatMessage", {
      author: "Kent",
      text: `${user.name}, welcome to Shoutouts. Get ready to have some fun.`,
      variant: "chat"
    });

    socket.broadcast.emit("chatMessage", {
      author: "Admin",
      text: `${user.name} has joined!`,
      variant: "chat"
    });

    // if everyone joins at more-or-less the same time, then sending to individuals rather than broadcasting should be fine
    setInterval(() => {
      socket.emit('chatMessage', {
        author: "Kent",
        text: "Hey, team! Check out our new branching strategy.",
        variant: "chat"
      });
      // TODO: increase time of interval
    }, 100000);

    callback();
  });

  socket.on("sendShoutout", (shoutout, callback) => {
    const user = getUser(socket.id);

    io.emit("shoutout", {
      user: user.name,
      variant: "shoutout",
      ...shoutout
    });
    
    callback();
  });

  socket.on("sendReply", (comment, callback) => {
    const user = getUser(socket.id);

    io.emit("comment", {
      user: user.name,
      variant: "comment",
      ...comment
    })

    callback();
  });

  socket.on("incrementEmojiCount", (emoji, callback) => {
    const user = getUser(socket.id);

    io.emit("emoji", {
      user: user.name,
      variant: "emoji",
      ...emoji
    })

    if (callback) {
      callback();
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.emit("chatMessage", {
        author: "Admin",
        text: `${user.name} has left.`,
        variant: "chat"
      });
    }
  });
});

app.use(router);

server.listen(PORT, () =>
  console.log(`*** Server has started on port ${PORT} ***`)
);
