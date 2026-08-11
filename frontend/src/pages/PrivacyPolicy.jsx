import ScrollReveal from '../components/ScrollReveal';

const PrivacyPolicy = () => {
  return (
    <div className="section container">
      <ScrollReveal>
        <div className="page-header text-center">
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="section-subtitle">Last updated: May 2026</p>
        </div>
        <div className="card" style={{padding: '3rem', maxWidth: '800px', margin: '0 auto'}}>
          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
          <br/>
          <h3>2. Use of Information</h3>
          <p>We may use the information we collect about you to provide, maintain, and improve our services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users, develop safety features, authenticate users, and send product updates and administrative messages.</p>
          <br/>
          <h3>3. Data Security</h3>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default PrivacyPolicy;
