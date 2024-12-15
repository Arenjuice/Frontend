import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

const BackButton = ({ to = '/', label = 'Grįžti atgal' }) => {
  const navigate = useNavigate();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Tikrinti, ar ekranas mažas
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768); // Jei ekranas mažesnis nei 768px
    };

    handleResize(); // Patikrina pradinį dydį
    window.addEventListener('resize', handleResize); // Klausosi pakeitimų

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '20px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
    }}>
      <Button
        variant="secondary"
        onClick={() => navigate(to)}
        style={{
          padding: isSmallScreen ? '5px 10px' : '10px 20px',
          fontSize: isSmallScreen ? '14px' : '16px',
        }}
      >
        &larr; {isSmallScreen ? '' : label}
      </Button>
    </div>
  );
};

export default BackButton;
