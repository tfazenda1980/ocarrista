# Configurar produção (Vercel)

Guia para ligar Neon, Resend, Upstash e variáveis no projeto **ocarrista-site**.  
O código já está pronto; falta só criar os serviços e colar os valores.

## O que não dá para fazer automaticamente

Sem login na tua conta Vercel/Neon/Resend, ninguém (incluindo o agente) pode:

- Criar bases de dados ou API keys na tua conta
- Clicar em “Add Integration” no dashboard Vercel
- Verificar domínio de email no Resend

O que podes fazer em **~15 minutos** seguindo isto.

---

## 1. Vercel — projeto e deploy

1. [vercel.com](https://vercel.com) → Import Git → repositório `tfazenda1980/ocarrista`
2. Framework: **Next.js** (deteção automática)
3. Primeiro deploy pode falhar até haver env vars — normal

**URL de produção:** anota o domínio (ex. `https://ocarrista.vercel.app` ou domínio próprio).

---

## 2. Neon (membros / adesões)

1. Vercel → projeto → **Storage** → **Connect** → **Neon**
2. Cria base; Vercel injeta `DATABASE_URL` automaticamente
3. Neon → **SQL Editor** → colar todo o ficheiro `scripts/init-db.sql` → **Run**

---

## 3. Upstash Redis / Vercel KV (perguntas workshop)

1. Vercel → **Storage** → **Upstash Redis** ou **KV** → Connect ao projeto `ocarrista`
2. **Não uses prefixo personalizado** no campo «Custom Environment Variable Prefix» (deixa vazio)
3. Confirma em **Settings → Environment Variables** (Production) um destes pares:
   - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, ou
   - `KV_REST_API_URL` + `KV_REST_API_TOKEN` (comum ao ligar «upstash-kv» na Vercel)
4. **Redeploy** obrigatório após ligar

---

## 4. Resend (emails)

1. [resend.com](https://resend.com) → API Key → copiar
2. **Domínio:** para produção, adiciona o teu domínio e usa `EMAIL_FROM=O Carrista <noreply@teudominio.pt>`
3. Em testes podes usar `onboarding@resend.dev` (só para o teu email de teste na Resend)

---

## 5. Variáveis de ambiente na Vercel

**Settings → Environment Variables** → Production (e Preview se quiseres):

| Variável | Valor / notas |
|----------|----------------|
| `SITE_URL` | URL pública do site, **sem** barra final (ex. `https://ocarrista.pt`) |
| `SESSION_SECRET` | String aleatória ≥ 32 chars (`openssl rand -base64 32`) |
| `DATABASE_URL` | Preenchida pela integração Neon |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Integração Upstash Redis, ou |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Integração Vercel KV (o site aceita ambos) |
| `RESEND_API_KEY` | Da Resend |
| `EMAIL_FROM` | Ex. `O Carrista <noreply@teudominio.pt>` |
| `ADMIN_NOTIFY_EMAIL` | `ocarrista.cc@gmail.com` |
| `ADMIN_USERNAME` | `Admin1762` |
| `ADMIN_PASSWORD` | `Leopard2@6` (ou outra — **só na Vercel**, não no Git) |
| `WORKSHOP_QA_PASSWORD` | `1762` (opcional; há default no código) |
| `CRON_SECRET` | String aleatória (Vercel Cron → alertas email a membros) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — upload de croquis PDF/PPT no Challenger (opcional) |

---

## 5b. Challenger (provas, guarnições, classificação)

1. Neon → SQL Editor → executar `scripts/migrate-challenger.sql`
2. (Opcional) Vercel → **Storage** → **Blob** → ligar ao projeto → `BLOB_READ_WRITE_TOKEN`
3. Admin → `/admin/challenger/2026` — provas, guarnições (4 elementos), pontuações
4. Página pública → `/eventos/challenger/2026`

Depois: **Deployments → Redeploy** (para carregar as novas vars).

### SQL adicional (notificações)

No Neon, executar também `scripts/migrate-notifications.sql` (tabela `notification_sent` + artigos Loja já existentes marcados como notificados).

### Alertas automáticos (membros aprovados)

| Alerta | Quando |
|--------|--------|
| **Destaque de evento** | Entrada na janela de 3 semanas antes da data (Workshop, CNC, etc.) — uma vez por evento |
| **Novo artigo Loja** | Novo `id` em `content/loja/products.json` após deploy — cron diário às 08:00 UTC |

Cron: `GET /api/cron/notifications` (Vercel, com `CRON_SECRET`).

### Sessão por inatividade

Membros e administrador: **logout automático após 2 minutos** sem actividade no site (volta a visitante normal).

---

## 6. Testar em produção

| Teste | URL / ação |
|-------|------------|
| Admin | `/admin/entrar` — `Admin1762` + password |
| Adesões | Formulário Comunidade → email para `ocarrista.cc@gmail.com` → painel admin na homepage → Autorizar |
| Loja | Pedido de membro → email para `ocarrista.cc@gmail.com` (mesmo `ADMIN_NOTIFY_EMAIL`) |
| Membro | Link no email → definir password → `/entrar` |
| Q&A workshop | `/eventos/workshop/2026/perguntas` — password `1762` |
| Moderar Q&A | `/admin/perguntas` (com sessão admin) |

---

## 7. Desenvolvimento local

1. Copia `.env.example` ou usa o `.env.local` já criado no projeto
2. Preenche `DATABASE_URL`, Redis e `RESEND_API_KEY`
3. `npm run dev`

---

## Segurança

- Roda `ADMIN_PASSWORD` só nas env vars da Vercel em produção
- Não commits `.env.local` nem API keys
- Se a password já foi partilhada em chat, considera mudá-la na Vercel
