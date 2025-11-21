"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const SIZE = 4;

function initGrid() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  addRandomTile(grid);
  addRandomTile(grid);
  return grid;
}

function addRandomTile(grid: number[][]) {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function transpose(grid: number[][]) {
  return grid[0].map((_, i) => grid.map(row => row[i]));
}

function reverse(grid: number[][]) {
  return grid.map(row => row.slice().reverse());
}

function slide(row: number[]) {
  const filtered = row.filter(v => v !== 0);
  const merged: number[] = [];
  let skip = false;
  for (let i = 0; i < filtered.length; i++) {
    if (skip) { skip = false; continue; }
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      skip = true;
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return merged;
}

function move(grid: number[][], dir: "up" | "down" | "left" | "right") {
  let newGrid = grid;
  if (dir === "up") newGrid = transpose(newGrid);
  if (dir === "down") newGrid = reverse(transpose(newGrid));
  if (dir === "right") newGrid = reverse(newGrid);
  newGrid = newGrid.map(row => slide(row));
  if (dir === "up") newGrid = transpose(newGrid);
  if (dir === "down") newGrid = transpose(reverse(newGrid));
  if (dir === "right") newGrid = reverse(newGrid);
  return newGrid;
}

export default function Game2048() {
  const [grid, setGrid] = useState<number[][]>(initGrid);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    const newGrid = move(grid, dir);
    if (JSON.stringify(newGrid) === JSON.stringify(grid)) return;
    const addedScore = newGrid.flat().reduce((s, v) => s + v, 0) - grid.flat().reduce((s, v) => s + v, 0);
    setScore(score + addedScore);
    setGrid(newGrid);
    addRandomTile(newGrid);
    setGrid([...newGrid]); // trigger re-render
    if (!hasMoves(newGrid)) setGameOver(true);
  };

  const hasMoves = (g: number[][]) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (g[r][c] === 0) return true;
        if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) return true;
        if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp": handleMove("up"); break;
        case "ArrowDown": handleMove("down"); break;
        case "ArrowLeft": handleMove("left"); break;
        case "ArrowRight": handleMove("right"); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [grid, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((v, i) => (
          <div key={i} className="w-16 h-16 flex items-center justify-center bg-muted rounded">
            {v !== 0 && <span className="text-xl font-bold">{v}</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleMove("up")}>↑</Button>
        <Button onClick={() => handleMove("down")}>↓</Button>
        <Button onClick={() => handleMove("left")}>←</Button>
        <Button onClick={() => handleMove("right")}>→</Button>
      </div>
      <div className="text-lg">Score: {score}</div>
      {gameOver && (
        <div className="mt-4">
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
