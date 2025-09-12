import '../styles/globals.css';
import { AuthProvider } from '../context/authcontext';
import { useAuth } from "../context/authcontext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;