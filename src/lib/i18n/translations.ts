export type Lang = 'en' | 'es';

export interface Translations {
  nav: {
    name: string;
    work: string;
    about: string;
    services: string;
    cta: string;
  };
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
    projects: { name: string; tag: string; url: string; description: string }[];
    futureVision: string;
    futureProject: string;
    letsTalk: string;
  };
  about: {
    label: string;
    heading: string[];
    paragraphs: string[];
    capabilitiesLabel: string;
    capabilities: string[];
  };
  services: {
    label: string;
    heading: string;
    tiers: { number: string; name: string; tagline: string; description: string }[];
    pricing: string;
  };
  inquiry: {
    label: string;
    heading: string[];
    sidebar: {
      label: string;
      items: { title: string; body: string }[];
      note: string;
    };
    fields: {
      business:     { label: string; placeholder: string };
      goals:        { label: string; placeholder: string };
      projectType:  { label: string; options: string[] };
      branding:     { label: string; options: string[] };
      admire:       { label: string; placeholder: string };
      timeline:     { label: string; options: string[] };
      functionality:{ label: string; placeholder: string };
      vision:       { label: string; placeholder: string };
      name:         { label: string; placeholder: string };
      email:        { label: string; placeholder: string };
    };
    submit: string;
    successTitle: string;
    successBody: string;
  };
  cta: {
    label: string;
    heading: string[];
    sub: string;
    primary: string;
    secondary: string;
  };
}

const en: Translations = {
  nav: {
    name: 'Mateo Polloni',
    work: 'Work',
    about: 'About',
    services: 'Services',
    cta: 'Start a Project',
  },
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
        description: "A marketplace where producers and artists connect. The challenge was making something commercial feel creative — the waveform animations and layered purple palette were designed to capture the energy of a late-night studio session.",
      },
      {
        name: 'Dettagli',
        tag: 'Premium Auto Detailing',
        url: 'https://dettagli-six.vercel.app/',
        description: "A premium detailing service that needed to feel as refined as the cars it services. A 3D Ferrari in a dark, infinite void became the brand statement — not decoration, but identity.",
      },
    ],
    futureVision: 'Your Vision',
    futureProject: 'Next Project',
    letsTalk: "Let's Talk",
  },
  about: {
    label: 'About',
    heading: ['I build websites', 'the way they were', 'meant to feel.'],
    paragraphs: [
      "I'm Mateo Polloni — a self-taught web designer and developer who believes the internet deserves better design. Not louder. Not more. Better. More considered. More felt.",
      "I started building websites because I was frustrated by how little care most digital experiences carry. Typography set without intention. Animations added without purpose. Layouts assembled rather than designed. I decided to work differently.",
      "I partner with a small number of clients at a time so each project gets the attention it deserves. If you want something people remember and return to — let's talk.",
    ],
    capabilitiesLabel: 'What I do',
    capabilities: [
      'Custom web design & development',
      'Motion design & microinteractions',
      'Brand identity & visual systems',
      'E-commerce & conversion',
      'Performance & accessibility',
      'Bilingual experiences — EN / ES',
    ],
  },
  services: {
    label: 'Services',
    heading: 'Complete digital experiences.',
    tiers: [
      {
        number: '01',
        name: 'Landing Page',
        tagline: 'A strong first impression.',
        description: "For businesses that need a focused, high-impact online presence. One page, fully custom, designed to convert and impress. Everything a visitor needs to trust you — nothing they don't.",
      },
      {
        number: '02',
        name: 'Custom Website',
        tagline: 'Your identity, fully expressed.',
        description: "My core offering. A multi-page website designed around your brand's unique personality. Custom layouts, refined motion, and an experience that feels unmistakably yours.",
      },
      {
        number: '03',
        name: 'Signature Experience',
        tagline: 'The highest level of craft.',
        description: "For projects that demand something extraordinary. Bespoke interactions, custom motion design, immersive storytelling — and the kind of attention to detail that sets a new benchmark for your category.",
      },
    ],
    pricing: "Projects start at $400. The final investment reflects your project's scope and ambition.",
  },
  inquiry: {
    label: 'Start a Project',
    heading: ["Let's talk about", 'your project.'],
    sidebar: {
      label: 'What to expect',
      items: [
        {
          title: 'A response within 24 hours',
          body: 'I read every inquiry personally and get back to you quickly.',
        },
        {
          title: 'A custom proposal',
          body: "Not a template — a plan tailored to your project's specific needs and goals.",
        },
        {
          title: 'Direct communication',
          body: "You work with me directly, start to finish. No middlemen.",
        },
      ],
      note: "I take on a limited number of projects at a time — this means your project gets my full attention. If our goals align, I'll tell you honestly.",
    },
    fields: {
      business:     { label: 'What type of business do you have?',          placeholder: 'My business is...' },
      goals:        { label: 'What are you hoping to achieve?',              placeholder: "I'm looking to..." },
      projectType:  { label: 'Is this a new website or a redesign?',        options: ['New website', 'Redesign', 'Not sure yet'] },
      branding:     { label: 'Do you already have branding?',               options: ['Yes, fully developed', 'Partial', 'Starting from scratch'] },
      admire:       { label: 'Any websites that inspired you?',             placeholder: 'Optional — e.g. linear.app, stripe.com...' },
      timeline:     { label: "What's your desired timeline?",               options: ['1–2 months', '3–4 months', '5–6 months', 'Flexible'] },
      functionality:{ label: 'Any specific functionality you need?',        placeholder: 'Optional — e.g. booking, e-commerce, blog...' },
      vision:       { label: 'Tell me about your vision.',                  placeholder: 'What does this project mean to you? What should visitors feel?' },
      name:         { label: 'Your name',                                   placeholder: 'Name' },
      email:        { label: 'Your email address',                          placeholder: 'email@example.com' },
    },
    submit: 'Send Inquiry',
    successTitle: 'Thank you.',
    successBody: "I'll be in touch within 48 hours.",
  },
  cta: {
    label: 'Next Step',
    heading: ["Let's build", 'something together.'],
    sub: "Tell me about your project. I respond within 48 hours.",
    primary: 'Start a Project',
    secondary: 'Send an Email',
  },
};

const es: Translations = {
  nav: {
    name: 'Mateo Polloni',
    work: 'Trabajo',
    about: 'Acerca de',
    services: 'Servicios',
    cta: 'Iniciar Proyecto',
  },
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
        description: 'Un marketplace donde productores y artistas se conectan. El desafío era hacer que algo comercial se sintiera creativo: las animaciones de forma de onda y la paleta morada fueron diseñadas para capturar la energía de una sesión de estudio a medianoche.',
      },
      {
        name: 'Dettagli',
        tag: 'Detailing Premium de Autos',
        url: 'https://dettagli-six.vercel.app/',
        description: 'Un servicio de detailing premium que necesitaba sentirse tan refinado como los autos que atiende. Un Ferrari 3D en un vacío oscuro e infinito se convirtió en la declaración de marca: no como decoración, sino como identidad.',
      },
    ],
    futureVision: 'Tu Visión',
    futureProject: 'Futuro Proyecto',
    letsTalk: 'Hablemos',
  },
  about: {
    label: 'Acerca de',
    heading: ['Creo sitios web', 'de la manera en que', 'deberían sentirse.'],
    paragraphs: [
      'Soy Mateo Polloni — diseñador y desarrollador web autodidacta que cree que internet merece mejor diseño. No más llamativo. No más cargado. Mejor. Más reflexivo. Más sentido.',
      'Empecé a construir sitios web porque me frustraba la poca atención que la mayoría de las experiencias digitales prestan al detalle. Tipografía sin intención. Animaciones sin propósito. Diseños ensamblados, no diseñados. Decidí trabajar de otra manera.',
      'Trabajo con un número reducido de clientes a la vez para asegurar que cada proyecto reciba la atención que merece. Si quieres algo que la gente recuerde y a lo que quiera volver — hablemos.',
    ],
    capabilitiesLabel: 'Lo que hago',
    capabilities: [
      'Diseño y desarrollo web a medida',
      'Motion design & microinteracciones',
      'Identidad de marca y sistemas visuales',
      'E-commerce y conversión',
      'Rendimiento y accesibilidad',
      'Experiencias bilingües — EN / ES',
    ],
  },
  services: {
    label: 'Servicios',
    heading: 'Experiencias digitales completas.',
    tiers: [
      {
        number: '01',
        name: 'Landing Page',
        tagline: 'Una primera impresión poderosa.',
        description: 'Para negocios que necesitan una presencia digital enfocada y de alto impacto. Una sola página, completamente personalizada, diseñada para impresionar y convertir. Todo lo que un visitante necesita para confiar en ti — nada más.',
      },
      {
        number: '02',
        name: 'Sitio Web a Medida',
        tagline: 'Tu identidad, completamente expresada.',
        description: "Mi oferta principal. Un sitio web de múltiples páginas diseñado alrededor de la personalidad única de tu marca. Composiciones a medida, movimiento refinado y una experiencia que se siente inequívocamente tuya.",
      },
      {
        number: '03',
        name: 'Experiencia Signature',
        tagline: 'El nivel más alto de artesanía.',
        description: 'Para proyectos que exigen algo extraordinario. Interacciones únicas, diseño de movimiento personalizado, narrativa visual inmersiva — y el nivel de atención al detalle que establece un nuevo estándar para tu categoría.',
      },
    ],
    pricing: 'Los proyectos comienzan desde $400. La inversión final refleja el alcance y la ambición del proyecto.',
  },
  inquiry: {
    label: 'Iniciar Proyecto',
    heading: ['Cuéntame sobre', 'tu proyecto.'],
    sidebar: {
      label: 'Qué esperar',
      items: [
        {
          title: 'Una respuesta en 24 horas',
          body: 'Leo cada consulta personalmente y respondo con rapidez.',
        },
        {
          title: 'Una propuesta personalizada',
          body: 'No una plantilla — un plan adaptado a las necesidades específicas de tu proyecto.',
        },
        {
          title: 'Comunicación directa',
          body: 'Trabajas conmigo directamente, de principio a fin. Sin intermediarios.',
        },
      ],
      note: 'Trabajo con un número limitado de proyectos a la vez — esto significa que tu proyecto recibe toda mi atención. Si nuestros objetivos coinciden, te lo diré con honestidad.',
    },
    fields: {
      business:     { label: '¿Qué tipo de negocio tienes?',                            placeholder: 'Mi negocio es...' },
      goals:        { label: '¿Qué esperas lograr?',                                    placeholder: 'Estoy buscando...' },
      projectType:  { label: '¿Es un sitio nuevo o una mejora del actual?',             options: ['Sitio nuevo', 'Rediseño', 'Aún no lo sé'] },
      branding:     { label: '¿Ya tienes una identidad de marca?',                      options: ['Sí, completamente desarrollada', 'Parcial', 'Desde cero'] },
      admire:       { label: '¿Hay algún sitio web que te haya inspirado?',             placeholder: 'Opcional — e.g. linear.app, stripe.com...' },
      timeline:     { label: '¿Cuál es tu plazo deseado?',                              options: ['1–2 meses', '3–4 meses', '5–6 meses', 'Flexible'] },
      functionality:{ label: '¿Necesitas alguna funcionalidad específica?',             placeholder: 'Opcional — e.g. reservas, e-commerce, blog...' },
      vision:       { label: 'Cuéntame sobre tu visión.',                               placeholder: '¿Qué significa este proyecto para ti? ¿Qué sensación deberían tener los visitantes?' },
      name:         { label: 'Tu nombre',                                               placeholder: 'Nombre' },
      email:        { label: 'Tu dirección de email',                                   placeholder: 'email@ejemplo.com' },
    },
    submit: 'Enviar Consulta',
    successTitle: 'Gracias.',
    successBody: 'Estaré en contacto en las próximas 48 horas.',
  },
  cta: {
    label: 'Siguiente Paso',
    heading: ['Construyamos', 'algo juntos.'],
    sub: 'Cuéntame sobre tu proyecto. Respondo en menos de 48 horas.',
    primary: 'Iniciar Proyecto',
    secondary: 'Enviar Email',
  },
};

export const translations: Record<Lang, Translations> = { en, es };
