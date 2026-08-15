# natalieandjordi.com — wedding website

Single-page static site (everything lives in `index.html`) for Natalie and
Jordi's wedding, Oct 15–18 2026. Deployed via GitHub Pages from `main` with
the custom domain `natalieandjordi.com` (the `CNAME` file — never remove it
from `main`). `Code.gs` is the Google Apps Script backing the RSVP form.

## Preview / staging workflow

Production must never be affected by work in progress. Instead:

- **Staging site:** https://joadoumie.github.io/natalieandjordi-staging/
  served from the separate repo `joadoumie/natalieandjordi-staging`. That repo
  is a **disposable mirror** — never edit or clone it; every deploy
  force-pushes over it.
- **To deploy a preview:** commit changes on a feature branch, then run
  `./deploy-preview.sh`. It pushes the current branch (with `CNAME` stripped)
  to the staging repo; live in ~1 minute. Natalie reviews at the staging URL.
- **To ship:** once approved, merge the PR into `main` as usual — production
  updates automatically. Nothing to sync back from staging.

## Current work (as of Aug 15, 2026)

- **PR #27** (`add-weekend-schedule` branch):
  https://github.com/joadoumie/natalieandjordi/pull/27 — fills in the
  weekend schedule (per-day accordion) and packing list placeholders on the
  details page. Deployed to staging; awaiting Natalie's feedback.
- Open question flagged in the PR: schedule now says arrival "anytime after
  5PM" Thursday, but older text said 6PM check-in — confirm which is right.
- Iterate on this branch, redeploy with `./deploy-preview.sh` after each
  round of feedback, and merge when Natalie signs off.
- Keep this section current as work progresses (and prune it once merged).
