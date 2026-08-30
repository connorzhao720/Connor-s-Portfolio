"use client";

import { useEffect, useRef, useState } from "react";
import { chapters, storageKey, type Chapter } from "../portfolio-data";
import { sitePath } from "../site-path";

type GateProps = {
  chapter: Chapter;
  chapterIndex: number;
  compact?: boolean;
  onUnlocked?: () => void;
};

type GateState = "idle" | "playing" | "paused" | "won" | "lost";

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  cooldown: number;
  dash: number;
  invincible: number;
  facing: 1 | -1;
};

type Boss = {
  x: number;
  y: number;
  hp: number;
  phase: number;
  timer: number;
  telegraph: number;
  attack: number;
  fired: boolean;
};

type Shot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  owner: "player" | "boss";
};

const W = 760;
const H = 360;
const ground = 300;

const maxBossHp = [14, 18, 22, 27, 34];
const bossColors = ["#7e5639", "#718195", "#9a643b", "#a47445", "#604737"];

const initialPlayer = (): Player => ({
  x: 70,
  y: ground - 42,
  vx: 0,
  vy: 0,
  hp: 5,
  cooldown: 0,
  dash: 0,
  invincible: 0,
  facing: 1,
});

const initialBoss = (chapterIndex: number): Boss => ({
  x: 590,
  y: chapterIndex === 1 ? 110 : ground - 58,
  hp: maxBossHp[chapterIndex],
  phase: 1,
  timer: 900,
  telegraph: 0,
  attack: 0,
  fired: false,
});

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const distanceHit = (shot: Shot, x: number, y: number, w: number, h: number) => {
  const nearestX = clamp(shot.x, x, x + w);
  const nearestY = clamp(shot.y, y, y + h);
  return (shot.x - nearestX) ** 2 + (shot.y - nearestY) ** 2 < shot.r ** 2;
};

const getUnlockedCount = () => {
  if (typeof window === "undefined") return 0;
  const stored = Number(window.localStorage.getItem(storageKey) ?? "0");
  return Number.isFinite(stored) ? clamp(stored, 0, chapters.length) : 0;
};

const setUnlockedCount = (value: number) => {
  window.localStorage.setItem(storageKey, String(clamp(value, 0, chapters.length)));
};

export function ForestGate({ chapter, chapterIndex, compact = false, onUnlocked }: GateProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<Set<string>>(new Set());
  const playerRef = useRef(initialPlayer());
  const bossRef = useRef(initialBoss(chapterIndex));
  const shotsRef = useRef<Shot[]>([]);
  const backdropRef = useRef<HTMLImageElement | null>(null);
  const [state, setState] = useState<GateState>("idle");
  const [message, setMessage] = useState(`Defeat ${chapter.boss} to enter ${chapter.title}.`);
  const [hud, setHud] = useState({ playerHp: 5, bossHp: maxBossHp[chapterIndex], bossMax: maxBossHp[chapterIndex] });

  useEffect(() => {
    const allowed = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "KeyA", "KeyD", "KeyW", "Space", "KeyF", "KeyE", "ShiftLeft", "ShiftRight"]);
    const down = (event: KeyboardEvent) => {
      if (allowed.has(event.code)) {
        event.preventDefault();
        inputRef.current.add(event.code);
      }
    };
    const up = (event: KeyboardEvent) => inputRef.current.delete(event.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const backdrop = new Image();
    backdrop.src = "/portfolio-landscape.png";
    backdropRef.current = backdrop;
    return () => {
      backdropRef.current = null;
    };
  }, []);

  const start = () => {
    playerRef.current = initialPlayer();
    bossRef.current = initialBoss(chapterIndex);
    shotsRef.current = [];
    setHud({ playerHp: 5, bossHp: maxBossHp[chapterIndex], bossMax: maxBossHp[chapterIndex] });
    setMessage(`${chapter.boss} is guarding this chapter. Move, jump, dash, and fire.`);
    setState("playing");
  };

  const togglePause = () => {
    inputRef.current.clear();
    setState((current) => {
      const next = current === "paused" ? "playing" : "paused";
      setMessage(next === "paused" ? "Paused." : "Back to the challenge.");
      return next;
    });
  };

  const finish = () => {
    const nextUnlocked = Math.max(getUnlockedCount(), chapterIndex + 1);
    setUnlockedCount(nextUnlocked);
    setMessage(`${chapter.title} is open. Entering the chapter page.`);
    setState("won");
    onUnlocked?.();
    window.setTimeout(() => window.location.assign(sitePath(chapter.route)), 600);
  };

  const updateGame = (dt: number) => {
    const player = playerRef.current;
    const boss = bossRef.current;
    const keys = inputRef.current;
    const left = keys.has("ArrowLeft") || keys.has("KeyA");
    const right = keys.has("ArrowRight") || keys.has("KeyD");
    const jump = keys.has("ArrowUp") || keys.has("KeyW");
    const fire = keys.has("Space") || keys.has("KeyF");
    const dash = keys.has("KeyE") || keys.has("ShiftLeft") || keys.has("ShiftRight");
    const onGround = player.y >= ground - 42;

    if (left) {
      player.vx -= 900 * dt;
      player.facing = -1;
    }
    if (right) {
      player.vx += 900 * dt;
      player.facing = 1;
    }
    if (!left && !right) player.vx *= 0.84;
    player.vx = clamp(player.vx, -210, 210);

    if (jump && onGround) player.vy = -470;
    if (dash && player.dash <= 0) {
      player.vx = player.facing * 520;
      player.invincible = 260;
      player.dash = 1000;
    }

    player.cooldown -= dt * 1000;
    player.dash -= dt * 1000;
    player.invincible -= dt * 1000;
    if (fire && player.cooldown <= 0) {
      shotsRef.current.push({ x: player.x + 24 * player.facing, y: player.y + 19, vx: player.facing * 430, vy: 0, r: 6, owner: "player" });
      player.cooldown = 190;
    }

    player.vy += 1050 * dt;
    player.x = clamp(player.x + player.vx * dt, 20, W - 34);
    player.y += player.vy * dt;
    if (player.y > ground - 42) {
      player.y = ground - 42;
      player.vy = 0;
    }

    boss.phase = boss.hp <= maxBossHp[chapterIndex] / 2 ? 2 : 1;
    boss.timer -= dt * 1000 * (boss.phase === 2 ? 1.2 : 1);
    boss.telegraph -= dt * 1000;

    moveBoss(chapterIndex, boss, player, dt);
    if (boss.timer <= 0 && boss.telegraph <= 0) {
      boss.attack = (boss.attack + 1) % 3;
      boss.telegraph = 420;
      boss.fired = false;
      boss.timer = 950 - chapterIndex * 70;
      setMessage(getTelegraphMessage(chapterIndex, chapter.boss));
    }
    if (boss.telegraph > 0 && boss.telegraph < 90 && !boss.fired) {
      fireBossPattern(chapterIndex, boss, player, shotsRef.current);
      boss.fired = true;
    }

    shotsRef.current = shotsRef.current
      .map((shot) => ({ ...shot, x: shot.x + shot.vx * dt, y: shot.y + shot.vy * dt, vy: shot.owner === "boss" ? shot.vy + 160 * dt : shot.vy }))
      .filter((shot) => shot.x > -30 && shot.x < W + 30 && shot.y > -40 && shot.y < H + 40);

    const remaining: Shot[] = [];
    for (const shot of shotsRef.current) {
      if (shot.owner === "player" && distanceHit(shot, boss.x, boss.y, 78, chapterIndex === 4 ? 76 : 56)) {
        boss.hp -= 1;
        continue;
      }
      if (shot.owner === "boss" && player.invincible <= 0 && distanceHit(shot, player.x, player.y, 28, 42)) {
        player.hp -= 1;
        player.invincible = 760;
        setMessage("You were hit. Dash gives a brief safe window.");
        continue;
      }
      remaining.push(shot);
    }
    shotsRef.current = remaining;

    if (player.invincible <= 0 && Math.abs(player.x - boss.x) < 58 && Math.abs(player.y - boss.y) < 62) {
      player.hp -= 1;
      player.invincible = 760;
      player.vx = -player.facing * 220;
      setMessage("Close contact hurts. Keep your distance and use your dash.");
    }

    setHud({ playerHp: Math.max(0, player.hp), bossHp: Math.max(0, boss.hp), bossMax: maxBossHp[chapterIndex] });
    if (boss.hp <= 0) finish();
    if (player.hp <= 0) {
      setState("lost");
      setMessage("The gate held. Retry when ready.");
    }
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const player = playerRef.current;
    const boss = bossRef.current;
    ctx.clearRect(0, 0, W, H);

    const backdrop = backdropRef.current;
    if (backdrop?.complete && backdrop.naturalWidth > 0) {
      ctx.drawImage(backdrop, 0, 0, W, H);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#2bc9e4");
      sky.addColorStop(0.55, "#aeead7");
      sky.addColorStop(1, "#4b963c");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
    }

    drawLowPolyTrees(ctx, chapterIndex);

    ctx.fillStyle = "rgba(96, 164, 51, 0.9)";
    ctx.fillRect(0, ground, W, H - ground);
    ctx.fillStyle = "rgba(14, 77, 39, 0.35)";
    ctx.beginPath();
    ctx.ellipse(120, ground + 44, 170, 30, -0.12, 0, Math.PI * 2);
    ctx.ellipse(620, ground + 28, 200, 28, 0.08, 0, Math.PI * 2);
    ctx.fill();

    if (boss.telegraph > 0) {
      ctx.fillStyle = "rgba(255, 240, 170, 0.35)";
      ctx.fillRect(0, ground - 28, W, 28);
    }

    for (const shot of shotsRef.current) {
      ctx.fillStyle = shot.owner === "player" ? "#fff1a6" : "#ff8a5b";
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#f2cf7b";
    ctx.fillRect(player.x, player.y, 28, 42);
    ctx.fillStyle = "#fff8de";
    ctx.fillRect(player.x + (player.facing === 1 ? 20 : -12), player.y + 18, 20, 5);

    ctx.fillStyle = bossColors[chapterIndex];
    ctx.beginPath();
    ctx.roundRect(boss.x, boss.y, 78, chapterIndex === 4 ? 76 : 56, 16);
    ctx.fill();
    ctx.strokeStyle = "#f9df91";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#fff8de";
    ctx.font = "800 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(chapter.bossSpecies, boss.x + 39, boss.y + 33);
  };

  const setControl = (code: string, active: boolean) => {
    if (active) inputRef.current.add(code);
    else inputRef.current.delete(code);
  };

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (time: number) => {
      const dt = Math.min(0.033, (time - last) / 1000);
      last = time;
      if (state === "playing") updateGame(dt);
      draw();
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  });

  return (
    <div className={`gate-card ${compact ? "compact" : ""}`}>
      <div className="gate-copy">
        <p className="eyebrow">Chapter access</p>
        <h2>{chapter.boss} the {chapter.bossSpecies}</h2>
        <p>{message}</p>
      </div>
      <div className="mini-hud" aria-label="Gate health">
        <span>You {hud.playerHp}/5</span>
        <span>{chapter.boss} {hud.bossHp}/{hud.bossMax}</span>
      </div>
      <div className="gate-canvas-wrap">
        <canvas ref={canvasRef} width={W} height={H} aria-label={`Game gate for ${chapter.title}`} />
        {state !== "playing" && (
          <div className="gate-overlay">
            <strong>{state === "won" ? "Open" : state === "lost" ? "Try Again" : state === "paused" ? "Paused" : "Ready"}</strong>
            {state !== "won" && <button type="button" onClick={state === "paused" ? togglePause : start}>{state === "lost" ? "Try Again" : state === "paused" ? "Resume" : "Start"}</button>}
          </div>
        )}
      </div>
      {state === "playing" && <button className="gate-pause" type="button" onClick={togglePause}>Pause</button>}
      <div className="gate-controls" aria-label="Touch controls">
        <button type="button" onPointerDown={() => setControl("ArrowLeft", true)} onPointerUp={() => setControl("ArrowLeft", false)} onPointerLeave={() => setControl("ArrowLeft", false)}>Left</button>
        <button type="button" onPointerDown={() => setControl("ArrowRight", true)} onPointerUp={() => setControl("ArrowRight", false)} onPointerLeave={() => setControl("ArrowRight", false)}>Right</button>
        <button type="button" onPointerDown={() => setControl("ArrowUp", true)} onPointerUp={() => setControl("ArrowUp", false)} onPointerLeave={() => setControl("ArrowUp", false)}>Jump</button>
        <button type="button" onPointerDown={() => setControl("KeyE", true)} onPointerUp={() => setControl("KeyE", false)} onPointerLeave={() => setControl("KeyE", false)}>Dash</button>
        <button type="button" onPointerDown={() => setControl("Space", true)} onPointerUp={() => setControl("Space", false)} onPointerLeave={() => setControl("Space", false)}>Fire</button>
      </div>
    </div>
  );
}

function moveBoss(chapterIndex: number, boss: Boss, player: Player, dt: number) {
  if (chapterIndex === 0) {
    boss.x += Math.sin(performance.now() / 360) * 105 * dt;
    if (boss.telegraph > 0 && boss.attack === 1) boss.x += (player.x < boss.x ? -1 : 1) * 270 * dt;
  }
  if (chapterIndex === 1) {
    boss.x = 560 + Math.sin(performance.now() / 520) * 120;
    boss.y = 88 + Math.sin(performance.now() / 340) * 46;
  }
  if (chapterIndex === 2) {
    boss.x += (player.x > boss.x ? 1 : -1) * 180 * dt;
    boss.x = clamp(boss.x, 130, W - 130);
    boss.y = ground - 50 + Math.sin(performance.now() / 180) * 12;
  }
  if (chapterIndex === 3) {
    boss.x = 565 + Math.sin(performance.now() / 620) * 115;
    boss.y = ground - 76;
  }
  if (chapterIndex === 4) {
    boss.x += (player.x > boss.x ? 1 : -1) * (boss.phase === 2 ? 150 : 95) * dt;
    boss.x = clamp(boss.x, 430, W - 120);
    boss.y = ground - 76;
  }
}

function fireBossPattern(chapterIndex: number, boss: Boss, player: Player, shots: Shot[]) {
  const targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
  const add = (angle: number, speed: number, r = 7) =>
    shots.push({
      x: boss.x + 36,
      y: boss.y + 28,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      owner: "boss",
    });

  if (chapterIndex === 0) {
    add(Math.PI, 260, 10);
    if (boss.phase === 2) add(Math.PI - 0.18, 285, 8);
  }
  if (chapterIndex === 1) {
    [-0.32, -0.16, 0, 0.16, 0.32].forEach((spread) => add(Math.PI + spread, 255, 6));
  }
  if (chapterIndex === 2) {
    add(targetAngle, 310, 8);
    add(Math.PI - 0.55, 260, 8);
    if (boss.phase === 2) add(Math.PI + 0.55, 260, 8);
  }
  if (chapterIndex === 3) {
    [-0.42, -0.2, 0, 0.2, 0.42].forEach((spread) => add(Math.PI + spread, 285, 7));
    shots.push({ x: boss.x - 8, y: ground - 20, vx: -350, vy: 0, r: 13, owner: "boss" });
  }
  if (chapterIndex === 4) {
    const count = boss.phase === 2 ? 7 : 5;
    for (let i = 0; i < count; i += 1) add(Math.PI - 0.55 + i * (1.1 / (count - 1)), 300 + i * 14, i % 2 ? 7 : 10);
  }
}

function getTelegraphMessage(chapterIndex: number, boss: string) {
  return [
    `${boss} lowers its head before a charge or stomp.`,
    `${boss} shifts perch and prepares an aerial fan.`,
    `${boss} dives through the creek for a ricochet shot.`,
    `${boss} paws the ridge before controlling the arena.`,
    `${boss} gathers force for a heavy final pattern.`,
  ][chapterIndex];
}

function drawLowPolyTrees(ctx: CanvasRenderingContext2D, chapterIndex: number) {
  const greens = [
    ["#5fc76b", "#43a85a", "#2e7e4c"],
    ["#74cc70", "#4aa95b", "#2d7048"],
    ["#55bc77", "#319b64", "#1e704e"],
  ];
  for (let layer = 0; layer < 3; layer += 1) {
    const palette = greens[layer];
    for (let i = 0; i < 15; i += 1) {
      const x = ((i * 83 + layer * 41 + chapterIndex * 29) % 850) - 30;
      const y = 90 + layer * 44 + ((i * 17) % 50);
      const size = 54 + ((i + chapterIndex + layer) % 5) * 12;
      ctx.fillStyle = "rgba(42, 75, 45, 0.35)";
      ctx.fillRect(x + size * 0.42, y + size * 1.02, size * 0.16, size * 0.42);
      ctx.fillStyle = palette[2];
      triangle(ctx, x, y + size * 0.86, size * 0.55, size * 0.74);
      ctx.fillStyle = palette[1];
      triangle(ctx, x + size * 0.04, y + size * 0.45, size * 0.48, size * 0.65);
      ctx.fillStyle = palette[0];
      triangle(ctx, x + size * 0.1, y + size * 0.12, size * 0.4, size * 0.52);
    }
  }
}

function triangle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}
