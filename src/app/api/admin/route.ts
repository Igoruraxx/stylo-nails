import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type TableName = 'categorias' | 'produtos'

const ALLOWED_TABLES: TableName[] = ['categorias', 'produtos']

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, id, data, password } = body

    // Simple auth
    if (password !== 'admin123') {
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
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  // Same as PUT for simplicity
  return PUT(req)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, id, data, password, action } = body

    if (password !== 'admin123') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Tabela inválida' }, { status: 400 })
    }

    if (action === 'reorder') {
      // Reorder: data = [{ id, ordem }]
      for (const item of data || []) {
        await supabase.from(table).update({ ordem: item.ordem }).eq('id', item.id)
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
