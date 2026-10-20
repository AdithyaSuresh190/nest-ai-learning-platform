import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Card';
import { Trash2, Download, Undo2 } from 'lucide-react';

interface DrawingCanvasProps {
  brushColor: string;
}

interface Stroke {
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

const brushColors = [
  '#65cd7c', '#36a9f6', '#b48eff', '#fc9358', '#ffd93b',
  '#f472b6', '#2dd4bf', '#a78bfa', '#fb923c', '#94a3b8',
];

export function DrawingCanvas({ brushColor }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(6);
  const [currentColor, setCurrentColor] = useState(brushColor);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  const currentStrokeRef = useRef<Stroke | null>(null);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  useEffect(() => {
    const handleResize = () => {
      // Save current strokes, re-setup, then redraw
      const savedStrokes = [...strokes];
      setupCanvas();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      for (const stroke of savedStrokes) {
        drawStroke(ctx, stroke);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [strokes, setupCanvas]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 0) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    if (stroke.points.length === 1) {
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.color;
      ctx.fill();
    }
    ctx.stroke();
  };

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getPointerPos(e);
    const stroke: Stroke = { color: currentColor, size: brushSize, points: [pos] };
    currentStrokeRef.current = stroke;
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    currentStrokeRef.current.points.push(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const points = currentStrokeRef.current.points;
    if (points.length >= 2) {
      ctx.strokeStyle = currentStrokeRef.current.color;
      ctx.lineWidth = currentStrokeRef.current.size;
      ctx.beginPath();
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (currentStrokeRef.current) {
      setStrokes((prev) => [...prev, currentStrokeRef.current!]);
      currentStrokeRef.current = null;
    }
    setIsDrawing(false);
  };

  const undo = () => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const remaining = prev.slice(0, -1);
      redrawAll(remaining);
      return remaining;
    });
  };

  const clear = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const redrawAll = (allStrokes: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    for (const stroke of allStrokes) {
      drawStroke(ctx, stroke);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `calmspace-art-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Color palette */}
      <div className="flex flex-wrap items-center gap-2">
        {brushColors.map((color) => (
          <button
            key={color}
            onClick={() => setCurrentColor(color)}
            className={`w-8 h-8 rounded-full transition-all border-2 ${
              currentColor === color ? 'border-gray-400 scale-110 shadow-soft' : 'border-white'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>

      {/* Brush size slider */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-500">Brush size</span>
        <input
          type="range"
          min={2}
          max={24}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1 accent-nest-green-400"
        />
        <span className="text-sm font-bold text-gray-600 w-8">{brushSize}px</span>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full h-72 rounded-2xl overflow-hidden shadow-soft border-2 border-gray-100 bg-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-crosshair"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button size="sm" variant="outline" onClick={undo} icon={<Undo2 className="w-4 h-4" />}>
          Undo
        </Button>
        <Button size="sm" variant="ghost" onClick={clear} icon={<Trash2 className="w-4 h-4" />}>
          Clear
        </Button>
        <Button size="sm" variant="success" onClick={download} icon={<Download className="w-4 h-4" />}>
          Save Artwork
        </Button>
      </div>
    </div>
  );
}
