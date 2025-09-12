import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from "../context/AuthContext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;