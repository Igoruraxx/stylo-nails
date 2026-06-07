import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// PostgreSQL connection via Supabase pooler
const pool = new Pool({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.blwzprxihmienukhsapw',
  password: '92752703Cl@',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})

const adminPasswords = ['92752703', 'senha123']

type TableName = 'categorias' | 'produtos'
const ALLOWED_TABLES: TableName[] = ['categorias', 'produtos']

function checkAuth(password: string) {
  return adminPasswords.includes(password)
}

/* ── UPDATE (PUT) ── */
export async function PUT(req: NextRequest) {
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

  try {
    const client = await pool.connect()
    try {
      const setClauses = Object.entries(data)
        .map(([key, val], i) => `"${key}" = $${i + 1}`)
        .join(', ')
      const values = Object.values(data)
      values.push(id)
      await client.query(
        `UPDATE "${table}" SET ${setClauses} WHERE id = $${values.length}`,
        values
      )
    } finally {
      client.release()
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req)
}

/* ── REORDER + INSERT (POST) ── */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { table, data, password, action } = body

  if (!checkAuth(password)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Tabela inválida' }, { status: 400 })
  }

  try {
    const client = await pool.connect()
    try {
      if (action === 'reorder') {
        for (const item of (data || [])) {
          await client.query(
            `UPDATE "${table}" SET "ordem" = $1 WHERE id = $2`,
            [item.ordem, item.id]
          )
        }
        return NextResponse.json({ success: true })
      }

      if (action === 'insert') {
        const keys = Object.keys(data)
        const values = Object.values(data)
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
        const result = await client.query(
          `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING id`,
          values
        )
        return NextResponse.json({ success: true, id: result.rows[0]?.id })
      }
    } finally {
      client.release()
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
