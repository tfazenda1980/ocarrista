# Logo O Carrista

**Ficheiro principal:** `ocarrista.png` (logo — figura do carrista)

(Não coloque na raiz do projeto — a raiz não é servida pelo site.)

- **Logo (navbar):** `ocarrista.png`
- **Brasão RC4:** `brasao-rc4.png` — secção História e marca d’água
- **Workshop 2026:** `workshop26.png` — cartão de eventos e página do workshop
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

1. Confirme que substituiu o ficheiro em `public/images/brasao-rc4.png` ou `ocarrista.png` (consoante o caso).
2. Em `app/lib/site-assets.ts`, aumente `BRASAO_VERSION` ou `LOGO_VERSION`.
3. Pare o servidor (`Ctrl+C`) e corra:
   ```bash
   rm -rf .next && npm run dev
   ```
4. No browser: janela anónima ou `Cmd+Shift+R` (hard refresh).
5. Em produção (Vercel): `git push` para novo deploy.
