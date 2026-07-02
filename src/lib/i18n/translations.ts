export type Lang = 'en' | 'es';

export interface Translations {
  nav: { name: string };
  hero: {
    eyebrow: string;
    headline: string[];
    sub: string;
  };
  principles: {
    label: string;
    items: { number: string; title: string; body: string }[];
  };
  portfolio: {
    label: string;
    viewProject: string;
    projects: { name: string; tag: string; url: string }[];
  };
}

const en: Translations = {
  nav: { name: 'Mateo Polloni' },
  hero: {
    eyebrow: 'Web Designer & Developer',
    headline: ['I design websites', 'that feel like', 'something.'],
    sub: 'Most sites are used. The best ones are experienced. I build digital experiences with mood, motion, and a level of craft you can feel in the details.',
  },
  principles: {
    label: 'Approach',
    items: [
      {
        number: '01',
        title: 'Mood & Atmosphere',
        body: "Before layouts or features, I think about how a site should make someone feel. Every project gets its own identity and emotional weight. I'm not building pages to be used — I'm building experiences to be felt.",
      },
      {
        number: '02',
        title: 'Motion & Interaction',
        body: "Animation isn't decoration. Done right, motion guides the user, reinforces the brand, and makes an interface feel alive and premium. Every microinteraction earns its place by making the experience smoother, not busier.",
      },
      {
        number: '03',
        title: 'Detail & Restraint',
        body: "The craft lives in what most people overlook: typography, spacing, timing, hierarchy, and alignment. A premium site isn't defined by how much is on the screen, but by how deliberately every element is placed. Restraint is the skill.",
      },
    ],
  },
  portfolio: {
    label: 'Selected Work',
    viewProject: 'View Project',
    projects: [
      {
        name: 'SoundBuy',
        tag: 'Beat & Track Marketplace',
        url: 'https://soundbuy-ten.vercel.app/',
      },
      {
        name: 'Dettagli',
        tag: 'Premium Auto Detailing',
        url: 'https://dettagli-six.vercel.app/',
      },
    ],
  },
};

const es: Translations = {
  nav: { name: 'Mateo Polloni' },
  hero: {
    eyebrow: 'Diseñador & Desarrollador Web',
    headline: ['Diseño sitios web', 'que transmiten', 'algo.'],
    sub: 'La mayoría de los sitios web simplemente se usan. Los mejores se viven. Creo experiencias digitales con personalidad, movimiento y un nivel de detalle que se percibe en cada interacción.',
  },
  principles: {
    label: 'Enfoque',
    items: [
      {
        number: '01',
        title: 'Atmósfera y emoción',
        body: 'Antes de pensar en la estructura o las funcionalidades, pienso en cómo debe hacer sentir un sitio web. Cada proyecto tiene una identidad propia y una intención emocional. No creo páginas para que simplemente se usen; creo experiencias que dejan una impresión.',
      },
      {
        number: '02',
        title: 'Movimiento e interacción',
        body: 'La animación no es un adorno. Cuando está bien aplicada, guía al usuario, fortalece la identidad de la marca y hace que la interfaz se sienta viva y sofisticada. Cada microinteracción tiene un propósito: hacer que la experiencia sea más fluida, no más compleja.',
      },
      {
        number: '03',
        title: 'Detalle y equilibrio',
        body: 'La calidad está en lo que la mayoría pasa por alto: la tipografía, los espacios, el ritmo, la jerarquía visual y la alineación. Un sitio web premium no se define por la cantidad de elementos que muestra, sino por la intención con la que cada uno ha sido colocado. La verdadera sofisticación está en saber cuándo menos es más.',
      },
    ],
  },
  portfolio: {
    label: 'Trabajo Seleccionado',
    viewProject: 'Ver Proyecto',
    projects: [
      {
        name: 'SoundBuy',
        tag: 'Marketplace de Beats y Tracks',
        url: 'https://soundbuy-ten.vercel.app/',
      },
      {
        name: 'Dettagli',
        tag: 'Detailing Premium de Autos',
        url: 'https://dettagli-six.vercel.app/',
      },
    ],
  },
};

export const translations: Record<Lang, Translations> = { en, es };
