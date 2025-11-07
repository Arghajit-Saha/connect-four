import React from "react";

const Card = ({
                title,
                pieceColor,
                isCurrentPlayer,
                isWinner,
                turnText = "Your Turn...",
                winnerText = "WINNER!",
              }) => {
  let borderClasses = "border-transparent";
  if (isWinner) {
    borderClasses = "border-yellow-400 border-4";
  } else if (isCurrentPlayer) {
    borderClasses = "border-white lg:scale-105";
  }

  return (
    <div
      className={`
        bg-white/10 p-4 sm:p-8 rounded-lg shadow-lg
        border-2 flex flex-col justify-between
        min-h-[9rem] sm:min-h-[11rem] w-1/2
        transition-all duration-300
        ${borderClasses}
      `}
    >
      <div className="flex justify-between items-start">
        <span className="text-lg sm:text-2xl font-play text-white w-2/3">{title}</span>
        <div className="w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center rounded-full bg-white border-2 border-blue-900 shadow-sm flex-shrink-0">
          <div className={`w-[85%] h-[85%] rounded-full ${pieceColor}`} />
        </div>
      </div>

      <div className="h-8 sm:h-9">
        {isCurrentPlayer && !isWinner && (
          <div className="text-base sm:text-lg font-play text-green-300 sm:mt-2 animate-pulse">
            {turnText}
          </div>
        )}
        {isWinner && (
          <div className="text-lg sm:text-2xl font-play font-bold text-yellow-300 mt-2">
            {winnerText}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;