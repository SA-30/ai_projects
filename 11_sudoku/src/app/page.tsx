'use client';

import { useEffect, useState } from 'react';

type SudokuCell = number;
type SudokuGrid = SudokuCell[][];

export default function Home() {
  const [board, setBoard] = useState<SudokuGrid>([]);
  const [solution, setSolution] = useState<SudokuGrid>([]);
  const [userInput, setUserInput] = useState<SudokuGrid>([]);
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [time, setTime] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  // const [isSolving, setIsSolving] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const resetTimer = () => setTime(0);

  const formatTime = (t: number) => {
    const mins = String(Math.floor(t / 60)).padStart(2, '0');
    const secs = String(t % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Fetch new board
  const fetchBoard = async () => {
    const res = await fetch(
      `https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{value,solution,difficulty}}}`
    );
    const data = await res.json();
    const grid = data.newboard.grids[0];
    setBoard(grid.value);
    setSolution(grid.solution);
    setDifficulty(grid.difficulty);
    setUserInput(JSON.parse(JSON.stringify(grid.value)));
    resetTimer();
  };

  const checkAnswer = () => {
    const correct = JSON.stringify(userInput) === JSON.stringify(solution);
    alert(correct ? '✅ Correct!' : '❌ Incorrect');
  };

  useEffect(() => {
    fetchBoard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (row: number, col: number, value: string) => {
    // if (isSolving) return;
    const newInput = [...userInput.map(r => [...r])];
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      newInput[row][col] = num;
    } else {
      newInput[row][col] = 0;
    }
    setUserInput(newInput);
  };

  // Update selection
    const handleCellClick = (row: number, col: number) => {
      if (board[row][col] === 0) {
        setSelectedCell([row, col]);
      } else {
        setSelectedCell(null); // Don't allow selection of prefilled cells
      }
    };

    const handleNumberClick = (num: number) => {
      if (selectedCell) {
        const [row, col] = selectedCell;
        const newInput = [...userInput.map(r => [...r])];
        newInput[row][col] = num;
        setUserInput(newInput);
      }
    };

  // Solve instantly
  const solveBoard = () => {
    if (solution.length) {
      setUserInput([...solution.map(r => [...r])]);
    }
  };

  // Step-by-step visual solver (backtracking with delay)
  // const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // const isValid = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
  //   for (let i = 0; i < 9; i++) {
  //     if (grid[row][i] === num || grid[i][col] === num) return false;
  //     const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
  //     const boxCol = 3 * Math.floor(col / 3) + i % 3;
  //     if (grid[boxRow][boxCol] === num) return false;
  //   }
  //   return true;
  // };

  // const stepSolve = async () => {
  //   setIsSolving(true);
  //   const grid = [...userInput.map(r => [...r])];

  //   const solve = async (): Promise<boolean> => {
  //     for (let row = 0; row < 9; row++) {
  //       for (let col = 0; col < 9; col++) {
  //         if (grid[row][col] === 0) {
  //           for (let num = 1; num <= 9; num++) {
  //             if (isValid(grid, row, col, num)) {
  //               grid[row][col] = num;
  //               setUserInput(grid.map(r => [...r]));
  //               await delay(50); // Speed of visualization

  //               if (await solve()) return true;

  //               grid[row][col] = 0;
  //               setUserInput(grid.map(r => [...r]));
  //               await delay(50);
  //             }
  //           }
  //           return false;
  //         }
  //       }
  //     }
  //     return true;
  //   };

  //   await solve();
  //   setIsSolving(false);
  // };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-200">
      <h2 className="text-6xl font-bold mb-2">Sudoku</h2>
      <div className="mb-2">
        Difficulty: {difficulty}
      </div>
      <div className="text-md font-mono mb-4">⏱ {formatTime(time)}</div>

      {/* Sudoku board */}
      <div className="grid grid-cols-9 gap-0 border-2 border-black">
        {userInput.map((row, i) =>
          row.map((cell, j) => {
            const isPrefilled = board[i][j] !== 0;
            const borderClasses = `
              ${i % 3 === 0 ? 'border-t-2' : 'border-t'}
              ${j % 3 === 0 ? 'border-l-2' : 'border-l'}
              ${i === 8 ? 'border-b-2' : ''}
              ${j === 8 ? 'border-r-2' : ''}
            `;

            return (
              // <input
              //   key={`${i}-${j}`}
              //   className={`w-10 h-10 text-center text-lg ${borderClasses} border-gray-600/40 
              //     ${isPrefilled ? 'bg-gray-200 font-bold' : 'bg-white'} focus:outline-none`}
              //   value={cell === 0 ? '' : cell}
              //   disabled={isPrefilled }
              //   onChange={(e) => handleChange(i, j, e.target.value)}
              //   maxLength={1}
              // />
              <input
                key={`${i}-${j}`}
                className={`w-10 h-10 text-center text-lg ${borderClasses} border-gray-600/40 
                  ${isPrefilled ? 'bg-gray-200 font-bold' : 'bg-white'} 
                  ${selectedCell?.[0] === i && selectedCell?.[1] === j ? '' : ''}
                  `}
                value={cell === 0 ? '' : cell}
                disabled={isPrefilled}
                onClick={() => handleCellClick(i, j)}
                onChange={(e) => handleChange(i, j, e.target.value)}
                maxLength={1}
              />

            );
          })
        )}
      </div>

      <div className="grid grid-cols-9 gap-1 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="bg-white text-black border border-gray-400 rounded w-10 h-10 hover:bg-blue-300"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 text-xs flex flex-wrap gap-4">
        <button
          onClick={fetchBoard}
          className="px-4 py-2 text-black border-2 border-black rounded hover:bg-blue-600"
        >
          Next Game
        </button>
        <button
          onClick={checkAnswer}
          className="px-4 py-2 text-black border-2 border-black rounded hover:bg-green-600"
        >
          Check Answer
        </button>
        <button
          onClick={solveBoard}
          className="px-4 py-2 text-black border-2 border-black rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Solve Instantly
        </button>
        
        {/* <button
          onClick={stepSolve}
          disabled={isSolving}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Step-by-Step Solve
        </button> */}
      </div>
      <button
          onClick={() => handleNumberClick(0)}
          className="mt-5 w-full px-4 py-2 text-black rounded hover:bg-red-600"
        >
          Clear Cell
        </button>
    </div>
  );
}
