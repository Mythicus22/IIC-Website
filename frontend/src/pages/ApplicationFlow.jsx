import React from 'react';
import ScrollReveal from '../components/ScrollReveal';
import './Flowcharts.css';

const ApplicationFlow = () => {
  return (
    <div className="section container">
      <ScrollReveal>
        <div className="page-header text-center">
          <span className="badge">Incubation Process</span>
          <h1 className="hero-title">Application Flow</h1>
          <p className="section-subtitle">Follow these simple steps to transform your idea into a funded startup.</p>
        </div>
        
        <div className="flowchart-container">
          <div className="flow-step">
            <div className="step-number">1</div>
            <h3>Idea Submission</h3>
            <p>Submit your executive summary and pitch deck via our online portal.</p>
          </div>
          <div className="flow-arrow">↓</div>
          <div className="flow-step">
            <div className="step-number">2</div>
            <h3>Screening Round</h3>
            <p>Our panel of experts reviews the viability and innovation factor of your idea.</p>
          </div>
          <div className="flow-arrow">↓</div>
          <div className="flow-step">
            <div className="step-number">3</div>
            <h3>Pitch Day</h3>
            <p>Shortlisted candidates present live to the IIC leadership and investor network.</p>
          </div>
          <div className="flow-arrow">↓</div>
          <div className="flow-step highlight">
            <div className="step-number">4</div>
            <h3>Pre-Incubation</h3>
            <p>Selected teams receive 3 months of rigorous mentorship, lab access, and seed funding!</p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default ApplicationFlow;
