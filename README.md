# MemoryOrb – mobile product page

Static site, no build step needed for deploy: `index.html` + `runtime.js` + `logic.js` + `assets/`.

- Source of the design: `memoryorb/project/Main.dc.html` (Design artifact format).
- `python3 build.py` regenerates `index.html` and `logic.js` from that source.
- Deploy (Vercel/Netlify/GitHub Pages): serve the repository root.
