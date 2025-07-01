import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  wave: {
    x: number;
    y: number;
  };
  cursor: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
}

interface Mouse {
  x: number;
  y: number;
  sx: number;
  sy: number;
}

class Grad {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  dot2(x: number, y: number): number {
    return this.x * x + this.y * y;
  }
}

class Noise {
  grad3: Grad[];
  p: number[];
  perm: number[];
  gradP: Grad[];

  constructor() {
    this.grad3 = [
      new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
      new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
      new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)
    ];

    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
      247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
      57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
      60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
      65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
      200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
      52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
      207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
      119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
      218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ];

    this.perm = new Array(512);
    this.gradP = new Array(512);
    this.seed(1);
  }

  seed(seed: number): void {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;

    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }

  fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b;
  }

  perlin2(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);

    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);

    const u = this.fade(x);
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
  }
}

export default function WavesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const boundingRef = useRef<DOMRect | null>(null);
  const linesRef = useRef<Point[][]>([]);
  const noiseRef = useRef<Noise>(new Noise());
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    ctxRef.current = canvas.getContext("2d");
    
    const updateCanvasSize = () => {
      if (!canvas || !container) return;
      boundingRef.current = container.getBoundingClientRect();
      canvas.width = boundingRef.current.width;
      canvas.height = boundingRef.current.height;
    };

    updateCanvasSize();

    const mouse: Mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const lineColor = "rgba(139, 69, 19, 0.3)"; // Dark brown/orange with transparency
    const numberOfLines = 8;
    const pointsPerLine = 30;
    const spacing = 50;

    // Initialize wave lines
    for (let j = 0; j < numberOfLines; j++) {
      const pts: Point[] = [];
      for (let i = 0; i <= pointsPerLine; i++) {
        const point: Point = {
          x: (i / pointsPerLine) * (boundingRef.current?.width || 800),
          y: ((boundingRef.current?.height || 600) / 2) + j * spacing - (numberOfLines * spacing) / 2,
          wave: { x: i / pointsPerLine, y: j },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 }
        };
        pts.push(point);
      }
      linesRef.current.push(pts);
    }

    function movePoints(time: number): void {
      if (!boundingRef.current) return;
      
      const { width, height } = boundingRef.current;
      
      linesRef.current.forEach((pts) => {
        pts.forEach((p) => {
          const noise = noiseRef.current.perlin2(p.wave.x * 2 + time * 0.0002, p.wave.y * 0.5) * 40;
          const waveY = p.y + Math.sin(p.wave.x * Math.PI * 2 + time * 0.002) * 20;
          
          p.cursor.vx += (mouse.x - p.cursor.x) * 0.0001;
          p.cursor.vy += (mouse.y - p.cursor.y) * 0.0001;
          p.cursor.vx *= 0.95;
          p.cursor.vy *= 0.95;
          p.cursor.x += p.cursor.vx;
          p.cursor.y += p.cursor.vy;
          
          const finalX = p.x + p.cursor.x * 0.1;
          const finalY = waveY + noise + p.cursor.y * 0.1;
          
          p.x += (finalX - p.x) * 0.1;
          p.y += (finalY - p.y) * 0.1;
        });
      });
    }

    function moved(point: Point, withCursor = true): Point {
      return {
        x: point.x + (withCursor ? point.cursor.x * 0.1 : 0),
        y: point.y + (withCursor ? point.cursor.y * 0.1 : 0),
        wave: point.wave,
        cursor: point.cursor
      };
    }

    function draw(): void {
      const ctx = ctxRef.current;
      if (!ctx || !boundingRef.current) return;
      
      const { width, height } = boundingRef.current;
      
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;

      linesRef.current.forEach((points) => {
        const p1 = moved(points[0]);
        ctx.moveTo(p1.x, p1.y);
        points.forEach((p, idx) => {
          const isLast = idx === points.length - 1;
          const p2 = moved(
            points[idx + 1] || points[points.length - 1],
            !isLast
          );
          ctx.lineTo(p1.x, p1.y);
          if (isLast) ctx.moveTo(p2.x, p2.y);
        });
      });
      
      ctx.stroke();
    }

    function tick(t: number): void {
      movePoints(t);
      draw();
      
      if (container && boundingRef.current) {
        const { width, height } = boundingRef.current;
        const normalizedX = (mouse.x / width) * 100;
        const normalizedY = (mouse.y / height) * 100;
        
        mouse.sx += (normalizedX - mouse.sx) * 0.1;
        mouse.sy += (normalizedY - mouse.sy) * 0.1;
        
        container.style.setProperty("--x", `${mouse.sx}px`);
        container.style.setProperty("--y", `${mouse.sy}px`);
      }
      
      animationRef.current = requestAnimationFrame(tick);
    }

    function onMouseMove(e: MouseEvent): void {
      updateMouse(e.clientX, e.clientY);
    }

    function onTouchMove(e: TouchEvent): void {
      updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }

    function updateMouse(x: number, y: number): void {
      if (!boundingRef.current) return;
      mouse.x = x - boundingRef.current.left;
      mouse.y = y - boundingRef.current.top;
    }

    // Event listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("resize", updateCanvasSize);

    // Start animation
    animationRef.current = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(139, 69, 19, 0.1) 0%, transparent 70%)'
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          filter: 'blur(0.5px)',
          opacity: 0.6
        }}
      />
    </div>
  );
}
