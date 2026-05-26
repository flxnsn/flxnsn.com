import { about, siteConfig } from '../data/content';

export default function PageAbout() {
  return (
    <div className="about-inner">
      <div className="about-portrait">
        <img src={about.portrait.src} alt={about.portrait.alt} />
        <div>
          <h3>{siteConfig.name}</h3>
          <p className="subtitle">{siteConfig.subtitle}</p>
        </div>
      </div>

      <div className="about-content">
        <h2>{about.headline}</h2>
        {about.bio.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
        <div className="skills-section">
          {about.skillGroups.map((group) => (
            <div key={group.label}>
              <h4>{group.label}</h4>
              <div className="skills-list">
                {group.items.map((item) => (
                  <span key={item} className="skill-item">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
