# Perguntas ao debate — Workshop

## URLs (edição 2026)

| Quem | URL |
|------|-----|
| Público | `/eventos/workshop/2026/perguntas` |
| Moderador | `/eventos/workshop/2026/moderador` |

No programa, cada «Sessão de debate» tem o link **Enviar pergunta ao debate**.

## Configuração na Vercel

1. Marketplace → **Upstash Redis** → ligar ao projeto (gera `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`).
2. Environment Variables:
   - `WORKSHOP_QA_P1_PASSWORD` — ex.: palavra curta para o debate do Painel 1
   - `WORKSHOP_QA_P2_PASSWORD` — para o Painel 2
   - `WORKSHOP_QA_MOD_PASSWORD` — só para o moderador ver a fila

Em desenvolvimento local, sem Redis, as perguntas ficam em memória (reiniciam ao parar o servidor).

## No dia do evento

1. Moderador diz a password do público para o debate em curso.
2. Público abre o link (ou QR) e envia perguntas.
3. Moderador abre `/moderador`, entra com a password de moderação, aprova as perguntas para ler no painel.

Perguntas expiram ao fim de 48 h no Redis.
