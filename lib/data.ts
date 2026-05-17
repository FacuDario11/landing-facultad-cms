import type { EventItem, FaqItem, Internship, NewsItem, ResourceItem, Scholarship, SiteSettings } from "@/types/content";

export const siteSettings: SiteSettings = {
  institutionName: "Consejería Estudiantil Institucional",
  email: "contacto.institucional@ejemplo.edu.ar",
  address: "Campus universitario - Oficina de orientación estudiantil",
  officeHours: "Lunes a viernes de 8:00 a 18:00",
  instagram: "https://www.instagram.com/institucion",
  facebook: "https://www.facebook.com/institucion"
};

export const news: NewsItem[] = [
  {
    id: "1",
    title: "Acompañamiento para estudiantes ingresantes 2026",
    slug: "acompanamiento-ingresantes-2026",
    excerpt: "La Consejería abre un espacio de orientación académica y administrativa para estudiantes que inician su recorrido universitario.",
    content: "<p>El programa acompaña consultas frecuentes sobre inscripción, cursado, materias iniciales, documentación y herramientas de organización para la vida universitaria.</p><p>Los encuentros se realizarán durante las primeras semanas de clase con modalidad presencial y espacios de consulta digital.</p>",
    category: "institucional",
    imageUrl: "/images/news-ingresantes.svg",
    featured: true,
    status: "published",
    publishedAt: "2026-03-05T10:00:00.000Z"
  },
  {
    id: "2",
    title: "Convocatoria orientativa a becas de apoyo estudiantil",
    slug: "convocatoria-becas-apoyo-estudiantil",
    excerpt: "Ejemplo institucional de comunicación para informar requisitos, documentación y plazos de programas de apoyo estudiantil.",
    content: "<p>Las postulaciones se organizan mediante formulario digital y validación de documentación respaldatoria en la oficina correspondiente.</p><p>Este contenido funciona como ejemplo para una futura carga administrable desde el CMS.</p>",
    category: "becas",
    imageUrl: "/images/news-becas.svg",
    featured: true,
    status: "published",
    publishedAt: "2026-03-18T10:00:00.000Z"
  },
  {
    id: "3",
    title: "Taller de herramientas para búsqueda laboral",
    slug: "taller-herramientas-busqueda-laboral",
    excerpt: "Actividad orientada a estudiantes avanzados para preparar CV, entrevistas y perfil profesional.",
    content: "<p>El taller forma parte de las acciones de vinculación con el sector productivo regional y acompaña la transición entre vida académica y primeras experiencias laborales.</p>",
    category: "pasantias",
    imageUrl: "/images/news-pasantias.svg",
    featured: false,
    status: "published",
    publishedAt: "2026-04-02T10:00:00.000Z"
  }
];

export const events: EventItem[] = [
  {
    id: "1",
    title: "Charla de orientación para ingresantes",
    slug: "charla-orientacion-ingresantes",
    description: "Presentación de servicios, canales de consulta y recursos para iniciar el cursado.",
    date: "2026-05-14T14:00:00.000Z",
    location: "Aula institucional",
    modality: "presencial",
    category: "Ingresantes"
  },
  {
    id: "2",
    title: "Encuentro de becas y documentación",
    slug: "encuentro-becas-documentacion",
    description: "Revisión de requisitos y orientación para completar formularios de postulación.",
    date: "2026-05-21T16:00:00.000Z",
    location: "Oficina de orientación estudiantil",
    modality: "hibrida",
    category: "Becas"
  },
  {
    id: "3",
    title: "Taller CV técnico profesional",
    slug: "taller-cv-tecnico-profesional",
    description: "Actividad para estudiantes avanzados que buscan pasantías o primeras experiencias laborales.",
    date: "2026-06-04T15:00:00.000Z",
    location: "Laboratorio de informática",
    modality: "presencial",
    category: "Pasantías"
  }
];

export const scholarships: Scholarship[] = [
  {
    id: "1",
    title: "Beca de apoyo económico institucional",
    slug: "beca-apoyo-economico-institucional",
    summary: "Programa de ejemplo destinado a estudiantes con necesidad socioeconómica acreditada.",
    requirements: ["Ser estudiante regular", "Presentar situación académica actualizada", "Completar evaluación socioeconómica"],
    documents: ["DNI", "Constancia de alumno regular", "Comprobantes de ingresos del grupo familiar"],
    deadline: "2026-06-10T23:59:00.000Z",
    link: "/contacto",
    status: "abierta"
  },
  {
    id: "2",
    title: "Becas estratégicas para carreras técnicas",
    slug: "becas-estrategicas-carreras-tecnicas",
    summary: "Ejemplo de convocatoria orientada a fortalecer la permanencia en carreras prioritarias.",
    requirements: ["Inscripción vigente", "Avance académico mínimo", "No poseer incompatibilidades"],
    documents: ["Formulario de postulación", "Historia académica", "CBU"],
    deadline: "2026-07-01T23:59:00.000Z",
    link: "/becas",
    status: "proxima"
  }
];

export const internships: Internship[] = [
  {
    id: "1",
    company: "Empresa tecnológica regional",
    title: "Pasantía en soporte e infraestructura",
    slug: "pasantia-soporte-infraestructura",
    modality: "hibrida",
    requirements: ["Estudiantes de carreras informáticas", "Conocimientos de redes", "Disponibilidad 20 horas semanales"],
    deadline: "2026-05-30T23:59:00.000Z",
    career: "Sistemas / Informática"
  },
  {
    id: "2",
    company: "Industria manufacturera",
    title: "Pasantía en mejora de procesos",
    slug: "pasantia-mejora-procesos",
    modality: "presencial",
    requirements: ["Estudiantes de carreras industriales", "Manejo de planillas", "Interés en calidad y producción"],
    deadline: "2026-06-12T23:59:00.000Z",
    career: "Industrial / Procesos"
  }
];

export const resources: ResourceItem[] = [
  {
    id: "1",
    title: "Formulario de consulta a Consejería",
    description: "Modelo de referencia para iniciar consultas, trámites o solicitudes de acompañamiento.",
    type: "formulario",
    fileUrl: "#",
    updatedAt: "2026-04-12T10:00:00.000Z"
  },
  {
    id: "2",
    title: "Guía para estudiantes ingresantes",
    description: "Información inicial sobre cursado, canales institucionales y servicios de apoyo.",
    type: "guia",
    fileUrl: "#",
    updatedAt: "2026-03-02T10:00:00.000Z"
  },
  {
    id: "3",
    title: "Reglamento académico básico",
    description: "Documento de consulta frecuente sobre regularidad, cursado y exámenes.",
    type: "reglamento",
    fileUrl: "#",
    updatedAt: "2026-02-20T10:00:00.000Z"
  }
];

export const faqs: FaqItem[] = [
  {
    id: "1",
    question: "¿Cómo contacto a la Consejería Estudiantil?",
    answer: "Podés escribir al correo institucional de referencia, usar el formulario de contacto demo o acercarte a la oficina indicada por la institución en sus canales oficiales.",
    category: "Atención"
  },
  {
    id: "2",
    question: "¿Dónde consulto por becas disponibles?",
    answer: "La sección Becas reúne convocatorias, requisitos, fechas y documentación. Las publicaciones definitivas deben validarse con el área responsable antes de difundirse.",
    category: "Becas"
  },
  {
    id: "3",
    question: "¿Las pasantías son solo para estudiantes avanzados?",
    answer: "Depende de cada convocatoria. Algunas requieren materias aprobadas específicas y otras están abiertas a perfiles iniciales con interés en formación profesional.",
    category: "Pasantías"
  }
];
