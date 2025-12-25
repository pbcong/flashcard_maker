import PropTypes from 'prop-types';
import Navbar from '../components/Navbar'

export default function AuthenticatedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

AuthenticatedLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
