import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const adminPasswords = ['92752703', 'senha123']

type TableName = 'categorias' | 'produtos'
const ALLOWED_TABLES: TableName[] = ['categorias', 'produtos']

function checkAuth(password: string) {
  return adminPasswords.includes(password)
}

/* ── DELETE ── */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, id, password } = body

    if (!checkAuth(password)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Tabela inválida' }, { status: 400 })
    }
    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
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

    const { error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
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
  try {
    const body = await req.json()
    const { table, data, password, action } = body

    if (!checkAuth(password)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Tabela inválida' }, { status: 400 })
    }

    if (action === 'reorder') {
      for (const item of (data || [])) {
        await supabase.from(table).update({ ordem: item.ordem }).eq('id', item.id)
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'insert') {
      const { error, data: inserted } = await supabase
        .from(table)
        .insert(data)
        .select('id')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, id: inserted?.id })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
