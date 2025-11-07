import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SocketContext } from '../context/SocketContext.jsx';
import BackgroundVideo from '../assets/video/background.mp4';

function Landing() {
  const [roomCode, setRoomCode] = useState('');
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRoomCreated = (roomId) => {
      console.log('Room created:', roomId);
      navigate(`/${roomId}`);
    };

    const handleRoomJoined = (roomId) => {
      console.log('Room joined:', roomId);
      navigate(`/${roomId}`);
    };

    const handleJoinError = (message) => {
      alert(message);
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('join_error', handleJoinError);

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_joined', handleRoomJoined);
      socket.off('join_error', handleJoinError);
    };
  }, [socket, navigate]);

  function handleCreateParty() {
    socket.emit('create_room');
  }

  function handleJoinLobby(e) {
    e.preventDefault();
    if (roomCode.trim()) {
      socket.emit('join_room', roomCode);
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1]">
        <video
          src={BackgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover min-w-[100%] min-h-[100%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        ></video>
      </div>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-black/70 via-black/50 to-black/70 z-[-1]"></div>

      <div className="flex flex-col justify-center items-center h-screen relative z-10 text-white p-4">

        <div className="bg-black/60 rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-md border border-white/10">

          <h1 className="text-3xl sm:text-4xl font-bold font-play text-center text-white mb-10 tracking-tight">
            Connect <span className="font-light">Four</span>
          </h1>

          <div className="flex flex-col gap-8">

            <button
              className="w-full bg-amber-700 hover:bg-amber-800
                         text-white font-bold font-play text-base py-3.5 px-4 rounded-lg shadow-lg focus:outline-none
                         focus:ring-4 focus:ring-blue-500/50 active:translate-y-0 active:scale-95"
              onClick={handleCreateParty}
            >
              CREATE A PARTY
            </button>

            <div className="flex items-center w-full">
              <hr className="flex-grow border-white/20" />
              <span className="px-4 text-gray-400 font-sans text-xs font-medium">OR</span>
              <hr className="flex-grow border-white/20" />
            </div>

            <form
              className="flex flex-col gap-4"
              onSubmit={handleJoinLobby}
            >
              <h2 className="text-xl font-play text-center text-white/90 mb-2">
                Join a Game
              </h2>
              <input
                className="w-full h-12 text-center align-text-bottom border border-white/20 bg-white/10 text-white text-lg rounded-lg placeholder:text-gray-400 placeholder:font-sans placeholder:tracking-normal font-mono"
                placeholder="ENTER ROOM CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button
                type="submit"
                className="w-full bg-transparent border-2 border-blue-400 text-blue-300 hover:bg-blue-400/20 hover:text-white font-bold font-play py-3 px-4 rounded-lg shadow-md"
              >
                JOIN
              </button>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}

export default Landing;