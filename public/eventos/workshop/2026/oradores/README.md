# Fotos — Workshop 2026 · Oradores e moderadores

Coloque aqui as fotos com o **nome do ficheiro = `id` da pessoa** (ver `content/events/workshop/2026.json`).

## Formato

| Campo | Valor |
|-------|--------|
| Pasta | `public/eventos/workshop/2026/oradores/` |
| Nome | `{id}.jpg` (ou `.png`, `.jpeg`, `.webp`) |
| Exemplo | `maj-tiago-ferreira.jpg` |

Não é obrigatório editar o JSON só para a foto: se o ficheiro existir nesta pasta com o `id` certo, o site deteta-a automaticamente.

## Lista (2026)

| id | Nome | Foto | Bio no JSON |
|----|------|------|-------------|
| `maj-nuno-silva` | Maj Nuno Silva | ✓ | ✓ (orador + moderador) |
| `smor-vitor-branco` | SMor Vítor Branco | ✓ | ✓ |
| `tcor-pereira-coutinho` | TCor Pereira Coutinho | pendente | pendente |
| `tcor-sergio-capelo` | TCor Sérgio Capelo | pendente | pendente |
| `maj-teixeira-pinto` | Maj Teixeira Pinto | pendente | pendente |
| `cap-marco-lopes` | Cap Marco Lopes | pendente | pendente |
| `ten-joao-leal` | Ten João Leal | pendente | pendente |
| `sch-nuno-goncalves` | SCh Nuno Gonçalves | pendente | pendente |
| `saj-alexandre-mendes` | SAj Alexandre Mendes | pendente | pendente |
| `saj-vitor-pereira` | SAj Vítor Pereira | pendente | pendente |
| `saj-vilas-boas` | SAj Vilas Boas | pendente | pendente |
| `maj-tiago-ferreira` | Maj Tiago Ferreira (moderador) | pendente | pendente |

## Bio completa (JSON)

Em `content/events/workshop/2026.json`, por cada pessoa, acrescentar quando tiver o descritivo:

```json
{
  "id": "maj-teixeira-pinto",
  "name": "Maj Teixeira Pinto",
  "fullName": "Nome completo oficial",
  "role": "Posto · Orador",
  "bio": "Resumo curto para o cartão (2–3 linhas)",
  "bioSections": [
    { "title": "Percurso", "body": "…" },
    { "title": "Formação e cursos", "items": ["…", "…"] },
    { "title": "Cargo atual", "body": "…" }
  ]
}
```

Campos opcionais: `fullName`, `image` (se o nome do ficheiro for diferente do `id`), `bioSections`.

Moderadores só em `moderators` (ex. `maj-tiago-ferreira`) usam o mesmo `id` e a mesma pasta de fotos. Se também forem oradores, basta preencher a entrada em `speakers`.
