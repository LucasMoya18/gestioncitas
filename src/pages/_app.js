import '../styles/globals.css';
import cors from "cors";

app.use(cors({
  origin: "https://gestioncitas.vercel.app", // frontend en Vercel
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;