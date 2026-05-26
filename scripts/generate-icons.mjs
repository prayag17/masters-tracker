/**
 * scripts/generate-icons.mjs
 * Converts public/icons/logo-source.svg → all required PWA PNG sizes.
 *
 * Run:  node scripts/generate-icons.mjs
 */
import sharp from "sharp"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = join(__dirname, "..")
const svgPath   = join(root, "public", "icons", "logo-source.svg")
const svgBuffer = readFileSync(svgPath)

const ICONS = [
  // PWA required
  { file: "icon-192.png",       size: 192 },
  { file: "icon-512.png",       size: 512 },
  // Apple touch icon
  { file: "apple-touch-icon.png", size: 180 },
  // Extra sizes for broader coverage
  { file: "icon-96.png",        size:  96 },
  { file: "icon-72.png",        size:  72 },
  { file: "favicon-32.png",     size:  32 },
  { file: "favicon-16.png",     size:  16 },
]

for (const { file, size } of ICONS) {
  const outPath = join(root, "public", "icons", file)
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ compressionLevel: 9, palette: false })
    .toFile(outPath)
  console.log(`✓  ${size}×${size}  →  public/icons/${file}`)
}

// Also write a favicon.ico–compatible 32×32 PNG as favicon.png
const faviconPath = join(root, "public", "favicon.png")
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(faviconPath)
console.log("✓  32×32   →  public/favicon.png")

console.log("\nAll icons generated successfully.")
