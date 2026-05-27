import { SectionShell } from "../section-shell";
import { IconBook } from "../icons";

/** Coloque o PDF em public/historia/historia-regimento-cavalaria-4.pdf */
export const HISTORIA_RC4_PDF = "/historia/historia-regimento-cavalaria-4.pdf";

const timeline = [
  {
    year: "1927",
    title: "Regimento de Cavalaria 4",
    text: "O RC4 nasce em Santa Margarida, forjando gerações de cavaleiros e, mais tarde, carristas nas forças blindadas portuguesas.",
  },
  {
    year: "1993",
    title: "Extinção e Legado",
    text: "Com a reorganização do Exército, o regimento é extinto — mas a memória, o quartel e o espírito Ex-RC4 permanecem vivos.",
  },
  {
    year: "Hoje",
    title: "O Carrista",
    text: "Comunidade que une veteranos, famílias e amigos em torno da história do RC4, dos eventos anuais e da identidade de Santa Margarida.",
  },
];

export function HistoriaSection() {
  return (
    <SectionShell
      id="historia"
      label="Secção 02 · História"
      title="Legado do RC4"
      description="A história do Regimento de Cavalaria 4 e de Santa Margarida — preservada para quem serviu, para as famílias e para as gerações futuras."
      alt
    >
      <div className="card-tactical corner-brackets mb-14 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
            <IconBook />
          </div>
          <div>
            <p className="font-display text-xs tracking-[0.2em] text-gold uppercase">
              Documento histórico
            </p>
            <h3 className="font-display mt-1 text-lg font-semibold tracking-wide text-foreground uppercase sm:text-xl">
              História do Regimento de Cavalaria 4
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Consulte ou descarregue o PDF com a história oficial do RC4 — origens,
              campanhas, o quartel em Santa Margarida e o legado do Ex-RC4.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          <a
            href={HISTORIA_RC4_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-center"
          >
            Abrir PDF
          </a>
          <a
            href={HISTORIA_RC4_PDF}
            download
            className="btn-outline text-center"
          >
            Descarregar
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent sm:left-1/2 sm:-translate-x-px" />

        <ol className="space-y-10 sm:space-y-14">
          {timeline.map((item, i) => (
            <li
              key={item.year}
              className={`relative flex flex-col gap-4 sm:w-[calc(50%-2rem)] ${
                i % 2 === 0
                  ? "sm:mr-auto sm:pr-8 sm:text-right"
                  : "sm:ml-auto sm:pl-8 sm:text-left"
              }`}
            >
              <span
                className={`absolute top-1 h-3 w-3 border border-gold bg-background ${
                  i % 2 === 0
                    ? "left-4 sm:left-auto sm:right-0 sm:translate-x-1/2"
                    : "left-4 sm:left-1/2 sm:-translate-x-1/2"
                }`}
              />
              <div className="pl-10 sm:pl-0">
                <span className="font-display text-2xl font-bold text-gold">{item.year}</span>
                <h3 className="font-display mt-1 text-lg font-semibold tracking-wide uppercase">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
