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
        "/api/openvidu": {
          target: "https://192.168.88.234",
          // target: "https://localhost",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/\/api/, ""),
        },
        "/openvidu": {
          target: "wss://192.168.88.234",
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => {
          //   console.log('✅ path!',path);
          //   return path.replace(/wss\:\/\/192\.168\.88\.234\/openvidu/, "");
          // },
          ws: true,
        },
      },
      https: true,
      hmr: {
        protocol: 'wss',
        host: "192.168.88.234",
        path: "/openvidu",
      },
    },
    plugins: [mkcert()],
  };
});
