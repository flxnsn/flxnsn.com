// Static content

export const siteConfig = {
  brand: 'flxnsn',
  name: 'Felix Nissen',
  subtitle: 'Developer & Media Designer',
  contactEmail: 'hello@johndoe.dev',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  copyright: '© 2026 Felix Nissen',
};

// About

export const about = {
  portrait: { src: 'https://picsum.photos/seed/portrait/400/533', alt: 'Portrait' },
  headline: 'Inspirational title.',
  bio: [
    'Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu.',
    'Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.',
  ],
  skillGroups: [
    {
      title: 'Skills',
      tags: ['UX/UI', 'Graphic Design', 'Web Design', 'Photography', 'Video Editing', 'Audio Editing'],
    },
    {
      title: 'Tools',
      tags: ['JavaScript', 'Python', 'Html & CSS', 'SQL', 'Linux', 'Windows', 'MacOS', 'Photography', 'Illustrator', 'InDesign', 'Lightroom', 'Cinema 4D'],
    },
    {
      title: 'Languages',
      tags: ['English', 'German'],
    },
  ],
};

// Impressum

export const impressum = [
  {
    title: 'Angaben gemäß § 5 TMG',
    desc: 'John Doe\nMusterstraße 12\n11111 Musterhausen\nDeutschland',
  },
  {
    title: 'Kontakt',
    desc: 'E-Mail: hello@johndoe.dev\nTelefon: +49 12 123456789',
  },
  {
    title: 'Haftungsausschluss',
    desc: 'Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.',
  },
  {
    title: 'Urheberrecht',
    desc: 'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.',
  },
];



// Database

// Design Projects
// images: array of src strings; layout is auto-derived:
//   1 image  → layout-1  (full-width)
//   2 images → layout-2  (side by side)
//   3 images → layout-3  (first spans full width, two below)
//   4 images → layout-4  (2×2 grid)

// Design

export const designProjects = [
  {
    id: 'd0',
    title: 'Project 1',
    tags: ['Illustrator', 'InDesign', 'Print'],
    desc: 'Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.',
    images: ['https://picsum.photos/seed/d3a/1200/800'],
  },
  {
    id: 'd1',
    title: 'Another Project',
    tags: ['Figma', 'Prototyping', 'iOS'],
    desc: 'Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.',
    images: ['https://picsum.photos/seed/d3a/1200/800'],
  },
  {
    id: 'd2',
    title: 'So much Design',
    tags: ['InDesign', 'Photoshop', 'Typography'],
    desc: 'Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu.',
    images: ['https://picsum.photos/seed/d3a/1200/800'],
  },
  {
    id: 'd3',
    title: 'So much more',
    tags: ['Cinema 4D', 'Illustrator', 'Packaging'],
    desc: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.',
    images: ['https://picsum.photos/seed/d3a/1200/800'],
  },
];

// IT

export const itProjects = [
  {
    id: 'i0',
    title: 'IT Project',
    tags: ['React', 'Node.js', 'WebSockets', 'PostgreSQL'],
    desc: [
      'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
    ],
    image: { src: 'https://picsum.photos/seed/it1/600/450', alt: 'Dashboard project' },
  },
  {
    id: 'i1',
    title: 'Some Development Stuff',
    tags: ['Go', 'Docker', 'Kubernetes', 'Bash'],
    desc: [
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
      'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
    ],
    image: null, // no image → single-column layout
  },
  {
    id: 'i2',
    title: 'Tricky Code and so on',
    tags: ['Rust', 'WASM', 'IndexedDB', 'AES-256'],
    desc: [
      'Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.',
    ],
    image: { src: 'https://picsum.photos/seed/it3/600/450', alt: 'Notes App' },
  },
];

// Photography

export const photos = [
  {
    id: 'p0',
    src: 'https://picsum.photos/seed/ph1/800/600',
    title: 'Golden Hour, Iceland',
    desc: 'Shot on a mirrorless during the midnight sun. Long exposure, no filters.'
  },
  {
    id: 'p1',
    src: 'https://picsum.photos/seed/ph2/600/900',
    title: 'Portrait Study #4',
    desc: 'Available light, north-facing window. Kodak Portra 400 emulation.'
  },
  {
    id: 'p2',
    src: 'https://picsum.photos/seed/ph3/800/500',
    title: 'Hamburg Harbour, Dawn',
    desc: 'Pre-dawn fog rolling off the Elbe. 5am alarm well worth it.'
  },
  {
    id: 'p3',
    src: 'https://picsum.photos/seed/ph4/700/700',
    title: 'Geometry & Shadow',
    desc: 'Brutalist stairwell, abandoned department store, natural light only.'
  },
  {
    id: 'p4',
    src: 'https://picsum.photos/seed/ph5/900/600',
    title: 'Open Water',
    desc: 'Baltic Sea in November. 1/2000s to freeze the wave crests.'
  },
  {
    id: 'p5',
    src: 'https://picsum.photos/seed/ph6/600/800',
    title: 'Street — Tokyo, 2023',
    desc: 'Shinjuku at 2am. Ricoh GR IIIx, zone focus, single burst.'
  },
  {
    id: 'p6',
    src: 'https://picsum.photos/seed/ph7/800/600',
    title: 'Forest Interior',
    desc: 'Old-growth beech forest, October. Mist reduces contrast beautifully.'
  },
  {
    id: 'p7',
    src: 'https://picsum.photos/seed/ph8/1000/600',
    title: 'Panorama — Lofoten',
    desc: 'Stitched from 7 vertical frames. 100MP equivalent output.'
  },
  {
    id: 'p8',
    src: 'https://picsum.photos/seed/ph9/600/900',
    title: 'Still Life — Ceramics',
    desc: 'Product photography for a local pottery studio.'
  },
  {
    id: 'p9',
    src: 'https://picsum.photos/seed/ph10/800/600',
    title: 'Commute',
    desc: 'U-Bahn window reflection. 1/60s, f/2, accepted the motion blur.'
  },
  {
    id: 'p10',
    src: 'https://picsum.photos/seed/ph11/700/500',
    title: 'The Red Boat',
    desc: 'Alster lake, midday. Colour was the whole point.'
  },
  {
    id: 'p11',
    src: 'https://picsum.photos/seed/ph12/800/800',
    title: 'Square Study — Architecture',
    desc: 'Symmetry hunting in the HafenCity district.' },
];