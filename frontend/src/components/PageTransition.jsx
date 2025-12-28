import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// iOS-style page transition wrapper
function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('enter');

  useEffect(() => {
    if (children !== displayChildren) {
      setTransitionStage('exit');
    }
  }, [children, displayChildren]);

  const handleAnimationEnd = () => {
    if (transitionStage === 'exit') {
      setDisplayChildren(children);
      setTransitionStage('enter');
    }
  };

  return (
    <div
      key={location.pathname}
      className={`page-transition page-${transitionStage}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {displayChildren}
    </div>
  );
}

export default PageTransition;
