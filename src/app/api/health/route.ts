export async function GET() {
  const start = Date.now()
  try {
    const res = await fetch('https://blwzprxihmienukhsapw.supabase.co/rest/v1/categorias?select=*&ativo=eq.true&limit=1', {
      headers: {
        apikey: 'sb_publishable_Md8oCk2-vqoTLqFTKmfxHA_pJ1eQhvA',
        Authorization: 'Bearer sb_publishable_Md8oCk2-vqoTLqFTKmfxHA_pJ1eQhvA',
      },
    })
    const data = await res.json()
    return Response.json({ status: res.status, data, ms: Date.now() - start })
  } catch (e: any) {
    return Response.json({ error: e.message, ms: Date.now() - start }, { status: 500 })
  }
}
