import { SectionShell } from "../section-shell";
import { TacticalCard } from "../tactical-card";
import { IconCalendar, IconTarget, IconShield } from "../icons";

const events = [
  {
    title: "Dia do Quartel da Cavalaria e do Ex-RC4",
    meta: "EDIÇÃO ANUAL",
    description:
      "Encontro no quartel de Santa Margarida: homenagens, convívio entre veteranos e ativos e celebração da casa do Regimento de Cavalaria 4.",
    icon: <IconShield />,
  },
  {
    title: "Concurso Nacional Combinado",
    meta: "EDIÇÃO ANUAL",
    description:
      "Competição nacional que reúne equipas em provas combinadas de precisão, conhecimento e espírito de corpo dos carristas.",
    icon: <IconTarget />,
  },
  {
    title: "Workshop de Carros de Combate",
    meta: "EDIÇÃO ANUAL",
    description:
      "Sessões técnicas e demonstrações sobre viaturas blindadas, manutenção e doutrina — para entusiastas e profissionais.",
    icon: <IconCalendar />,
  },
  {
    title: "Marcha a Cavalo à Batalha",
    meta: "EDIÇÃO ANUAL",
    description:
      "Percurso a cavalo em memória das campanhas e tradições equestres do regimento, com participação da comunidade e convidados.",
    icon: <IconShield />,
  },
  {
    title: "São Martinho",
    meta: "EDIÇÃO ANUAL",
    description:
      "Magusto e convívio de outono à mesa, no espírito de união que caracteriza os encontros do Ex-RC4 em Santa Margarida.",
    icon: <IconCalendar />,
  },
  {
    title: "A Noite de Fados",
    meta: "EDIÇÃO ANUAL",
    description:
      "Noite de fado e tradição portuguesa entre carristas, famílias e amigos — cultura e camaradagem em ambiente íntimo.",
    icon: <IconCalendar />,
  },
  {
    title: 'Challenger "O Carrista"',
    meta: "EDIÇÃO ANUAL",
    description:
      "Desafio competitivo da comunidade O Carrista: provas, equipas e espírito de superação entre membros e convidados.",
    icon: <IconTarget />,
  },
];

export function EventosSection() {
  return (
    <SectionShell
      id="eventos"
      label="Secção 01 · Eventos"
      title="Agenda Anual"
      description="Sete eventos com edições anuais que marcam o calendário da comunidade — do quartel de Santa Margarida aos desafios e tradições do Ex-RC4."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <TacticalCard key={event.title} {...event} />
        ))}
      </div>

      <p className="mt-10 border border-gold/15 bg-gold/5 px-6 py-4 text-center text-sm text-muted sm:text-base">
        Todos os eventos decorrem em edição anual. Consulte datas e inscrições
        através da{" "}
        <a href="#comunidade" className="text-gold underline-offset-4 hover:underline">
          Comunidade
        </a>{" "}
        ou do{" "}
        <a href="#gesco" className="text-gold underline-offset-4 hover:underline">
          GesCO
        </a>
        .
      </p>
    </SectionShell>
  );
}
