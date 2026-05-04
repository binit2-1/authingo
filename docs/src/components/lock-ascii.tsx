"use client";

import React, { useEffect, useRef } from "react";

export default function AsciiLock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!container || !canvas || !img) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Configuration
    let CELL_SIZE = 8;
    let CELL_GAP = 2;
    let CELL_STEP = CELL_SIZE + CELL_GAP;
    
    const CHAR_COLOR = "#0763EE"; // The lock color
    
    const ASCII_CHARS = ".:-*#%@O0&9";
    const THRESHOLD = 0.5;
    const PUSH_RADIUS = 5;
    const PUSH_FORCE = 30;
    const SPRING = 0.025;
    const DAMPING = 0.5;

    let cols = 0;
    let rows = 0;
    let cells: any[] = [];
    let animationFrameId: number;
    let intervalId: NodeJS.Timeout;
    const mouse = { col: -999, row: -999, isMoving: false };
    let idleTimer: NodeJS.Timeout;

    const setupCanvas = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      CELL_SIZE = width < 768 ? 4 : 8;
      CELL_GAP = width < 768 ? 1 : 2;
      CELL_STEP = CELL_SIZE + CELL_GAP;

      cols = Math.floor(width / CELL_STEP);
      rows = Math.floor(height / CELL_STEP);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const sampleLogoIntoCells = () => {
      const imgRect = img.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const logoCols = Math.ceil(imgRect.width / CELL_STEP);
      const logoRows = Math.ceil(imgRect.height / CELL_STEP);

      if (logoCols <= 0 || logoRows <= 0) return;

      const startCol = Math.floor((imgRect.left - containerRect.left) / CELL_STEP);
      const startRow = Math.floor((imgRect.top - containerRect.top) / CELL_STEP);

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = logoCols;
      sampleCanvas.height = logoRows;

      const sampleCtx = sampleCanvas.getContext("2d");
      if (!sampleCtx) return;

      sampleCtx.fillStyle = "#000";
      sampleCtx.fillRect(0, 0, logoCols, logoRows);
      sampleCtx.drawImage(img, 0, 0, logoCols, logoRows);

      const { data } = sampleCtx.getImageData(0, 0, logoCols, logoRows);
      cells = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const inLogo =
            col >= startCol &&
            col < startCol + logoCols &&
            row >= startRow &&
            row < startRow + logoRows;

          let isLit = false;
          let char = "";

          if (inLogo) {
            const idx = ((row - startRow) * logoCols + (col - startCol)) * 4;
            const brightness =
              (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;

            isLit = brightness > THRESHOLD;
            char = isLit
              ? ASCII_CHARS[
                  Math.min(ASCII_CHARS.length - 1, Math.floor(brightness * ASCII_CHARS.length))
                ]
              : "";
          }

          cells.push({
            col,
            row,
            char,
            isLit,
            offsetX: 0,
            offsetY: 0,
            velX: 0,
            velY: 0,
          });
        }
      }
    };

    const renderFrame = () => {
      ctx.font = `${CELL_SIZE * 2}px monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);

      // Grid background render loop has been removed completely

      ctx.fillStyle = CHAR_COLOR;
      for (const { col, row, char, isLit, offsetX, offsetY } of cells) {
        if (!isLit) continue;

        const x = (col + Math.round(offsetX)) * CELL_STEP;
        const y = (row + Math.round(offsetY)) * CELL_STEP;
        ctx.fillText(char, x + CELL_SIZE / 2, y);
      }
    };

    const init = () => {
      setupCanvas();
      sampleLogoIntoCells();
      renderFrame();
    };

    const updatePhysics = () => {
      for (const cell of cells) {
        if (!cell.isLit) continue;

        if (mouse.isMoving) {
          const dx = cell.col + cell.offsetX - mouse.col;
          const dy = cell.row + cell.offsetY - mouse.row;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < PUSH_RADIUS && dist > 0) {
            const force = (1 - dist / PUSH_RADIUS) ** 2 * PUSH_FORCE;
            cell.velX += (dx / dist) * force;
            cell.velY += (dy / dist) * force;
          }
        }

        cell.velX += -cell.offsetX * SPRING;
        cell.velY += -cell.offsetY * SPRING;
        cell.velX *= DAMPING;
        cell.velY *= DAMPING;

        cell.offsetX += cell.velX;
        cell.offsetY += cell.velY;

        if (Math.abs(cell.offsetX) < 0.01 && Math.abs(cell.velX) < 0.01) {
          cell.offsetX = 0;
          cell.velX = 0;
        }
        if (Math.abs(cell.offsetY) < 0.01 && Math.abs(cell.velY) < 0.01) {
          cell.offsetY = 0;
          cell.velY = 0;
        }
      }
    };

    const animationLoop = () => {
      updatePhysics();
      renderFrame();
      animationFrameId = requestAnimationFrame(animationLoop);
    };

    // Observers & Listeners
    const resizeObserver = new ResizeObserver(() => {
      if (img.complete) init();
    });
    resizeObserver.observe(container);

    if (img.complete) {
      init();
    } else {
      img.addEventListener("load", init);
    }

    intervalId = setInterval(() => {
      for (const cell of cells) {
        if (cell.isLit) {
          cell.char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
        }
      }
    }, 50);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.col = (e.clientX - rect.left) / CELL_STEP;
      mouse.row = (e.clientY - rect.top) / CELL_STEP;
      mouse.isMoving = true;

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        mouse.isMoving = false;
      }, 50);
    };

    const handleMouseLeave = () => {
      mouse.col = -999;
      mouse.row = -999;
      mouse.isMoving = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    animationLoop();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
      clearTimeout(idleTimer);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      img.removeEventListener("load", init);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-100 bg-transparent overflow-hidden"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 max-w-50 aspect-square pointer-events-none">
        <img
          ref={imgRef}
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z'/%3E%3C/svg%3E"
          alt="Lock Source"
          className="w-full h-full object-contain opacity-0"
        />
      </div>
    </div>
  );
}