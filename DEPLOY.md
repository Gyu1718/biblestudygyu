# Genesis 1–50 static shelf deploy bundle

This bundle is prepared for `Gyu1718/biblestudygyu`.

Included:
- `ot/genesis/ch01.html` … `ch50.html`
- `ot/genesis/index.html`
- `ot/genesis/overview.html`
- `ot/genesis/genesis-shelf.js`

The repository already provides these shared assets and they are referenced by the pages:
- `ot/genesis/genesis-suite.css`
- `ot/genesis/genesis-suite.js`
- `assets/theme.css`
- `assets/app.css`
- `assets/css/bible-reader.css`
- `assets/app.js`
- `assets/js/bible-reader.js`
- `assets/js/commentator-chips.js`

Deployment from a local checkout:

```bash
unzip genesis-1-50-static-ready.zip -d /tmp/genesis-ready
cp -R /tmp/genesis-ready/ot/genesis/* ot/genesis/
git add ot/genesis
git commit -m "Publish Genesis 1-50 study shelf"
git push origin main
```

After deployment, update the root README/catalog progress from 25/50 to 50/50 only after verifying `ot/genesis/ch50.html` is reachable.
