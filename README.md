# EnerMAKER Lab · Jin-Kyeom Kim

Public academic homepage for Prof. Jin-Kyeom Kim (김진겸),
Department of Marine New Materials Convergence Engineering, KMOU.

Live: https://ttthkim-hue.github.io/

## Architecture

Static SPA with hash routes (`#/`, `#/research`, `#/work`, `#/pi`, `#/join`, `#/news`).
Visual language follows [al-folio](https://github.com/alshedivat/al-folio) and Academic Pages:
about sidebar + news + selected publications on Home; bibliography is its own page.

## Plugins (GitHub Pages compatible)

Jekyll gems such as `jekyll-scholar` need a `gh-pages` build branch and a Settings change.
This repo already deploys the `main` tree via `.github/workflows/pages.yml`, so plugins are loaded as CDNs:

- Bootstrap 5.3
- Bootstrap Icons
- Academicons
- Source Sans 3 / Source Serif 4
- Client-side bibliography from `content.json` + `papers.bib`

## Sources (public record only)

- KMOU faculty page teaSn=5782
- Google Scholar k4WJ_DMAAAAJ
- ORCID 0000-0003-0824-2373
- Crossref DOIs
- UW-Madison Engineering news 2026-08-19
