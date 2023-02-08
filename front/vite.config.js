import { defineConfig, loadEnv } from "vite";
import dotenv from "dotenv";
import path from "path";
import mkcert from "vite-plugin-mkcert";

export default defineConfig(({ command, mode, ssrBuild }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  dotenv.config({
    path: path.join(path.resolve(), ".env"),
  });
  return {
    // vite config
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    server: {
      host: process.env.HOST,
      port: process.env.PORT,
      watch: {
        usePolling: true,
      },
      cors: true,
      proxy: {
        "/proxy": {
          target: "https://1779-61-74-229-172.jp.ngrok.io",
          // target: "https://localhost",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/proxy/, ""),
        },
        // "/openvidu": {
        //   target: "wss://2e98-61-74-229-172.jp.ngrok.io",
        //   changeOrigin: true,
        //   secure: false,
        //   rewrite: (path) => {
        //     console.log("✅ path!", path);
        //     return path.replace(/\/openvidu/, "");
        //   },
        //   ws: true,
        // },
      },
      https: true,
      // hmr: {
      //   // server: {}
      //   // protocol: "ws",
      //   // host: 'rtc-test.kro.kr',
      //   // // path: "/openvidu",
      // },
    },
    plugins: [mkcert()],
  };
});
