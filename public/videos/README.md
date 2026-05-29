# Vídeo de divulgação

Coloque aqui o vídeo promocional (aparece a seguir ao Grito d'O Carrista).

## Ficheiro principal

**`divulgacao.mp4`**

Caminho completo:

```
public/videos/divulgacao.mp4
```

## Poster opcional (imagem antes de play)

**`divulgacao-poster.jpg`**

```
public/videos/divulgacao-poster.jpg
```

## Recomendações

- Formato: **MP4** (H.264), proporção **16:9**
- Comprima o vídeo (ex.: HandBrake) — ficheiros muito grandes podem ser lentos na Vercel
- Ideal: até ~50–80 MB; acima disso considere YouTube/Vimeo e pedir embed no projeto

Ao substituir o vídeo, aumente `VIDEO_DIVULGACAO_VERSION` em `app/lib/site-assets.ts` para forçar atualização no browser.
