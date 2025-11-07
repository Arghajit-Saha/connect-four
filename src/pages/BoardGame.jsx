import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext.jsx';
import Slot from '../components/Slot';
import Card from '../components/Card';

function BoardGame() {
  const { roomId } = useParams();
  const socket = useContext(SocketContext);

  const [boardData, setBoardData] = useState([]);
  const [winner, setWinner] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [isDraw, setIsDraw] = useState(false);
  const [playerPiece, setPlayerPiece] = useState(null);
  const [opponentLeft, setOpponentLeft] = useState(false);

  useEffect(() => {
    if (socket && roomId) {
      console.log(`Client ready, reporting for room: ${roomId}`);
      socket.emit('client_ready', roomId);
    } else {
      console.log("Waiting for socket or roomId...");
    }

    socket.on('player_assigned', (piece) => {
      setPlayerPiece((prevPiece) => {
        if (prevPiece !== piece) {
          console.log(`I have been assigned: ${piece}`);
          return piece;
        }
        return prevPiece;
      });
    });

    socket.on('game_update', (serverGameState) => {
      console.log("Client received 'game_update' from server.");
      setBoardData(serverGameState.board);
      setCurrentPlayer(serverGameState.currentPlayer);
      setWinner(serverGameState.winner);
      setIsDraw(serverGameState.isDraw);
      setOpponentLeft(false);
    });

    socket.on('join_error', (message) => {
      console.error(message);
      alert(message);
    });

    socket.on('opponent_left', (message) => {
      console.log(message);
      setOpponentLeft(true);
    });

    return () => {
      socket.off('player_assigned');
      socket.off('game_update');
      socket.off('join_error');
      socket.off('opponent_left');
    };
  }, [socket, roomId]);

  const handleSlotClick = (colIndex) => {
    if (winner || isDraw || opponentLeft) {
      console.log('Click ignored: Game is over.');
      return;
    }
    if (playerPiece !== currentPlayer) {
      console.log(`Click ignored: Not your turn. (Your piece: ${playerPiece}, Current turn: ${currentPlayer})`);
      return;
    }
    if (playerPiece === 'spectator') {
      console.log('Click ignored: You are a spectator.');
      return;
    }

    socket.emit('make_move', { colIndex, roomId });
  };

  const handleResetGame = () => {
    console.log(`Emitting 'reset_game' for room ${roomId}`);
    socket.emit('reset_game', roomId);
  };

  let statusMessage;
  if (opponentLeft) {
    statusMessage = 'Opponent Disconnected.';
  } else if (winner) {
    statusMessage = `Winner: ${winner === 'X' ? 'Blue' : 'Green'}!`;
  } else if (isDraw) {
    statusMessage = "It's a Draw!";
  } else {
    statusMessage = `${currentPlayer === 'X' ? 'Blue' : 'Green'}'s Turn`;
  }

  const getStatusStyles = () => {
    if (opponentLeft) return 'text-gray-600 font-bold';
    if (winner === 'X') return 'text-blue-600 font-bold';
    if (winner === 'O') return 'text-green-600 font-bold';
    if (isDraw) return 'text-gray-600 font-bold';
    return currentPlayer === 'X' ? 'text-blue-600' : 'text-green-600';
  };

  let playerIndicator;
  if (playerPiece) {
    let pieceName = 'Spectator';
    if (playerPiece === 'X') pieceName = 'Blue (X)';
    if (playerPiece === 'O') pieceName = 'Green (O)';
    playerIndicator = `You are: ${pieceName}`;
  } else {
    playerIndicator = "Connecting...";
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen font-sans">
      <div className="w-full lg:w-1/2 lg:h-screen bg-orange-800 p-6 sm:p-10 flex flex-col justify-start shadow-lg lg:rounded-r-4xl">
        <h1 className="text-4xl sm:text-5xl font-bold font-play text-white/95 mb-8 sm:mb-16">
          Connect Four
        </h1>
        <h2 className="text-xl sm:text-2xl font-play text-white/80 mb-4 sm:mb-6">
          Room Code: <span className="text-yellow-300">{roomId}</span>
        </h2>
        <h2 className="text-xl sm:text-2xl font-play text-white/80 mb-6 sm:mb-10">
          {playerIndicator}
        </h2>

        <div className="flex flex-row gap-4 sm:gap-6">
          <Card
            title="Blue (X)"
            pieceColor="bg-blue-500"
            isCurrentPlayer={currentPlayer === 'X' && !winner && !opponentLeft}
            isWinner={winner === 'X'}
            turnText="Blue's Turn..."
          />
          <Card
            title="Green (O)"
            pieceColor="bg-green-500"
            isCurrentPlayer={currentPlayer === 'O' && !winner && !opponentLeft}
            isWinner={winner === 'O'}
            turnText="Green's Turn..."
            T          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 bg-gray-100 flex-1 lg:flex-auto">
        <h2 className={`text-3xl sm:text-4xl font-bold font-play mb-4 sm:mb-6 ${getStatusStyles()}`}>
          {statusMessage}
        </h2>

        <div
          className="grid grid-cols-7 grid-rows-6 gap-0 bg-blue-700 p-2 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md"
          style={{
            aspectRatio: '7 / 6',
          }}
        >
          {boardData.length > 0 ? (
            boardData.map((row, i) => {
              return row.map((ch, j) => {
                return (
                  <Slot
                    key={`${i}-${j}`}
                    ch={ch}
                    onClick={() => handleSlotClick(j)}
                  />
                );
              });
            })
          ) : (
            <div className="text-white col-span-7 row-span-6 flex items-center justify-center font-play text-lg">
              Waiting for opponent...
            </div>
          )}
        </div>

        {(winner || isDraw || opponentLeft) && (
          <button
            className="mt-6 sm:mt-8 px-6 py-3 bg-white text-orange-800 font-bold font-play text-lg rounded-lg shadow-md
                       hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2
                       focus:ring-orange-500 focus:ring-offset-2"
            onClick={handleResetGame}
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}

export default BoardGame;