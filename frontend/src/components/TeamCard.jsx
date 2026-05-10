import React, { useEffect, useState } from 'react';
import './TeamCard.css';

const TeamCard = ({ member }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = member.imageUrl || member.secure_url || member.url;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div className="team-card">
      <div className="team-img-wrapper">
        {imageUrl && !imageFailed ? (
          <img src={imageUrl} alt={member.name} className="team-img" onError={() => setImageFailed(true)} />
        ) : (
          <div className="team-img-placeholder"></div>
        )}
      </div>
      <div className="team-info">
        <h4 className="team-name">{member.name}</h4>
        <p className="team-role">{member.role}</p>
      </div>
    </div>
  );
};

export default TeamCard;
