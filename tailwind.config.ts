import type { Config } from 'tailwindcss'

export default {
  content: ["./index.njk", "./sections.njk", "./_includes/*.njk"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
