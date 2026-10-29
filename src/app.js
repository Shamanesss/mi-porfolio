import './styles.css';
import config from './data/config.json';
import projects from './data/projects.json';

for (const [name, value] of Object.entries(config.colors)) {
  document.documentElement.style.setProperty(`--color-${name}`, value);
}

const required = (selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`No se encontró el elemento requerido: ${selector}`);
  }
  return element;
};

const setText = (selector, value) => {
  required(selector).textContent = value;
};

const initialsFrom = (name) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase('es'))
    .join('');

document.title = `${config.name} · ${config.profession}`;
setText('[data-profile="initials"]', initialsFrom(config.name));
setText('[data-profile="name"]', config.name);
setText('[data-profile="profession"]', config.profession);
setText('[data-profile="headline"]', config.headline);
const location = config.location?.trim();
if (location) {
  setText('[data-profile="location"]', location);
} else {
  required('.hero-location').hidden = true;
}
setText('[data-current-year]', String(new Date().getFullYear()));

const aboutContainer = required('[data-profile="about"]');
aboutContainer.replaceChildren(
  ...config.about.map((paragraph) => {
    const element = document.createElement('p');
    element.textContent = paragraph;
    return element;
  }),
);

const projectContainer = required('[data-projects]');
if (projects.length === 0) {
  const emptyState = document.createElement('p');
  emptyState.className = 'projects-empty';
  emptyState.textContent = 'Aún no hay proyectos publicados.';
  projectContainer.replaceChildren(emptyState);
} else {
  projectContainer.replaceChildren(
    ...projects.map((project, index) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('aria-labelledby', `project-title-${index}`);

      const category = document.createElement('p');
      category.className = 'project-category';
      category.textContent = project.category;

      const title = document.createElement('h3');
      title.id = `project-title-${index}`;
      title.textContent = project.name;

      const description = document.createElement('p');
      description.className = 'project-description';
      description.textContent = project.description;

      const technologies = document.createElement('ul');
      technologies.className = 'technology-list';
      technologies.setAttribute('aria-label', 'Tecnologías');
      technologies.replaceChildren(
        ...project.technologies.map((technology) => {
          const item = document.createElement('li');
          item.textContent = technology;
          return item;
        }),
      );

      card.append(category, title);
      if (project.isExample) {
        const notice = document.createElement('p');
        notice.className = 'example-notice';
        notice.textContent = 'Proyecto de ejemplo';
        card.append(notice);
      }
      card.append(description, technologies);

      if (project.url) {
        const link = document.createElement('a');
        link.className = 'project-link';
        link.href = project.url;
        link.textContent = 'Ver proyecto';
        link.setAttribute('aria-label', `Ver proyecto: ${project.name}`);
        card.append(link);
      }

      return card;
    }),
  );
}

const skillContainer = required('[data-skills]');
skillContainer.replaceChildren(
  ...config.skills.map((skill) => {
    const item = document.createElement('span');
    item.className = 'skill-chip';
    item.textContent = skill;
    return item;
  }),
);

const contactContainer = required('[data-contact]');
const contactLinks = [
  ['email', 'Correo electrónico'],
  ['github', 'GitHub'],
  ['linkedin', 'LinkedIn'],
  ['website', 'Sitio web'],
].filter(([key]) => config.contact[key]?.trim());

if (contactLinks.length) {
  contactContainer.replaceChildren(
    ...contactLinks.map(([key, label]) => {
      const link = document.createElement('a');
      link.className = 'contact-link';
      link.textContent = label;

      if (key === 'email') {
        link.href = `mailto:${config.contact.email}`;
      } else {
        const url = new URL(config.contact[key]);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error(`El enlace de contacto "${key}" debe usar http(s).`);
        }
        link.href = url.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      return link;
    }),
  );
} else {
  const message = document.createElement('p');
  message.textContent = 'Añade tus enlaces de contacto en src/data/config.json.';
  contactContainer.replaceChildren(message);
}

const menuToggle = required('.menu-toggle');
const navigation = required('#primary-navigation');
const mobileNavigation = window.matchMedia('(max-width: 768px)');

const syncNavigation = () => {
  navigation.hidden =
    mobileNavigation.matches && menuToggle.getAttribute('aria-expanded') !== 'true';
};

const closeNavigation = ({ returnFocus = false } = {}) => {
  menuToggle.setAttribute('aria-expanded', 'false');
  syncNavigation();
  if (returnFocus) menuToggle.focus();
};

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  syncNavigation();
});

navigation.addEventListener('click', (event) => {
  if (event.target instanceof Element && event.target.closest('a')) {
    closeNavigation();
  }
});

document.addEventListener('keydown', (event) => {
  if (
    event.key === 'Escape' &&
    menuToggle.getAttribute('aria-expanded') === 'true'
  ) {
    closeNavigation({ returnFocus: true });
  }
});

mobileNavigation.addEventListener('change', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  syncNavigation();
});

syncNavigation();
