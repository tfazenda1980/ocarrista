import { SectionShell } from "../section-shell";
import { EventCard } from "../events/event-card";
import { IconCalendar, IconTarget, IconShield } from "../icons";
import { WORKSHOP_26_SRC } from "../../lib/site-assets";

const events = [
  {
    title: "Dia do Quartel da Cavalaria e do Ex-RC4",
    meta: "EDIÇÃO ANUAL · EFEMÉRIDE",
    description:
      "Efeméride que evoca o combate em Viella, onde 264 cavaleiros do RC 4 desenvolveram uma notável carga de Cavalaria sob o comando do Coronel John Campbell — homenagem, memória e convívio no quartel.",
    icon: <IconShield />,
  },
  {
    title: "Concurso Completo Combinado de Equitação",
    meta: "EDIÇÃO ANUAL · ENSINO · CROSS · OBSTÁCULOS",
    description:
      "Prova equestre militar composta por três fases: Ensino, Cross e Obstáculos — rigor técnico, tradição e espírito de corpo dos carristas.",
    icon: <IconTarget />,
  },
  {
    title: "Workshop de Carros de Combate",
    meta: "EDIÇÃO ANUAL · 2.ª EDIÇÃO 2026",
    description:
      "Sessões técnicas e demonstrações sobre viaturas blindadas, manutenção e doutrina — para entusiastas e profissionais.",
    icon: <IconCalendar />,
    href: "/eventos/workshop",
    backgroundImage: WORKSHOP_26_SRC,
  },
  {
    title: "Marcha a Cavalo à Batalha",
    meta: "EDIÇÃO ANUAL · ARMA DA CAVALARIA",
    description:
      "Atividade da Arma da Cavalaria em honra do patrono Mouzinho de Albuquerque. O Quartel da Cavalaria organiza o percurso, que culmina na Batalha — tradição equestre e identidade da cavalaria portuguesa.",
    icon: <IconShield />,
  },
  {
    title: "São Martinho",
    meta: "EDIÇÃO ANUAL · FESTA DA COMUNIDADE",
    description:
      "A nossa festa anual, onde celebramos também os valores da lenda de São Martinho como valores nossos — partilha, generosidade e união.",
    icon: <IconCalendar />,
  },
  {
    title: "A Noite de Fados",
    meta: "EDIÇÃO ANUAL",
    description:
      "A combinação entre tradição, união e identidade do Carrista — uma noite de fado, memória e camaradagem entre a comunidade.",
    icon: <IconCalendar />,
  },
  {
    title: 'Challenger "O Carrista"',
    meta: "EDIÇÃO ANUAL · DESTREZA",
    description:
      "Prova de destreza técnica e física para as guarnições de carristas — superação, precisão e espírito de equipa em ambiente competitivo.",
    icon: <IconTarget />,
  },
];

export function EventosSection() {
  return (
    <SectionShell
      id="eventos"
      label="Secção 01 · Eventos"
      title="Agenda Anual"
      description="Eventos com edições anuais que marcam o calendário do Carrista — do Quartel da Cavalaria de Santa Margarida aos desafios e tradições do Ex-RC4."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.title} {...event} />
        ))}
      </div>
    </SectionShell>
  );
}
