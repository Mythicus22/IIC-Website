import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero section container">
        <ScrollReveal>
          <div className="about-hero-content">
            <span className="badge">Who We Are</span>
            <h1 className="hero-title">Fostering the next generation of <i>innovators</i> and entrepreneurs.</h1>
            <p className="hero-desc">
              The Innovation & Incubation Cell (IIC) at our college is a vibrant ecosystem dedicated to transforming student ideas into viable business ventures through mentorship, funding, and collaboration.
            </p>
          </div>
          <div className="about-hero-image">
            <div className="pyramid-placeholder">
               <div className="placeholder-text">IIC Activities Pyramid</div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* VMG Section */}
      <section className="vmg-section container section">
        <ScrollReveal>
          <div className="vmg-grid">
            <div className="vmg-card bg-orange">
              <div className="vmg-icon">💡</div>
              <h3>Our Vision</h3>
              <p>To be a globally recognized center of excellence that nurtures a culture of innovation and empowers young minds to build sustainable solutions for local and global challenges.</p>
            </div>
            <div className="vmg-card bg-yellow">
              <div className="vmg-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>We provide the platform, technical expertise, and business mentorship needed to convert creative concepts into impactful startups, bridging the gap between academia and industry.</p>
            </div>
            <div className="vmg-card bg-green">
              <div className="vmg-icon">🚀</div>
              <h3>Our Goals</h3>
              <p>Achieve 50+ successful student startups by 2025, establish 10+ industry-academic partnerships, and conduct over 100 skill-development workshops annually.</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Journey Section */}
      <section className="journey-section bg-light section">
        <div className="container">
          <ScrollReveal>
            <div className="journey-layout">
              <div className="journey-text">
                <h2 className="section-title" style={{textAlign: 'left'}}>Our Journey So Far</h2>
                <p className="hero-desc">From our humble beginnings to becoming a leading incubation center, every milestone marks a story of grit and creative breakthrough.</p>
                <Link to="/gallery" className="btn btn-primary">View Gallery</Link>
              </div>
              <div className="journey-timeline">
                <div className="timeline-item">
                  <div className="timeline-year">2018</div>
                  <h4>Foundation Laid</h4>
                  <p>The IIC was officially inaugurated with a cohort of 10 eager students and 3 faculty mentors.</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2019</div>
                  <h4>First Patent Filed</h4>
                  <p>Our students successfully filed for a patent in renewable energy storage solutions.</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2021</div>
                  <h4>Incubation Wing Opens</h4>
                  <p>Dedicated physical co-working space launched with high-speed fiber and prototyping tools.</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2023</div>
                  <h4>Global Recognition</h4>
                  <p>Ranked Top 5 Academic Incubators in the region by the National Innovation Council.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="features-section container section">
        <ScrollReveal>
          <h2 className="section-title">Why Join the IIC Ecosystem?</h2>
          <p className="section-subtitle">Unlock your potential with resources designed to accelerate your growth from student to founder.</p>
          <div className="features-grid">
            {[
              { icon: '👥', title: 'Expert Mentorship', desc: 'Direct access to seasoned entrepreneurs and domain experts to guide your strategic decisions.' },
              { icon: '💰', title: 'Seed Funding', desc: 'Opportunity to pitch for internal grants and connections to angel investor networks.' },
              { icon: '🌐', title: 'Global Network', desc: 'Collaborate with international research hubs and participate in global hackathons.' },
              { icon: '🛠️', title: 'Prototyping Labs', desc: 'Unlimited use of 3D printers, IoT kits, and high-performance computing clusters.' },
              { icon: '📚', title: 'IP Support', desc: 'Legal and technical assistance for filing patents and protecting your intellectual property.' },
              { icon: '🚀', title: 'Pre-Incubation', desc: 'Structured programs to refine your idea before you even have a registered startup.' },
              { icon: '🎯', title: 'Market Access', desc: 'Partnerships with local chambers of commerce to help you find your first customers.' },
              { icon: '💡', title: 'Soft Skills', desc: 'Regular workshops on pitching, leadership, and emotional intelligence for founders.' }
            ].map((feature, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Application Flow Section */}
      <section id="application-flow" className="appflow-section bg-light section">
        <div className="container">
          <ScrollReveal>
            <div className="page-header text-center" style={{ marginBottom: '3rem' }}>
              <span className="badge">Incubation Process</span>
              <h2 className="section-title">Application Flow</h2>
              <p className="section-subtitle">Follow these simple steps to transform your idea into a funded startup.</p>
            </div>
            <div className="flow-steps-grid">
              {[
                { n: 1, title: 'Idea Submission', desc: 'Submit your executive summary and pitch deck via our online portal.' },
                { n: 2, title: 'Screening Round', desc: 'Our panel of experts reviews the viability and innovation factor of your idea.' },
                { n: 3, title: 'Pitch Day', desc: 'Shortlisted candidates present live to the IIC leadership and investor network.' },
                { n: 4, title: 'Pre-Incubation', desc: 'Selected teams receive 3 months of rigorous mentorship, lab access, and seed funding!', highlight: true },
              ].map(step => (
                <div key={step.n} className={`flow-step-card${step.highlight ? ' highlight' : ''}`}>
                  <div className="flow-step-number">{step.n}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <a href="https://forms.gle/SeoQnn8KnrYLyoUD7" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Apply Now</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mentor Network Section */}
      <section id="mentor-network" className="mentor-section section">
        <div className="container">
          <ScrollReveal>
            <div className="page-header text-center" style={{ marginBottom: '3rem' }}>
              <span className="badge">Ecosystem</span>
              <h2 className="section-title">Mentor Network</h2>
              <p className="section-subtitle">How our mentorship program accelerates your growth.</p>
            </div>
            <div className="mentor-grid">
              <div className="mentor-card">
                <div className="mentor-icon">🔬</div>
                <h3>Domain Experts</h3>
                <p>Technical guidance specific to your industry — AI, Biotech, FinTech, and more.</p>
              </div>
              <div className="mentor-card">
                <div className="mentor-icon">🎓</div>
                <h3>Student Founders</h3>
                <p>You and your team absorbing knowledge, iterating rapidly, and building boldly.</p>
              </div>
              <div className="mentor-card">
                <div className="mentor-icon">📊</div>
                <h3>Business Strategists</h3>
                <p>GTM strategies, financial modeling, and pitch refinement from seasoned professionals.</p>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <a href="https://forms.gle/Hs58wCfgvJFPRYL76" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Become a Mentor</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section-wrapper section">
        <div className="container">
          <ScrollReveal>
            <div className="cta-box">
              <div className="cta-box-content">
                <h2 className="cta-title">Ready to start your innovation journey?</h2>
                <p className="cta-desc">Join a community of thousands of students building the future. Your idea could be the next big breakthrough.</p>
              </div>
              <div className="cta-box-actions">
                <Link to="/events" className="btn btn-secondary">Explore Events</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default About;
