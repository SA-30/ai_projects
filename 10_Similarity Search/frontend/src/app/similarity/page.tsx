'use client'

import { useState, useEffect } from 'react';

type GameData = {
  target: string;
  words: string[];
};

export default function WordRevealGame() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const url = process.env.backend_url || "https://ai-projects-i11h.onrender.com/";

  const fetchGameData = async () => {
    const res = await fetch(`${url}generate-game`);
    const data = await res.json();

    const filteredWords = data.words.filter((word: string) => word.toLowerCase() !== data.target.toLowerCase());

    setGameData({ target: data.target, words: filteredWords });
    setRevealed(new Array(filteredWords.length).fill(false));
    setGuess('');
    setMessage('');
    setLoading(false)
  };

  const fetchNewWords = async () => {
    setLoading(true)
    await fetchGameData();
  };

  const handleGuess = () => {
    if (!gameData || !guess.trim()) return;

    const newRevealed = [...revealed];
    let foundAny = false;

    gameData.words.forEach((word, index) => {
      if (word.toLowerCase() === guess.toLowerCase() && !newRevealed[index]) {
        newRevealed[index] = true;
        foundAny = true;
        setScore(score + 1);
      }
    });

    setRevealed(newRevealed);
    setGuess('');

    if (foundAny) {
      setMessage('Correct! You found a synonym!');
    } else {
      setMessage('No match. Try again!');
    }
  };

  const allRevealed = revealed.every(r => r);

  useEffect(() => {
    fetchGameData();
  }, []);

  if (!gameData) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="flex flex-col items-center  justify-center p-4 pt-10 ">
      <h1 className="text-6xl font-bold text-center mb-8">Synonym Guess Game</h1>

      <div className=''>
        <div className="mb-6 text-center ">
        <p className="text-lg font-semibold">Your word: <span className="text-rose-500">{gameData.target}</span></p>
        <p className="text-gray-600">Score: {score}</p>
        {message && <p className={`mt-2 ${message.includes('No') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </div>

      {/* Synonym slots */}
      <div className="grid grid-cols-1 gap-3 mb-6 w-[600px]">
        {gameData.words.map((word, index) => (
          <div
            key={index}
            className={`p-3 rounded border-2 text-center ${
              revealed[index]
                ? 'bg-blue-100 border-blue-300'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            {revealed[index] ? word : '?'}
          </div>
        ))}
      </div>

      {/* Guess input */}
      <div className="flex mb-4 w-[600px] space-x-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="flex-1 p-2 border rounded-l"
          placeholder="Type a synonym..."
        />
        <button
          onClick={handleGuess}
          className="bg-rose-500 text-white px-4 py-2 rounded-r hover:bg-rose-600 cursor-pointer"
        >
          Guess
        </button>
      </div>

      <button
        onClick={fetchNewWords}
        disabled={loading ? true : false}
        className="flex mb-4 w-[600px] justify-center items-center font-black cursor-pointer py-4  px-10 disabled:bg-purple-300 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        New Words
      </button>
      </div>
    </div>
  );
}
