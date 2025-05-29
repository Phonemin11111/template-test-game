import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const phasermsg = () => {
    return {
        name: "phasermsg",
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line =
                "---------------------------------------------------------";
            const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);

            process.stdout.write(`✨ Done ✨\n`);
        },
    };
};

export default defineConfig({
    base: "./",
    plugins: [
        react(),
        tailwindcss(),
        phasermsg(),
        VitePWA({
            registerType: "autoUpdate",
            manifest: {
                short_name: "MyGame",
                name: "My Phaser React Game",
                start_url: "/",
                display: "standalone",
                background_color: "#000000",
                theme_color: "#1a202c",
                icons: [
                    {
                        src: "public/favicon.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "public/assets/logo.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,png,mp3}"],
                runtimeCaching: [
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|mp3)$/,
                        handler: "CacheFirst",
                        options: { cacheName: "game-assets" },
                    },
                    {
                        urlPattern: /.*/,
                        handler: "NetworkFirst",
                    },
                ],
            },
        }),
    ],
    logLevel: "warning",
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ["phaser"],
                },
            },
        },
        minify: "terser",
        terserOptions: {
            compress: {
                passes: 2,
            },
            mangle: true,
            format: {
                comments: false,
            },
        },
    },
});
