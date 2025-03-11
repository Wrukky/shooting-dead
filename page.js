"use client"; // Ensures this runs only on the client-side

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Import images correctly
import bulletImg from "/bullet.png";
import playerImg from "/player.png";
import zombieImg from "/zombie.png";
import healthPackImg from "/health-pack.png";

export default function Game() {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ x: 50, y: 300, width: 50, height: 50 });
  const [bullets, setBullets] = useState([]);
  const [zombies, setZombies] = useState([]);
  const [healthPacks, setHealthPacks] = useState([]);
  const [hp, setHp] = useState(300);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [screenWidth, setScreenWidth] = useState(800);
  const [screenHeight, setScreenHeight] = useState(400);

  // Adjust screen size only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    }
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const bulletSpeed = 20; // Super effective bullets
    const zombieSpeed = 1.5;
    const playerSpeed = 15; // 3x faster player movement
    const verticalSpeed = 15; // Up/Down movement
    const maxZombies = 7; // Zombies constantly appearing

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "#D3D3D3";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw player
      ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

      // Draw bullets
      bullets.forEach((bullet, index) => {
        bullet.x += bulletSpeed;
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);

        // Remove bullets off-screen
        if (bullet.x > canvas.width) bullets.splice(index, 1);

        // Check for bullet collision with zombies
        zombies.forEach((zombie, zIndex) => {
          if (
            bullet.x < zombie.x + zombie.width &&
            bullet.x + bullet.width > zombie.x &&
            bullet.y < zombie.y + zombie.height &&
            bullet.y + bullet.height > zombie.y
          ) {
            bullets.splice(index, 1);
            zombies.splice(zIndex, 1);
            setScore((prev) => prev + 10);
          }
        });
      });

      // Draw zombies
      zombies.forEach((zombie, index) => {
        zombie.x -= zombieSpeed;
        ctx.drawImage(zombieImg, zombie.x, zombie.y, zombie.width, zombie.height);

        // Reduce HP only if zombie **directly** collides with player
        if (
          zombie.x < player.x + player.width &&
          zombie.x + zombie.width > player.x &&
          zombie.y < player.y + player.height &&
          zombie.y + zombie.height > player.y
        ) {
          setHp((prev) => Math.max(0, prev - 3)); // Reduce HP by 3
          zombies.splice(index, 1);
        }

        // Remove zombies off-screen
        if (zombie.x + zombie.width < 0) zombies.splice(index, 1);
      });

      // Draw health packs
      healthPacks.forEach((pack, index) => {
        ctx.drawImage(healthPackImg, pack.x, pack.y, pack.width, pack.height);

        // Check for collision with player
        if (
          pack.x < player.x + player.width &&
          pack.x + pack.width > player.x &&
          pack.y < player.y + player.height &&
          pack.y + pack.height > player.y
        ) {
          setHp((prev) => Math.min(300, prev + 20)); // Increase HP but max is 300
          healthPacks.splice(index, 1);
        }

        pack.x -= 1.5; // Health pack moves with zombies

        // Remove off-screen health packs
        if (pack.x + pack.width < 0) healthPacks.splice(index, 1);
      });

      // Display HP Bar
      ctx.fillStyle = "red";
      ctx.fillRect(10, 10, (hp / 300) * 200, 20);
      ctx.strokeStyle = "black";
      ctx.strokeRect(10, 10, 200, 20);
      ctx.fillStyle = "white";
      ctx.font = "bold 16px 'Press Start 2P'";
      ctx.fillText(`HP: ${hp}`, 20, 25);

      // Display Score & High Score
      ctx.fillStyle = "black";
      ctx.fillText(`Score: ${score}`, canvas.width - 250, 25);
      ctx.fillText(`High Score: ${highScore}`, canvas.width - 250, 50);

      if (hp === 0) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
      } else {
        requestAnimationFrame(draw);
      }
    }

    function spawnZombie() {
      if (zombies.length < maxZombies) {
        setZombies((prev) => [
          ...prev,
          { x: canvas.width, y: Math.random() * (canvas.height - 50), width: 50, height: 50 },
        ]);
      }
    }

    function spawnHealthPack() {
      setHealthPacks((prev) => [
        ...prev,
        { x: canvas.width, y: Math.random() * (canvas.height - 50), width: 30, height: 30 },
      ]);
    }

    function controls(e) {
      if (e.key === "ArrowRight" && player.x + player.width < canvas.width)
        setPlayer((prev) => ({ ...prev, x: prev.x + playerSpeed }));

      if (e.key === "ArrowLeft" && player.x > 0)
        setPlayer((prev) => ({ ...prev, x: prev.x - playerSpeed }));

      if (e.key === "ArrowUp" && player.y > 0)
        setPlayer((prev) => ({ ...prev, y: prev.y - verticalSpeed }));

      if (e.key === "ArrowDown" && player.y + player.height < canvas.height)
        setPlayer((prev) => ({ ...prev, y: prev.y + verticalSpeed }));

      if (e.key === " " || e.key === "Spacebar") {
        setBullets((prev) => [...prev, { x: player.x + player.width, y: player.y + 20, width: 10, height: 5 }]);
      }
    }

    document.addEventListener("keydown", controls);
    draw();
    const zombieInterval = setInterval(spawnZombie, 1000);
    const healthPackInterval = setInterval(spawnHealthPack, 10000);

    return () => {
      document.removeEventListener("keydown", controls);
      clearInterval(zombieInterval);
      clearInterval(healthPackInterval);
    };
  }, [player, bullets, zombies, healthPacks, hp, gameOver, score]);

  function restartGame() {
    setPlayer({ x: 50, y: 300, width: 50, height: 50 });
    setBullets([]);
    setZombies([]);
    setHealthPacks([]);
    setHp(300);
    setScore(0);
    setGameOver(false);
  }

  return (
    <div>
      <canvas ref={canvasRef} width={screenWidth} height={screenHeight} style={{ display: "block" }}></canvas>
      {gameOver && (
        <div style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold" }}>
          <h2>Game Over</h2>
          <p>Final Score: {score}</p>
          <p>Highest Score: {highScore}</p>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
    </div>
  );
}
