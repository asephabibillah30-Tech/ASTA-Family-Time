import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pencil, Paintbrush, Eraser, PaintBucket, RotateCcw, Trash2, Smile, Image as ImageIcon } from 'lucide-react';
import { sound } from '../../utils/sound';

export type ToolType = 'pencil' | 'brush' | 'eraser' | 'bucket' | 'stamp';

export interface SketchTemplate {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

export const SKETCH_TEMPLATES: SketchTemplate[] = [
  { id: 'house', name: 'Rumah & Gunung', emoji: '🏠', category: 'Bangunan' },
  { id: 'cat', name: 'Kucing Lucu', emoji: '🐈', category: 'Hewan' },
  { id: 'cake', name: 'Kue Ulang Tahun', emoji: '🎂', category: 'Makanan' },
  { id: 'car', name: 'Mobil Balap', emoji: '🚗', category: 'Kendaraan' },
  { id: 'ice_cream', name: 'Es Krim', emoji: '🍦', category: 'Makanan' },
  { id: 'flower', name: 'Bunga Indah', emoji: '🌸', category: 'Alam' },
  { id: 'rocket', name: 'Roket Angkasa', emoji: '🚀', category: 'Kendaraan' },
  { id: 'boat', name: 'Perahu Layar', emoji: '⛵', category: 'Kendaraan' },
  { id: 'butterfly', name: 'Kupu-Kupu', emoji: '🦋', category: 'Hewan' },
  { id: 'fish', name: 'Ikan Laut', emoji: '🐟', category: 'Hewan' },
];

interface DrawingCanvasProps {
  isReadOnly?: boolean;
  onCanvasChange?: (dataUrl: string) => void;
  width?: number;
  height?: number;
  initialSketchId?: string | null;
}

const COLOR_PALETTE = [
  '#000000', '#FFFFFF', '#64748B', '#EF4444',
  '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#84CC16', '#A855F7', '#78350F', '#0284C7',
];

const EMOJI_STAMPS = ['⭐', '❤️', '🌸', '👑', '😃', '🚗', '🍦', '🎈'];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isReadOnly = false,
  onCanvasChange,
  width = 800,
  height = 550,
  initialSketchId = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('bucket');
  const [selectedStamp, setSelectedStamp] = useState<string>('⭐');
  const [activeSketchId, setActiveSketchId] = useState<string | null>(initialSketchId);
  const [color, setColor] = useState<string>('#EF4444');
  const [lineWidth, setLineWidth] = useState<number>(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);

  // Draw crisp vector sketch outlines
  const drawSketchOutline = useCallback((ctx: CanvasRenderingContext2D, sketchId: string) => {
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (sketchId) {
      case 'house': {
        // Sun
        ctx.beginPath(); ctx.arc(700, 100, 45, 0, Math.PI * 2); ctx.stroke();
        for (let a = 0; a < 360; a += 45) {
          const rad = (a * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(700 + Math.cos(rad) * 55, 100 + Math.sin(rad) * 55);
          ctx.lineTo(700 + Math.cos(rad) * 70, 100 + Math.sin(rad) * 70);
          ctx.stroke();
        }
        // Mountains
        ctx.beginPath(); ctx.moveTo(50, 420); ctx.lineTo(250, 180); ctx.lineTo(450, 420); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(350, 420); ctx.lineTo(550, 220); ctx.lineTo(750, 420); ctx.stroke();
        // Snow caps
        ctx.beginPath(); ctx.moveTo(210, 228); ctx.lineTo(250, 260); ctx.lineTo(290, 228); ctx.stroke();
        // House Body
        ctx.beginPath(); ctx.rect(260, 260, 280, 180); ctx.stroke();
        // Roof
        ctx.beginPath(); ctx.moveTo(230, 260); ctx.lineTo(400, 140); ctx.lineTo(570, 260); ctx.closePath(); ctx.stroke();
        // Door & knob
        ctx.beginPath(); ctx.rect(370, 340, 60, 100); ctx.stroke();
        ctx.beginPath(); ctx.arc(420, 390, 5, 0, Math.PI * 2); ctx.stroke();
        // Windows
        ctx.beginPath(); ctx.rect(290, 300, 55, 55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(317.5, 300); ctx.lineTo(317.5, 355); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(290, 327.5); ctx.lineTo(345, 327.5); ctx.stroke();
        ctx.beginPath(); ctx.rect(455, 300, 55, 55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(482.5, 300); ctx.lineTo(482.5, 355); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(455, 327.5); ctx.lineTo(510, 327.5); ctx.stroke();
        // Ground line
        ctx.beginPath(); ctx.moveTo(0, 440); ctx.lineTo(800, 440); ctx.stroke();
        break;
      }
      case 'cat': {
        // Head
        ctx.beginPath(); ctx.arc(400, 200, 100, 0, Math.PI * 2); ctx.stroke();
        // Ears
        ctx.beginPath(); ctx.moveTo(325, 135); ctx.lineTo(280, 40); ctx.lineTo(365, 110); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(475, 135); ctx.lineTo(520, 40); ctx.lineTo(435, 110); ctx.stroke();
        // Eyes
        ctx.beginPath(); ctx.ellipse(360, 185, 14, 20, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(440, 185, 14, 20, 0, 0, Math.PI * 2); ctx.stroke();
        // Nose & Mouth
        ctx.beginPath(); ctx.moveTo(392, 215); ctx.lineTo(408, 215); ctx.lineTo(400, 226); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.arc(389, 232, 11, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(411, 232, 11, 0, Math.PI); ctx.stroke();
        // Whiskers
        ctx.beginPath(); ctx.moveTo(270, 205); ctx.lineTo(340, 212); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(260, 225); ctx.lineTo(340, 222); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(530, 205); ctx.lineTo(460, 212); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(540, 225); ctx.lineTo(460, 222); ctx.stroke();
        // Body
        ctx.beginPath(); ctx.ellipse(400, 370, 110, 85, 0, 0, Math.PI * 2); ctx.stroke();
        // Paws
        ctx.beginPath(); ctx.arc(350, 445, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(450, 445, 24, 0, Math.PI * 2); ctx.stroke();
        // Tail
        ctx.beginPath(); ctx.moveTo(505, 395); ctx.quadraticCurveTo(610, 410, 590, 310); ctx.stroke();
        break;
      }
      case 'cake': {
        // Plate
        ctx.beginPath(); ctx.ellipse(400, 440, 260, 30, 0, 0, Math.PI * 2); ctx.stroke();
        // Bottom tier
        ctx.beginPath(); ctx.rect(200, 300, 400, 130); ctx.stroke();
        // Frosting drips bottom
        ctx.beginPath();
        for (let x = 200; x < 600; x += 40) {
          ctx.arc(x + 20, 300, 20, 0, Math.PI);
        }
        ctx.stroke();
        // Top tier
        ctx.beginPath(); ctx.rect(270, 170, 260, 130); ctx.stroke();
        // Frosting drips top
        ctx.beginPath();
        for (let x = 270; x < 530; x += 32.5) {
          ctx.arc(x + 16.25, 170, 16.25, 0, Math.PI);
        }
        ctx.stroke();
        // Candles
        [330, 400, 470].forEach((cx) => {
          ctx.beginPath(); ctx.rect(cx - 10, 90, 20, 80); ctx.stroke();
          // Flame
          ctx.beginPath(); ctx.ellipse(cx, 70, 8, 15, 0, 0, Math.PI * 2); ctx.stroke();
        });
        break;
      }
      case 'car': {
        // Body
        ctx.beginPath();
        ctx.moveTo(120, 340);
        ctx.lineTo(150, 260);
        ctx.lineTo(260, 260);
        ctx.lineTo(340, 160);
        ctx.lineTo(540, 160);
        ctx.lineTo(620, 260);
        ctx.lineTo(700, 270);
        ctx.lineTo(720, 340);
        ctx.closePath();
        ctx.stroke();
        // Wheels
        ctx.beginPath(); ctx.arc(240, 350, 48, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(240, 350, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(580, 350, 48, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(580, 350, 24, 0, Math.PI * 2); ctx.stroke();
        // Windows
        ctx.beginPath(); ctx.moveTo(355, 175); ctx.lineTo(430, 175); ctx.lineTo(430, 250); ctx.lineTo(285, 250); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(445, 175); ctx.lineTo(525, 175); ctx.lineTo(595, 250); ctx.lineTo(445, 250); ctx.closePath(); ctx.stroke();
        // Headlight
        ctx.beginPath(); ctx.arc(705, 300, 14, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'ice_cream': {
        // Cone
        ctx.beginPath(); ctx.moveTo(300, 240); ctx.lineTo(400, 490); ctx.lineTo(500, 240); ctx.closePath(); ctx.stroke();
        for (let i = 1; i <= 5; i++) {
          ctx.beginPath(); ctx.moveTo(300 + i * 16, 240 + i * 40); ctx.lineTo(500 - i * 16, 240 + i * 40); ctx.stroke();
        }
        // Scoops
        ctx.beginPath(); ctx.arc(400, 220, 85, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 140, 75, 0, Math.PI * 2); ctx.stroke();
        // Cherry
        ctx.beginPath(); ctx.arc(400, 50, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(400, 30); ctx.quadraticCurveTo(430, 10, 440, 25); ctx.stroke();
        break;
      }
      case 'flower': {
        // Center
        ctx.beginPath(); ctx.arc(400, 190, 48, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const px = 400 + Math.cos(angle) * 105;
          const py = 190 + Math.sin(angle) * 105;
          ctx.beginPath(); ctx.arc(px, py, 52, 0, Math.PI * 2); ctx.stroke();
        }
        // Stem
        ctx.beginPath(); ctx.moveTo(400, 240); ctx.lineTo(400, 470); ctx.stroke();
        // Leaf Left
        ctx.beginPath(); ctx.moveTo(400, 350); ctx.quadraticCurveTo(300, 320, 320, 380); ctx.quadraticCurveTo(360, 390, 400, 350); ctx.stroke();
        // Leaf Right
        ctx.beginPath(); ctx.moveTo(400, 380); ctx.quadraticCurveTo(500, 350, 480, 410); ctx.quadraticCurveTo(440, 420, 400, 380); ctx.stroke();
        break;
      }
      case 'rocket': {
        // Body
        ctx.beginPath(); ctx.moveTo(400, 50); ctx.quadraticCurveTo(480, 150, 480, 350); ctx.lineTo(320, 350); ctx.quadraticCurveTo(320, 150, 400, 50); ctx.stroke();
        // Window
        ctx.beginPath(); ctx.arc(400, 200, 42, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 200, 28, 0, Math.PI * 2); ctx.stroke();
        // Fins
        ctx.beginPath(); ctx.moveTo(320, 290); ctx.lineTo(240, 390); ctx.lineTo(320, 370); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(480, 290); ctx.lineTo(560, 390); ctx.lineTo(480, 370); ctx.closePath(); ctx.stroke();
        // Nozzle & Flame
        ctx.beginPath(); ctx.rect(360, 350, 80, 25); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(360, 375); ctx.lineTo(400, 470); ctx.lineTo(440, 375); ctx.closePath(); ctx.stroke();
        break;
      }
      case 'boat': {
        // Waves
        ctx.beginPath();
        for (let x = 0; x < 800; x += 80) {
          ctx.arc(x + 40, 420, 40, 0, Math.PI);
        }
        ctx.stroke();
        // Hull
        ctx.beginPath(); ctx.moveTo(180, 330); ctx.lineTo(240, 420); ctx.lineTo(580, 420); ctx.lineTo(660, 330); ctx.closePath(); ctx.stroke();
        // Mast
        ctx.beginPath(); ctx.moveTo(400, 330); ctx.lineTo(400, 70); ctx.stroke();
        // Sails
        ctx.beginPath(); ctx.moveTo(410, 85); ctx.lineTo(600, 310); ctx.lineTo(410, 310); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(390, 110); ctx.lineTo(240, 310); ctx.lineTo(390, 310); ctx.closePath(); ctx.stroke();
        break;
      }
      case 'butterfly': {
        // Body
        ctx.beginPath(); ctx.ellipse(400, 250, 16, 115, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 115, 20, 0, Math.PI * 2); ctx.stroke();
        // Antennae
        ctx.beginPath(); ctx.moveTo(390, 95); ctx.quadraticCurveTo(340, 35, 320, 55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(410, 95); ctx.quadraticCurveTo(460, 35, 480, 55); ctx.stroke();
        // Wings Left
        ctx.beginPath(); ctx.moveTo(385, 175); ctx.quadraticCurveTo(160, 35, 180, 240); ctx.quadraticCurveTo(240, 310, 385, 260); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(385, 270); ctx.quadraticCurveTo(220, 320, 260, 430); ctx.quadraticCurveTo(350, 420, 385, 330); ctx.stroke();
        // Wings Right
        ctx.beginPath(); ctx.moveTo(415, 175); ctx.quadraticCurveTo(640, 35, 620, 240); ctx.quadraticCurveTo(560, 310, 415, 260); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(415, 270); ctx.quadraticCurveTo(580, 320, 540, 430); ctx.quadraticCurveTo(450, 420, 415, 330); ctx.stroke();
        break;
      }
      case 'fish': {
        // Body
        ctx.beginPath(); ctx.ellipse(380, 250, 175, 105, 0, 0, Math.PI * 2); ctx.stroke();
        // Tail
        ctx.beginPath(); ctx.moveTo(555, 250); ctx.lineTo(685, 150); ctx.lineTo(645, 250); ctx.lineTo(685, 350); ctx.closePath(); ctx.stroke();
        // Eye
        ctx.beginPath(); ctx.arc(270, 210, 17, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(270, 210, 7, 0, Math.PI * 2); ctx.stroke();
        // Gills
        ctx.beginPath(); ctx.arc(310, 250, 58, -Math.PI / 3, Math.PI / 3); ctx.stroke();
        // Bubbles
        ctx.beginPath(); ctx.arc(150, 170, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(120, 110, 20, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      default:
        break;
    }
  }, []);

  // Initialize canvas background & draw active sketch outline if any
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeSketchId) {
      drawSketchOutline(ctx, activeSketchId);
    }

    // Save initial state
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack([initialData]);
  }, [activeSketchId, drawSketchOutline]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const loadSketchTemplate = (sketchId: string | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    sound.playClick();
    setActiveSketchId(sketchId);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (sketchId) {
      drawSketchOutline(ctx, sketchId);
    }

    saveCanvasState();
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-15), data]); // Max 15 undo steps

    if (onCanvasChange) {
      onCanvasChange(canvas.toDataURL());
    }
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    sound.playClick();
    const newStack = [...undoStack];
    newStack.pop(); // Remove current state
    const previousState = newStack[newStack.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setUndoStack(newStack);
      if (onCanvasChange) {
        onCanvasChange(canvas.toDataURL());
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    sound.playClick();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  // Flood Fill Algorithm for Paint Bucket Tool
  const floodFill = (startX: number, startY: number, fillColorHex: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Convert hex color to RGBA
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.fillStyle = fillColorHex;
    tempCtx.fillRect(0, 0, 1, 1);
    const fillRgb = tempCtx.getImageData(0, 0, 1, 1).data;

    const targetIdx = (startY * canvas.width + startX) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];
    const targetA = data[targetIdx + 3];

    // If target color is same as fill color, return
    if (
      targetR === fillRgb[0] &&
      targetG === fillRgb[1] &&
      targetB === fillRgb[2] &&
      targetA === fillRgb[3]
    ) {
      return;
    }

    const pixelStack: [number, number][] = [[startX, startY]];
    const width = canvas.width;
    const height = canvas.height;

    const matchTargetColor = (idx: number) => {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Tolerance range for anti-aliased borders
      return (
        Math.abs(r - targetR) < 30 &&
        Math.abs(g - targetG) < 30 &&
        Math.abs(b - targetB) < 30 &&
        Math.abs(a - targetA) < 30
      );
    };

    const colorPixel = (idx: number) => {
      data[idx] = fillRgb[0];
      data[idx + 1] = fillRgb[1];
      data[idx + 2] = fillRgb[2];
      data[idx + 3] = 255;
    };

    while (pixelStack.length > 0) {
      const popVal = pixelStack.pop();
      if (!popVal) break;
      let [x, y] = popVal;
      let pixelPos = (y * width + x) * 4;

      while (y >= 0 && matchTargetColor(pixelPos)) {
        y--;
        pixelPos -= width * 4;
      }

      pixelPos += width * 4;
      y++;

      let reachLeft = false;
      let reachRight = false;

      while (y < height && matchTargetColor(pixelPos)) {
        colorPixel(pixelPos);

        if (x > 0) {
          if (matchTargetColor(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < width - 1) {
          if (matchTargetColor(pixelPos + 4)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        y++;
        pixelPos += width * 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    saveCanvasState();
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly) return;
    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'stamp') {
      sound.playClick();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = `${Math.max(28, lineWidth * 3.5)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      saveCanvasState();
      return;
    }

    if (activeTool === 'bucket') {
      sound.playClick();
      floodFill(x, y, color);
      return;
    }

    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = lineWidth * 2.5;
    } else if (activeTool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, lineWidth / 2);
    } else {
      // brush
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isReadOnly || activeTool === 'bucket' || activeTool === 'stamp') return;
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    saveCanvasState();
  };

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      
      {/* 0. SKETCH SELECTION TEMPLATE BAR */}
      {!isReadOnly && (
        <div className="w-full bg-gradient-to-r from-amber-100 via-rose-100 to-indigo-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border-2 border-amber-300 dark:border-slate-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
              <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="uppercase tracking-wider">PILIH SKETSA GAMBAR (TINGGAL MEWARNAI):</span>
            </div>
            {activeSketchId && (
              <button
                onClick={() => loadSketchTemplate(null)}
                className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
              >
                <span>Hapus Sketsa (Kanvas Polos)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
            <button
              onClick={() => loadSketchTemplate(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 border transition-all active:scale-95 flex items-center gap-1 ${
                !activeSketchId
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-amber-50'
              }`}
            >
              <span>📄 Polos (Bebas)</span>
            </button>
            {SKETCH_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => loadSketchTemplate(tmpl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 border transition-all active:scale-95 flex items-center gap-1.5 ${
                  activeSketchId === tmpl.id
                    ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-md scale-105 ring-2 ring-amber-300'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-amber-50'
                }`}
              >
                <span className="text-sm">{tmpl.emoji}</span>
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Drawing Viewport */}
      <div className="w-full flex flex-col sm:flex-row md:flex-row items-stretch gap-2 sm:gap-3 h-full min-h-0 overflow-hidden">
      
      {/* 1. DRAWING TOOLBAR (Left side on Landscape/Desktop, Scrollable Bar on Portrait Mobile) */}
      {!isReadOnly && (
        <div className="w-full sm:w-auto md:w-auto bg-amber-100/90 dark:bg-slate-800/90 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-300 dark:border-slate-700 shadow-bubbly-amber flex flex-row sm:flex-col md:flex-col items-center justify-between gap-2 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-full touch-pan-x sm:touch-pan-y">
          
          {/* Main Drawing Tools */}
          <div className="flex flex-row sm:flex-col md:flex-col items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Pencil */}
            <button
              onClick={() => {
                setActiveTool('pencil');
                sound.playClick();
              }}
              className={`p-2 sm:p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'pencil'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-amber-50'
              }`}
              title="Pensil (Garis Halus)"
            >
              <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Brush */}
            <button
              onClick={() => {
                setActiveTool('brush');
                sound.playClick();
              }}
              className={`p-2 sm:p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'brush'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-amber-50'
              }`}
              title="Kuas (Garis Tebal)"
            >
              <Paintbrush className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Eraser */}
            <button
              onClick={() => {
                setActiveTool('eraser');
                sound.playClick();
              }}
              className={`p-2 sm:p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'eraser'
                  ? 'bg-rose-400 text-white border-rose-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-rose-50'
              }`}
              title="Penghapus"
            >
              <Eraser className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Bucket */}
            <button
              onClick={() => {
                setActiveTool('bucket');
                sound.playClick();
              }}
              className={`p-2 sm:p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'bucket'
                  ? 'bg-sky-400 text-slate-900 border-sky-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-sky-50'
              }`}
              title="Ember Cat (Isi Warna)"
            >
              <PaintBucket className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Stamp Tool */}
            <button
              onClick={() => {
                setActiveTool('stamp');
                sound.playClick();
              }}
              className={`p-2 sm:p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'stamp'
                  ? 'bg-purple-400 text-slate-900 border-purple-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-purple-50'
              }`}
              title="Stempel Emoji / Stiker"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Stamp Selector when active */}
          {activeTool === 'stamp' && (
            <div className="flex flex-row sm:flex-col md:flex-col gap-1 overflow-x-auto sm:overflow-y-auto p-1 bg-white/80 dark:bg-slate-700 rounded-2xl border border-purple-300 shrink-0 max-h-32 sm:max-h-40">
              {EMOJI_STAMPS.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedStamp(s);
                    sound.playClick();
                  }}
                  className={`text-base sm:text-lg p-1 rounded-xl transition-all ${selectedStamp === s ? 'bg-purple-200 dark:bg-purple-900 scale-110' : 'hover:bg-slate-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="h-px sm:h-auto w-full sm:w-px bg-amber-300 dark:bg-slate-700 my-1 hidden sm:block" />

          {/* Line Width Slider */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-[10px] font-black text-amber-900 dark:text-amber-300 hidden sm:block">
              UKURAN
            </span>
            <input
              type="range"
              min="2"
              max="32"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-14 sm:w-16 md:w-20 accent-amber-500 cursor-pointer"
              title={`Ukuran Kuas: ${lineWidth}px`}
            />
            <div
              className="rounded-full bg-slate-800 dark:bg-white transition-all hidden sm:block"
              style={{ width: `${Math.max(4, lineWidth)}px`, height: `${Math.max(4, lineWidth)}px` }}
            />
          </div>

          <div className="h-px sm:h-auto w-full sm:w-px bg-amber-300 dark:bg-slate-700 my-1 hidden sm:block" />

          {/* Color Palette Grid */}
          <div className="grid grid-flow-col grid-rows-2 sm:grid-flow-row sm:grid-cols-2 gap-1 sm:gap-1.5 shrink-0 max-w-full overflow-x-auto sm:overflow-y-auto max-h-36">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (activeTool === 'eraser') setActiveTool('brush');
                  sound.playClick();
                }}
                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-xl border-2 transition-transform active:scale-90 ${
                  color === c && activeTool !== 'eraser'
                    ? 'scale-115 border-slate-900 dark:border-white shadow-md ring-2 ring-amber-400'
                    : 'border-white/80 dark:border-slate-700 shadow-2xs hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                title={`Pilih Warna ${c}`}
              />
            ))}
          </div>

          <div className="h-px sm:h-auto w-full sm:w-px bg-amber-300 dark:bg-slate-700 my-1 hidden sm:block" />

          {/* Action Buttons: Undo & Clear */}
          <div className="flex flex-row sm:flex-col md:flex-col items-center gap-1.5 shrink-0">
            <button
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-2 rounded-2xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 disabled:opacity-40 active:scale-90 transition-all shadow-2xs"
              title="Batalkan (Undo)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white border border-rose-600 active:scale-90 transition-all shadow-2xs"
              title="Hapus Semua Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 2. TABLET FRAME CANVAS (Center Viewport) */}
      <div className="flex-1 bg-slate-900 p-1.5 sm:p-3 rounded-2xl sm:rounded-3xl md:rounded-[36px] shadow-2xl border-4 border-slate-800 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-0">
        
        {/* Tablet Front Camera Dot */}
        <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 absolute top-2 left-1/2 -translate-x-1/2 hidden sm:block" />

        {/* Canvas Surface */}
        <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-inner flex items-center justify-center relative touch-none">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`w-full h-full object-contain aspect-[16/9] sm:aspect-[16/10] ${
              isReadOnly ? 'cursor-default' : activeTool === 'bucket' ? 'cursor-cell' : 'cursor-crosshair'
            }`}
          />

          {isReadOnly && (
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-300 font-extrabold text-[11px] px-3 py-1 rounded-full shadow-md border border-amber-400/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Memantau Lukisan...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
