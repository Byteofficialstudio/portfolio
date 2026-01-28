Image optimization
==================

This project includes `scripts/optimize-images.js` to generate responsive image variants (WebP and JPEG) into `images/variants/`.

Steps to use:

1. From project root, install `sharp`:

```powershell
npm install sharp
```

2. Run the optimizer:

```powershell
node scripts/optimize-images.js
```

3. The script writes files like `images/variants/roblox-gun-800.webp` and `roblox-gun-800.jpg`. The HTML uses `picture`/`srcset` to serve the best size.

Notes:
- Adjust `files` and `sizes` arrays in `scripts/optimize-images.js` for more images or different sizes.
- For CI or faster builds, consider pre-generating and committing `images/variants/`.

- Workflow artifact: a GitHub Actions workflow (`.github/workflows/optimize-images-artifacts.yml`) is included. It runs the optimizer and uploads `images/variants/` as a downloadable artifact after the job finishes. Use the Actions UI or push to `main`/`master` to trigger.

AVIF support:
- The optimizer now generates AVIF variants alongside WebP and JPEG. `index.html` `picture` elements include AVIF first, then WebP, then JPEG fallback for best compression and compatibility.
