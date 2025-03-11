"use client";
import { useEffect, useRef, useState } from "react";

// Use public folder image paths
const bulletImg = "/bullet.png";
const playerImg = "/player.png";
const zombieImg = "/zombie.png";
const healthPackImg = "/health-pack.png";
const bgImg = "/background.jpeg";

export default function Game() {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ x: 50, y: 300, width: 50, height: 50, hp: 300 });
  const [bullets, setBullets] = useState([]);
  const [zombies, setZombies] = useState([]);
  const [healthPacks, setHealthPacks] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const speed = 15;
  const zombieSpeed = 1.5;
  const verticalSpeed = 15;
  const bulletSpeed = 15;
  const zombieSpawnRate = 1500;
  const healthPackSpawnRate = 10000;

  useEffect(() => {
    if (gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const playerSprite = new Image();
    playerSprite.src = playerImg;

    const bulletSprite = new Image();
    bulletSprite.src = bulletImg;

    const zombieSprite = new Image();
    zombieSprite.src = zombieImg;

    const healthPackSprite = new Image();
    healthPackSprite.src = healthPackImg;

    const background = new Image();
    background.src = bgImg;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);

      bullets.forEach((bullet, index) => {
        bullet.x += bulletSpeed;
        ctx.drawImage(bulletSprite, bullet.x, bullet.y, bullet.width, bullet.height);
        if (bullet.x > canvas.width) bullets.splice(index, 1);
      });

      zombies.forEach((zombie, index) => {
        zombie.x -= zombieSpeed;
        ctx.drawImage(zombieSprite, zombie.x, zombie.y, zombie.width, zombie.height);

        if (
          zombie.x < player.x + player.width &&
          zombie.x + zombie.width > player.x &&
          zombie.y < player.y + player.height &&
          zombie.y + zombie.height > player.y
        ) {
          zombies.splice(index, 1);
          setPlayer((prev) => ({ ...prev, hp: prev.hp - 3 }));
        }

        bullets.forEach((bullet, bIndex) => {
          if (
            bullet.x < zombie.x + zombie.width &&
            bullet.x + bullet.width > zombie.x &&
            bullet.y < zombie.y + zombie.height &&
            bullet.y + bullet.height > zombie.y
          ) {
            zombies.splice(index, 1);
            bullets.splice(bIndex, 1);
            setScore((prev) => prev + 10);
          }
        });

        if (zombie.x + zombie.width < 0) zombies.splice(index, 1);
      });

      healthPacks.forEach((pack, index) => {
        pack.x -= zombieSpeed;
        ctx.drawImage(healthPackSprite, pack.x, pack.y, pack.width, pack.height);

        if (
          pack.x < player.x + player.width &&
          pack.x + pack.width > player.x &&
          pack.y < player.y + player.height &&
          pack.y + pack.height > player.y
        ) {
          healthPacks.splice(index, 1);
          setPlayer((prev) => ({ ...prev, hp: Math.min(300, prev.hp + 50) }));
        }

        if (pack.x + pack.width < 0) healthPacks.splice(index, 1);
      });

      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.fillText(`HP: ${player.hp}`, 20, 30);
      ctx.fillText(`Score: ${score}`, 20, 60);
      ctx.fillText(`High Score: ${highScore}`, 20, 90);

      ctx.fillStyle = "red";
      ctx.fillRect(20, 100, 300, 20);
      ctx.fillStyle = "green";
      ctx.fillRect(20, 100, player.hp, 20);

      if (player.hp <= 0) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
      }

      requestAnimationFrame(draw);
    }

    function spawnZombie() {
      setZombies((prev) => [
        ...prev,
        { x: canvas.width, y: Math.random() * (canvas.height - 50), width: 50, height: 50 },
      ]);
    }

    function spawnHealthPack() {
      setHealthPacks((prev) => [
        ...prev,
        { x: canvas.width, y: Math.random() * (canvas.height - 50), width: 30, height: 30 },
      ]);
    }

    const controls = (e) => {
      if (e.key === "ArrowRight" && player.x + player.width < canvas.width)
        setPlayer((prev) => ({ ...prev, x: prev.x + speed }));

      if (e.key === "ArrowLeft" && player.x > 0)
        setPlayer((prev) => ({ ...prev, x: prev.x - speed }));

      if (e.key === "ArrowUp" && player.y > 0)
        setPlayer((prev) => ({ ...prev, y: prev.y - verticalSpeed }));

      if (e.key === "ArrowDown" && player.y + player.height < canvas.height)
        setPlayer((prev) => ({ ...prev, y: prev.y + verticalSpeed }));

      if (e.key === " ") {
        setBullets((prev) => [...prev, { x: player.x + player.width, y: player.y + 20, width: 10, height: 5 }]);
      }
    };

    document.addEventListener("keydown", controls);
    draw();
    const zombieInterval = setInterval(spawnZombie, zombieSpawnRate);
    const healthPackInterval = setInterval(spawnHealthPack, healthPackSpawnRate);

    return () => {
      document.removeEventListener("keydown", controls);
      clearInterval(zombieInterval);
      clearInterval(healthPackInterval);
    };
  }, [player, bullets, zombies, gameOver, score]);

  return (
    <div>
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={{ display: "block" }}></canvas>
      {gameOver && (
        <div>
          <h2>Game Over</h2>
          <h3>Final Score: {score}</h3>
          <h3>Highest Score: {highScore}</h3>
          <button onClick={() => location.reload()} style={{ padding: "10px", fontSize: "16px" }}>Restart</button>
        </div>
      )}
    </div>
  );
}
