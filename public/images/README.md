# Brasão / imagem da unidade

Coloque aqui o brasão (ou imagem de referência do layout).

**Caminho completo no projeto:**

`ocarrista-site/public/images/brasao-rc4.png`

(Não coloque na raiz do projeto — a raiz não é servida pelo site.)

- **Ficheiro:** `brasao-rc4.png`
- **Entrada (castelo):** `cc_castelo.png` — imagem grande e transparente no ecrã inicial
- **Formato:** PNG com fundo transparente (recomendado) ou SVG
- **Tamanho sugerido:** 800×800 px ou superior (quadrado)

O site usa automaticamente:

- marca d'água subtil no hero
- brasão visível ao lado do título
- logótipo na navbar (substitui "CC" quando o ficheiro existe)
- destaque na secção História

Se o ficheiro ainda não existir, aparece o monograma **CC** como alternativa.

## Troquei a imagem e continua a antiga?

1. Confirme que substituiu o ficheiro em `public/images/brasao-rc4.png` (mesmo nome).
2. Em `app/lib/site-assets.ts`, aumente `BRASAO_VERSION` (ex.: `"2"` → `"3"`).
3. Pare o servidor (`Ctrl+C`) e corra:
   ```bash
   rm -rf .next && npm run dev
   ```
4. No browser: janela anónima ou `Cmd+Shift+R` (hard refresh).
5. Em produção (Vercel): `git push` para novo deploy.
