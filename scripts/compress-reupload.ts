/**
 * 📦 Compacta e re-sobe todas as fotos dos produtos
 *
 * Lê as fotos locais de ~/Desktop/StyloNails/import/
 * Redimensiona pra max 1000px, qualidade 85, e re-faz upload pro Supabase
 *
 * Uso: npx tsx scripts/compress-reupload.ts
 */

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const IMPORT_DIR = path.resolve(os.homedir(), 'Desktop/StyloNails/import')
const TEMP_DIR = path.join(os.tmpdir(), 'stylo-compress')

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erro: credenciais Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  🖼️  Compactando e re-enviando fotos... ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log()

  if (!fs.existsSync(IMPORT_DIR)) {
    console.error(`❌ Pasta não encontrada: ${IMPORT_DIR}`)
    process.exit(1)
  }
  
  // Clean temp
  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true })
  fs.mkdirSync(TEMP_DIR, { recursive: true })

  const folders = fs.readdirSync(IMPORT_DIR).filter(f => {
    const full = path.join(IMPORT_DIR, f)
    return fs.statSync(full).isDirectory()
  })

  let totalOriginal = 0
  let totalCompressed = 0
  let totalSaved = 0

  for (const folder of folders) {
    const catSlug = slugify(folder.trim())
    const folderPath = path.join(IMPORT_DIR, folder)
    const images = fs.readdirSync(folderPath)
      .filter(f => ['.jpg','.jpeg','.png','.webp'].includes(path.extname(f).toLowerCase()))
      .sort()

    if (images.length === 0) continue

    // Get category from DB
    const { data: cat } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', catSlug)
      .maybeSingle()

    if (!cat) {
      console.log(`⚠️  Categoria não encontrada: ${folder.trim()}, pulando.`)
      continue
    }

    console.log(`📁 ${folder.trim()} (${images.length} fotos)`)

    let produtoIdx = 0
    for (const img of images) {
      produtoIdx++
      const ext = path.extname(img).toLowerCase()
      const localPath = path.join(folderPath, img)
      const origSize = fs.statSync(localPath).size
      totalOriginal += origSize

      // Compress with sips
      const outName = `produto-${produtoIdx}.jpg`
      const outPath = path.join(TEMP_DIR, outName)

      try {
        execSync(
          `sips -Z 1000 -s format jpeg -s formatOptions 85 "${localPath}" --out "${outPath}" 2>/dev/null`,
          { stdio: 'ignore' }
        )
      } catch {
        // If sips fails (e.g. already jpg), just copy
        fs.copyFileSync(localPath, outPath)
      }

      const compressedSize = fs.statSync(outPath).size
      totalCompressed += compressedSize
      totalSaved += (origSize - compressedSize)

      // Upload to storage
      const fileName = `${catSlug}/${outName}`
      const fileBuffer = fs.readFileSync(outPath)
      const { error: upErr } = await supabase.storage
        .from('produtos')
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (upErr) {
        console.error(`   ❌ Upload erro: ${upErr.message}`)
        continue
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(fileName)

      // Update product record with compressed URL
      await supabase
        .from('produtos')
        .update({ imagem_url: publicUrl })
        .eq('categoria_id', cat.id)
        .eq('nome', `Produto ${produtoIdx}`)
    }

    // Clean temp files for this category
    const catTempFiles = fs.readdirSync(TEMP_DIR)
    for (const f of catTempFiles) {
      fs.unlinkSync(path.join(TEMP_DIR, f))
    }
  }

  // Cleanup
  fs.rmSync(TEMP_DIR, { recursive: true, force: true })

  console.log()
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  ✅ Compactação concluída!              ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  Original:    ${(totalOriginal / 1024 / 1024).toFixed(1).padStart(6)} MB  ║`)
  console.log(`║  Comprimido:  ${(totalCompressed / 1024 / 1024).toFixed(1).padStart(6)} MB  ║`)
  console.log(`║  Economia:    ${(totalSaved / 1024 / 1024).toFixed(1).padStart(6)} MB  ║`)
  console.log(`║  Redução:     ${(100 - (totalCompressed / totalOriginal * 100)).toFixed(0).padStart(5)}%    ║`)
  console.log('╚══════════════════════════════════════════╝')
}

main().catch(e => {
  console.error('❌ Erro fatal:', e.message)
  process.exit(1)
})
