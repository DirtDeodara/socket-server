const express = require("express");
const app = express();
require("socket.io");
const http = require("http");
const router = require("./router");
const { addUser, removeUser, getUser, users } = require("./users.js");
require("util");
const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN || "http://localhost:3000";

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

    socket.emit("chatMessage", {
      author: "Kent",
      text: `${user.name}, welcome to Shoutouts. Get ready to have some fun.`,
      variant: "chat",
    });

    socket.broadcast.emit("chatMessage", {
      author: "Admin",
      text: `${user.name} has joined!`,
      variant: "chat",
    });

    const teamsMessages = [
      "Hello, folks! Id like to introduce you to our newest team, Team Cerberus.",
      "Wow! We're really growing now! Welcome Team Minotaur!",
      "Driveway is really taking off! Welcome Team Sphinx!",
      "Our competitors can't slow our roll. We've added another team, Team Chimera.",
      "Here we go. Welcome Team Hydra, our newest Driveway Team.",
      "Geez, still growing. Alrighty then, welcome Team Cyclopes.",
      "Alright, who's gonna update the Org Chart this time?... Welcome Team Gorgon.",
    ];
    
    let i = 0;
    const myLoop = () => {
      setTimeout(function () {
          socket.emit("chatMessage", {
            author: "Kent",
            text: teamsMessages[i],
            variant: "chat",
          });
        i++;
        if (i < teamsMessages.length) {
          myLoop();
        }
      }, 600000); // 10 minutes
    }
    myLoop();

    callback();
  });

  socket.on("sendShoutout", (shoutout, callback) => {
    const user = getUser(socket.id);

    io.emit("shoutout", {
      user: user.name,
      variant: "shoutout",
      ...shoutout,
    });

    callback();
  });

  socket.on("sendReply", (comment, callback) => {
    const user = getUser(socket.id);

    io.emit("comment", {
      user: user.name,
      variant: "comment",
      ...comment,
    });

    callback();
  });

  socket.on("incrementEmojiCount", (emoji, callback) => {
    const user = getUser(socket.id);

    io.emit("emoji", {
      user: user.name,
      variant: "emoji",
      ...emoji,
    });

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
        variant: "chat",
      });
    }
  });
});

app.use(router);

server.listen(PORT, () =>
  console.log(`*** Server has started on port ${PORT} ***`)
);
