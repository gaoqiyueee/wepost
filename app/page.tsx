'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { Mode, BasicStyle, Role } from '@/lib/prompts'

// canvas 组件仅客户端渲染
const AnnotationCanvas = dynamic(() => import('@/components/AnnotationCanvas'), { ssr: false })
const PreviewCard = dynamic(() => import('@/components/PreviewCard'), { ssr: false })

// ─── 常量 ────────────────────────────────────────────────────────────────────

const MODES: { id: Mode; label: string; emoji: string; desc: string }[] = [
  { id: 'academic', emoji: '🎓',  label: '论文版',   desc: '学术语气包装日常' },
  { id: 'basic',    emoji: '✍️',  label: '基础版',   desc: '选个风格，AI 帮你写' },
  { id: 'era',      emoji: '⏰',  label: '年代穿越', desc: '三个年代同时输出' },
  { id: 'role',     emoji: '🎭',  label: '角色版',   desc: '假装你是谁' },
]

const BASIC_STYLES: { id: BasicStyle; emoji: string }[] = [
  { id: '文艺', emoji: '🌸' },
  { id: '搞笑', emoji: '😂' },
  { id: '旅行', emoji: '✈️' },
  { id: '晒娃', emoji: '👶' },
]

const ROLES: { id: Role; emoji: string; desc: string }[] = [
  { id: '牛马', emoji: '🐴', desc: '996 社畜视角' },
  { id: '领导', emoji: '👔', desc: '格局赋能对齐' },
  { id: '作家', emoji: '🖊️', desc: '矫情存在主义' },
  { id: '皇帝', emoji: '👑', desc: '大清乾隆上线' },
  { id: '自定义', emoji: '✨', desc: '输入任意角色' },
]

// ─── 类型 ────────────────────────────────────────────────────────────────────

type EraResult = { era: string; content: string }[]
type GenerateResult =
  | { mode: 'era'; result: EraResult }
  | { mode: Exclude<Mode, 'era'>; captions: string[] }

// ─── 主页面 ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [annotatedImageBase64, setAnnotatedImageBase64] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('academic')
  const [style, setStyle] = useState<BasicStyle>('文艺')
  const [role, setRole] = useState<Role>('牛马')
  const [customRole, setCustomRole] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── 图片处理 ──────────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      // 压缩图片再预览
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 1024
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          if (width > height) { height = (height * maxSize) / width; width = maxSize }
          else { width = (width * maxSize) / height; height = maxSize }
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        setImagePreview(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
    setImageFile(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ── 生成 ──────────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (mode === '自定义' as unknown as Mode && role === '自定义' && !customRole.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let imageBase64: string | undefined
      if (mode === 'academic' && annotatedImageBase64) {
        // 论文版：用标注后的图片（含框选区域）
        imageBase64 = annotatedImageBase64
      } else if (imagePreview) {
        imageBase64 = imagePreview.split(',')[1]
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mode,
          style: mode === 'basic' ? style : undefined,
          role: mode === 'role' ? role : undefined,
          customRole: mode === 'role' && role === '自定义' ? customRole : undefined,
          description: description.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `请求失败 (${res.status})`)
      }

      const data = await res.json()
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="text-center pt-10 pb-6 px-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
          朋友圈文案生成器
        </h1>
        <p className="mt-2 text-gray-500 text-sm">上传图片 · 选个模式 · 一键生成有灵魂的文案</p>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-16 space-y-5">

        {/* ① 上传图片 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3">① 上传图片（可选）</h2>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover" />
              <button
                onClick={() => { setImagePreview(null); setImageFile(null) }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black/70 transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm text-gray-400">点击上传或拖拽图片至此</p>
              <p className="text-xs text-gray-300 mt-1">JPG / PNG / WEBP</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {!imagePreview && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="没图片也没关系，用文字描述一下场景..."
              className="mt-3 w-full text-sm border border-gray-100 rounded-xl p-3 resize-none h-20 text-gray-600 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          )}
        </section>

        {/* ② 选择模式 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3">② 选个模式</h2>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setResult(null) }}
                className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left ${
                  mode === m.id
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-100 hover:border-purple-200'
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="font-medium text-gray-700 text-sm mt-1">{m.label}</span>
                <span className="text-xs text-gray-400">{m.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ③ 子选项 */}
        {mode === 'basic' && (
          <section className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-3">③ 选风格</h2>
            <div className="flex gap-2 flex-wrap">
              {BASIC_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    style === s.id
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'border-gray-200 text-gray-500 hover:border-purple-300'
                  }`}
                >
                  {s.emoji} {s.id}
                </button>
              ))}
            </div>
          </section>
        )}

        {mode === 'role' && (
          <section className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-3">③ 选角色</h2>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    role === r.id
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <span className="text-xl">{r.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.id}</p>
                    <p className="text-xs text-gray-400">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {role === '自定义' && (
              <input
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder='输入角色，例如："减肥第18天但刚吃了火锅的人"'
                className="mt-3 w-full text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            )}
          </section>
        )}

        {mode === 'academic' && (
          <section className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-3">③ 标注重点区域（可选）</h2>
            {imagePreview ? (
              <AnnotationCanvas
                imagePreview={imagePreview}
                onAnnotatedImage={setAnnotatedImageBase64}
              />
            ) : (
              <div className="flex items-start gap-3 text-sm text-gray-500 bg-yellow-50 rounded-xl p-3">
                <span className="text-lg">💡</span>
                <span>上传图片后可以框选重点区域，AI 会在图注里特别点名～也可以直接生成！</span>
              </div>
            )}
          </section>
        )}

        {mode === 'era' && (
          <section className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-start gap-3 text-sm text-gray-500 bg-blue-50 rounded-xl p-3">
              <span className="text-lg">✨</span>
              <span>将同时输出 📻 80年代日记体 · 💜 QQ空间体 · 📕 小红书体，三个平行宇宙一起来！</span>
            </div>
          </section>
        )}

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={loading || (mode === 'role' && role === '自定义' && !customRole.trim())}
          className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI 正在绞尽脑汁…
            </span>
          ) : (
            '✨ 生成文案'
          )}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl p-4">
            ⚠️ {error}
          </div>
        )}

        {/* 结果展示 */}
        {result && (
          <section className="space-y-4">
            <h2 className="font-semibold text-gray-700">🎉 生成结果</h2>

            {result.mode === 'era' ? (
              result.result.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <PreviewCard
                    mode="era"
                    caption={item.content}
                    eraLabel={item.era}
                    imagePreview={imagePreview}
                    index={idx}
                  />
                  <CopyBtn text={item.content} idx={idx} copiedIdx={copiedIdx} onCopy={copyText} />
                </div>
              ))
            ) : (
              result.captions.map((caption, idx) => (
                <div key={idx} className="space-y-2">
                  <PreviewCard
                    mode={result.mode}
                    caption={caption}
                    imagePreview={
                      result.mode === 'academic' && annotatedImageBase64
                        ? `data:image/jpeg;base64,${annotatedImageBase64}`
                        : imagePreview
                    }
                    index={idx}
                    styleName={mode === 'basic' ? style : undefined}
                    roleName={mode === 'role' ? role : undefined}
                  />
                  <CopyBtn text={caption} idx={idx} copiedIdx={copiedIdx} onCopy={copyText} />
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  )
}

// ─── 复制按钮 ─────────────────────────────────────────────────────────────────

function CopyBtn({
  text, idx, copiedIdx, onCopy,
}: { text: string; idx: number; copiedIdx: number | null; onCopy: (t: string, i: number) => void }) {
  return (
    <button
      onClick={() => onCopy(text, idx)}
      className="text-xs text-gray-400 hover:text-purple-500 transition flex items-center gap-1"
    >
      {copiedIdx === idx ? '✓ 已复制文案' : '复制文案'}
    </button>
  )
}
