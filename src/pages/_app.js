import { Providers } from "../providers";
import "@/styles/globals.css";

export default function App({ Component, pageProps}) {
  return (<>
  <Providers>
  <Component {...pageProps} />
  </Providers>
  
  </>
  )
}
