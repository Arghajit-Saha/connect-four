import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import Landing from './pages/Landing';
import BoardGame from './pages/BoardGame';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/:roomId" element={<BoardGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;