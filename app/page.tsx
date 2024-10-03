"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SnakeBody {
  x: number;
  y: number;
}

const Home = () => {
  const displayRef = useRef<HTMLDivElement>(null);
  const [foodExist, setFoodExist] = useState(false);
  const [snake, setSnake] = useState<SnakeBody[]>([{ x: 0, y: 0 }]);
  const [food, setFood] = useState<SnakeBody | null>(null);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState("right");
  const [gameActive, setGameActive] = useState(false);
  const numberOfColumns = 20;

  useEffect(() => {
    const generateGrid = () => {
      if (displayRef.current) {
        const display = displayRef.current;
        display.style.width = `${numberOfColumns * 25}px`;
        display.style.height = `${numberOfColumns * 25}px`;
        display.style.display = "grid";
        display.style.gridTemplateColumns = `repeat(${numberOfColumns}, 25px)`;
        display.style.gridTemplateRows = `repeat(${numberOfColumns}, 25px)`;

        while (display.firstChild) {
          display.removeChild(display.firstChild);
        }

        for (let i = 0; i < numberOfColumns * numberOfColumns; i++) {
          const cell = document.createElement("div");
          cell.className = "border border-black";
          cell.style.width = "25px";
          cell.style.height = "25px";
          display.appendChild(cell);
        }
      }
    };
    generateGrid();
  }, []);

  useEffect(() => {
    const generateFood = () => {
      const randomCell = {
        x: Math.floor(Math.random() * numberOfColumns),
        y: Math.floor(Math.random() * numberOfColumns),
      };
      if (
        snake.some((seg) => seg.x === randomCell.x && seg.y === randomCell.y)
      ) {
        return generateFood(); // Retry if food is on the snake
      }
      setFood(randomCell);
      setFoodExist(true);
    };
    if (!foodExist) {
      generateFood();
    }
  }, [snake, foodExist]);

  useEffect(() => {
    if (gameActive) {
      const moveSnake = () => {
        setSnake((prevSnake) => {
          const newHead = {
            x:
              prevSnake[0].x +
              (direction === "right" ? 1 : direction === "left" ? -1 : 0),
            y:
              prevSnake[0].y +
              (direction === "down" ? 1 : direction === "up" ? -1 : 0),
          };

          // Check for collisions with walls or itself
          if (
            newHead.x < 0 ||
            newHead.x >= numberOfColumns ||
            newHead.y < 0 ||
            newHead.y >= numberOfColumns ||
            prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
          ) {
            if (gameActive) {
              setGameActive(false); // Immediately stop the game
              alert("Game Over!");
            }
            return prevSnake; // Keep the snake unchanged
          }

          // Check if food is eaten
          const newSnake = [newHead, ...prevSnake];
          if (food && newHead.x === food.x && newHead.y === food.y) {
            setScore(score + 1);
            setFoodExist(false); // Regenerate food
            return newSnake; // Grow snake
          } else {
            return [newHead, ...prevSnake.slice(0, -1)]; // Move snake
          }
        });
      };

      const interval = setInterval(moveSnake, 200); // Move every 200 ms
      return () => clearInterval(interval);
    }
  }, [gameActive, direction, food, foodExist, score]);

  useEffect(() => {
    const display = displayRef.current;

    if (display) {
      Array.from(display.children).forEach((cell) => {
        (cell as HTMLElement).style.backgroundColor = "white"; // Reset cell color
      });

      // Render the snake
      snake.forEach((segment) => {
        const index = segment.y * numberOfColumns + segment.x;
        if (display.children[index]) {
          (display.children[index] as HTMLElement).style.backgroundColor =
            "green";
        }
      });

      // Render the food
      if (food) {
        const foodIndex = food.y * numberOfColumns + food.x;
        if (display.children[foodIndex]) {
          (display.children[foodIndex] as HTMLElement).style.backgroundColor =
            "red";
        }
      }
    }
  }, [snake, food]);

  const handleDirectionChange = useCallback(
    (newDirection: string) => {
      if (
        (newDirection === "right" && direction !== "left") ||
        (newDirection === "left" && direction !== "right") ||
        (newDirection === "up" && direction !== "down") ||
        (newDirection === "down" && direction !== "up")
      ) {
        setDirection(newDirection);
      }
    },
    [direction]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          handleDirectionChange("up");
          break;
        case "ArrowDown":
          handleDirectionChange("down");
          break;
        case "ArrowLeft":
          handleDirectionChange("left");
          break;
        case "ArrowRight":
          handleDirectionChange("right");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDirectionChange]);

  return (
    <div className="size-full flex flex-col space-y-4 items-center justify-center">
      <div
        ref={displayRef}
        id="display"
        className="w-1/2 h-auto aspect-square"
      ></div>
      <div
        id="score"
        className="w-1/2 flex items-center justify-center text-2xl font-bold "
      >
        Score: {score}
      </div>
      <div id="controls" className="flex justify-center space-x-4">
        <button
          id="start"
          className="bg-blue-500 text-white px-4 py-2"
          onClick={() => {
            setGameActive(true);
            setScore(0);
            setSnake([{ x: 0, y: 0 }]);
            setDirection("right");
          }}
        >
          Start
        </button>
        <button
          id="stop"
          className="bg-red-500 text-white px-4 py-2"
          onClick={() => setGameActive(false)}
        >
          Stop
        </button>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handleDirectionChange("up")}
          className="bg-slate-400 px-4 py-2"
        >
          Up
        </button>
        <button
          onClick={() => handleDirectionChange("down")}
          className="bg-slate-400 px-4 py-2"
        >
          Down
        </button>
        <button
          onClick={() => handleDirectionChange("left")}
          className="bg-slate-400 px-4 py-2"
        >
          Left
        </button>
        <button
          onClick={() => handleDirectionChange("right")}
          className="bg-slate-400 px-4 py-2"
        >
          Right
        </button>
      </div>
    </div>
  );
};

export default Home;
