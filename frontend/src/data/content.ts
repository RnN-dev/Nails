import type { Service, Testimonial } from "../types";

export const navItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Servicos" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#contato", label: "Contato" }
];

export const services: Service[] = [
  {
    name: "Gel Premium",
    description: "Alongamento elegante com curvatura natural, acabamento fino e brilho de longa duracao.",
    price: "a partir de R$ 130",
    icon: "gel"
  },
  {
    name: "Acrilico",
    description: "Estrutura resistente para quem precisa de unhas impecaveis por semanas.",
    price: "a partir de R$ 150",
    icon: "acrylic"
  },
  {
    name: "Nail Art",
    description: "Composicoes autorais com foil, pedrarias, tracos finos e combinacoes sob medida.",
    price: "a partir de R$ 35",
    icon: "art"
  },
  {
    name: "Blindagem",
    description: "Camada protetora para fortalecer unhas naturais sem perder delicadeza.",
    price: "a partir de R$ 90",
    icon: "shield"
  },
  {
    name: "Remocao Segura",
    description: "Retirada tecnica sem agressao, preservando a placa natural da unha.",
    price: "a partir de R$ 45",
    icon: "remove"
  },
  {
    name: "Manicure Classica",
    description: "Cutilagem cuidadosa, esmaltação precisa e finalizacao com toque de spa.",
    price: "a partir de R$ 55",
    icon: "classic"
  }
];

export const testimonials: Testimonial[] = [
  {
    name: "Marina A.",
    avatar: "MA",
    rating: 5,
    text: "A durabilidade foi absurda. Sai com a mao parecendo editorial de revista e voltei depois de tres semanas intacta."
  },
  {
    name: "Bianca R.",
    avatar: "BR",
    rating: 5,
    text: "Atendimento pontual, ambiente lindo e uma delicadeza nos detalhes que eu nao tinha encontrado em outro estudio."
  },
  {
    name: "Camila S.",
    avatar: "CS",
    rating: 5,
    text: "Mostrei uma referencia dificil e ela transformou em algo melhor, com acabamento fino e nada exagerado."
  },
  {
    name: "Luiza P.",
    avatar: "LP",
    rating: 5,
    text: "A blindagem salvou minhas unhas. Ficaram fortes, naturais e com brilho de gel sem pesar."
  }
];

export const categories = ["Todos", "Gel", "Nail Art", "Acrilico", "Blindagem", "Classica"];
