import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '朋友圈文案生成器',
  description: '上传图片，AI帮你写有灵魂的朋友圈文案',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
