import { UserProvider } from '/app/context/UseContext';
import '../app/globals.css';

export default function App({ Component, pageProps }) {
    return (
        <UserProvider>
            <Component {...pageProps} />
        </UserProvider>
    );
}