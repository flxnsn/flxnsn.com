import { impressum } from '../data/content';

export default function PageImpressum() {
  return (
    <div className="impressum-inner">
      <div className="page-heading" style={{ fontSize: '2rem' }}>Impressum</div>
      <div className="page-rule" />
      {impressum.map((block) => (
        <div key={block.heading}>
          <h2>{block.heading}</h2>
          <p>
            {block.text.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}
