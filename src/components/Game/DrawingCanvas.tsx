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
  { id: 'house', name: 'Rumah Minimalis 3D', emoji: '🏠', category: 'Bangunan' },
  { id: 'cat', name: 'Kucing Lucu', emoji: '🐈', category: 'Hewan' },
  { id: 'cake', name: 'Kue Ulang Tahun', emoji: '🎂', category: 'Makanan' },
  { id: 'car', name: 'Mobil Balap', emoji: '🚗', category: 'Kendaraan' },
  { id: 'ice_cream', name: 'Es Krim', emoji: '🍦', category: 'Makanan' },
  { id: 'flower', name: 'Bunga Indah', emoji: '🌸', category: 'Alam' },
  { id: 'rocket', name: 'Roket Angkasa', emoji: '🚀', category: 'Kendaraan' },
  { id: 'boat', name: 'Perahu Layar', emoji: '⛵', category: 'Kendaraan' },
  { id: 'butterfly', name: 'Kupu-Kupu', emoji: '🦋', category: 'Hewan' },
  { id: 'fish', name: 'Ikan Laut', emoji: '🐟', category: 'Hewan' },
  { id: 'giraffe', name: 'Jerapah Tinggi', emoji: '🦒', category: 'Hewan' },
  { id: 'elephant', name: 'Gajah Besar', emoji: '🐘', category: 'Hewan' },
  { id: 'turtle', name: 'Kura-Kura', emoji: '🐢', category: 'Hewan' },
  { id: 'airplane', name: 'Pesawat Terbang', emoji: '✈️', category: 'Kendaraan' },
  { id: 'bicycle', name: 'Sepeda Ceria', emoji: '🚲', category: 'Kendaraan' },
  { id: 'pizza', name: 'Pizza Keju', emoji: '🍕', category: 'Makanan' },
  { id: 'donut', name: 'Donat Manis', emoji: '🍩', category: 'Makanan' },
  { id: 'rainbow', name: 'Pelangi Indah', emoji: '🌈', category: 'Alam' },
  { id: 'sunflower', name: 'Bunga Matahari', emoji: '🌻', category: 'Tanaman' },
  { id: 'sun_cloud', name: 'Matahari & Awan', emoji: '☀️', category: 'Alam' },
  { id: 'dinosaur', name: 'Dinosaurus', emoji: '🦕', category: 'Mitos' },
  { id: 'dragon', name: 'Naga Api', emoji: '🐉', category: 'Mitos' },
  { id: 'robot', name: 'Robot AI', emoji: '🤖', category: 'Teknologi' },
  { id: 'alien_ufo', name: 'UFO Angkasa', emoji: '🛸', category: 'Angkasa' },
  { id: 'teddy_bear', name: 'Beruang Teddy', emoji: '🧸', category: 'Mainan' },
  { id: 'crown', name: 'Mahkota Raja', emoji: '👑', category: 'Benda' },
  { id: 'glasses', name: 'Kacamata', emoji: '👓', category: 'Benda' },
  { id: 'football', name: 'Bola Sepak', emoji: '⚽', category: 'Olahraga' },
  { id: 'guitar', name: 'Gitar Musik', emoji: '🎸', category: 'Musik' },
  { id: 'palm_tree', name: 'Pohon Kelapa', emoji: '🌴', category: 'Alam' },
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

  // Draw ultra-realistic 4D CAD vector sketch outlines with dynamic multi-pass drop shadow & volumetric depth
  const drawSketchOutline = useCallback((ctx: CanvasRenderingContext2D, sketchId: string) => {
    ctx.save();

    // 4D Ultra-Realistic Ambient Occlusion & Volumetric Drop Shadow Shader
    ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (sketchId) {
      case 'house': {
        // 1. Main 3D House Body Facade
        ctx.beginPath(); ctx.rect(170, 200, 330, 230); ctx.stroke(); // Main front wall
        
        // 2. 3D Side Elevation Wall (Perspective Depth)
        ctx.beginPath(); ctx.moveTo(500, 200); ctx.lineTo(650, 130); ctx.lineTo(650, 350); ctx.lineTo(500, 430); ctx.closePath(); ctx.stroke();
        
        // 3. 3D Roof Gable Front
        ctx.beginPath(); ctx.moveTo(140, 200); ctx.lineTo(335, 60); ctx.lineTo(530, 200); ctx.closePath(); ctx.stroke();
        
        // 4. 3D Side Roof Extension (Depth)
        ctx.beginPath(); ctx.moveTo(335, 60); ctx.lineTo(485, 10); ctx.lineTo(670, 130); ctx.lineTo(530, 200); ctx.stroke();
        
        // 5. 3D Chimney with Smoke Rings
        ctx.beginPath(); ctx.rect(440, 45, 45, 90); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(462.5, 45, 22.5, 7, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(480, 20, 12, 0, Math.PI * 2); ctx.stroke(); // Smoke ring 1
        ctx.beginPath(); ctx.arc(500, 0, 16, 0, Math.PI * 2); ctx.stroke();  // Smoke ring 2
        
        // 6. 3D Attic Round Window with Cross Grid
        ctx.beginPath(); ctx.arc(335, 130, 28, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(335, 130, 22, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(335, 108); ctx.lineTo(335, 152); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(313, 130); ctx.lineTo(357, 130); ctx.stroke();
        
        // 7. 3D Double Main Door & Porch Canopy
        ctx.beginPath(); ctx.rect(300, 280, 70, 150); ctx.stroke(); // Door frame
        ctx.beginPath(); ctx.moveTo(335, 280); ctx.lineTo(335, 430); ctx.stroke(); // Center split
        ctx.beginPath(); ctx.arc(325, 360, 5, 0, Math.PI * 2); ctx.stroke(); // Left handle
        ctx.beginPath(); ctx.arc(345, 360, 5, 0, Math.PI * 2); ctx.stroke(); // Right handle
        ctx.beginPath(); ctx.rect(285, 268, 100, 12); ctx.stroke(); // Canopy overhang
        ctx.beginPath(); ctx.rect(290, 280, 10, 150); ctx.stroke();  // Left porch pillar
        ctx.beginPath(); ctx.rect(370, 280, 10, 150); ctx.stroke();  // Right porch pillar
        
        // 8. 3D Windows with Glass Panes & Shutters
        // Left Window
        ctx.beginPath(); ctx.rect(200, 250, 65, 80); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(232.5, 250); ctx.lineTo(232.5, 330); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(200, 290); ctx.lineTo(265, 290); ctx.stroke();
        ctx.beginPath(); ctx.rect(195, 330, 75, 8); ctx.stroke(); // Window Sill
        ctx.beginPath(); ctx.rect(180, 250, 20, 80); ctx.stroke(); // Left shutter
        ctx.beginPath(); ctx.rect(265, 250, 20, 80); ctx.stroke(); // Right shutter
        
        // Right Window
        ctx.beginPath(); ctx.rect(405, 250, 65, 80); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(437.5, 250); ctx.lineTo(437.5, 330); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(405, 290); ctx.lineTo(470, 290); ctx.stroke();
        ctx.beginPath(); ctx.rect(400, 330, 75, 8); ctx.stroke(); // Window Sill
        ctx.beginPath(); ctx.rect(385, 250, 20, 80); ctx.stroke(); // Left shutter
        ctx.beginPath(); ctx.rect(470, 250, 20, 80); ctx.stroke(); // Right shutter
        
        // 9. 3D Side Garage Extension (Right Side)
        ctx.beginPath(); ctx.rect(500, 270, 140, 160); ctx.stroke();
        ctx.beginPath(); ctx.rect(515, 300, 110, 130); ctx.stroke(); // Garage door
        for (let y = 320; y < 430; y += 22) {
          ctx.beginPath(); ctx.moveTo(515, y); ctx.lineTo(625, y); ctx.stroke(); // Roll-up door panels
        }
        
        // 10. 3D Front Walkway & Ground Pavement Line
        ctx.beginPath(); ctx.moveTo(0, 430); ctx.lineTo(800, 430); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(300, 430); ctx.lineTo(260, 495); ctx.lineTo(410, 495); ctx.lineTo(370, 430); ctx.stroke(); // Paved pathway
        ctx.beginPath(); ctx.moveTo(280, 460); ctx.lineTo(390, 460); ctx.stroke(); // Paver line
        break;
      }
      case 'cat': {
        // Head
        ctx.beginPath(); ctx.arc(400, 200, 100, 0, Math.PI * 2); ctx.stroke();
        // 3D Ears with inner fold
        ctx.beginPath(); ctx.moveTo(325, 135); ctx.lineTo(280, 40); ctx.lineTo(365, 110); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(325, 125); ctx.lineTo(300, 65); ctx.lineTo(350, 110); ctx.stroke(); // Inner ear L
        ctx.beginPath(); ctx.moveTo(475, 135); ctx.lineTo(520, 40); ctx.lineTo(435, 110); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(475, 125); ctx.lineTo(500, 65); ctx.lineTo(450, 110); ctx.stroke(); // Inner ear R
        // 3D Eyes with pupil highlights
        ctx.beginPath(); ctx.ellipse(360, 185, 15, 22, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(362, 185, 6, 12, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(440, 185, 15, 22, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(438, 185, 6, 12, 0, 0, Math.PI * 2); ctx.stroke();
        // Nose & Muzzle
        ctx.beginPath(); ctx.moveTo(390, 215); ctx.lineTo(410, 215); ctx.lineTo(400, 228); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.arc(388, 235, 12, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(412, 235, 12, 0, Math.PI); ctx.stroke();
        // Whiskers
        ctx.beginPath(); ctx.moveTo(260, 205); ctx.lineTo(340, 215); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(250, 230); ctx.lineTo(340, 225); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(540, 205); ctx.lineTo(460, 215); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(550, 230); ctx.lineTo(460, 225); ctx.stroke();
        // 3D Body & Collar with bell
        ctx.beginPath(); ctx.ellipse(400, 370, 115, 90, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 290, 45, 0.2, Math.PI - 0.2); ctx.stroke(); // Collar
        ctx.beginPath(); ctx.arc(400, 305, 12, 0, Math.PI * 2); ctx.stroke(); // Bell sphere
        // 3D Paws
        ctx.beginPath(); ctx.arc(345, 445, 25, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(455, 445, 25, 0, Math.PI * 2); ctx.stroke();
        // 3D Tail
        ctx.beginPath(); ctx.moveTo(505, 395); ctx.quadraticCurveTo(620, 420, 595, 300); ctx.quadraticCurveTo(580, 280, 570, 310); ctx.quadraticCurveTo(590, 400, 485, 420); ctx.stroke();
        break;
      }
      case 'cake': {
        // 3D Plate
        ctx.beginPath(); ctx.ellipse(400, 450, 270, 35, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 455, 260, 25, 0, 0, Math.PI * 2); ctx.stroke();
        // Bottom tier 3D Cylinder
        ctx.beginPath(); ctx.ellipse(400, 310, 200, 25, 0, 0, Math.PI * 2); ctx.stroke(); // Top ellipse bottom tier
        ctx.beginPath(); ctx.moveTo(200, 310); ctx.lineTo(200, 430); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(600, 310); ctx.lineTo(600, 430); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 430, 200, 25, 0, 0, Math.PI); ctx.stroke(); // Bottom curve
        // Frosting drips bottom tier
        ctx.beginPath();
        for (let x = 200; x < 600; x += 40) {
          ctx.arc(x + 20, 310, 20, 0, Math.PI);
        }
        ctx.stroke();
        // Top tier 3D Cylinder
        ctx.beginPath(); ctx.ellipse(400, 180, 130, 18, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(270, 180); ctx.lineTo(270, 305); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(530, 180); ctx.lineTo(530, 305); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 305, 130, 18, 0, 0, Math.PI); ctx.stroke();
        // Frosting drips top tier
        ctx.beginPath();
        for (let x = 270; x < 530; x += 32.5) {
          ctx.arc(x + 16.25, 180, 16.25, 0, Math.PI);
        }
        ctx.stroke();
        // 3D Candles
        [330, 400, 470].forEach((cx) => {
          ctx.beginPath(); ctx.rect(cx - 10, 95, 20, 80); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(cx, 95, 10, 4, 0, 0, Math.PI * 2); ctx.stroke(); // 3D top candle
          ctx.beginPath(); ctx.ellipse(cx, 75, 9, 16, 0, 0, Math.PI * 2); ctx.stroke(); // Flame
        });
        break;
      }
      case 'car': {
        // 3D Sports Car Body Contour
        ctx.beginPath();
        ctx.moveTo(110, 340);
        ctx.lineTo(140, 260);
        ctx.lineTo(250, 250);
        ctx.lineTo(330, 150);
        ctx.lineTo(540, 150);
        ctx.lineTo(630, 250);
        ctx.lineTo(710, 260);
        ctx.lineTo(730, 340);
        ctx.closePath();
        ctx.stroke();
        // 3D Side Crease Contour Line
        ctx.beginPath(); ctx.moveTo(140, 260); ctx.lineTo(710, 260); ctx.stroke();
        // 3D Wheels with Rim Depth
        ctx.beginPath(); ctx.arc(230, 350, 52, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(230, 350, 32, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(230, 350, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(590, 350, 52, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(590, 350, 32, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(590, 350, 14, 0, Math.PI * 2); ctx.stroke();
        // 3D Windows & Mirror
        ctx.beginPath(); ctx.moveTo(345, 165); ctx.lineTo(430, 165); ctx.lineTo(430, 240); ctx.lineTo(275, 240); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(445, 165); ctx.lineTo(530, 165); ctx.lineTo(605, 240); ctx.lineTo(445, 240); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.rect(425, 230, 25, 15); ctx.stroke(); // 3D Side mirror
        // Headlight & 3D Bumper
        ctx.beginPath(); ctx.arc(715, 290, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.rect(700, 330, 35, 15); ctx.stroke(); // Bumper
        break;
      }
      case 'ice_cream': {
        // 3D Cone with waffle depth grid
        ctx.beginPath(); ctx.moveTo(290, 240); ctx.lineTo(400, 490); ctx.lineTo(510, 240); ctx.closePath(); ctx.stroke();
        for (let i = 1; i <= 6; i++) {
          ctx.beginPath(); ctx.moveTo(290 + i * 16, 240 + i * 36); ctx.lineTo(510 - i * 16, 240 + i * 36); ctx.stroke();
        }
        for (let i = 1; i <= 5; i++) {
          ctx.beginPath(); ctx.moveTo(310 + i * 30, 240); ctx.lineTo(400 + i * 10, 490 - i * 45); ctx.stroke();
        }
        // 3D Overlapping Scoops
        ctx.beginPath(); ctx.arc(400, 230, 90, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 145, 80, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 200, 85, 0.3, Math.PI - 0.3); ctx.stroke(); // Overlap depth arc
        // 3D Cherry on top
        ctx.beginPath(); ctx.arc(400, 50, 22, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(393, 44, 6, 0, Math.PI * 2); ctx.stroke(); // Highlight
        ctx.beginPath(); ctx.moveTo(400, 28); ctx.quadraticCurveTo(435, 8, 445, 25); ctx.stroke();
        break;
      }
      case 'flower': {
        // 3D Center Stamen
        ctx.beginPath(); ctx.arc(400, 190, 50, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 190, 35, 0, Math.PI * 2); ctx.stroke();
        // 3D Overlapping Petals
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const px = 400 + Math.cos(angle) * 110;
          const py = 190 + Math.sin(angle) * 110;
          ctx.beginPath(); ctx.arc(px, py, 48, 0, Math.PI * 2); ctx.stroke();
        }
        // Stem & Leaves with 3D veins
        ctx.beginPath(); ctx.moveTo(400, 240); ctx.lineTo(400, 470); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(400, 350); ctx.quadraticCurveTo(290, 310, 310, 380); ctx.quadraticCurveTo(360, 395, 400, 350); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(310, 380); ctx.lineTo(365, 360); ctx.stroke(); // Leaf vein
        ctx.beginPath(); ctx.moveTo(400, 380); ctx.quadraticCurveTo(510, 340, 490, 410); ctx.quadraticCurveTo(440, 425, 400, 380); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(490, 410); ctx.lineTo(435, 390); ctx.stroke(); // Leaf vein
        break;
      }
      case 'rocket': {
        // 3D Cylindrical Body
        ctx.beginPath(); ctx.moveTo(400, 45); ctx.quadraticCurveTo(485, 140, 485, 350); ctx.lineTo(315, 350); ctx.quadraticCurveTo(315, 140, 400, 45); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 150, 80, 15, 0, 0, Math.PI * 2); ctx.stroke(); // Curvature ring
        ctx.beginPath(); ctx.ellipse(400, 270, 82, 15, 0, 0, Math.PI * 2); ctx.stroke();
        // 3D Double Porthole Window
        ctx.beginPath(); ctx.arc(400, 210, 44, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 210, 30, 0, Math.PI * 2); ctx.stroke();
        // 3D Fins with thickness
        ctx.beginPath(); ctx.moveTo(315, 290); ctx.lineTo(230, 390); ctx.lineTo(315, 370); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(485, 290); ctx.lineTo(570, 390); ctx.lineTo(485, 370); ctx.closePath(); ctx.stroke();
        // 3D Engine Thruster & Flames
        ctx.beginPath(); ctx.rect(355, 350, 90, 28); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(355, 378); ctx.lineTo(400, 480); ctx.lineTo(445, 378); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(375, 378); ctx.lineTo(400, 440); ctx.lineTo(425, 378); ctx.stroke(); // Inner flame
        break;
      }
      case 'boat': {
        // 3D Water Waves
        ctx.beginPath();
        for (let x = 0; x < 800; x += 80) {
          ctx.arc(x + 40, 420, 40, 0, Math.PI);
        }
        ctx.stroke();
        // 3D Hull
        ctx.beginPath(); ctx.moveTo(170, 330); ctx.lineTo(230, 420); ctx.lineTo(590, 420); ctx.lineTo(670, 330); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(170, 330); ctx.lineTo(670, 330); ctx.stroke();
        ctx.beginPath(); ctx.rect(340, 280, 120, 50); ctx.stroke(); // 3D Deck cabin
        // Mast & 3D Billowed Sails
        ctx.beginPath(); ctx.moveTo(400, 280); ctx.lineTo(400, 60); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(410, 75); ctx.quadraticCurveTo(530, 180, 610, 300); ctx.lineTo(410, 300); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(390, 100); ctx.quadraticCurveTo(280, 190, 230, 300); ctx.lineTo(390, 300); ctx.closePath(); ctx.stroke();
        break;
      }
      case 'butterfly': {
        // 3D Body & Head
        ctx.beginPath(); ctx.ellipse(400, 250, 18, 115, 0, 0, Math.PI * 2); ctx.stroke();
        for (let y = 160; y <= 340; y += 30) {
          ctx.beginPath(); ctx.ellipse(400, y, 17, 6, 0, 0, Math.PI * 2); ctx.stroke(); // 3D Body segments
        }
        ctx.beginPath(); ctx.arc(400, 115, 22, 0, Math.PI * 2); ctx.stroke();
        // Antennae
        ctx.beginPath(); ctx.moveTo(390, 95); ctx.quadraticCurveTo(340, 30, 315, 55); ctx.stroke();
        ctx.beginPath(); ctx.arc(315, 55, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(410, 95); ctx.quadraticCurveTo(460, 30, 485, 55); ctx.stroke();
        ctx.beginPath(); ctx.arc(485, 55, 6, 0, Math.PI * 2); ctx.stroke();
        // 3D Wings Left & Veins
        ctx.beginPath(); ctx.moveTo(385, 175); ctx.quadraticCurveTo(150, 30, 175, 240); ctx.quadraticCurveTo(240, 310, 385, 260); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(385, 270); ctx.quadraticCurveTo(210, 320, 250, 435); ctx.quadraticCurveTo(350, 425, 385, 330); ctx.stroke();
        // 3D Wings Right & Veins
        ctx.beginPath(); ctx.moveTo(415, 175); ctx.quadraticCurveTo(650, 30, 625, 240); ctx.quadraticCurveTo(560, 310, 415, 260); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(415, 270); ctx.quadraticCurveTo(590, 320, 550, 435); ctx.quadraticCurveTo(450, 425, 415, 330); ctx.stroke();
        break;
      }
      case 'fish': {
        // 3D Body & Tail
        ctx.beginPath(); ctx.ellipse(380, 250, 180, 110, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(558, 250); ctx.lineTo(690, 140); ctx.lineTo(650, 250); ctx.lineTo(690, 360); ctx.closePath(); ctx.stroke();
        // 3D Eye & Gill
        ctx.beginPath(); ctx.arc(265, 210, 18, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(265, 210, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(310, 250, 60, -Math.PI / 3, Math.PI / 3); ctx.stroke();
        // 3D Scales Matrix
        for (let x = 360; x <= 480; x += 40) {
          for (let y = 180; y <= 300; y += 40) {
            ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI); ctx.stroke();
          }
        }
        // 3D Fins & Bubbles
        ctx.beginPath(); ctx.moveTo(380, 140); ctx.quadraticCurveTo(420, 80, 460, 145); ctx.stroke(); // Dorsal fin
        ctx.beginPath(); ctx.arc(140, 160, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(110, 100, 22, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'giraffe': {
        // Neck & Head
        ctx.beginPath(); ctx.rect(355, 145, 50, 235); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(395, 135, 38, 24, 0, 0, Math.PI * 2); ctx.stroke();
        // 3D Ossicones (Horns) & Ears
        ctx.beginPath(); ctx.rect(365, 95, 8, 25); ctx.stroke();
        ctx.beginPath(); ctx.arc(369, 90, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.rect(395, 95, 8, 25); ctx.stroke();
        ctx.beginPath(); ctx.arc(399, 90, 8, 0, Math.PI * 2); ctx.stroke();
        // Body & Legs
        ctx.beginPath(); ctx.rect(305, 360, 180, 90); ctx.stroke();
        ctx.beginPath(); ctx.rect(325, 450, 20, 55); ctx.stroke();
        ctx.beginPath(); ctx.rect(445, 450, 20, 55); ctx.stroke();
        // 3D Body Spots
        ctx.beginPath(); ctx.arc(380, 200, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(378, 260, 16, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(382, 320, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(350, 400, 18, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(430, 400, 20, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'elephant': {
        // Body & Head
        ctx.beginPath(); ctx.ellipse(430, 300, 155, 110, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(250, 260, 80, 0, Math.PI * 2); ctx.stroke();
        // 3D Ear with inner fold
        ctx.beginPath(); ctx.ellipse(300, 250, 48, 75, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(300, 250, 32, 55, 0, 0, Math.PI * 2); ctx.stroke();
        // 3D Curved Trunk with wrinkles
        ctx.beginPath(); ctx.moveTo(190, 280); ctx.quadraticCurveTo(100, 320, 135, 400); ctx.quadraticCurveTo(160, 410, 175, 375); ctx.stroke();
        for (let y = 300; y <= 370; y += 18) {
          ctx.beginPath(); ctx.arc(170, y, 15, -Math.PI / 2, Math.PI / 2); ctx.stroke();
        }
        // 3D Tusk
        ctx.beginPath(); ctx.moveTo(210, 320); ctx.quadraticCurveTo(150, 350, 180, 370); ctx.stroke();
        // Legs
        ctx.beginPath(); ctx.rect(345, 400, 42, 80); ctx.stroke();
        ctx.beginPath(); ctx.rect(475, 400, 42, 80); ctx.stroke();
        break;
      }
      case 'turtle': {
        // 3D Shell Dome
        ctx.beginPath(); ctx.arc(400, 290, 145, Math.PI, 0); ctx.lineTo(255, 290); ctx.closePath(); ctx.stroke();
        // 3D Hexagonal Scutes Pattern
        ctx.beginPath(); ctx.moveTo(330, 290); ctx.lineTo(365, 185); ctx.lineTo(435, 185); ctx.lineTo(470, 290); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(365, 185); ctx.lineTo(400, 145); ctx.lineTo(435, 185); ctx.stroke();
        // Head & Flippers
        ctx.beginPath(); ctx.arc(195, 285, 42, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(180, 275, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(290, 320, 32, 20, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(510, 320, 32, 20, 0, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'airplane': {
        // 3D Fuselage Body Cylinder
        ctx.beginPath(); ctx.ellipse(400, 250, 240, 40, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(200, 250, 12, 40, 0, 0, Math.PI * 2); ctx.stroke(); // Cockpit nose ring
        // 3D Wings & Engines
        ctx.beginPath(); ctx.moveTo(360, 215); ctx.lineTo(290, 75); ctx.lineTo(430, 75); ctx.lineTo(440, 215); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.rect(340, 130, 40, 20); ctx.stroke(); // Jet Engine L
        ctx.beginPath(); ctx.moveTo(600, 220); ctx.lineTo(655, 120); ctx.lineTo(685, 120); ctx.lineTo(635, 240); ctx.closePath(); ctx.stroke();
        // Cockpit Windscreen
        ctx.beginPath(); ctx.arc(205, 240, 18, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'bicycle': {
        // 1. Rear Wheel & Hub (X=200, Y=350)
        ctx.beginPath(); ctx.arc(200, 350, 85, 0, Math.PI * 2); ctx.stroke(); // Tire
        ctx.beginPath(); ctx.arc(200, 350, 72, 0, Math.PI * 2); ctx.stroke(); // Rim
        ctx.beginPath(); ctx.arc(200, 350, 14, 0, Math.PI * 2); ctx.stroke(); // Hub cap
        for (let a = 0; a < 360; a += 30) {
          const rad = (a * Math.PI) / 180;
          ctx.beginPath(); ctx.moveTo(200, 350); ctx.lineTo(200 + Math.cos(rad) * 72, 350 + Math.sin(rad) * 72); ctx.stroke();
        }

        // 2. Front Wheel & Hub (X=600, Y=350)
        ctx.beginPath(); ctx.arc(600, 350, 85, 0, Math.PI * 2); ctx.stroke(); // Tire
        ctx.beginPath(); ctx.arc(600, 350, 72, 0, Math.PI * 2); ctx.stroke(); // Rim
        ctx.beginPath(); ctx.arc(600, 350, 14, 0, Math.PI * 2); ctx.stroke(); // Hub cap
        for (let a = 0; a < 360; a += 30) {
          const rad = (a * Math.PI) / 180;
          ctx.beginPath(); ctx.moveTo(600, 350); ctx.lineTo(600 + Math.cos(rad) * 72, 350 + Math.sin(rad) * 72); ctx.stroke();
        }

        // 3. Bottom Bracket & Chainring Gear (X=350, Y=350)
        ctx.beginPath(); ctx.arc(350, 350, 26, 0, Math.PI * 2); ctx.stroke(); // Outer gear
        ctx.beginPath(); ctx.arc(350, 350, 14, 0, Math.PI * 2); ctx.stroke(); // Inner disc
        // Bicycle Chain
        ctx.beginPath(); ctx.moveTo(200, 338); ctx.lineTo(350, 338); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(200, 362); ctx.lineTo(350, 362); ctx.stroke();
        // Pedals & Cranks
        ctx.beginPath(); ctx.moveTo(350, 350); ctx.lineTo(350, 395); ctx.stroke();
        ctx.beginPath(); ctx.rect(335, 395, 30, 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(350, 350); ctx.lineTo(350, 305); ctx.stroke();
        ctx.beginPath(); ctx.rect(335, 297, 30, 8); ctx.stroke();

        // 4. Diamond Bicycle Frame Geometry
        // Chainstays (Rear Hub -> Bottom Bracket)
        ctx.beginPath(); ctx.moveTo(200, 350); ctx.lineTo(350, 350); ctx.stroke();
        // Seatstays (Rear Hub -> Seatpost Top)
        ctx.beginPath(); ctx.moveTo(200, 350); ctx.lineTo(320, 210); ctx.stroke();
        // Seat Post Tube (Bottom Bracket -> Seatpost Junction)
        ctx.beginPath(); ctx.moveTo(350, 350); ctx.lineTo(320, 210); ctx.stroke();
        // Down Tube (Bottom Bracket -> Head Tube Bottom)
        ctx.beginPath(); ctx.moveTo(350, 350); ctx.lineTo(480, 245); ctx.stroke();
        // Top Tube (Seatpost Junction -> Head Tube Top)
        ctx.beginPath(); ctx.moveTo(320, 210); ctx.lineTo(490, 210); ctx.stroke();
        // Head Tube (Steerer Sleeve)
        ctx.beginPath(); ctx.moveTo(490, 195); ctx.lineTo(480, 250); ctx.stroke();

        // 5. Front Fork (Connecting Head Tube to Front Wheel Hub 600, 350!)
        ctx.beginPath(); ctx.moveTo(480, 250); ctx.lineTo(600, 350); ctx.stroke();

        // 6. Handlebars & Stem
        ctx.beginPath(); ctx.moveTo(490, 195); ctx.lineTo(495, 145); ctx.stroke(); // Stem
        ctx.beginPath(); ctx.moveTo(450, 145); ctx.lineTo(540, 145); ctx.stroke(); // Handlebar
        ctx.beginPath(); ctx.rect(440, 140, 15, 10); ctx.stroke(); // Grip Left
        ctx.beginPath(); ctx.rect(535, 140, 15, 10); ctx.stroke(); // Grip Right
        ctx.beginPath(); ctx.moveTo(480, 145); ctx.quadraticCurveTo(550, 230, 600, 350); ctx.stroke(); // Front brake cable

        // 7. Saddle / Bicycle Seat
        ctx.beginPath(); ctx.rect(316, 175, 8, 35); ctx.stroke(); // Seat post tube
        ctx.beginPath();
        ctx.moveTo(275, 175);
        ctx.quadraticCurveTo(320, 162, 355, 175);
        ctx.lineTo(350, 185);
        ctx.quadraticCurveTo(315, 178, 280, 185);
        ctx.closePath();
        ctx.stroke();

        // 8. Fenders / Mudguards
        ctx.beginPath(); ctx.arc(200, 350, 92, Math.PI * 0.85, Math.PI * 1.85); ctx.stroke(); // Rear fender
        ctx.beginPath(); ctx.arc(600, 350, 92, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); // Front fender
        break;
      }
      case 'pizza': {
        // 3D Slice & Curved Thick Crust
        ctx.beginPath(); ctx.moveTo(400, 70); ctx.lineTo(170, 420); ctx.lineTo(630, 420); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.quadraticCurveTo(400, 470, 170, 420); ctx.stroke();
        ctx.beginPath(); ctx.quadraticCurveTo(400, 440, 170, 400); ctx.stroke(); // Crust border line
        // 3D Pepperoni Slices
        [ {x:340, y:240}, {x:450, y:280}, {x:370, y:350} ].forEach(p => {
          ctx.beginPath(); ctx.arc(p.x, p.y, 26, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x - 3, p.y - 3, 20, 0, Math.PI * 2); ctx.stroke();
        });
        break;
      }
      case 'donut': {
        // 3D Donut Torus & Inner Hole Depth
        ctx.beginPath(); ctx.arc(400, 250, 155, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 250, 52, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(405, 255, 48, 0, Math.PI * 2); ctx.stroke(); // Inner rim 3D shadow
        // 3D Wavy Icing Layer
        ctx.beginPath();
        for (let a = 0; a <= 360; a += 30) {
          const rad = (a * Math.PI) / 180;
          const r = 110 + Math.sin(a * 4) * 12;
          const px = 400 + Math.cos(rad) * r;
          const py = 250 + Math.sin(rad) * r;
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
        // Sprinkles
        [ {x:280, y:170}, {x:490, y:180}, {x:520, y:270}, {x:300, y:310} ].forEach(s => {
          ctx.beginPath(); ctx.rect(s.x, s.y, 18, 8); ctx.stroke();
        });
        break;
      }
      case 'rainbow': {
        [300, 260, 220, 180, 140].forEach((r) => {
          ctx.beginPath(); ctx.arc(400, 410, r, Math.PI, 0); ctx.stroke();
        });
        // 3D Puffy Base Clouds
        ctx.beginPath(); ctx.arc(100, 400, 45, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(145, 380, 55, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(700, 400, 45, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(655, 380, 55, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'sunflower': {
        // 3D Seed Matrix Center
        ctx.beginPath(); ctx.arc(400, 195, 70, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 195, 45, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 14; i++) {
          const a = (i * Math.PI) / 7;
          ctx.beginPath(); ctx.arc(400 + Math.cos(a) * 102, 195 + Math.sin(a) * 102, 32, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(400, 265); ctx.lineTo(400, 480); ctx.stroke();
        break;
      }
      case 'sun_cloud': {
        // 3D Sun
        ctx.beginPath(); ctx.arc(250, 175, 60, 0, Math.PI * 2); ctx.stroke();
        for (let a = 0; a < 360; a += 45) {
          const rad = (a * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(250 + Math.cos(rad) * 70, 175 + Math.sin(rad) * 70);
          ctx.lineTo(250 + Math.cos(rad) * 88, 175 + Math.sin(rad) * 88);
          ctx.stroke();
        }
        // 3D Cloud Lobes
        ctx.beginPath(); ctx.arc(440, 270, 55, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(525, 235, 70, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(610, 270, 52, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.rect(440, 275, 170, 50); ctx.stroke();
        break;
      }
      case 'dinosaur': {
        // 3D Dino Body Contour
        ctx.beginPath(); ctx.moveTo(150, 150); ctx.quadraticCurveTo(240, 150, 250, 260); ctx.quadraticCurveTo(360, 240, 480, 260); ctx.lineTo(660, 365); ctx.quadraticCurveTo(460, 425, 270, 370); ctx.closePath(); ctx.stroke();
        // 3D Dorsal Spikes / Plates
        for (let x = 270; x <= 550; x += 45) {
          ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x + 20, 190); ctx.lineTo(x + 40, 245); ctx.closePath(); ctx.stroke();
        }
        // Legs & Claws
        ctx.beginPath(); ctx.rect(295, 370, 38, 80); ctx.stroke();
        ctx.beginPath(); ctx.rect(425, 370, 38, 80); ctx.stroke();
        ctx.beginPath(); ctx.arc(185, 175, 8, 0, Math.PI * 2); ctx.stroke(); // Eye
        break;
      }
      case 'dragon': {
        // 3D Horns & Head
        ctx.beginPath(); ctx.moveTo(340, 160); ctx.lineTo(210, 50); ctx.lineTo(270, 200); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 280, 125, 85, 0, 0, Math.PI * 2); ctx.stroke();
        // 3D Bat Wings with Bone Ribs
        ctx.beginPath(); ctx.moveTo(400, 200); ctx.lineTo(570, 90); ctx.lineTo(510, 270); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(470, 140); ctx.lineTo(510, 270); ctx.stroke();
        // 3D Fire Flame Breath
        ctx.beginPath(); ctx.moveTo(270, 200); ctx.quadraticCurveTo(160, 170, 100, 240); ctx.quadraticCurveTo(180, 260, 270, 230); ctx.stroke();
        break;
      }
      case 'robot': {
        // 3D Head Box & Antenna Light
        ctx.beginPath(); ctx.rect(315, 75, 170, 125); ctx.stroke();
        ctx.beginPath(); ctx.rect(325, 85, 150, 105); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(400, 75); ctx.lineTo(400, 25); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 18, 12, 0, Math.PI * 2); ctx.stroke();
        // Eyes & Visor
        ctx.beginPath(); ctx.arc(355, 130, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(445, 130, 20, 0, Math.PI * 2); ctx.stroke();
        // 3D Chest Box & Joints
        ctx.beginPath(); ctx.rect(275, 230, 250, 185); ctx.stroke();
        ctx.beginPath(); ctx.rect(315, 260, 170, 120); ctx.stroke(); // Chest panel
        ctx.beginPath(); ctx.rect(195, 240, 55, 125); ctx.stroke();
        ctx.beginPath(); ctx.rect(550, 240, 55, 125); ctx.stroke();
        break;
      }
      case 'alien_ufo': {
        // 3D Glass Dome & Saucer Rim
        ctx.beginPath(); ctx.arc(400, 210, 98, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(370, 170, 25, 0, Math.PI * 2); ctx.stroke(); // Reflection arc
        ctx.beginPath(); ctx.ellipse(400, 230, 240, 50, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 235, 220, 32, 0, 0, Math.PI * 2); ctx.stroke();
        // Signal Orbs
        [-160, -80, 0, 80, 160].forEach(dx => {
          ctx.beginPath(); ctx.arc(400 + dx, 235, 12, 0, Math.PI * 2); ctx.stroke();
        });
        // 3D Beam Cone
        ctx.beginPath(); ctx.moveTo(250, 275); ctx.lineTo(130, 465); ctx.lineTo(670, 465); ctx.lineTo(550, 275); ctx.closePath(); ctx.stroke();
        break;
      }
      case 'teddy_bear': {
        // Head & 3D Inner Ears
        ctx.beginPath(); ctx.arc(400, 180, 88, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(315, 110, 35, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(315, 110, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(485, 110, 35, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(485, 110, 20, 0, Math.PI * 2); ctx.stroke();
        // Snout & Bowtie
        ctx.beginPath(); ctx.ellipse(400, 205, 32, 22, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 195, 10, 0, Math.PI * 2); ctx.stroke(); // Nose
        // 3D Body & Paws
        ctx.beginPath(); ctx.ellipse(400, 355, 110, 92, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 355, 65, 55, 0, 0, Math.PI * 2); ctx.stroke(); // Belly patch
        ctx.beginPath(); ctx.arc(270, 365, 34, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(530, 365, 34, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'crown': {
        // 3D Base Cylinder Rim
        ctx.beginPath(); ctx.rect(210, 340, 380, 48); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 340, 190, 14, 0, 0, Math.PI * 2); ctx.stroke();
        // Crown Spikes & 3D Jewels
        ctx.beginPath(); ctx.moveTo(210, 340); ctx.lineTo(190, 145); ctx.lineTo(305, 255); ctx.lineTo(400, 105); ctx.lineTo(495, 255); ctx.lineTo(610, 145); ctx.lineTo(590, 340); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.arc(190, 130, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 90, 18, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(610, 130, 15, 0, Math.PI * 2); ctx.stroke();
        // Gems on headband
        [-110, 0, 110].forEach(dx => {
          ctx.beginPath(); ctx.rect(390 + dx, 352, 20, 24); ctx.stroke();
        });
        break;
      }
      case 'glasses': {
        // 3D Beveled Rims
        ctx.beginPath(); ctx.rect(160, 195, 200, 140); ctx.stroke();
        ctx.beginPath(); ctx.rect(172, 207, 176, 116); ctx.stroke(); // Inner rim
        ctx.beginPath(); ctx.rect(440, 195, 200, 140); ctx.stroke();
        ctx.beginPath(); ctx.rect(452, 207, 176, 116); ctx.stroke(); // Inner rim
        // 3D Nose Bridge & Temples
        ctx.beginPath(); ctx.arc(400, 240, 40, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(160, 220); ctx.lineTo(90, 180); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(640, 220); ctx.lineTo(710, 180); ctx.stroke();
        break;
      }
      case 'football': {
        // 3D Sphere & Pentagons Grid
        ctx.beginPath(); ctx.arc(400, 250, 160, 0, Math.PI * 2); ctx.stroke();
        // Center Pentagon
        ctx.beginPath(); ctx.moveTo(400, 195); ctx.lineTo(445, 228); ctx.lineTo(430, 282); ctx.lineTo(370, 282); ctx.lineTo(355, 228); ctx.closePath(); ctx.stroke();
        // 3D Seam lines to outer rim
        ctx.beginPath(); ctx.moveTo(400, 195); ctx.lineTo(400, 90); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(445, 228); ctx.lineTo(540, 190); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(430, 282); ctx.lineTo(520, 350); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(370, 282); ctx.lineTo(280, 350); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(355, 228); ctx.lineTo(260, 190); ctx.stroke();
        break;
      }
      case 'guitar': {
        // 3D Body & Side Depth Contour
        ctx.beginPath(); ctx.ellipse(400, 360, 110, 98, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(400, 225, 78, 68, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(415, 365, 110, 98, 0, 0, Math.PI * 2); ctx.stroke(); // 3D Side depth edge
        // Soundhole & Neck
        ctx.beginPath(); ctx.arc(400, 250, 30, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(400, 250, 35, 0, Math.PI * 2); ctx.stroke(); // Inner rim
        ctx.beginPath(); ctx.rect(385, 25, 30, 175); ctx.stroke();
        ctx.beginPath(); ctx.rect(375, 15, 50, 30); ctx.stroke(); // Headstock
        break;
      }
      case 'palm_tree': {
        // Ground & 3D Segmented Trunk
        ctx.beginPath(); ctx.arc(400, 520, 300, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(365, 430); ctx.quadraticCurveTo(390, 280, 350, 180); ctx.lineTo(390, 180); ctx.quadraticCurveTo(410, 280, 430, 430); ctx.closePath(); ctx.stroke();
        for (let y = 200; y <= 410; y += 30) {
          ctx.beginPath(); ctx.ellipse(390, y, 25, 8, 0, 0, Math.PI * 2); ctx.stroke(); // 3D Trunk rings
        }
        // Coconuts & 3D Fronds
        ctx.beginPath(); ctx.arc(355, 190, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(380, 195, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(368, 208, 14, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      default:
        break;
    }

    ctx.restore();
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
        <div className="w-full bg-gradient-to-r from-amber-100 via-rose-100 to-indigo-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border border-amber-300 dark:border-slate-700 shadow-2xs space-y-1">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-900 dark:text-amber-300">
              <ImageIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="uppercase tracking-wider">SKETSA GAMBAR:</span>
            </div>
            {activeSketchId && (
              <button
                onClick={() => loadSketchTemplate(null)}
                className="text-[9px] sm:text-[10px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
              >
                <span>Hapus Sketsa</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar max-w-full">
            <button
              onClick={() => loadSketchTemplate(null)}
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-extrabold shrink-0 border transition-all active:scale-95 flex items-center gap-1 ${
                !activeSketchId
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-amber-50'
              }`}
            >
              <span>📄 Polos</span>
            </button>
            {SKETCH_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => loadSketchTemplate(tmpl.id)}
                className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-extrabold shrink-0 border transition-all active:scale-95 flex items-center gap-1 ${
                  activeSketchId === tmpl.id
                    ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-md scale-105 ring-2 ring-amber-300'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-amber-50'
                }`}
              >
                <span className="text-xs">{tmpl.emoji}</span>
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Drawing Viewport */}
      <div className="w-full flex flex-col sm:flex-row items-stretch gap-1.5 sm:gap-2.5 flex-1 min-h-0 overflow-hidden">
      
      {/* 1. DRAWING TOOLBAR (Left side on Landscape/Desktop, Scrollable Bar on Portrait Mobile) */}
      {!isReadOnly && (
        <div className="w-full sm:w-auto bg-amber-100/95 dark:bg-slate-800/95 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-300 dark:border-slate-700 shadow-bubbly-amber flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-1.5 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-full sm:max-h-[calc(100vh-60px)] touch-pan-x sm:touch-pan-y no-scrollbar">
          
          {/* Main Drawing Tools */}
          <div className="flex flex-row sm:flex-col items-center gap-1 shrink-0">
            {/* Pencil */}
            <button
              onClick={() => {
                setActiveTool('pencil');
                sound.playClick();
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-90 border-2 ${
                activeTool === 'pencil'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-amber-50'
              }`}
              title="Pensil (Garis Halus)"
            >
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Brush */}
            <button
              onClick={() => {
                setActiveTool('brush');
                sound.playClick();
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-90 border-2 ${
                activeTool === 'brush'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-amber-50'
              }`}
              title="Kuas (Garis Tebal)"
            >
              <Paintbrush className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Eraser */}
            <button
              onClick={() => {
                setActiveTool('eraser');
                sound.playClick();
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-90 border-2 ${
                activeTool === 'eraser'
                  ? 'bg-rose-400 text-white border-rose-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-rose-50'
              }`}
              title="Penghapus"
            >
              <Eraser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Bucket */}
            <button
              onClick={() => {
                setActiveTool('bucket');
                sound.playClick();
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-90 border-2 ${
                activeTool === 'bucket'
                  ? 'bg-sky-400 text-slate-900 border-sky-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-sky-50'
              }`}
              title="Ember Cat (Isi Warna)"
            >
              <PaintBucket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Stamp Tool */}
            <button
              onClick={() => {
                setActiveTool('stamp');
                sound.playClick();
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-90 border-2 ${
                activeTool === 'stamp'
                  ? 'bg-purple-400 text-slate-900 border-purple-500 font-extrabold shadow-md scale-105'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-purple-50'
              }`}
              title="Stempel Emoji / Stiker"
            >
              <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Stamp Selector when active */}
          {activeTool === 'stamp' && (
            <div className="flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto p-1 bg-white/80 dark:bg-slate-700 rounded-2xl border border-purple-300 shrink-0 max-h-32">
              {EMOJI_STAMPS.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedStamp(s);
                    sound.playClick();
                  }}
                  className={`text-sm sm:text-base p-0.5 rounded-xl transition-all ${selectedStamp === s ? 'bg-purple-200 dark:bg-purple-900 scale-110' : 'hover:bg-slate-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="h-px sm:h-auto w-full sm:w-px bg-amber-300 dark:bg-slate-700 my-0.5 hidden sm:block" />

          {/* Line Width Slider */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <span className="text-[8px] sm:text-[9px] font-black text-amber-900 dark:text-amber-300 hidden sm:block">
              UKURAN
            </span>
            <input
              type="range"
              min="2"
              max="32"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-10 sm:w-14 accent-amber-500 cursor-pointer"
              title={`Ukuran Kuas: ${lineWidth}px`}
            />
          </div>

          <div className="h-px sm:h-auto w-full sm:w-px bg-amber-300 dark:bg-slate-700 my-0.5 hidden sm:block" />

          {/* Color Palette Grid: 8 Columns on mobile, 4 Columns on sm/landscape, 2 Columns on md */}
          <div className="grid grid-cols-8 sm:grid-cols-4 md:grid-cols-2 gap-1 sm:gap-1.5 shrink-0 max-w-full overflow-visible">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (activeTool === 'eraser') setActiveTool('brush');
                  sound.playClick();
                }}
                className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 rounded-md sm:rounded-lg border-2 border-slate-300 dark:border-slate-600 transition-transform active:scale-90 ${
                  color === c && activeTool !== 'eraser'
                    ? 'scale-115 border-slate-900 dark:border-white ring-2 ring-amber-400 z-10 shadow-xs'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                title={`Pilih Warna ${c}`}
              />
            ))}
          </div>

          <div className="h-px sm:h-auto w-full sm:w-px bg-amber-300 dark:bg-slate-700 my-0.5 hidden sm:block" />

          {/* Action Buttons: Undo & Clear */}
          <div className="flex flex-row sm:flex-col items-center gap-1 shrink-0">
            <button
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 disabled:opacity-40 active:scale-90 transition-all shadow-2xs"
              title="Batalkan (Undo)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleClear}
              className="p-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white border border-rose-600 active:scale-90 transition-all shadow-2xs"
              title="Hapus Semua Canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 2. TABLET FRAME CANVAS (Center Viewport) */}
      <div className="flex-1 bg-slate-900 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl md:rounded-[28px] shadow-xl border-2 sm:border-4 border-slate-800 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-0">
        
        {/* Tablet Front Camera Dot */}
        <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700 absolute top-1 left-1/2 -translate-x-1/2 hidden sm:block" />

        {/* Canvas Surface */}
        <div className="w-full h-full bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative touch-none p-0.5">
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
            className={`max-w-full max-h-full w-auto h-auto object-contain rounded-md ${
              isReadOnly ? 'cursor-default' : activeTool === 'bucket' ? 'cursor-cell' : 'cursor-crosshair'
            }`}
            style={{ aspectRatio: `${width} / ${height}` }}
          />

          {!isReadOnly && activeSketchId && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-display font-black text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full shadow-lg border border-white/50 flex items-center gap-1.5 opacity-95 pointer-events-none animate-pulse z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
              <span>✨ SKETSA 4D REALISTIS</span>
            </div>
          )}

          {isReadOnly && (
            <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-amber-300 font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full shadow-md border border-amber-400/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Memantau Lukisan...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
