import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="p-4 bg-gray-800 text-white flex space-x-4">
        <a href="/" className="hover:underline">Upload</a>
        <a href="/contracts" className="hover:underline">Contracts</a>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}
