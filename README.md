# MemoryOrb – mobile product page

Static site, no build step needed for deploy: `index.html` + `runtime.js` + `logic.js` + `assets/`.

- Source of the design: `memoryorb/project/Main.dc.html` (Design artifact format).
- `python3 build.py` regenerates `index.html` and `logic.js` from that source.
- Deploy (Vercel/Netlify/GitHub Pages): serve the repository root.

## Design system

All visual styling lives in the `<style>` block at the top of `memoryorb/project/Main.dc.html` (tokens in `:root`: colour, radius, shadow, motion, spacing; fonts: Manrope + Cormorant Garamond italic for accent words). Layout is responsive (mobile → tablet → desktop) and honours `prefers-reduced-motion`. After editing, run `python3 build.py`.
