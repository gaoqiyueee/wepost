'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

type Annotation = { x: number; y: number; w: number; h: number; color: string }

const COLORS = [
  { value: '#ef4444', label: '🔴 红框' },
  { value: '#f59e0b', label: '🟡 黄框' },
  { value: '#3b82f6', label: '🔵 蓝框' },
]

interface Props {
  imagePreview: string                        // base64 image
  onAnnotatedImage: (base64: string) => void  // 标注后的图片回传
}

export default function AnnotationCanvas({ imagePreview, onAnnotatedImage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [drawing, setDrawing] = useState(false)
  const [start, setStart] = useState<{ x: number; y: number } | null>(null)
  const [current, setCurrent] = useState<Annotation | null>(null)
  const [color, setColor] = useState(COLORS[0].value)

  // ── 把图片绘制到 canvas ──────────────────────────────────────────────────

  const redraw = useCallback(
    (annots: Annotation[], preview?: Annotation | null) => {
      const canvas = canvasRef.current
      const img = imgRef.current
      if (!canvas || !img) return
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const draw = (a: Annotation, lineWidth = 2) => {
        ctx.strokeStyle = a.color
        ctx.lineWidth = lineWidth
        ctx.setLineDash([6, 3])
        ctx.strokeRect(a.x, a.y, a.w, a.h)
        ctx.setLineDash([])
        // 半透明填充
        ctx.fillStyle = a.color + '18'
        ctx.fillRect(a.x, a.y, a.w, a.h)
      }

      annots.forEach((a) => draw(a))
      if (preview) draw(preview, 2)
    },
    []
  )

  // ── 加载图片 ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new window.Image()
    img.onload = () => {
      imgRef.current = img
      // 限制最大宽度以适应移动端
      const maxW = Math.min(img.naturalWidth, 600)
      const ratio = maxW / img.naturalWidth
      canvas.width = maxW
      canvas.height = img.naturalHeight * ratio
      redraw(annotations)
      exportAnnotated(annotations)
    }
    img.src = imagePreview
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreview])

  // ── 导出标注后图片 ────────────────────────────────────────────────────────

  const exportAnnotated = useCallback(
    (annots: Annotation[]) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]
      onAnnotatedImage(base64)
    },
    [onAnnotatedImage]
  )

  // ── 鼠标/触摸事件处理 ────────────────────────────────────────────────────

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e)
    setStart(pos)
    setDrawing(true)
  }

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || !start) return
    const pos = getPos(e)
    const preview: Annotation = {
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y),
      color,
    }
    setCurrent(preview)
    redraw(annotations, preview)
  }

  const onUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || !start) return
    const pos = getPos(e)
    const newAnnot: Annotation = {
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y),
      color,
    }
    if (newAnnot.w > 5 && newAnnot.h > 5) {
      const next = [...annotations, newAnnot]
      setAnnotations(next)
      redraw(next)
      exportAnnotated(next)
    }
    setDrawing(false)
    setStart(null)
    setCurrent(null)
  }

  const handleUndo = () => {
    const next = annotations.slice(0, -1)
    setAnnotations(next)
    redraw(next)
    exportAnnotated(next)
  }

  const handleClear = () => {
    setAnnotations([])
    redraw([])
    exportAnnotated([])
  }

  return (
    <div className="space-y-2">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400">框选要标注的区域：</span>
        {COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            className={`text-xs px-2 py-1 rounded-full border transition-all ${
              color === c.value ? 'border-gray-400 bg-gray-100' : 'border-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {annotations.length > 0 && (
            <>
              <button
                onClick={handleUndo}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ↩ 撤销
              </button>
              <button
                onClick={handleClear}
                className="text-xs text-red-400 hover:text-red-600"
              >
                清空
              </button>
            </>
          )}
        </div>
      </div>

      {/* 画布 */}
      <div className="rounded-xl overflow-hidden cursor-crosshair select-none border border-gray-100">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        />
      </div>

      {annotations.length > 0 && (
        <p className="text-xs text-purple-500">
          ✓ 已添加 {annotations.length} 个标注框，AI 会结合标注内容写图注
        </p>
      )}
      {annotations.length === 0 && (
        <p className="text-xs text-gray-400">
          💡 可选：拖动鼠标框选图片中想强调的部分
        </p>
      )}
    </div>
  )
}
