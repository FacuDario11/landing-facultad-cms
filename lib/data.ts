import type { EventItem, FaqItem, Internship, NewsItem, ResourceItem, Scholarship, SiteSettings } from "@/types/content";

export const siteSettings: SiteSettings = {
  institutionName: "Portal Estudiantil Institucional",
  email: "contacto@facultad.edu.ar",
  address: "Oficina de orientación estudiantil - Campus universitario",
  officeHours: "Lunes a viernes de 8:00 a 18:00 hs",
  instagram: "https://www.instagram.com/institucion",
  facebook: "https://www.facebook.com/institucion"
};

export const news: NewsItem[] = [
  {
    id: "1",
    title: "Acompañamiento para estudiantes ingresantes",
    slug: "acompanamiento-estudiantes-ingresantes",
    excerpt: "El área de orientación estudiantil presenta nuevas instancias de acompañamiento para estudiantes que inician su recorrido académico.",
    content: "<p>El programa acompaña consultas frecuentes sobre inscripción, cursado, materias iniciales, documentación y herramientas de organización para la vida universitaria.</p><p>Las actividades se realizarán durante las primeras semanas de clase con modalidad presencial y canales de consulta digital.</p>",
    category: "institucional",
    imageUrl: "/images/news-ingresantes.svg",
    featured: true,
    status: "published",
    publishedAt: "2026-03-05T10:00:00.000Z"
  },
  {
    id: "2",
    title: "Nueva convocatoria a becas de apoyo estudiantil",
    slug: "nueva-convocatoria-becas-apoyo-estudiantil",
    excerpt: "Se encuentra disponible una nueva convocatoria destinada a estudiantes que requieren acompañamiento económico para continuar sus estudios.",
    content: "<p>Las postulaciones se organizan mediante formulario digital y validación de documentación respaldatoria en el área correspondiente.</p><p>La información publicada funciona como referencia institucional para orientar a la comunidad estudiantil.</p>",
    category: "becas",
    imageUrl: "/images/news-becas.svg",
    featured: true,
    status: "published",
    publishedAt: "2026-03-18T10:00:00.000Z"
  },
  {
    id: "3",
    title: "Pasantías y oportunidades de formación profesional",
    slug: "pasantias-oportunidades-formacion-profesional",
    excerpt: "La institución difunde nuevas oportunidades para que estudiantes puedan vincularse con espacios de práctica profesional.",
    content: "<p>Las convocatorias permiten conocer requisitos, perfiles solicitados y canales de postulación para primeras experiencias profesionales.</p><p>Este contenido puede administrarse desde el panel CMS según las necesidades de cada área institucional.</p>",
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
    title: "Charla de orientación académica",
    slug: "charla-orientacion-academica",
    description: "Presentación de servicios, canales de consulta y recursos para acompañar el inicio del cursado.",
    date: "2026-06-10T14:00:00.000Z",
    location: "Aula institucional",
    modality: "presencial",
    category: "Ingresantes"
  },
  {
    id: "2",
    title: "Taller de organización del estudio",
    slug: "taller-organizacion-estudio",
    description: "Actividad práctica para fortalecer hábitos de planificación, lectura y preparación de evaluaciones.",
    date: "2026-06-17T16:00:00.000Z",
    location: "Oficina de orientación estudiantil",
    modality: "hibrida",
    category: "Bienestar"
  },
  {
    id: "3",
    title: "Encuentro informativo sobre becas y beneficios",
    slug: "encuentro-informativo-becas-beneficios",
    description: "Revisión de requisitos, documentación y plazos para acceder a programas de apoyo estudiantil.",
    date: "2026-06-24T15:00:00.000Z",
    location: "Sala de reuniones institucional",
    modality: "presencial",
    category: "Becas"
  }
];

export const scholarships: Scholarship[] = [
  {
    id: "1",
    title: "Beca de apoyo estudiantil",
    slug: "beca-apoyo-estudiantil",
    summary: "Programa de referencia destinado a estudiantes con necesidad socioeconómica acreditada.",
    requirements: ["Ser estudiante regular", "Presentar situación académica actualizada", "Completar evaluación socioeconómica"],
    documents: ["Documento de identidad", "Constancia de estudiante regular", "Comprobantes de ingresos del grupo familiar"],
    deadline: "2026-07-10T23:59:00.000Z",
    link: "/contacto",
    status: "abierta"
  },
  {
    id: "2",
    title: "Beca de conectividad",
    slug: "beca-conectividad",
    summary: "Convocatoria orientada a facilitar el acceso a herramientas digitales para el cursado.",
    requirements: ["Inscripción vigente", "Declaración de necesidad de conectividad", "No poseer incompatibilidades"],
    documents: ["Formulario de postulación", "Historia académica", "Declaración jurada"],
    deadline: "2026-08-01T23:59:00.000Z",
    link: "/becas",
    status: "proxima"
  },
  {
    id: "3",
    title: "Beca de materiales de estudio",
    slug: "beca-materiales-estudio",
    summary: "Beneficio institucional para acompañar la adquisición de materiales básicos de cursado.",
    requirements: ["Ser estudiante activo", "Presentar solicitud fundamentada", "Acreditar avance académico"],
    documents: ["Formulario de solicitud", "Constancia de inscripción", "Presupuesto o detalle de materiales"],
    deadline: "2026-08-20T23:59:00.000Z",
    link: "/contacto",
    status: "proxima"
  }
];

export const internships: Internship[] = [
  {
    id: "1",
    company: "Área administrativa institucional",
    title: "Pasantía administrativa para estudiantes avanzados",
    slug: "pasantia-administrativa-estudiantes-avanzados",
    modality: "hibrida",
    requirements: ["Estudiantes avanzados", "Manejo básico de herramientas digitales", "Disponibilidad 20 horas semanales"],
    deadline: "2026-07-30T23:59:00.000Z",
    career: "Administración / Gestión"
  },
  {
    id: "2",
    company: "Equipo de innovación educativa",
    title: "Práctica profesional en área de sistemas",
    slug: "practica-profesional-area-sistemas",
    modality: "presencial",
    requirements: ["Estudiantes de carreras informáticas", "Conocimientos básicos de desarrollo o soporte", "Interés en proyectos institucionales"],
    deadline: "2026-08-12T23:59:00.000Z",
    career: "Sistemas / Informática"
  },
  {
    id: "3",
    company: "Programa de vinculación profesional",
    title: "Programa de formación laboral",
    slug: "programa-formacion-laboral",
    modality: "hibrida",
    requirements: ["Estudiantes con interés en formación práctica", "Disponibilidad horaria", "Participación en instancias de seguimiento"],
    deadline: "2026-09-05T23:59:00.000Z",
    career: "Perfil interdisciplinario"
  }
];

export const resources: ResourceItem[] = [
  {
    id: "1",
    title: "Guía para estudiantes ingresantes",
    description: "Información inicial sobre cursado, canales institucionales y servicios de apoyo.",
    type: "guia",
    fileUrl: "#",
    updatedAt: "2026-04-12T10:00:00.000Z"
  },
  {
    id: "2",
    title: "Formulario de solicitud de beca",
    description: "Modelo de referencia para iniciar solicitudes de beneficios o acompañamiento económico.",
    type: "formulario",
    fileUrl: "#",
    updatedAt: "2026-03-02T10:00:00.000Z"
  },
  {
    id: "3",
    title: "Reglamento académico básico",
    description: "Documento de consulta frecuente sobre regularidad, cursado y evaluaciones.",
    type: "reglamento",
    fileUrl: "#",
    updatedAt: "2026-02-20T10:00:00.000Z"
  },
  {
    id: "4",
    title: "Calendario académico institucional",
    description: "Referencia orientativa de fechas importantes para la organización del ciclo académico.",
    type: "pdf",
    fileUrl: "#",
    updatedAt: "2026-02-28T10:00:00.000Z"
  }
];

export const faqs: FaqItem[] = [
  {
    id: "1",
    question: "¿Dónde puedo consultar por becas disponibles?",
    answer: "La sección Becas reúne convocatorias, requisitos, fechas y documentación. También podés comunicarte con el área de orientación estudiantil para recibir acompañamiento.",
    category: "Becas"
  },
  {
    id: "2",
    question: "¿Cómo me contacto con el área de orientación estudiantil?",
    answer: "Podés escribir al correo institucional de referencia, usar el formulario de contacto o acercarte a la oficina indicada por la institución.",
    category: "Atención"
  },
  {
    id: "3",
    question: "¿Dónde encuentro recursos y formularios institucionales?",
    answer: "La sección Recursos centraliza guías, formularios, reglamentos y documentos útiles para trámites académicos y administrativos.",
    category: "Recursos"
  },
  {
    id: "4",
    question: "¿Las pasantías están disponibles para todas las carreras?",
    answer: "Depende de cada convocatoria. Algunas están orientadas a perfiles específicos y otras admiten estudiantes de distintas carreras o trayectos formativos.",
    category: "Pasantías"
  }
];
