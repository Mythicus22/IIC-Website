import React, { useState } from 'react';
import ScrollReveal from '../components/ScrollReveal';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "Who can apply for the incubation program?", a: "Any currently enrolled student or recent alumni (within 2 years of graduation) from our college can apply." },
    { q: "Do I need a registered company to apply?", a: "No. You can apply with just a solid idea or a prototype. We help you with the legal registration during the pre-incubation phase." },
    { q: "How much seed funding does IIC provide?", a: "Seed funding varies depending on the project requirements, typically ranging from ₹10,000 to ₹1,000,000 as a grant or convertible note." },
    { q: "Will the college take equity in my startup?", a: "The IIC takes a nominal 2-5% equity in startups that receive direct funding and lab space, which is reinvested back into the ecosystem." }
  ];

  return (
    <div className="section container">
      <ScrollReveal>
        <div className="page-header text-center">
          <h1 className="hero-title">Frequently Asked Questions</h1>
          <p className="section-subtitle">Find answers to common queries about our programs.</p>
        </div>
        <div className="faq-container" style={{maxWidth: '800px', margin: '0 auto'}}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="card" 
              style={{marginBottom: '1rem', cursor: 'pointer', padding: '1.5rem'}}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1rem'}}>
                {faq.q}
                <span>{openIndex === idx ? '−' : '+'}</span>
              </div>
              {openIndex === idx && (
                <p style={{marginTop: '1rem', color: 'var(--text-muted)'}}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
};

export default FAQs;
