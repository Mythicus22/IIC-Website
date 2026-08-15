import { useState } from 'react';
import './TeamCard.css';

const TeamCard = ({ member }) => {
  const [failedImage, setFailedImage] = useState(null);
  const imageUrl = member.imageUrl || member.secure_url || member.url;
  const imageFailed = failedImage === imageUrl;

  return (
    <div className="team-card">
      <div className="team-img-wrapper">
        {imageUrl && !imageFailed ? (
          <img src={imageUrl} alt={member.name} className="team-img" onError={() => setFailedImage(imageUrl)} />
        ) : (
          <div className="team-img-placeholder"></div>
        )}
      </div>
      <div className="team-info">
        <h4 className="team-name">{member.name}</h4>
        <p className="team-role">{member.category}</p>
      </div>
    </div>
  );
};

export default TeamCard;
