export default function PageHome({ onNavigate }) {
  return (
    <>
    <p>"I am currently under construction</p>
    <p>Thank you for your patience" ~ES</p>
      <div className="home-buttons">
        <button className="home-btn btn-it"     onClick={() => onNavigate('it')}>IT</button>
        <button className="home-btn btn-design" onClick={() => onNavigate('design')}>Design</button>
        <button className="home-btn btn-photo"  onClick={() => onNavigate('photo')}>Photography</button>
      </div>
    </>
  );
}
