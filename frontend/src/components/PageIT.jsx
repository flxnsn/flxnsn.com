import { itProjects } from '../data/content';

export default function PageIT() {
  return (
    <>
      <div className="page-heading">IT <span>Projects</span></div>
      <div className="page-rule" />
      <div className="it-articles">
        {itProjects.map((project) => (
          <article
            key={project.id}
            className="it-article"
            style={!project.image ? { gridTemplateColumns: '1fr' } : undefined}
          >
            <div className="it-article-text">
              <h2>{project.title}</h2>
              <div className="tech-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="tech-tag">{tag}</span>
                ))}
              </div>
              {project.body.map((paragraph, i) => (
                <p key={i} style={i > 0 ? { marginTop: '.5rem' } : undefined}>{paragraph}</p>
              ))}
            </div>
            {project.image && (
              <div className="it-article-img">
                <img src={project.image.src} alt={project.image.alt} loading="lazy" />
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
