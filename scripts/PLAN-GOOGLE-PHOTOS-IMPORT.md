# 📸 Plano: Importar Google Photos → Stylo Nails

## Objetivo

Logar no Google Fotos, ler todos os álbuns e suas fotos, e popular o banco Supabase:
- **Cada álbum** → vira uma **categoria**
- **Cada foto** do álbum → vira um **produto** dentro dessa categoria
- Produtos com nome placeholder (`Produto 1`, `Produto 2`...) **sem preço**
- Admin edita nome e preço depois pelo painel

---

## 🔧 Passo 1 — Configurar Google Cloud + API Fotos

### 1.1 Criar projeto no Google Cloud
- Acessar [console.cloud.google.com](https://console.cloud.google.com)
- Criar projeto: **Stylo Nails Import**
- Ativar **Google Photos Library API**

### 1.2 Configurar tela de consentimento OAuth
- Tipo: **External**
- Escopo: `https://www.googleapis.com/auth/photoslibrary.readonly`
- Test users: adicionar o email `cc664183@gmail.com`

### 1.3 Criar credenciais OAuth Desktop
- Tipo: **Desktop application**
- Baixar `credentials.json`
- Salvar em: `~/stylo-nails/scripts/google-credentials.json`

> ⚠️ Precisa fazer pelo browser uma vez na vida para autorizar o app.

---

## 🐍 Passo 2 — Script de Import (Node.js)

Criar `scripts/import-google-photos.ts` — script Node.js que:

### 2.1 Autenticação OAuth
```ts
// Usa googleapis package para fazer o flow OAuth
// Abre URL no navegador → usuário autoriza → recebe token
// Salva token.json localmente para reuso
```

### 2.2 Listar álbuns
```ts
GET https://photoslibrary.googleapis.com/v1/albums
// Paginar se tiver muitos
```

### 2.3 Para cada álbum:
1. **Criar categoria** no Supabase
   - `nome` = nome do álbum
   - `slug` = slugify(nome)
   - `ordem` = posição
   - `ativo` = true

2. **Listar fotos do álbum**
   ```ts
   POST https://photoslibrary.googleapis.com/v1/mediaItems:search
   { albumId: "...", pageSize: 100 }
   ```

3. **Para cada foto:**
   - Extrair `baseUrl` da mídia
   - Fazer download (`baseUrl=w600-h600`)
   - Fazer upload para **Supabase Storage** bucket `produtos`
   - Criar registro em `produtos`:
     - `nome` = `Produto {n}`
     - `categoria_id` = id da categoria criada
     - `imagem_url` = URL do Supabase Storage
     - `preco` = `0` (sem preço ainda)
     - `ativo` = true

### 2.4 Estrutura do Storage
```
Bucket: produtos/
  {categoria-slug}/
    produto-1.jpg
    produto-2.jpg
    ...
```

---

## 🗄️ Passo 3 — Schema (já existe)

O schema SQL já tem tudo pronto:

```sql
categorias (id, nome, slug, descricao, imagem_url, ordem, ativo)
produtos    (id, categoria_id, nome, descricao, preco, imagem_url, ...)
```

Precisa criar o **bucket `produtos`** no Supabase Storage (público):

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('produtos', 'produtos', true);
```

---

## 👨‍💻 Passo 4 — Execução

```bash
# 1. Instalar dependências
cd ~/stylo-nails/scripts
npm init -y
npm install googleapis @supabase/supabase-js dotenv node-fetch

# 2. Colocar credentials.json no lugar
# 3. Executar import
npx tsx import-google-photos.ts
```

---

## 📋 Fluxo Completo

```
1. [ ] Criar projeto Google Cloud + ativar API
2. [ ] Baixar credentials.json
3. [ ] Executar script → abre navegador pra autorizar
4. [ ] Script lista álbuns → cria categorias
5. [ ] Script percorre cada álbum → baixa fotos → sobe pro Storage
6. [ ] Script cria produtos com nome "Produto N" e preço 0
7. [ ] Admin entra no painel → edita nomes e preços
```

---

## 🔄 Estrutura Final Espearda no DB

```
categorias:
  id | nome              | slug                  | ordem
  ───┼───────────────────┼───────────────────────┼───────
  1  | "Esmaltes Vermelhos" | "esmaltes-vermelhos" | 1
  2  | "Ferramentas"      | "ferramentas"         | 2
  3  | "Decoração"        | "decoracao"           | 3

produtos:
  id | categoria_id | nome       | preco | imagem_url
  ───┼──────────────┼────────────┼───────┼────────────────────
  1  | 1            | Produto 1  | 0.00  | storage/.../1.jpg
  2  | 1            | Produto 2  | 0.00  | storage/.../2.jpg
  3  | 2            | Produto 1  | 0.00  | storage/.../3.jpg
```

---

## ⚠️ Pontos de Atenção

1. **OAuth precisa de interação humana** — a primeira vez vc precisa abrir o navegador e autorizar. Depois o token fica salvo.
2. **Rate limit** — Google Photos API: 10.000 requests/dia. Dá pra importar muitos álbuns.
3. **Tamanho das fotos** — Usar `=w600-h600` nas URLs pra não travar o site.
4. **Bucket público** — O Storage precisa ser público pra exibir no site.
5. **Preço zerado** — Produtos sem preço aparecem como "Sob consulta" ou similar no frontend.

---

## 🚀 Depois da Importação

- Admin vai em `/admin` → edita cada produto com nome real e preço
- Pode reordenar, desativar, colocar em destaque
- Promoções podem ser aplicadas individualmente

---

**Script principal:** `scripts/import-google-photos.ts`
**Dependências:** `googleapis`, `@supabase/supabase-js`, `dotenv`
