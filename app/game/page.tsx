"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./game.module.css";

// Game constants
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const INITIAL_GAME_SPEED = 5;
const SPEED_INCREMENT = 0.0005;
const MAX_SPEED = 12;
const PLAYER_SIZE = 40;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_MIN_HEIGHT = 30;
const OBSTACLE_MAX_HEIGHT = 80;
const COIN_SIZE = 20;
const GROUND_HEIGHT = 100;
const LANE_POSITIONS = [0.3, 0.5, 0.7]; // Three lanes as percentages of canvas width

type GameState = "menu" | "playing" | "gameover";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  lane?: number;
}

interface Coin extends GameObject {
  collected: boolean;
}

interface Obstacle extends GameObject {
  lane: number;
}

interface BackgroundLayer {
  x: number;
  speed: number;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state refs
  const gameStateRef = useRef<GameState>("menu");
  const playerRef = useRef({
    x: 100,
    y: 0,
    velocityY: 0,
    isJumping: false,
    lane: 1, // 0, 1, or 2 (left, center, right)
    targetLane: 1,
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const gameSpeedRef = useRef(INITIAL_GAME_SPEED);
  const scoreRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastObstacleSpawnRef = useRef(0);
  const lastCoinSpawnRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const backgroundLayersRef = useRef<BackgroundLayer[]>([
    { x: 0, speed: 0.3 },
    { x: 0, speed: 0.5 },
    { x: 0, speed: 0.7 },
  ]);

  // Audio context refs
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("endlessRunnerHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    // Initialize audio context on user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
    };

    window.addEventListener("touchstart", initAudio, { once: true });
    window.addEventListener("click", initAudio, { once: true });

    return () => {
      window.removeEventListener("touchstart", initAudio);
      window.removeEventListener("click", initAudio);
    };
  }, []);

  const playSound = (frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContextRef.current.currentTime + duration
      );

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const playJumpSound = () => playSound(400, 0.1, "sine");
  const playCollectSound = () => playSound(800, 0.1, "sine");
  const playCollisionSound = () => playSound(100, 0.3, "sawtooth");

  const resetGame = () => {
    playerRef.current = {
      x: 100,
      y: 0,
      velocityY: 0,
      isJumping: false,
      lane: 1,
      targetLane: 1,
    };
    obstaclesRef.current = [];
    coinsRef.current = [];
    gameSpeedRef.current = INITIAL_GAME_SPEED;
    scoreRef.current = 0;
    setScore(0);
    lastObstacleSpawnRef.current = 0;
    lastCoinSpawnRef.current = 0;
    backgroundLayersRef.current = [
      { x: 0, speed: 0.3 },
      { x: 0, speed: 0.5 },
      { x: 0, speed: 0.7 },
    ];
  };

  const startGame = () => {
    resetGame();
    setGameState("playing");
    gameStateRef.current = "playing";
  };

  const endGame = () => {
    playCollisionSound();
    setGameState("gameover");
    gameStateRef.current = "gameover";

    // Update high score
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem("endlessRunnerHighScore", scoreRef.current.toString());
    }
  };

  const jump = () => {
    if (gameStateRef.current !== "playing") return;
    if (!playerRef.current.isJumping) {
      playerRef.current.velocityY = JUMP_STRENGTH;
      playerRef.current.isJumping = true;
      playJumpSound();
    }
  };

  const moveLeft = () => {
    if (gameStateRef.current !== "playing") return;
    if (playerRef.current.targetLane > 0) {
      playerRef.current.targetLane--;
    }
  };

  const moveRight = () => {
    if (gameStateRef.current !== "playing") return;
    if (playerRef.current.targetLane < LANE_POSITIONS.length - 1) {
      playerRef.current.targetLane++;
    }
  };

  const spawnObstacle = (canvasWidth: number, canvasHeight: number) => {
    const lane = Math.floor(Math.random() * LANE_POSITIONS.length);
    const height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
    const laneX = canvasWidth * LANE_POSITIONS[lane];

    obstaclesRef.current.push({
      x: canvasWidth,
      y: canvasHeight - GROUND_HEIGHT - height,
      width: OBSTACLE_WIDTH,
      height: height,
      lane: lane,
    });
  };

  const spawnCoin = (canvasWidth: number, canvasHeight: number) => {
    const lane = Math.floor(Math.random() * LANE_POSITIONS.length);
    const laneX = canvasWidth * LANE_POSITIONS[lane];
    const yPosition = canvasHeight - GROUND_HEIGHT - 80 - Math.random() * 60;

    coinsRef.current.push({
      x: canvasWidth,
      y: yPosition,
      width: COIN_SIZE,
      height: COIN_SIZE,
      lane: lane,
      collected: false,
    });
  };

  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastTime = 0;

    const gameLoop = (timestamp: number) => {
      if (!canvas || !ctx) return;

      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const groundY = canvasHeight - GROUND_HEIGHT;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      skyGradient.addColorStop(0, "#87CEEB");
      skyGradient.addColorStop(1, "#E0F6FF");
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw parallax background layers
      backgroundLayersRef.current.forEach((layer, index) => {
        ctx.fillStyle = `rgba(34, 139, 34, ${0.1 + index * 0.1})`;
        const layerHeight = 150 - index * 30;
        const y = groundY - layerHeight;

        if (gameStateRef.current === "playing") {
          layer.x -= gameSpeedRef.current * layer.speed;
          if (layer.x <= -canvasWidth) {
            layer.x = 0;
          }
        }

        // Draw two instances for seamless scrolling
        ctx.fillRect(layer.x, y, canvasWidth, layerHeight);
        ctx.fillRect(layer.x + canvasWidth, y, canvasWidth, layerHeight);
      });

      // Draw ground
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, groundY, canvasWidth, GROUND_HEIGHT);

      // Draw lane markers
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      LANE_POSITIONS.forEach((lanePos) => {
        const x = canvasWidth * lanePos;
        ctx.beginPath();
        ctx.moveTo(x, groundY - 200);
        ctx.lineTo(x, groundY);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      if (gameStateRef.current === "playing") {
        // Update game speed
        gameSpeedRef.current = Math.min(
          MAX_SPEED,
          INITIAL_GAME_SPEED + scoreRef.current * SPEED_INCREMENT
        );

        // Update player lane position (smooth transition)
        const targetX = canvasWidth * LANE_POSITIONS[playerRef.current.targetLane];
        playerRef.current.lane = playerRef.current.targetLane;
        playerRef.current.x = targetX - PLAYER_SIZE / 2;

        // Update player physics
        playerRef.current.velocityY += GRAVITY;
        playerRef.current.y += playerRef.current.velocityY;

        // Ground collision
        if (playerRef.current.y >= groundY - PLAYER_SIZE) {
          playerRef.current.y = groundY - PLAYER_SIZE;
          playerRef.current.velocityY = 0;
          playerRef.current.isJumping = false;
        }

        // Spawn obstacles
        if (timestamp - lastObstacleSpawnRef.current > 1500 / (gameSpeedRef.current / INITIAL_GAME_SPEED)) {
          spawnObstacle(canvasWidth, canvasHeight);
          lastObstacleSpawnRef.current = timestamp;
        }

        // Spawn coins
        if (timestamp - lastCoinSpawnRef.current > 800) {
          spawnCoin(canvasWidth, canvasHeight);
          lastCoinSpawnRef.current = timestamp;
        }

        // Update and draw obstacles
        obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
          obstacle.x -= gameSpeedRef.current;

          // Check collision with player
          const playerObj: GameObject = {
            x: playerRef.current.x,
            y: playerRef.current.y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
          };

          if (
            obstacle.lane === playerRef.current.lane &&
            checkCollision(playerObj, obstacle)
          ) {
            endGame();
          }

          return obstacle.x + obstacle.width > 0;
        });

        // Update and draw coins
        coinsRef.current = coinsRef.current.filter((coin) => {
          if (!coin.collected) {
            coin.x -= gameSpeedRef.current;

            // Check collection
            const playerObj: GameObject = {
              x: playerRef.current.x,
              y: playerRef.current.y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            };

            if (
              coin.lane === playerRef.current.lane &&
              checkCollision(playerObj, coin)
            ) {
              coin.collected = true;
              scoreRef.current += 10;
              setScore(scoreRef.current);
              playCollectSound();
              return false;
            }
          }

          return coin.x + coin.width > 0 && !coin.collected;
        });

        // Increment score over time
        scoreRef.current += 0.1;
        setScore(Math.floor(scoreRef.current));
      }

      // Draw obstacles
      obstaclesRef.current.forEach((obstacle) => {
        ctx.fillStyle = "#FF4444";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        // Add highlight
        ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width / 3, obstacle.height);
      });

      // Draw coins
      coinsRef.current.forEach((coin) => {
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(
          coin.x + coin.width / 2,
          coin.y + coin.height / 2,
          coin.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Add shine effect
        ctx.fillStyle = "#FFF8DC";
        ctx.beginPath();
        ctx.arc(
          coin.x + coin.width / 2 - 4,
          coin.y + coin.height / 2 - 4,
          coin.width / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // Draw player
      const playerX = playerRef.current.x;
      const playerY = playerRef.current.y;

      // Player body
      ctx.fillStyle = "#4169E1";
      ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);

      // Player face
      ctx.fillStyle = "#FFF";
      // Eyes
      ctx.fillRect(playerX + 10, playerY + 12, 6, 6);
      ctx.fillRect(playerX + 24, playerY + 12, 6, 6);
      // Pupils
      ctx.fillStyle = "#000";
      ctx.fillRect(playerX + 12, playerY + 14, 3, 3);
      ctx.fillRect(playerX + 26, playerY + 14, 3, 3);
      // Mouth
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(playerX + 20, playerY + 24, 8, 0, Math.PI);
      ctx.stroke();

      // Draw score
      ctx.fillStyle = "#000";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${Math.floor(scoreRef.current)}`, 20, 40);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, soundEnabled, highScore]);

  // Touch event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine if it's a swipe or tap
      if (absDeltaX > 50 || absDeltaY > 50) {
        // Swipe gesture
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            moveRight();
          } else {
            moveLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY < 0) {
            jump();
          }
        }
      } else {
        // Tap gesture - jump
        jump();
      }

      touchStartRef.current = null;
    };

    const handleClick = (e: MouseEvent) => {
      // Desktop click for testing
      jump();
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  // Keyboard controls for desktop testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      switch (e.key) {
        case " ":
        case "ArrowUp":
          e.preventDefault();
          jump();
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          moveRight();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  return (
    <div className={styles.gameContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {gameState === "menu" && (
        <div className={styles.overlay}>
          <div className={styles.menuContent}>
            <h1 className={styles.title}>Endless Runner</h1>
            <p className={styles.instructions}>
              Tap to jump<br />
              Swipe left/right to dodge<br />
              Collect coins and avoid obstacles!
            </p>
            <button onClick={startGame} className={styles.button}>
              Start Game
            </button>
            <div className={styles.highScore}>High Score: {highScore}</div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={styles.soundButton}
            >
              Sound: {soundEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div className={styles.overlay}>
          <div className={styles.menuContent}>
            <h1 className={styles.title}>Game Over!</h1>
            <div className={styles.finalScore}>Score: {Math.floor(score)}</div>
            <div className={styles.highScore}>High Score: {highScore}</div>
            <button onClick={startGame} className={styles.button}>
              Play Again
            </button>
            <button
              onClick={() => {
                setGameState("menu");
                gameStateRef.current = "menu";
              }}
              className={styles.secondaryButton}
            >
              Main Menu
            </button>
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className={styles.controls}>
          <button onClick={moveLeft} className={styles.controlButton}>
            ←
          </button>
          <button onClick={jump} className={styles.controlButton}>
            ↑
          </button>
          <button onClick={moveRight} className={styles.controlButton}>
            →
          </button>
        </div>
      )}
    </div>
  );
}
