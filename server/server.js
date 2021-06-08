const { instrument } = require("@socket.io/admin-ui");
const io = require("socket.io")(3000, {
  cors: {
    origin: [
      // origenes permitidos
      "http://localhost:8080",
      "https://admin.socket.io",
    ],
  },
});

io.on("connection", (socket) => {
  // cliente connectado
  console.log(socket.id);

  socket.on("client-message-to-room", (str, room) => {
    console.log(str, room);
    /* Send to all sockets */
    // io.emit("on-server-message", str);
    /* Send to all sockets except myself*/
    // socket.broadcast.emit("on-server-message", str);
    /* Send to a socket id (all in the room except to myself) */
    socket.to(room).emit("server-message", str, socket.id);
  });

  socket.on("client-message-to-all", (str, room) => {
    socket.broadcast.emit("server-message", str, socket.id);
  });

  socket.on("client-join-room-request", (room, cb) => {
    socket.join(room);
    if (cb) {
      cb();
    }
  });

  socket.on("client-leave-room-request", (room, cb) => {
    socket.leave(room);
    if (cb) {
      cb();
    }
  });

  socket.on("client-typing", (room, str) => {
    socket.to(room).emit("client-typing", str);
  });
});

/*
En socket.io cada cliente que se conecta al servidor
tiene un socket_id que representa una sala donde estamos solos

Para mandar un mensaje a un usuario en particular debo conocer su socket id

Para enviar un mensaje a un grupo de usuarios todos deben escuchar en el mismo socket id
*/

// herramienta de metricas (Sin autenticación)
instrument(io, { auth: false });
