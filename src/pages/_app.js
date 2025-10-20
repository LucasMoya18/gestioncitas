import '../styles/globals.css';
import { ConfirmProvider } from '../utils/confirm';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <ConfirmProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ConfirmProvider>
  );
}

export default MyApp;