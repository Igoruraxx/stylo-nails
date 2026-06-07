import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const adminPassword = process.env.ADMIN_PASSWORD || ''

/* ── Pool de conexão direta ao PostgreSQL ── */
const pool = new Pool({
  host: 'db.blwzprxihmienukhsapw.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD || '92752703Cl@',
  ssl: { rejectUnauthorized: false },
  max: 3,
  connectionTimeoutMillis: 10000,
})

type TableName = 'categorias' | 'produtos'
const ALLOWED_TABLES: TableName[] = ['categorias', 'produtos']

function checkAuth(password: string) {
  return password === adminPassword
}

/* ── Executa query e retorna JSON ── */
async function query(sql: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = params
      ? await client.query(sql, params)
      : await client.query(sql)
    return { rows: result.rows, rowCount: result.rowCount }
  } finally {
    client.release()
  }
}

/* ── UPDATE (PUT) ── */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, id, data, password } = body

    if (!checkAuth(password)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Tabela inválida' }, { status: 400 })
    }
    if (!id || !data) {
      return NextResponse.json({ error: 'id e data são obrigatórios' }, { status: 400 })
    }

    // Monta SET dinamicamente
    const sets: string[] = []
    const values: any[] = []
    let idx = 1
    for (const [key, val] of Object.entries(data)) {
      sets.push(`${key} = $${idx++}`)
      values.push(val)
    }
    values.push(id)
    const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${idx}`
    await query(sql, values)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req)
}

/* ── INSERT + REORDER (POST) ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, data, password, action } = body

    if (!checkAuth(password)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Tabela inválida' }, { status: 400 })
    }

    /* ── Reorder ── */
    if (action === 'reorder') {
      for (const item of (data || [])) {
        await query(`UPDATE ${table} SET ordem = $1 WHERE id = $2`, [item.ordem, item.id])
      }
      return NextResponse.json({ success: true })
    }

    /* ── Insert ── */
    if (action === 'insert') {
      const cols = Object.keys(data)
      const vals = Object.values(data)
      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ')
      const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING id`
      const result = await query(sql, vals)
      return NextResponse.json({ success: true, id: result.rows[0]?.id })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
