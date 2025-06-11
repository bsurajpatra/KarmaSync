import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="dashboard-footer-main">
      <div className="footer-content">
        <p>Made with <FontAwesomeIcon icon={faHeart} className="heart-icon" /> by KarmaSync Team</p>
        <p>© ${new Date().getFullYear()} KarmaSync. Licensed under the MIT License.</p>
      </div>
    </footer>
  );
};

export default Footer; 