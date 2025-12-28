import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'

export default function AuthenticatedLayout({ children }) {
  const location = useLocation();
  const [animationKey, setAnimationKey] = useState(0);
  
  // Trigger animation on every route change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [location.pathname]);
  
  return (
    <>
      <Navbar />
      <div 
        key={animationKey}
        className="page-transition page-enter"
      >
        {children}
      </div>
    </>
  )
}

AuthenticatedLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
