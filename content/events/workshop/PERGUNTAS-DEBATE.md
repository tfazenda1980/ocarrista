# Perguntas ao debate — Workshop

## Passwords

Por defeito (sem configurar nada na Vercel):

| Uso | Password |
|-----|----------|
| Público — enviar pergunta | **1762** |
| Moderador — ver fila | **1762** |

Para mudar: variáveis na Vercel → Settings → Environment Variables:

- `WORKSHOP_QA_PASSWORD` — público
- `WORKSHOP_QA_MOD_PASSWORD` — moderador (se omitir, usa a mesma do público)

## URLs (2026)

- Público: `/eventos/workshop/2026/perguntas`
- Moderador: `/eventos/workshop/2026/moderador`

## Redis (produção)

Ligar **Upstash Redis** ao projeto Vercel para guardar perguntas entre visitantes.
Sem Redis, em `npm run dev` funciona em memória local.

## No dia

1. Dizer ao público: «Password **1762**» (ou a que configurou).
2. Link ou QR para `/perguntas`.
3. Moderador abre `/moderador` com **1762** e aprova perguntas.
