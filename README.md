# Ramzi Bougdar — Online CV

Personal website and CV of Ramzi Bougdar, AI application developer and PrestaShop & Shopify
e-commerce expert based in Antibes, France.

**Live:** <https://ramzibougdar.github.io/> — in English (`/en/`) and French (`/fr/`).

## Stack

Static site, no framework and no build step: semantic HTML, CSS and vanilla JavaScript, hosted on
GitHub Pages. Animations use GSAP; analytics run through Google Tag Manager behind a cookie banner
(Google Consent Mode v2).

```text
data/cv.js        CV content, in English and French (the file to edit)
en/, fr/          Language pages
js/               Rendering, translations, cookie banner, animations
css/              Styles (screen, print, PDF)
assets/           PDFs, images, icons, self-hosted fonts
scripts/          Maintenance scripts (minified bundles, pre-render, metadata, sitemap, llms.txt)
```

## Updating the CV

1. Edit `data/cv.js` and set `meta.updatedOn`.
2. Rebuild the minified bundles (`css/site.min.css`, `js/site.min.js`), the pre-rendered HTML,
   metadata, `sitemap.xml` and `llms.txt` (needs Node, npx and Chrome). Do the same after editing
   any CSS or JS source:

   ```bash
   node scripts/generate-metadata.js --write
   ```

3. Regenerate the PDFs by printing `en/index.html?pdf` and `fr/index.html?pdf`
   (`?ats` for the plain ATS version) to `assets/` with headless Chrome.
4. Commit and push to `main`: GitHub Pages publishes the site.

## License

Code under the MIT License (see `LICENSE`). Texts and photo © Ramzi Bougdar.
