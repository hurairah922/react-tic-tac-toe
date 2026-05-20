import {useRef, useState} from 'react'

function Square ({ value, onSquareClick, className}) {

  return (
    <>
      <button className={`square ${className}`} onClick={onSquareClick}>
        {value}
      </button>
    </>
  )
}

function Board({xIsNext, squares, onPlay}) {

  const winnerCalculation = calculateWinner(squares);
  const winner = winnerCalculation ? winnerCalculation.winner : null;
  const winningLine = winnerCalculation ? winnerCalculation.line : [];

  function handleClick(i) {

    if (squares[i] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'x' : 'o';
    onPlay(nextSquares);
  }

  let status = winner ? `Winner is ${winner}` : `Next is ${xIsNext ? 'x' : 'o'}`;

  const gameSquares = [];

  for (let i = 0; i < 3; i++) {
    const rowSquares = [];
    for (let j = i*3; j < i*3 + 3; j++) {
      const winningClass =  winningLine.includes(j) ? 'winning-square' : '';
      rowSquares.push(
        <Square 
          key={j}
          value={squares[j]} 
          onSquareClick={() => handleClick(j)} 
          className={winningClass}
        />
      );
    }
    gameSquares.push(
      <div 
        key={i}
        className="board-row"
      >
        {rowSquares}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {gameSquares}
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 4, 6],
    [2, 5, 8],
    [3, 4, 5],
    [6, 7, 8]
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { 
        winner: squares[a], 
        line: [a, b, c]
      };
    }
  }

  return { winner: null, line: []};
}


export default function Game() {

  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [sortMoves, setSortMoves] = useState(false);

  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }


  const winningCalculation = calculateWinner(currentSquares);
  const winner = winningCalculation ? winningCalculation.winner : null;
  const winningLine = winningCalculation ? winningCalculation.line : [];
  const draw = !winner && history.length === 10;

  const moves = history.map( (squares, move) => {
    const isLast = move === history.length - 1;
    let description = move > 0 ? (isLast ? (winner ? `Winner is ${winner}` : draw ? `Game ended in a draw` : `Your Move #${move}`) : `Goto move #${move}`) : `Start the game!`;
    return (
      <li key={move}>
        {isLast ? (
          <span>{description}</span>
          ) : (
            <button onClick={() => jumpTo(move)}>{description}</button>
          )
        }
        {/* <button onClick={() => jumpTo(move)}>{description}</button> */}
      </li>
    )
  })

  const sortedMoves = sortMoves ? moves : [...moves].reverse();

  function clearGameBoard() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  return (
    <>
      <div className="game">
        <div className="game-board">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
        </div>
        
        <div className="game-info">
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              className="toggle-switch-checkbox" 
              id="sort-moves" 
              name="sort-moves"
              value={sortMoves}
              onChange={(e) => setSortMoves(e.target.checked)}
            />
            <label htmlFor="sort-moves">
              <span className="toggle-switch-inner"></span>
              <span className="toggle-switch-switch"></span>
            </label>
            
          </div>
          <ol>{sortedMoves}</ol>
        </div>

        <div className="game-info">
          <div className="clear-board">
            {history.length > 1 && <button onClick={clearGameBoard}>Clear Board</button>}
          </div>
        </div>
      </div>
    </>
  )
};