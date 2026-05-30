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

## 3. Upstash Redis (perguntas workshop)

1. Vercel → **Storage** → **Upstash Redis** → Connect
2. Confirma que aparecem `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

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
| `UPSTASH_REDIS_REST_URL` | Preenchida pela integração Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Idem |
| `RESEND_API_KEY` | Da Resend |
| `EMAIL_FROM` | Ex. `O Carrista <noreply@teudominio.pt>` |
| `ADMIN_NOTIFY_EMAIL` | `secpessoalgcc@gmail.com` |
| `ADMIN_USERNAME` | `Admin1762` |
| `ADMIN_PASSWORD` | `Leopard2@6` (ou outra — **só na Vercel**, não no Git) |
| `WORKSHOP_QA_PASSWORD` | `1762` (opcional; há default no código) |

Depois: **Deployments → Redeploy** (para carregar as novas vars).

---

## 6. Testar em produção

| Teste | URL / ação |
|-------|------------|
| Admin | `/admin/entrar` — `Admin1762` + password |
| Adesões | Formulário Comunidade → email para `secpessoalgcc@gmail.com` → `/admin/adesoes` → Autorizar |
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
