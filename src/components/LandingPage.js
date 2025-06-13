import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Header Section */}
      <section className="landing-header">
        <div className="header-text">
          <h1 className="app-title">KarmaSync</h1>
          <p className="app-tagline">Agile Project Management Made Simple</p>
          <div className="header-cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started
            </Link>
          </div>
        </div>
        <div className="header-logo">
          <img src="/logo.png" alt="KarmaSync Logo" className="app-logo" />
        </div>
      </section>

      {/* About Section */}
      <section className="landing-about">
        <div className="about-content">
          <h2>About KarmaSync</h2>
          <p>
          Karma Sync is a modern, lightweight project management tool built for teams and individuals to stay organized, productive, and in sync. Whether you're working solo or managing a group project, Karma Sync helps you plan tasks, track progress, and collaborate effectively — all in one streamlined dashboard.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="landing-team">
        <h2>Our Team</h2>
        <div className="team-members">
          <div className="team-member">
            <p>B Suraj Patra</p>
          </div>
          <div className="team-member">
            <p>G Sri Krishna Sudhindra</p>
          </div>
          <div className="team-member">
            <p>Alimillla Abhinandan</p>
          </div>
          <div className="team-member">
            <p>P Bhavya Varsha</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage; 