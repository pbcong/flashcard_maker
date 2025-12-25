import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" />
  }
  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
