# MemoryOrb – product page (mobile + desktop)

Static site, no build step needed for deploy: `index.html` + `runtime.js` + `logic.js` + `assets/`.

- Source of the design: `memoryorb/project/Main.dc.html` (Design artifact format).
- `python3 build.py` regenerates `index.html` and `logic.js` from that source.
- Deploy (Vercel/Netlify/GitHub Pages): serve the repository root.
- Desktop layout (≥900px) lives in the `@media (min-width:900px)` block in `memoryorb/project/Main.dc.html`; mobile is unchanged.
