'use client'

import { useState, useEffect } from 'react';

type GameData = {
  target: string;
  words: string[];
  hint: string;
};

export default function WordRevealGame() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');

  // Initialize game
  const fetchGameData = async () => {
    const res = await fetch('/api/generate-game');
    const data = await res.json();
    setGameData(data);
    setRevealed(new Array(data.words.length).fill(false));
    setGuess('');
    setMessage('');
  };

  // Handle guess submission
  const handleGuess = () => {
    if (!gameData || !guess.trim()) return;

    const newRevealed = [...revealed];
    let foundAny = false;

    gameData.words.forEach((word, index) => {
      if (word.toLowerCase() === guess.toLowerCase() && !newRevealed[index]) {
        newRevealed[index] = true;
        foundAny = true;
        if (word === gameData.target) {
          setScore(score + 1);
        }
      }
    });

    setRevealed(newRevealed);
    setGuess('');

    if (foundAny) {
      setMessage('Found matching words!');
    } else {
      setMessage('No matches found. Try again!');
    }
  };

  // Check if all words are revealed
  const allRevealed = revealed.every(r => r);

  useEffect(() => {
    fetchGameData();
  }, []);

  if (!gameData) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Word Reveal Game</h1>
      
      <div className="mb-6 text-center">
        <p className="text-lg font-semibold">Hint: {gameData.hint}</p>
        <p className="text-gray-600">Score: {score}</p>
        {message && <p className={`mt-2 ${message.includes('No') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </div>

      {/* Word slots */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {gameData.words.map((word, index) => (
          <div 
            key={index} 
            className={`p-3 rounded border-2 text-center ${
              revealed[index] 
                ? word === gameData.target 
                  ? 'bg-green-100 border-green-500' 
                  : 'bg-blue-100 border-blue-300'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            {revealed[index] ? word : '?'}
          </div>
        ))}
      </div>

      {/* Guess input */}
      <div className="flex mb-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="flex-1 p-2 border rounded-l"
          placeholder="Type your guess..."
        />
        <button 
          onClick={handleGuess}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Guess
        </button>
      </div>

      {/* Next round button (only shows when all revealed) */}
      {allRevealed && (
        <button
          onClick={fetchGameData}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Next Round
        </button>
      )}
    </div>
  );
}