// Slot.jsx

const Slot = ({ ch, onClick }) => {
  // Base class for the "hole" in the board
  // CHANGED: from w-10 h-10 to w-14 h-14
  const slotBaseClass = "w-14 h-14 flex justify-center items-center rounded-full bg-white border-2 border-blue-900 cursor-pointer";

  // Dynamic class for the piece inside the hole
  let pieceClass = "w-[85%] h-[85%] rounded-full shadow-inner";

  if (ch === 'X') {
    pieceClass += " bg-blue-500";
  } else if (ch === 'O') {
    pieceClass += " bg-green-500";
  }

  return (
    <div
      className={slotBaseClass}
      onClick={onClick}
    >
      {/* Render the piece only if ch is 'X' or 'O' */}
      {ch && <div className={pieceClass} />}
    </div>
  )
}

export default Slot;