import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const svgPath = path.join(dir, 'icon.svg')
const publicDir = path.join(dir, '..', 'public')

const targets = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 16, name: 'favicon-16.png' },
]

for (const { size, name } of targets) {
  const outPath = path.join(publicDir, name)
  await sharp(svgPath).resize(size, size).png().toFile(outPath)
  console.log(`Wrote ${outPath}`)
}
