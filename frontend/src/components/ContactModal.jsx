import { useState } from 'react';
import { siteConfig } from '../data/content';

export default function ContactModal({ onClose }) {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      alert('Please fill in name, email and message.');
      return;
    }
    const subject = form.subject.trim() || 'Portfolio Enquiry';
    const body    = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Get in touch</h2>
        <p className="modal-sub">I'll get back to you within 24 hours</p>

        {!submitted ? (
          <div>
            {[
              { name: 'name',    label: 'Name',    type: 'text',  placeholder: 'Your name',           required: true  },
              { name: 'email',   label: 'Email',   type: 'email', placeholder: 'your@email.com',       required: true  },
              { name: 'subject', label: 'Subject', type: 'text',  placeholder: "What's this about?",  required: false },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name} className="form-group">
                <label htmlFor={`contact-${name}`}>{label}</label>
                <input
                  type={type}
                  id={`contact-${name}`}
                  name={name}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Your message…"
                value={form.message}
                onChange={handleChange}
              />
            </div>

            <button className="btn-submit" onClick={handleSubmit}>
              Send Message →
            </button>
          </div>
        ) : (
          <div className="form-success" style={{ display: 'block' }}>
            Message sent. Thank you!<br />
            <span style={{ fontSize: '.85rem', color: 'var(--muted)', fontFamily: 'var(--font-ui)' }}>
              I'll be in touch soon.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
