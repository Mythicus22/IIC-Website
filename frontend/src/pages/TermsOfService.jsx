import React from 'react';
import ScrollReveal from '../components/ScrollReveal';

const TermsOfService = () => {
  return (
    <div className="section container">
      <ScrollReveal>
        <div className="page-header text-center">
          <h1 className="hero-title">Terms of Service</h1>
          <p className="section-subtitle">Please read these terms carefully.</p>
        </div>
        <div className="card" style={{padding: '3rem', maxWidth: '800px', margin: '0 auto'}}>
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing or using our services, you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, you may not access or use our services.</p>
          <br/>
          <h3>2. User Conduct</h3>
          <p>You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the Service in any medium; (ii) using any automated system, including without limitation "robots," "spiders," "offline readers," etc., to access the Service.</p>
          <br/>
          <h3>3. Termination</h3>
          <p>We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default TermsOfService;
