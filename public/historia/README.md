# História — PDF e marcos cronológicos

## 1. PDF (slideshow)

Coloque o ficheiro com o nome exato:

**`slideshow.pdf`**

Caminho completo no projeto:

```
public/historia/slideshow.pdf
```

No site: botão **Ver slideshow** e área clicável na secção História.

---

## 2. Marcos importantes (linha do tempo)

**Ordem de prioridade:**

1. Se existir **`marcos.json`** → usa essa lista
2. Senão → marcos por defeito no código (não lê o PDF ao carregar a página — mais rápido)

### Ficheiro manual (opcional, recomendado)

Copie `marcos.json.example` para **`marcos.json`** e edite:

```
public/historia/marcos.json
```

```json
[
  {
    "year": "1927",
    "title": "Título curto",
    "text": "Descrição do marco importante."
  }
]
```

Use `"year": "Hoje"` para o marco atual.

---

## Visualização

O PDF abre **automaticamente** ao fazer scroll até à secção História (visualizador nativo do browser — mais leve que renderização página a página).

**Dica:** PDFs muito grandes (&gt; 5 MB) demoram mais na primeira abertura. Comprima o ficheiro se possível.
