# CV en ligne — Ramzi Bougdar

Site CV one-page statique et **bilingue** (anglais par défaut, français), sans framework ni
étape de build : HTML5 sémantique, CSS et JavaScript natif, direction « Bento vivant » (grille de
tuiles, frise et timeline du parcours). Tout le contenu du CV vit dans **un seul fichier**,
`data/cv.js`, où chaque texte existe dans les deux langues, rendu dynamiquement par `js/main.js`.
Il s'ouvre directement depuis le fichier `index.html`, sans serveur.

## Langues

- `en/` : version anglaise ; `fr/` : version française. Chaque page a son adresse, sa langue
  déclarée (`lang`) et un sélecteur **FR / EN** dans la barre (la section en cours est conservée).
- `index.html` (racine) oriente le visiteur : vers la langue qu'il a choisie avec le sélecteur
  (mémorisée dans le navigateur), sinon vers le français si son navigateur est en français,
  sinon vers l'anglais. Sans JavaScript, elle propose deux liens.
- Les textes d'interface fixes (titres de sections, boutons, fenêtre Accessibilité) sont dans
  `en/index.html` et `fr/index.html` ; ceux générés par le script (durées, « Voir les N missions »,
  libellés de contact…) sont dans `js/i18n.js`. Les deux pages HTML ont la même structure :
  toute modification de structure se fait dans les deux.

**Dépendances externes** (amélioration progressive, le CV reste complet sans elles) :

- [GSAP 3.13.0](https://gsap.com) (core, ScrollTrigger) depuis cdnjs, version figée et
  empreintes SRI : animations uniquement ;
- Google Fonts : Unbounded (titres) et Manrope (texte), avec polices système de repli ;
- Google Tag Manager (`GTM-W86L38PQ`), qui charge Google Analytics, sous **Google Consent Mode v2**
  (voir « Cookies et consentement » ci-dessous).

### Cookies et consentement

- Le script en ligne du `<head>` des trois pages HTML (avant GTM) refuse tout par défaut
  (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) et applique aussitôt
  le choix déjà mémorisé. À garder **avant** le bloc Google Tag Manager, et hors du bloc généré
  par `scripts/generate-metadata.js` (qui le réécrit).
- `js/consent.js` affiche la bannière (`#consent`, textes dans `en/index.html` et `fr/index.html`)
  tant qu'aucun choix n'est mémorisé, puis envoie `gtag('consent', 'update', …)` et l'événement
  `consent_update` au `dataLayer`. « Tout refuser » et « Tout accepter » ont le même poids
  (recommandations de la CNIL) ; le choix dure 6 mois (`localStorage`, clé `consent`), puis il est
  redemandé. Le bouton « Cookies » du pied de page rouvre la bannière ; retirer son accord efface
  les cookies `_ga`.
- Côté GTM : la balise Google (GA4) respecte nativement `analytics_storage` (mode avancé :
  pings sans cookie tant que le visiteur n'a pas accepté). Pour le mode de base, ajoutez à la
  balise l'autorisation supplémentaire `analytics_storage` ou un déclencheur sur l'événement
  personnalisé `consent_update`.

## Structure

```text
index.html               Page d'orientation vers la langue du visiteur
en/index.html            Page en anglais (bento, parcours, sections, navigation)
fr/index.html            Page en français (même structure)
css/tokens.css           Tokens de design : couleurs clair/sombre, typographie, espacements, mouvement
css/style.css            Styles écran (mobile-first)
css/print.css            Mise en page d'impression A4 (sert aussi à générer le PDF)
js/i18n.js               Langue de la page, textes d'interface générés en JS, choix de la langue dans data/cv.js
js/calc.js               Calculs dérivés (chiffres clés, durées, timeline)
js/icons.js              Tracés SVG des logos de technologies (Simple Icons, CC0), rendus en ligne
js/main.js               Rendu du CV, thème, navigation, marqueurs, bouton PDF (fonctionne seul)
js/consent.js            Bannière cookies (Google Consent Mode v2) : choix du visiteur, envoyé à Google Tag Manager
js/animations.js         Seul module d'animation (GSAP) ; inerte sans GSAP ou en mouvement réduit
data/cv.js             ← le contenu du CV, en anglais et en français (seul fichier à modifier au quotidien)
data/private.js        Téléphone de secours pour le PDF, LOCAL (ignoré par git) — facultatif si `contact.phone` est renseigné
assets/CV-Ramzi-Bougdar-en.pdf  PDF téléchargeable en anglais, généré à partir de la page
assets/CV-Ramzi-Bougdar-fr.pdf  PDF téléchargeable en français
assets/img/              Photo optionnelle
scripts/generate-metadata.js  Génère et vérifie le pré-rendu, les balises de tête, le JSON-LD, sitemap.xml et les llms.txt
robots.txt               Consignes aux robots (commentées en anglais et en français)
llms.txt                 Résumé du CV pour les assistants IA, en anglais (fr/llms.txt : en français)
sitemap.xml              Plan du site (pages en/ et fr/, alternances de langue)
specs/                   Spécification, plan et tâches (Spec Kit)
```

## Ouvrir le site en local

Double-cliquez simplement sur `index.html` : le site fonctionne en ouverture directe
(`file://`), sans serveur. Les données sont chargées par une balise `<script>`
(`data/cv.js`), ce que les navigateurs autorisent en local, contrairement à `fetch()`.

## Modifier le contenu (`data/cv.js`)

1. Ouvrez `data/cv.js` dans un éditeur de texte.
2. Modifiez les valeurs souhaitées (voir le format ci-dessous).
3. Mettez à jour `meta.updatedOn` (format `AAAA-MM-JJ`).
4. Mettez à jour le pré-rendu et les métadonnées : `node scripts/generate-metadata.js --write`.
5. Rechargez la page. Si la syntaxe est invalide (virgule en trop, guillemet manquant…), la page affiche un message d'erreur et la console
   du navigateur en donne le détail.
6. Régénérez les deux PDF (section suivante).

Le fichier commence par `window.CV_DATA = {` et se termine par `};` : entre les deux, c'est du
JSON standard (guillemets doubles, pas de virgule après le dernier élément d'une liste).
Vérification facultative en ligne de commande : `node -e "global.window={};require('./data/cv.js');console.log('Syntaxe valide')"`

### Format

Les clés sont en anglais (principe VII de la constitution). **Chaque texte affiché existe dans les
deux langues** sous la forme `{ "en": "…", "fr": "…" }` ; une valeur identique dans les deux
langues (nom propre, URL, date, technologie) reste une simple chaîne. Exemple :

```json
"title": { "en": "Full Stack Developer", "fr": "Développeur Full Stack" },
"start": "2023-02"
```

Si une traduction manque, la page affiche l'anglais. Une traduction ne doit rien ajouter ni
retirer au contenu.

| Bloc | Contenu |
|------|---------|
| `meta` | `siteUrl` (adresse publique du site, pour les URL absolues), `updatedOn`, `source`, `shareImage?` (image des aperçus de partage LinkedIn, X…, idéalement 1200 × 630 : `src`, `alt`, `width`, `height` ; à défaut, la photo du profil) |
| `profile` | `name` (obligatoire), `title`, `location`, `summary` (texte ou liste de paragraphes), `pdfSummary?` (version courte de « Qui suis-je », utilisée seulement dans les PDF), `strengths[]`, `photo` |
| `strengths[]` | tuiles « points forts » : `label`, puis `title`, `steps[]` ou `logo`, `detail?`, `color` (`gradient`, `active`, `warm` ou `accent`) |
| `contact` | `email`, `phone`, `linkedin`, `github`, `instagram`, `tiktok` (URL en `https://`) |
| `experiences[]` | `employer`, `location?`, `positions[]` |
| `positions[]` | `title`, `type` (`employee`, `mission` ou `internship`), `start` (`AAAA-MM`), `end` (`AAAA-MM` ou `null` = « aujourd'hui »), `location?`, `description?`, `via?` (employeur pour le compte duquel une mission a été réalisée, affiché « Mission pour … »), `highlights[]?` (réalisations chiffrées, affichées en « Résultats clés »), `missions[]` |
| `education[]` | `school`, `degree`, `field`, `start`, `end` (`AAAA`) |
| `skills[]` | `category`, `items[]` |
| `hobbies[]` | centres d'intérêt `{ label, icon }` (`label` bilingue, `icon` : clé de `js/icons.js`), affichés seulement dans les PDF |
| `languages[]` | `language`, `level` |
| `pdf` | `file`, `downloadName`, `generatedOn` |

- **Ordre** : les expériences et formations sont triées automatiquement (plus récent en premier) ;
  l'ordre dans le fichier n'a pas d'importance.
- **Valeurs calculées** : années d'expérience, nombre d'entreprises et de langues, durées et
  barres de la frise sont calculés à partir des dates : rien à saisir.
- **Information manquante** : remplacez n'importe quelle valeur texte par
  `{ "toClarify": "explication" }`. Le site affiche alors un libellé discret « … à préciser »
  dont l'explication s'ouvre au survol, au focus ou au toucher.
  Pour compléter une information, remplacez simplement cet objet par le texte définitif.
- **Photo** : déposez une image optimisée (WebP ou JPEG, ~256 × 256 px, < 30 Ko) dans
  `assets/img/`, puis renseignez :

  ```json
  "photo": { "src": "assets/img/photo.webp", "alt": "Portrait de Ramzi Bougdar", "width": 256, "height": 256 }
  ```

- **E-mail et téléphone** : `contact.email` et `contact.phone`. Sur le site, ce sont des liens directs
  « Envoyer un e-mail » et « Appeler » dont l'adresse n'est écrite qu'au survol, au focus ou au
  toucher (ni lus par les robots qui parcourent la page, ni indexés). Ils sont imprimés en clair et figurent dans le PDF. Ils restent
  toutefois lisibles dans le fichier `data/cv.js` lui-même. `data/private.js` (non versionné) ne sert
  plus que si `contact.phone` est vide.
- **Réseaux** : `contact.linkedin`, `github`, `instagram`, `tiktok` (URL en `https://`), avec pictogramme.

## Régénérer le PDF

Le PDF téléchargeable reprend l'identité du site (polices Unbounded et Manrope, couleurs, tuiles,
timeline) grâce à `css/pdf.css`, active uniquement en mode `?pdf`, et tient en 3 pages A4.
L'impression faite par un visiteur (Ctrl+P) garde la mise en page sobre noir sur blanc de
`css/print.css`.

Le bouton « Télécharger le CV » pointe vers le PDF de la langue de la page
(`assets/CV-Ramzi-Bougdar-en.pdf` ou `-fr.pdf`, voir `pdf.file` dans `data/cv.js`). Chaque fichier est
produit en imprimant la page elle-même (feuille `css/print.css`) en mode `?pdf`, le seul mode où
le téléphone est ajouté.

1. Créez (une seule fois) `data/private.js`, qui n'est pas versionné :

   ```js
   window.CV_PRIVATE = { "phone": "+33 6 00 00 00 00" };
   ```

2. Générez les deux PDF (macOS), depuis la racine du projet :

   ```bash
   for l in en fr; do
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
       --no-pdf-header-footer --virtual-time-budget=5000 --window-size=794,1123 \
       --print-to-pdf=assets/CV-Ramzi-Bougdar-$l.pdf "file://$PWD/$l/index.html?pdf"
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
       --no-pdf-header-footer --virtual-time-budget=5000 --window-size=794,1123 \
       --print-to-pdf=assets/CV-Ramzi-Bougdar-ATS-$l.pdf "file://$PWD/$l/index.html?ats"
   done
   ```

   `CV-Ramzi-Bougdar-ATS-*.pdf` est la version sobre pour les logiciels de recrutement (ATS) :
   une colonne, noir sur blanc, toutes les missions (mode `?ats`, `js/pdf.js` et `css/ats.css`).

   `--window-size=794,1123` (largeur A4) sert à ranger les centres d'intérêt pour que chaque ligne soit pleine.

   Variante manuelle : ouvrez `en/index.html?pdf` (puis `fr/index.html?pdf`) dans Chrome, faites Imprimer → « Enregistrer au
   format PDF », marges par défaut, en-têtes et pieds de page désactivés.
3. Mettez à jour `pdf.generatedOn` dans `data/cv.js`.

Si le fichier PDF est absent, le bouton devient automatiquement « Imprimer le CV ».

## Déployer sur GitHub Pages

Aucune compilation : le dépôt est publié tel quel.

1. Créez sur GitHub un dépôt nommé exactement **`ramzibougdar.github.io`** : le site sera publié à
   la racine, `https://ramzibougdar.github.io/`, l'adresse déclarée dans `meta.siteUrl` de
   `data/cv.js` (canonical, hreflang, Open Graph, JSON-LD, sitemap, llms.txt et `robots.txt`
   l'utilisent). Pour une autre adresse, changez `meta.siteUrl` et la ligne `Sitemap:` de
   `robots.txt`, puis relancez `node scripts/generate-metadata.js --write`.
2. Depuis la racine du projet :

   ```bash
   git remote add origin https://github.com/ramzibougdar/ramzibougdar.github.io.git
   git push -u origin main
   ```

   Vérifiez que `data/private.js` n'apparaît **pas** dans `git status` (il est dans `.gitignore`).
3. Sur GitHub : **Settings → Pages → Build and deployment → Source : Deploy from a branch**,
   branche `main`, dossier `/ (root)`, puis **Save**.
4. Le site est en ligne après une ou deux minutes : `https://ramzibougdar.github.io/` oriente vers
   `…/en/` ou `…/fr/`. Suivez ensuite la section « GEO » ci-dessous (Search Console, Bing).

Le fichier `.nojekyll` indique à GitHub Pages de servir les fichiers sans traitement Jekyll.
Tous les chemins sont relatifs : le site fonctionne aussi bien à la racine d'un domaine que dans
un sous-dossier.

Pour mettre à jour le site : modifiez `data/cv.js`, lancez
`node scripts/generate-metadata.js --write`, régénérez les deux PDF, puis
`git commit -am "Mise à jour du CV" && git push`.

## Pré-rendu, données structurées et métadonnées

Le CV est construit par `js/main.js`, mais beaucoup de robots (en particulier ceux des assistants
IA) n'exécutent pas JavaScript. Le script `scripts/generate-metadata.js` écrit donc dans les
fichiers, à partir de `data/cv.js` :

- **le CV pré-rendu** dans les conteneurs `data-render` de `en/index.html` et `fr/index.html` :
  Chrome sans interface exécute le vrai `js/main.js` (mode `?prerender`) et le script recopie le
  résultat, sans e-mail ni téléphone ni icônes. Au chargement, `js/main.js` le remplace par le
  même rendu, avec icônes et animations. Sans JavaScript, le CV est donc entièrement lisible ;
- **les balises de tête** : `canonical`, `hreflang` (en, fr, x-default), Open Graph et carte
  Twitter, avec l'adresse `meta.siteUrl` ;
- **les données structurées** schema.org (`ProfilePage` / `Person`) aux URL absolues ;
- **`sitemap.xml`** et les **`llms.txt`** (voir plus bas).

C'est un outil de maintenance, pas une étape de build : le site se déploie tel quel. Il a besoin
de Node et de Google Chrome (variable `CHROME=/chemin/vers/chrome` si Chrome n'est pas à
l'emplacement macOS habituel). **Après chaque modification de `data/cv.js`** :

```bash
node scripts/generate-metadata.js --write   # réécrit pages, sitemap et llms.txt
node scripts/generate-metadata.js           # vérifie : « up to date », sinon code d'erreur 1
```

Le pré-rendu contient les durées calculées (« 3 ans 9 mois ») : relancez le script de temps en
temps (par exemple chaque mois) pour qu'elles restent exactes pour les robots ; les visiteurs
voient toujours les valeurs du jour.

## robots.txt et llms.txt

- `robots.txt` (racine) autorise l'exploration de tout le CV, par les moteurs de recherche comme
  par les assistants IA, et demande de ne pas indexer les dossiers internes (`specs/`,
  `scripts/`…). Il ne protège aucun fichier : tout ce qui est publié reste accessible par son
  adresse. Il nomme les robots d'IA (GPTBot, ClaudeBot, PerplexityBot…) pour pouvoir les
  autoriser ou bloquer un par un, et indique `sitemap.xml`.
- `llms.txt` (anglais, racine) et `fr/llms.txt` (français) présentent le CV aux assistants IA
  selon le format <https://llmstxt.org> : titre, résumé, faits clés, parcours, formation,
  compétences, langues, puis liens vers les pages, le PDF et les profils. Ils sont générés par
  `scripts/generate-metadata.js`, sans e-mail ni téléphone : ne les modifiez pas à la main.

## GEO : visibilité dans les assistants IA

Ce que le site fait déjà : CV lisible sans JavaScript (pré-rendu), `llms.txt` en deux langues,
données structurées `Person`, robots d'IA autorisés, `sitemap.xml`, `hreflang` et Open Graph.

**À faire après la mise en ligne (une seule fois)**

1. **Google Search Console** (<https://search.google.com/search-console>) : ajoutez la propriété
   `https://ramzibougdar.github.io/`, validez-la (balise `meta` ou fichier HTML fourni par Google,
   à déposer à la racine) et soumettez `sitemap.xml`. Testez `en/` et `fr/` avec le test des
   résultats enrichis.
2. **Bing Webmaster Tools** (<https://www.bing.com/webmasters>) : importez le site depuis la
   Search Console et soumettez `sitemap.xml`. La recherche de ChatGPT et Copilot s'appuie sur
   l'index de Bing.
3. **Aperçus de partage** : collez l'adresse dans l'inspecteur de LinkedIn
   (<https://www.linkedin.com/post-inspector/>) pour vérifier la carte (titre, description, photo).

**Cohérence de votre identité hors du site** (les assistants IA recoupent les sources)

- LinkedIn : même titre que le site, ville « Antibes », lien vers `https://ramzibougdar.github.io/`
  dans la section Coordonnées et dans « Sélection ».
- GitHub : créez le dépôt `ramzibougdar/ramzibougdar` avec un `README.md` de profil (un modèle vous
  a été fourni), et renseignez le lien du site dans le profil.
- Instagram et TikTok : lien du site dans la bio.

**Réalisations chiffrées** : ajoutez-les dans `highlights` du poste concerné (`data/cv.js`, en
anglais et en français), puis relancez le script. Les assistants IA reprennent volontiers les
faits précis ; n'indiquez que des chiffres vérifiables.

**Suivi** (par exemple chaque mois) : posez les mêmes questions à ChatGPT, Claude, Perplexity et
Gemini, et notez si vous êtes cité, avec quelles informations et quelles sources :

- « Qui est Ramzi Bougdar ? » / "Who is Ramzi Bougdar?"
- « Développeur PrestaShop et IA à Antibes » / "AI and PrestaShop developer in Antibes"
- « Expert Shopify B2B sur la Côte d'Azur » / "Shopify B2B expert on the French Riviera"

Si une réponse est fausse ou datée, corrigez la source (site, LinkedIn) plutôt que la réponse.

## Contrôles qualité avant mise en ligne

- Ouverture de `en/index.html` et `fr/index.html` sans message d'erreur (syntaxe de `data/cv.js` valide).
- Validateur W3C (<https://validator.w3.org/>) sur `index.html`, `en/index.html` et `fr/index.html`.
- Lighthouse (onglet de Chrome DevTools) : Performance, Accessibilité et Bonnes pratiques ≥ 90.
- Parcours complet au clavier (Tab, Entrée, Échap), aperçu d'impression, affichage à 320 px de large.
- Les trois modes : normal, **mouvement réduit** (DevTools → Rendering → *prefers-reduced-motion:
  reduce*) et **sans GSAP** (DevTools → Network → bloquer `cdnjs.cloudflare.com`) : tout le
  contenu doit rester visible.

Paramètres d'URL utiles : `?final` (animations à l'état final), `?theme=dark` ou `?theme=light`
(thème forcé, non mémorisé), `?pdf` (génération du PDF).

Scénarios détaillés : `specs/002-refonte-ui-ux/quickstart.md`.
