/**
 * 📸 Import Google Photos → Stylo Nails
 *
 * 1. Usa rclone para listar álbuns e baixar fotos do Google Fotos
 * 2. Cria categorias no Supabase (nome = álbum)
 * 3. Sobe fotos pro Supabase Storage
 * 4. Cria produtos com nome "Produto N" e preço 0
 *
 * Pré-requisitos:
 *   - rclone configurado com Google Photos (rclone config → gphotos)
 *   - .env.local com NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso: npx tsx scripts/import-google-photos.ts
 */

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// ─── Config ───────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const TEMP_DIR = path.join(os.tmpdir(), 'stylo-nails-import')
const BUCKET = 'produtos'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erro: Supabase credentials não encontradas no .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Helpers ──────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 })
  } catch (e: any) {
    console.error(`❌ Comando falhou: ${cmd}`)
    console.error(e.stderr || e.message)
    throw e
  }
}

function parseRcloneList(output: string): string[] {
  return output
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .filter(l => !l.startsWith('---')) // skip rclone header
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  📸 Import Google Photos → Stylo Nails  ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log()

  // 1. Verificar rclone + Google Photos
  console.log('🔍 Verificando rclone...')
  try {
    const version = run('rclone version').split('\n')[0]
    console.log(`   ✅ ${version}`)
  } catch {
    console.error('❌ rclone não encontrado. Instale com: brew install rclone')
    process.exit(1)
  }

  console.log('🔍 Verificando Google Photos...')
  try {
    run('rclone lsd gphotos:album 2>/dev/null')
    console.log('   ✅ Google Photos configurado!')
  } catch {
    console.log()
    console.log('⚠️  Google Photos NÃO configurado no rclone.')
    console.log()
    console.log('📋 Para configurar:')
    console.log('   1. Execute: rclone config')
    console.log('   2. Escolha: n) New remote')
    console.log('   3. Nome: gphotos')
    console.log('   4. Tipo: 28) Google Photos')
    console.log('   5. Client ID: deixe vazio (usa default)')
    console.log('   6. Client Secret: deixe vazio')
    console.log('   7. Escopo: 1) photoslibrary.readonly')
    console.log('   8. Abre browser → faça login → autorize')
    console.log('   9. Pronto!')
    console.log()
    console.log('Depois de configurar, rode este script novamente.')
    process.exit(0)
  }

  // 2. Listar álbuns
  console.log('\n📂 Listando álbuns do Google Fotos...')
  const albumOutput = run('rclone lsd gphotos:album/')
  const albumLines = parseRcloneList(albumOutput)

  // Parse: rclone lsd mostra "-1 2024-01-01 12:34:00 -1 Nome do Album"
  interface Album {
    name: string
  }

  const albums: Album[] = []
  for (const line of albumLines) {
    // Pega tudo depois do último timestamp
    const parts = line.split(/\s+/)
    // Formato típico: "-1 2024-01-01 12:34:00 -1 Nome do Album"
    const nameParts = parts.slice(4)
    if (nameParts.length > 0) {
      albums.push({ name: nameParts.join(' ') })
    }
  }

  if (albums.length === 0) {
    console.log('❌ Nenhum álbum encontrado no Google Fotos.')
    process.exit(0)
  }

  console.log(`   ✅ Encontrados ${albums.length} álbuns:`)
  albums.forEach((a, i) => console.log(`      ${i + 1}. ${a.name}`))

  // Confirmar
  console.log()
  console.log('⚠️  Vai importar TODOS os álbuns acima como categorias + produtos.')
  console.log('   Pressione Ctrl+C para cancelar ou aguarde 5 segundos...')
  await sleep(5000)

  // 3. Processar cada álbum
  let totalProdutos = 0
  let totalCategorias = 0

  for (const album of albums) {
    const categoriaSlug = slugify(album.name)
    console.log(`\n━━━ 📁 ${album.name} ━━━`)

    // 3a. Criar categoria
    console.log(`   → Criando categoria...`)
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
          nome: album.name,
          slug: categoriaSlug,
          ordem: totalCategorias + 1,
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

    // 3b. Listar fotos do álbum
    console.log(`   → Listando fotos...`)
    const albumPath = `gphotos:album/${album.name}`

    let photosOutput: string
    try {
      photosOutput = run(`rclone lsf "${albumPath}" --format "p"`)
    } catch {
      console.log(`   ℹ️  Álbum vazio ou inacessível, pulando.`)
      continue
    }

    const photoNames = parseRcloneList(photosOutput)
    console.log(`   📸 ${photoNames.length} foto(s) encontrada(s)`)

    if (photoNames.length === 0) continue

    // 3c. Criar diretório temp para o álbum
    const albumDir = path.join(TEMP_DIR, categoriaSlug)
    fs.mkdirSync(albumDir, { recursive: true })

    // 3d. Baixar fotos
    const localDir = path.join(TEMP_DIR, categoriaSlug)
    console.log(`   ⬇️  Baixando fotos...`)

    try {
      run(`rclone copy "${albumPath}" "${localDir}"`)
    } catch (e) {
      console.error(`   ❌ Erro ao baixar fotos: ${e}`)
      continue
    }

    const files = fs.readdirSync(localDir).filter(f => {
      const ext = path.extname(f).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.heic'].includes(ext)
    })

    console.log(`   ✅ ${files.length} arquivo(s) baixado(s)`)

    // 3e. Upload cada foto + criar produto
    let produtoCount = 0
    for (const file of files) {
      produtoCount++
      const localPath = path.join(localDir, file)
      const ext = path.extname(file)
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.gif': 'image/gif',
        '.heic': 'image/heic',
      }

      // Ler arquivo
      const fileBuffer = fs.readFileSync(localPath)
      const fileName = `${categoriaSlug}/produto-${produtoCount}${ext}`
      const contentType = mimeTypes[ext] || 'image/jpeg'

      // Upload pra Storage
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, fileBuffer, {
          contentType,
          upsert: true,
        })

      if (uploadErr) {
        console.error(`   ❌ Erro upload ${file}: ${uploadErr.message}`)
        continue
      }

      // URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName)

      // Criar produto
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

    // Limpar temp
    fs.rmSync(albumDir, { recursive: true, force: true })

    console.log(`   ✅ ${produtoCount} produto(s) importados de "${album.name}"`)
  }

  // ─── Resumo Final ───────────────────────────────────────────
  console.log()
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  🎉 Importação concluída!               ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  📂 Categorias criadas: ${totalCategorias.toString().padStart(4)}        ║`)
  console.log(`║  📦 Produtos criados:   ${totalProdutos.toString().padStart(4)}        ║`)
  console.log('╠══════════════════════════════════════════╣')
  console.log('║  Próximo passo:                         ║')
  console.log('║  Acesse /admin para editar nomes         ║')
  console.log('║  e preços dos produtos!                  ║')
  console.log('╚══════════════════════════════════════════╝')
}

main().catch(e => {
  // eslint-disable-next-line no-console
  console.error('❌ Erro fatal:', e.message)
  process.exit(1)
})
