const http = require('http');
const { Server } = require("socket.io");

const createEmptyBoard = () => [
  ['','','','','','',''],
  ['','','','','','',''],
  ['','','','','','',''],
  ['','','','','','',''],
  ['','','','','','',''],
  ['','','','','','','']
];

const checkWin = (board, r, c, player) => {
  let count = 0;

  count = 1;
  for (let j = c - 1; j >= 0; j--) {
    if (board[r][j] === player) count++;
    else break;
  }
  for (let j = c + 1; j < 7; j++) {
    if (board[r][j] === player) count++;
    else break;
  }
  if (count >= 4) return true;

  count = 1;
  for (let i = r + 1; i < 6; i++) {
    if (board[i][c] === player) count++;
    else break;
  }
  if (count >= 4) return true;

  count = 1;
  for (let i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j] === player) count++;
    else break;
  }
  for (let i = r + 1, j = c + 1; i < 6 && j < 7; i++, j++) {
    if (board[i][j] === player) count++;
    else break;
  }
  if (count >= 4) return true;

  count = 1;
  for (let i = r - 1, j = c + 1; i >= 0 && j < 7; i--, j++) {
    if (board[i][j] === player) count++;
    else break;
  }
  for (let i = r + 1, j = c - 1; i < 6 && j >= 0; i++, j--) {
    if (board[i][j] === player) count++;
    else break;
  }
  return count >= 4;
};

const isBoardFull = (board) => {
  for (let j = 0; j < 7; j++) {
    if (board[0][j] === '') {
      return false;
    }
  }
  return true;
};

const requestHandler = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO server is running');
};

const server = http.createServer(requestHandler);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  }
});

const PORT = 3001;

let gameRooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create_room', () => {
    let newRoomId = generateRoomCode();
    while (gameRooms[newRoomId]) {
      newRoomId = generateRoomCode();
    }

    socket.roomId = newRoomId;
    gameRooms[newRoomId] = {
      players: { [socket.id]: 'X' },
      gameState: {
        board: createEmptyBoard(),
        currentPlayer: 'X',
        winner: null,
        isDraw: false,
      }
    };

    socket.join(newRoomId);
    console.log(`User ${socket.id} created and joined room ${newRoomId}`);
    socket.emit('room_created', newRoomId);
    socket.emit('player_assigned', 'X');
  });

  socket.on('join_room', (roomId) => {
    const room = gameRooms[roomId];

    if (!room) {
      return socket.emit('join_error', 'Room not found. :(');
    }

    const numPlayers = Object.keys(room.players).length;

    if (numPlayers >= 2) {
      socket.roomId = roomId;
      room.players[socket.id] = 'spectator';
      socket.join(roomId);
      socket.emit('room_joined', roomId);
      socket.emit('player_assigned', 'spectator');
      socket.emit('game_update', room.gameState);
      return;
    }

    socket.roomId = roomId;
    room.players[socket.id] = 'O';
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    socket.emit('room_joined', roomId);
    socket.emit('player_assigned', 'O');

    io.to(roomId).emit('game_update', room.gameState);
  });

  socket.on('client_ready', (roomId) => {
    const room = gameRooms[roomId];
    if (!room) {
      return;
    }

    let playerPiece = room.players[socket.id];

    if (playerPiece) {
      console.log(`Client ${socket.id} is ready. Re-sending player_assigned (${playerPiece}).`);
      socket.emit('player_assigned', playerPiece);
    } else {
      console.log(`Client ${socket.id} is ready, but not in player list. Assigning as spectator.`);
      room.players[socket.id] = 'spectator';
      socket.emit('player_assigned', 'spectator');
    }
  });


  socket.on('make_move', ({ colIndex, roomId }) => {
    const room = gameRooms[roomId];
    if (!room) return;

    let gameState = room.gameState;
    let playerPiece = room.players[socket.id];

    if (gameState.winner || gameState.isDraw) return;
    if (playerPiece !== gameState.currentPlayer) return;

    let rowIndex = -1;
    for (let i = 5; i >= 0; i--) {
      if (gameState.board[i][colIndex] === '') {
        rowIndex = i;
        break;
      }
    }
    if (rowIndex === -1) return;

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[rowIndex][colIndex] = gameState.currentPlayer;
    gameState.board = newBoard;

    if (checkWin(gameState.board, rowIndex, colIndex, gameState.currentPlayer)) {
      gameState.winner = gameState.currentPlayer;
    } else if (isBoardFull(gameState.board)) {
      gameState.isDraw = true;
    } else {
      gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    }

    io.to(roomId).emit('game_update', gameState);
  });

  socket.on('reset_game', (roomId) => {
    const room = gameRooms[roomId];
    if (!room) return;

    console.log(`Resetting game for room ${roomId}`);
    room.gameState = {
      board: createEmptyBoard(),
      currentPlayer: 'X',
      winner: null,
      isDraw: false,
    };

    io.to(roomId).emit('game_update', room.gameState);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const roomId = socket.roomId;

    if (roomId && gameRooms[roomId]) {
      delete gameRooms[roomId].players[socket.id];
      io.to(roomId).emit('opponent_left', 'Your opponent has disconnected.');

      if (Object.keys(gameRooms[roomId].players).length === 0) {
        delete gameRooms[roomId];
        console.log(`Room ${roomId} is empty and has been deleted.`);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on *:${PORT}`);
});