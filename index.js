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
    const capitalizedUserName = capitalizedName(user.name);

    if (error) return callback(error);

    socket.emit("chatMessage", {
      author: "Kent",
      text: `${capitalizedUserName}, welcome to Shoutouts. Get ready to have some fun.`,
      variant: "chat"
    });

    socket.broadcast.emit("chatMessage", {
      author: "Admin",
      text: `${capitalizedUserName} has joined!`,
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
    const capitalizedUserName = capitalizedName(user.name);

    io.emit("shoutout", {
      user: capitalizedUserName,
      variant: "shoutout",
      ...shoutout
    });
    
    callback();
  });

  socket.on("sendReply", (comment, callback) => {
    const user = getUser(socket.id);
    const capitalizedUserName = capitalizedName(user.name);

    io.emit("comment", {
      user: capitalizedUserName,
      variant: "comment",
      ...comment
    })

    callback();
  });

  socket.on("incrementEmojiCount", (emoji, callback) => {
    const user = getUser(socket.id);
    const capitalizedUserName = capitalizedName(user.name);

    io.emit("emoji", {
      user: capitalizedUserName,
      variant: "emoji",
      ...emoji
    })

    if (callback) {
      callback();
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    const capitalizedUserName = capitalizedName(user.name);

    if (user) {
      io.emit("chatMessage", {
        author: "Admin",
        text: `${capitalizedUserName} has left.`,
        variant: "chat"
      });
    }
  });
});

app.use(router);

server.listen(PORT, () =>
  console.log(`*** Server has started on port ${PORT} ***`)
);
