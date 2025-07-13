import Navbar from '../components/Navbar'

export default function AuthenticatedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
