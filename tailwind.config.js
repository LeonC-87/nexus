/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--nexus-canvas)',
        surface1: 'var(--nexus-surface-1)',
        surface2: 'var(--nexus-surface-2)',
        surface3: 'var(--nexus-surface-3)',
        emerald: {
          DEFAULT: 'var(--nexus-emerald)',
          strong: 'var(--nexus-emerald-strong)',
          dim: 'var(--nexus-emerald-dim)'
        },
        text: {
          primary: 'var(--nexus-text-primary)',
          secondary: 'var(--nexus-text-secondary)',
          muted: 'var(--nexus-text-muted)'
        },
        nexusBorder: 'var(--nexus-border)',
        nexusBorderStrong: 'var(--nexus-border-strong)',
        glass: 'var(--nexus-glass-bg)'
      },
      borderRadius: {
        nsm: 'var(--nexus-radius-sm)',
        nmd: 'var(--nexus-radius-md)',
        nlg: 'var(--nexus-radius-lg)'
      },
      boxShadow: {
        glow: '0 0 24px var(--nexus-emerald-glow)',
        glowSoft: '0 0 12px var(--nexus-emerald-glow)'
      },
      backdropBlur: {
        glass: 'var(--nexus-glass-blur)'
      }
    }
  },
  plugins: []
}
