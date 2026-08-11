import ScrollReveal from '../components/ScrollReveal';
import './Flowcharts.css';

const MentorNetwork = () => {
  return (
    <div className="section container">
      <ScrollReveal>
        <div className="page-header text-center">
          <span className="badge">Ecosystem</span>
          <h1 className="hero-title">Mentor Network</h1>
          <p className="section-subtitle">How our mentorship program accelerates your growth.</p>
        </div>
        
        <div className="flowchart-container grid-flow">
          <div className="flow-step bg-light">
            <h3>Domain Experts</h3>
            <p>Technical guidance specific to your industry (AI, Biotech, FinTech).</p>
          </div>
          <div className="flow-arrow horizontal">→</div>
          <div className="flow-step bg-primary">
            <h3>Student Founders</h3>
            <p>You and your team absorbing knowledge and iterating rapidly.</p>
          </div>
          <div className="flow-arrow horizontal">←</div>
          <div className="flow-step bg-light">
            <h3>Business Strategists</h3>
            <p>GTM strategies, financial modeling, and pitch refinement.</p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default MentorNetwork;
