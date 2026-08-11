import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import TeamCard from '../components/TeamCard';
import { teamCategories, teamRoles } from '../constants/taxonomy';
import { API_URL } from '../config/api';
import './Team.css';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [filter, setFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get(`${API_URL}/team`);
        setTeam(res.data);
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };
    fetchTeam();
  }, []);

  const filteredTeam = team.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) || member.role.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'All' || member.category === filter;
    const matchesRole = roleFilter === 'All Roles' || member.role === roleFilter;
    return matchesSearch && matchesCategory && matchesRole;
  });

  return (
    <div className="team-page section container">
      <ScrollReveal>
        <div className="page-header text-center" style={{marginBottom: '4rem'}}>
          <span className="badge">Our People</span>
          <h1 className="hero-title" style={{textAlign: 'center', marginBottom: '1rem'}}>Meet the Minds Driving Innovation</h1><br /><br />
          <p className="section-subtitle">
            The IIC is powered by a diverse group of visionary faculty, industry experts, and passionate student leaders dedicated to nurturing the next generation of entrepreneurs.
          </p>
        </div>

        <div className="team-filters">
          <div className="filter-tabs">
            {['All', ...teamCategories].map(cat => (
              <button 
                key={cat}
                className={filter === cat ? 'active' : ''} 
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <select className="role-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All Roles">All Roles</option>
            {teamRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="team-grid-large">
          {filteredTeam.length > 0 ? filteredTeam.map((member, index) => (
            <ScrollReveal key={member._id} delay={index * 0.05}>
              <div className="team-card-wrapper">
                <TeamCard member={member} />
                <div className="team-card-badge">{member.category}</div>
              </div>
            </ScrollReveal>
          )) : (
            <p className="text-center" style={{gridColumn: '1 / -1', padding: '4rem 0'}}>No team members found.</p>
          )}
        </div>

        <div className="cta-box">
          <div className="cta-box-content">
            <h2>Interested in joining our mission?</h2>
            <p>We are always looking for mentors, industry partners, and student leads to help expand our ecosystem. Share your expertise and shape the future.</p>
          </div>
          <div className="cta-box-actions">
            <a href="https://forms.gle/Hs58wCfgvJFPRYL76" target="_blank" rel="noopener noreferrer" className="btn" style={{backgroundColor: 'white', color: 'var(--dark)'}}>Become a Mentor</a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Team;
