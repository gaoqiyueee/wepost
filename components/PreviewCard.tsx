'use client'

import { useRef, useCallback } from 'react'
import type { Mode } from '@/lib/prompts'

interface BaseProps {
  caption: string
  imagePreview?: string | null   // original or annotated image (base64 data URL)
  index: number
}

interface NormalCardProps extends BaseProps {
  mode: Exclude<Mode, 'era'>
  styleName?: string
  roleName?: string
}

interface EraCardProps extends BaseProps {
  mode: 'era'
  eraLabel: string   // e.g. "📻 80年代日记体"
}

type Props = NormalCardProps | EraCardProps

// ─── 颜色/风格配置 ──────────────────────────────────────────────────────────

const MODE_ACCENT: Record<Exclude<Mode, 'era'>, string> = {
  academic: '#1e3a5f',
  basic:    '#8b5cf6',
  role:     '#f59e0b',
}

const ERA_STYLES: Record<string, { bg: string; text: string; accent: string; border: string; font: string }> = {
  '80年代日记体': {
    bg: '#fdf6e3',
    text: '#3d2b1f',
    accent: '#8b4513',
    border: '#c8a96e',
    font: '"Courier New", Courier, monospace',
  },
  'QQ空间体': {
    bg: '#1a0033',
    text: '#e0b0ff',
    accent: '#ff69b4',
    border: '#9400d3',
    font: 'system-ui, sans-serif',
  },
  '小红书体': {
    bg: '#ffffff',
    text: '#1a1a1a',
    accent: '#ff2442',
    border: '#ff2442',
    font: 'system-ui, sans-serif',
  },
}

function getEraKey(label: string) {
  for (const key of Object.keys(ERA_STYLES)) {
    if (label.includes(key)) return key
  }
  return '80年代日记体'
}

// ─── 下载工具 ────────────────────────────────────────────────────────────────

async function downloadCard(el: HTMLElement, filename: string) {
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(el, {
    useCORS: true,
    scale: 2,
    backgroundColor: null,
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// ─── 论文版卡片 ──────────────────────────────────────────────────────────────

function AcademicCard({ caption, imagePreview, index }: BaseProps) {
  const ref = useRef<HTMLDivElement>(null)
  const figNum = index + 1

  const handleDownload = useCallback(() => {
    if (ref.current) downloadCard(ref.current, `figure-${figNum}.png`)
  }, [figNum])

  return (
    <div className="space-y-2">
      <div
        ref={ref}
        style={{
          background: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: 4,
          overflow: 'hidden',
          fontFamily: '"Times New Roman", serif',
          maxWidth: 560,
        }}
      >
        {/* 图片区 */}
        {imagePreview && (
          <div style={{ background: '#f9fafb', padding: '12px 12px 0' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="figure"
              style={{ width: '100%', display: 'block', borderRadius: 2 }}
            />
          </div>
        )}
        {/* 图注区 */}
        <div style={{ padding: '10px 16px 14px' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: '#1e3a5f',
                whiteSpace: 'nowrap',
                marginTop: 1,
              }}
            >
              图{figNum}.
            </span>
            <p
              style={{
                fontSize: 13,
                color: '#1f2937',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {caption}
            </p>
          </div>
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: '1px solid #e5e7eb',
              fontSize: 11,
              color: '#6b7280',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Journal of Ordinary Life</span>
            <span>Vol. 1, 2024</span>
          </div>
        </div>
      </div>

      <DownloadBtn onClick={handleDownload} />
    </div>
  )
}

// ─── 朋友圈风格卡片 ──────────────────────────────────────────────────────────

function MomentsCard({ caption, imagePreview, index, mode, ...rest }: NormalCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const accent = MODE_ACCENT[mode]
  const badge = mode === 'role'
    ? ('roleName' in rest ? rest.roleName : '') + ' 视角'
    : ('styleName' in rest ? rest.styleName : '') + ' 风格'

  const handleDownload = useCallback(() => {
    if (ref.current) downloadCard(ref.current, `moments-${index + 1}.png`)
  }, [index])

  return (
    <div className="space-y-2">
      <div
        ref={ref}
        style={{
          background: '#f5f5f5',
          borderRadius: 12,
          overflow: 'hidden',
          maxWidth: 360,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* 顶部色条 */}
        <div style={{ height: 4, background: accent }} />
        {/* 用户行 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px 6px',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            😊
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>
              某某某
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>刚刚</p>
          </div>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 20,
              background: accent + '18',
              color: accent,
              fontWeight: 500,
            }}
          >
            {badge}
          </span>
        </div>
        {/* 图片 */}
        {imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt=""
            style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'cover' }}
          />
        )}
        {/* 文案 */}
        <div style={{ padding: '10px 12px 14px' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#1a1a1a', lineHeight: 1.7 }}>
            {caption}
          </p>
        </div>
      </div>

      <DownloadBtn onClick={handleDownload} />
    </div>
  )
}

// ─── 年代穿越卡片 ────────────────────────────────────────────────────────────

function EraCard({ caption, imagePreview, index, eraLabel }: EraCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const key = getEraKey(eraLabel)
  const s = ERA_STYLES[key]

  const handleDownload = useCallback(() => {
    if (ref.current) downloadCard(ref.current, `era-${key}.png`)
  }, [key])

  return (
    <div className="space-y-2">
      <div
        ref={ref}
        style={{
          background: s.bg,
          border: `2px solid ${s.border}`,
          borderRadius: 10,
          overflow: 'hidden',
          maxWidth: 380,
          fontFamily: s.font,
        }}
      >
        {/* 年代 badge */}
        <div
          style={{
            background: s.accent,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 1,
          }}
        >
          {eraLabel}
        </div>
        {/* 图片 */}
        {imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt=""
            style={{
              width: '100%',
              display: 'block',
              maxHeight: 240,
              objectFit: 'cover',
              opacity: key === '80年代日记体' ? 0.85 : 1,
              filter: key === '80年代日记体' ? 'sepia(0.3)' : 'none',
            }}
          />
        )}
        {/* 文案 */}
        <div style={{ padding: '12px 16px 16px' }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: s.text,
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
            }}
          >
            {caption}
          </p>
        </div>
      </div>

      <DownloadBtn onClick={handleDownload} />
    </div>
  )
}

// ─── 下载按钮 ────────────────────────────────────────────────────────────────

function DownloadBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-gray-400 hover:text-purple-500 flex items-center gap-1 transition-colors"
    >
      <span>↓</span> 下载卡片
    </button>
  )
}

// ─── 导出 ────────────────────────────────────────────────────────────────────

export default function PreviewCard(props: Props) {
  if (props.mode === 'era') return <EraCard {...props} />
  if (props.mode === 'academic') return <AcademicCard {...props} />
  return <MomentsCard {...props} />
}
