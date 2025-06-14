import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "transparent",
        color: "white",
        textAlign: "center",
        padding: "1rem",
        fontSize: "0.9rem",
        borderTop: "1px solid white",
        fontWeight: 500,
      }}
    >
      &copy; {year} KarmaSync. Licensed under{" "}
      <a    
        href="https://github.com/bsurajpatra/KarmaSync/blob/main/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "white", textDecoration: "underline" }}
      >
        MIT License
      </a>.
    </footer>
  );
};

export default Footer;
