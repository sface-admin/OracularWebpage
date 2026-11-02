# Oracular - Marketing Website

Single-page marketing website for Oracular (a product of SFACE), built with plain HTML, CSS and JavaScript. No build step, no dependencies.

## Structure
- `index.html` - the page
- `css/styles.css` - styles
- `js/main.js` - nav, animations, lightbox, contact form
- `assets/` - images

## Run locally
Open `index.html` in a browser, or serve the folder:
```
python -m http.server 8000
```

## Contact form
The form emails support@sface.no. By default it opens the visitor email app (mailto fallback). To send through a hosted endpoint, create a form at https://formspree.io and set `FORMSPREE_ENDPOINT` at the top of `js/main.js`.

## Deploy on GitHub Pages (free)
1. Create a public GitHub repository and push this folder.
2. Repo Settings > Pages > Source: Deploy from a branch -> `main` -> `/ (root)` -> Save.
3. Repo Settings > Pages > Custom domain: `oracular.no` -> Save.
4. At Nordic Hosting add these DNS records for `oracular.no`:
   - `A`  `@`  `185.199.108.153`
   - `A`  `@`  `185.199.109.153`
   - `A`  `@`  `185.199.110.153`
   - `A`  `@`  `185.199.111.153`
   - `CNAME`  `www`  `YOUR_GITHUB_USERNAME.github.io`
5. Enable "Enforce HTTPS" in Pages settings once DNS resolves.