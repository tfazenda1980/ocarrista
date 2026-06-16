# Eventos O Carrista

## Workshop (por ano)

Configuração em `content/events/workshop/`:

| Ficheiro | Função |
|----------|--------|
| `series.json` | Anos listados na barra dourada e ano por defeito |
| `2026.json` | Conteúdo completo da edição 2026 |
| `2025.json` | 1.ª edição — arquivo (`published: false` até preencher conteúdo) |

**URLs:**
- Cartão na Agenda → `/eventos/workshop` (página do evento com barra de anos)
- Teaser na **entrada** (hero) → `/eventos/workshop/2026` se faltarem ≤ 3 semanas; senão placeholder «Próximo destaque»

Registo de novas edições: adicionar `YYYY.json` e o ano em `series.json` → `app/lib/events/load-workshop.ts`.

### Oradores e moderadores (fotos + bios)

| Recurso | Local |
|---------|--------|
| Fotos | `public/eventos/workshop/2026/oradores/{id}.jpg` — deteção automática |
| Dados | `content/events/workshop/2026.json` → `speakers` e `moderators` |
| Guia | `public/eventos/workshop/2026/oradores/README.md` |

Perfil ao clicar: `fullName`, `bio` (cartão), `bioSections` (modal). Ver entradas de `smor-vitor-branco` e `maj-nuno-silva` como modelo.

## Concurso Nacional Combinado (CNC)

Configuração em `content/events/cnc/`:

| Ficheiro | Função |
|----------|--------|
| `series.json` | Anos e ano por defeito |
| `2026.json` | Nota de abertura, programa, provas (PDFs), informação útil, contactos, patrocinadores |

**URLs:** `/eventos/cnc` → `/eventos/cnc/2026`

PDFs para concorrentes: `public/eventos/cnc/2026/` (ver README nessa pasta). Actualizar `href` em `2026.json`.

Patrocinadores: array `sponsors` com `name`, `logo`, `url`.

## Outros eventos

Rotas genéricas em `/eventos/[slug]` quando existirem mais eventos além do Workshop e CNC.
