import Link from "next/link";


export default function Home() {
  return (
    <div className="p-4 flex flex-col items-center bg-rose-200/40 justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-center mb-4">Word Reveal Game</h1>
      <Link 
        href={'/similarity'} 
        className="py-2 px-5 text-2xl cursor-pointer hover:bg-rose-500 transition-all bg-rose-400 text-white font-bold tracking-wide rounded-2xl"
      >
        Game
      </Link>
    </div>
  );
}