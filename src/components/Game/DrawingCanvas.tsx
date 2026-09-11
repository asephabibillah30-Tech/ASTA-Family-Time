import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pencil, Paintbrush, Eraser, PaintBucket, RotateCcw, Trash2, Smile } from 'lucide-react';
import { sound } from '../../utils/sound';

export type ToolType = 'pencil' | 'brush' | 'eraser' | 'bucket' | 'stamp';

interface DrawingCanvasProps {
  isReadOnly?: boolean;
  onCanvasChange?: (dataUrl: string) => void;
  width?: number;
  height?: number;
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [selectedStamp, setSelectedStamp] = useState<string>('⭐');
  const [color, setColor] = useState<string>('#3B82F6');
  const [lineWidth, setLineWidth] = useState<number>(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);

  // Initialize canvas background to solid white
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Save initial blank state
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack([initialData]);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

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
    <div className="w-full flex flex-col md:flex-row items-stretch gap-4 select-none">
      
      {/* 1. DRAWING TOOLBAR (Left side on Desktop, Top/Bottom on Mobile) */}
      {!isReadOnly && (
        <div className="bg-amber-100/90 dark:bg-slate-800/90 p-3 rounded-3xl border-3 border-amber-300 dark:border-slate-700 shadow-bubbly-amber flex flex-row md:flex-col items-center justify-between gap-3 shrink-0">
          
          {/* Main Drawing Tools */}
          <div className="flex flex-row md:flex-col items-center gap-2">
            {/* Pencil */}
            <button
              onClick={() => {
                setActiveTool('pencil');
                sound.playClick();
              }}
              className={`p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'pencil'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-amber-50'
              }`}
              title="Pensil (Garis Halus)"
            >
              <Pencil className="w-5 h-5" />
            </button>

            {/* Brush */}
            <button
              onClick={() => {
                setActiveTool('brush');
                sound.playClick();
              }}
              className={`p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'brush'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-amber-50'
              }`}
              title="Kuas (Garis Tebal)"
            >
              <Paintbrush className="w-5 h-5" />
            </button>

            {/* Eraser */}
            <button
              onClick={() => {
                setActiveTool('eraser');
                sound.playClick();
              }}
              className={`p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'eraser'
                  ? 'bg-rose-400 text-white border-rose-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-rose-50'
              }`}
              title="Penghapus"
            >
              <Eraser className="w-5 h-5" />
            </button>

            {/* Bucket */}
            <button
              onClick={() => {
                setActiveTool('bucket');
                sound.playClick();
              }}
              className={`p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'bucket'
                  ? 'bg-sky-400 text-slate-900 border-sky-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-sky-50'
              }`}
              title="Ember Cat (Isi Warna)"
            >
              <PaintBucket className="w-5 h-5" />
            </button>

            {/* Stamp Tool */}
            <button
              onClick={() => {
                setActiveTool('stamp');
                sound.playClick();
              }}
              className={`p-2.5 rounded-2xl transition-all active:scale-90 border-2 ${
                activeTool === 'stamp'
                  ? 'bg-purple-400 text-slate-900 border-purple-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-purple-50'
              }`}
              title="Stempel Emoji / Stiker"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Stamp Selector when active */}
          {activeTool === 'stamp' && (
            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto p-1 bg-white/80 dark:bg-slate-700 rounded-2xl border border-purple-300">
              {EMOJI_STAMPS.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedStamp(s);
                    sound.playClick();
                  }}
                  className={`text-lg p-1 rounded-xl transition-all ${selectedStamp === s ? 'bg-purple-200 dark:bg-purple-900 scale-110' : 'hover:bg-slate-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="h-px md:h-auto w-full md:w-px bg-amber-300 dark:bg-slate-700 my-1 hidden md:block" />

          {/* Line Width Slider */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-amber-900 dark:text-amber-300 hidden md:block">
              UKURAN
            </span>
            <input
              type="range"
              min="2"
              max="32"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 md:w-20 accent-amber-500 cursor-pointer"
              title={`Ukuran Kuas: ${lineWidth}px`}
            />
            <div
              className="rounded-full bg-slate-800 dark:bg-white transition-all hidden md:block"
              style={{ width: `${Math.max(4, lineWidth)}px`, height: `${Math.max(4, lineWidth)}px` }}
            />
          </div>

          <div className="h-px md:h-auto w-full md:w-px bg-amber-300 dark:bg-slate-700 my-1 hidden md:block" />

          {/* Color Palette Grid */}
          <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5 max-w-[120px] md:max-w-none overflow-x-auto md:overflow-visible">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (activeTool === 'eraser') setActiveTool('brush');
                  sound.playClick();
                }}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl border-2 transition-transform active:scale-90 ${
                  color === c && activeTool !== 'eraser'
                    ? 'scale-115 border-slate-900 dark:border-white shadow-md ring-2 ring-amber-400'
                    : 'border-white/80 dark:border-slate-700 shadow-2xs hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                title={`Pilih Warna ${c}`}
              />
            ))}
          </div>

          <div className="h-px md:h-auto w-full md:w-px bg-amber-300 dark:bg-slate-700 my-1 hidden md:block" />

          {/* Action Buttons: Undo & Clear */}
          <div className="flex flex-row md:flex-col items-center gap-1.5">
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
      <div className="flex-1 bg-slate-900 p-2 sm:p-4 rounded-3xl md:rounded-[36px] shadow-2xl border-4 border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Tablet Front Camera Dot */}
        <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 absolute top-2 left-1/2 -translate-x-1/2 hidden sm:block" />

        {/* Canvas Surface */}
        <div className="w-full bg-white rounded-2xl overflow-hidden shadow-inner flex items-center justify-center relative touch-none">
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
            className={`w-full h-auto aspect-[4/3] sm:aspect-[16/10] object-contain ${
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
  );
};
