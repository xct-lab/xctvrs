# Cloudflare Pages deployment

This repository belongs to the existing Cloudflare Pages project `xctvrs`, serving https://xctvrs.ca/.

The GitHub Actions workflow is manual only. Committing or merging files does not deploy the site.
No deployment has been performed as part of this setup.

## Configuration

Add these repository secrets under Settings > Secrets and variables > Actions:

- `CLOUDFLARE_ACCOUNT_ID`: the account containing the xctvrs project.
- `CLOUDFLARE_API_TOKEN`: a Cloudflare token with Account > Cloudflare Pages > Edit permission, restricted to that account.

Save the token directly in GitHub secrets, not in repository files or chat.
Local Wrangler browser login does not authenticate GitHub Actions.

After the workflow is merged into main, review the site content and confirm the Cloudflare production branch before using Actions > Deploy XCTVRS to Cloudflare Pages > Run workflow on main.
Running it uploads the repository's existing homepage, petition and resources pages to the main branch of the xctvrs Pages project.
The current repository links to /contact/ but does not contain that page; resolve that before publishing if the link is intended to work.

## Content boundaries

Only index.html, petition/ and resources/ are copied into the deployment folder.
If new assets or pages are added, add their explicit paths to the workflow.
Repository metadata, deployment documentation, private records and internal draft handoffs are not uploaded.
No content from the separate DUN360 workspace was copied into this repository.

This workflow preserves the existing Direct Upload Pages project. Cloudflare's dashboard will not show a native Git provider connection; GitHub Actions performs the upload.
See [Cloudflare's CI guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).
