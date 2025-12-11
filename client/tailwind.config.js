/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // ==========================================
      // CREATIVE HANDS v2 - Design System
      // Precision Craft: Vercel/Apple + Teenage Engineering
      // ==========================================
      
      colors: {
        // Backgrounds
        background: {
          DEFAULT: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          elevated: "var(--bg-elevated)",
        },
        
        // Surfaces
        surface: {
          DEFAULT: "var(--surface-default)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
          overlay: "var(--surface-overlay)",
        },
        
        // Text
        foreground: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          inverse: "var(--text-inverse)",
        },
        
        // Borders
        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        
        // Primary - Terracota
        primary: {
          50: "#FDF5F2",
          100: "#FBEAE4",
          200: "#F5D4C9",
          300: "#EDB9A6",
          400: "#D97B58",
          DEFAULT: "#CB6843",
          500: "#CB6843",
          600: "#B25A39",
          700: "#8F4830",
          800: "#6D3725",
          900: "#4A251A",
        },
        
        // Accent - Signal Orange
        accent: {
          DEFAULT: "#FF6B35",
          hover: "#E55A2B",
          muted: "rgba(255, 107, 53, 0.12)",
        },
        
        // Semantic
        success: {
          DEFAULT: "#10B981",
          muted: "rgba(16, 185, 129, 0.12)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          muted: "rgba(245, 158, 11, 0.12)",
        },
        error: {
          DEFAULT: "#EF4444",
          muted: "rgba(239, 68, 68, 0.12)",
        },
        
        // Indicators (LED style)
        indicator: {
          on: "#10B981",
          off: "var(--indicator-off)",
          active: "var(--indicator-active)",
        },
        
        // Neutrals (for fallback)
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
        },
      },
      
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Fira Code",
          "monospace",
        ],
        brand: [
          "Copernicus-Cond-110",
          "Copernicus-Bold",
          "serif",
        ],
      },
      
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],     // 10px
        xs: ["0.75rem", { lineHeight: "1rem" }],         // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],     // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],        // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],     // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],      // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],       // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],  // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],    // 36px
        "5xl": ["3rem", { lineHeight: "1.15" }],         // 48px
        "6xl": ["3.75rem", { lineHeight: "1.1" }],       // 60px
        "7xl": ["4.5rem", { lineHeight: "1.1" }],        // 72px
        "8xl": ["6rem", { lineHeight: "1" }],            // 96px
        "9xl": ["8rem", { lineHeight: "1" }],            // 128px
      },
      
      spacing: {
        // 8px grid system
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "3.5": "14px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "11": "44px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
        "28": "112px",
        "32": "128px",
        "36": "144px",
        "40": "160px",
        "44": "176px",
        "48": "192px",
        "52": "208px",
        "56": "224px",
        "60": "240px",
        "64": "256px",
        "72": "288px",
        "80": "320px",
        "96": "384px",
      },
      
      borderRadius: {
        none: "0",
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },
      
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        glow: "var(--shadow-glow)",
        "glow-accent": "var(--shadow-glow-accent)",
        none: "none",
      },
      
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-expo": "cubic-bezier(0.65, 0, 0.35, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
        slower: "600ms",
      },
      
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-in-left": "slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-up": "slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-down": "slideInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(203, 104, 67, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(203, 104, 67, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },
      
      zIndex: {
        dropdown: "50",
        sticky: "100",
        fixed: "200",
        "modal-backdrop": "300",
        modal: "400",
        popover: "500",
        tooltip: "600",
      },
      
      aspectRatio: {
        "4/3": "4 / 3",
        "3/4": "3 / 4",
        "16/9": "16 / 9",
        "9/16": "9 / 16",
        "21/9": "21 / 9",
      },
      
      screens: {
        xs: "475px",
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
        // xl: 1280px (default)
        "2xl": "1400px",
        "3xl": "1600px",
      },
      
      maxWidth: {
        "8xl": "88rem",   // 1408px
        "9xl": "96rem",   // 1536px
      },
      
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
    },
  },
  plugins: [],
};
