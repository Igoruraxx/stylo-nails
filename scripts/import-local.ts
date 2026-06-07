/**
 * 📦 Import Local Photos → Stylo Nails
 *
 * Lê pastas locais em ~/Desktop/StyloNails/import/
 * Cada pasta vira uma categoria, cada foto vira um produto
 *
 * Uso: npx tsx scripts/import-local.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const IMPORT_DIR = path.resolve(__dirname, '../import')

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erro: Supabase credentials não encontradas no .env.local')
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

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.heic': 'image/heic',
}

function getFolders(dir: string): string[] {
  return fs.readdirSync(dir).filter(f => {
    const full = path.join(dir, f)
    return fs.statSync(full).isDirectory()
  })
}

function getImages(dir: string): string[] {
  return fs.readdirSync(dir).filter(f => {
    const ext = path.extname(f).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.heic'].includes(ext)
  }).sort()
}

async function main() {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║  📦 Import Local → Stylo Nails            ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log()

  // Verificar pasta de importação
  if (!fs.existsSync(IMPORT_DIR)) {
    console.error(`❌ Pasta não encontrada: ${IMPORT_DIR}`)
    process.exit(1)
  }

  const folders = getFolders(IMPORT_DIR)
  console.log(`📂 Encontradas ${folders.length} pastas (categorias)`)

  let totalCategorias = 0
  let totalProdutos = 0
  let ordem = 0

  for (const folder of folders) {
    ordem++
    const categoriaNome = folder.trim()
    const categoriaSlug = slugify(categoriaNome)
    const folderPath = path.join(IMPORT_DIR, folder)
    const images = getImages(folderPath)

    console.log(`\n━━━ 📁 ${categoriaNome} (${images.length} fotos) ━━━`)

    if (images.length === 0) {
      console.log('   ℹ️  Pasta vazia, pulando.')
      continue
    }

    // Criar categoria
    console.log('   → Criando categoria...')
    const { data: existingCat } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', categoriaSlug)
      .maybeSingle()

    let categoriaId: number
    if (existingCat) {
      categoriaId = existingCat.id
      console.log(`   ✅ Categoria já existe (id=${categoriaId})`)
    } else {
      const { data: newCat, error: catErr } = await supabase
        .from('categorias')
        .insert({
          nome: categoriaNome,
          slug: categoriaSlug,
          ordem,
          ativo: true,
        })
        .select('id')
        .single()

      if (catErr || !newCat) {
        console.error(`   ❌ Erro ao criar categoria: ${catErr?.message}`)
        continue
      }
      categoriaId = newCat.id
      totalCategorias++
      console.log(`   ✅ Categoria criada (id=${categoriaId})`)
    }

    // Upload cada foto e criar produto
    let produtoCount = 0
    for (const imgFile of images) {
      produtoCount++
      const localPath = path.join(folderPath, imgFile)
      const ext = path.extname(imgFile).toLowerCase()
      const contentType = MIME_TYPES[ext] || 'image/jpeg'

      // Ler o arquivo
      const fileBuffer = fs.readFileSync(localPath)
      const fileName = `${categoriaSlug}/produto-${produtoCount}${ext}`

      // Upload pro Storage
      const { error: uploadErr } = await supabase.storage
        .from('produtos')
        .upload(fileName, fileBuffer, {
          contentType,
          upsert: true,
        })

      if (uploadErr) {
        console.error(`   ❌ Erro upload ${imgFile}: ${uploadErr.message}`)
        continue
      }

      // URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(fileName)

      // Criar produto no DB
      const { error: prodErr } = await supabase
        .from('produtos')
        .insert({
          categoria_id: categoriaId,
          nome: `Produto ${produtoCount}`,
          preco: 0,
          imagem_url: publicUrl,
          ordem: produtoCount,
          ativo: true,
        })

      if (prodErr) {
        console.error(`   ❌ Erro ao criar produto: ${prodErr.message}`)
        continue
      }

      totalProdutos++
    }

    console.log(`   ✅ ${produtoCount} produtos importados`)
  }

  // ─── Resumo Final ───────────────────────────
  console.log()
  console.log('╔════════════════════════════════════════════╗')
  console.log('║  🎉 Importação concluída!                 ║')
  console.log('╠════════════════════════════════════════════╣')
  console.log(`║  📂 Categorias: ${totalCategorias.toString().padStart(4)}                        ║`)
  console.log(`║  📦 Produtos:   ${totalProdutos.toString().padStart(4)}                        ║`)
  console.log('╠════════════════════════════════════════════╣')
  console.log('║  Próximo passo:                           ║')
  console.log('║  Acesse /admin para editar nomes           ║')
  console.log('║  e preços dos produtos!                    ║')
  console.log('╚════════════════════════════════════════════╝')
}

main().catch(e => {
  console.error('❌ Erro fatal:', e.message)
  process.exit(1)
})
