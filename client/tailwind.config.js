/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Backgrounds
                background: "var(--bg-primary)",
                surface: {
                    DEFAULT: "var(--surface-default)",
                    hover: "var(--surface-hover)",
                    active: "var(--surface-active)",
                },
                // Text colors
                foreground: {
                    DEFAULT: "var(--text-primary)",
                    secondary: "var(--text-secondary)",
                    tertiary: "var(--text-tertiary)",
                    inverse: "var(--text-inverse)",
                },
                // Borders
                border: {
                    DEFAULT: "var(--border-default)",
                    strong: "var(--border-strong)",
                    subtle: "var(--border-subtle)",
                },
                // Primary - Terracota  
                primary: {
                    DEFAULT: "#CB6843",
                    50: "#FDF5F2",
                    100: "#FAE8E0",
                    200: "#F5D0C1",
                    300: "#EDB698",
                    400: "#DC8D66",
                    500: "#CB6843",
                    600: "#B25A39",
                    700: "#8F4830",
                    800: "#6D3726",
                    900: "#4F281C",
                    muted: "var(--primary-muted)",
                },
                // Indicators
                indicator: {
                    off: "var(--indicator-off)",
                    on: "#10b981",
                    active: "var(--indicator-active)",
                },
                // Semantic colors
                success: {
                    DEFAULT: "#10b981",
                    muted: "rgba(16, 185, 129, 0.1)",
                },
                warning: {
                    DEFAULT: "#f59e0b",
                    muted: "rgba(245, 158, 11, 0.1)",
                },
                error: {
                    DEFAULT: "#ef4444",
                    muted: "rgba(239, 68, 68, 0.1)",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
                mono: ["JetBrains Mono", "SF Mono", "Consolas", "monospace"],
                brand: ["Copernicus-Cond-110", "Copernicus-Bold", "Georgia", "serif"],
            },
            transitionDuration: {
                fast: "150ms",
                normal: "250ms",
                slow: "400ms",
            },
            transitionTimingFunction: {
                "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
            },
            zIndex: {
                sticky: "50",
                modal: "100",
                "modal-backdrop": "99",
                overlay: "200",
            },
            aspectRatio: {
                product: "3/4",
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                md: "var(--shadow-md)",
                lg: "var(--shadow-lg)",
                xl: "var(--shadow-xl)",
            },
        },
    },
    plugins: [],
};
