# Login assets

- `public/logo.png`: existing Smart Tracker Telematics production logo. SHA-256 matches the public `https://www.smarttracker.cloud/logo.png` asset checked on 11 November 2026. The shared wordmark preserves the production name and Telematics descriptor.
- `public/logo.webp`: the same production logo resized to 256 × 256 and compressed at WebP quality 88 (12,814 bytes versus the 201,529-byte PNG). Shared sidebar/login branding loads this local file eagerly without an image-optimization round trip.
- `public/fonts/InterVariable.woff2`: Inter variable font from the [maintainer’s repository](https://github.com/rsms/inter), distributed under the SIL Open Font License in `public/fonts/Inter-LICENSE.txt`. Locally loaded through `next/font/local`; no Google Fonts connection is needed for builds or page loads.
- `public/favicon.png`: 32px derivative of the same production logo for browser tabs.
- `public/login-wallpaper.webp`: “Delivery truck good distribution services” by rawpixel.com, sourced from [Freepik](https://www.freepik.com/free-photo/delivery-truck-good-distribution-services_17433801.htm). A visible photographer/source credit links to this page. The public 1600×1067 JPEG is converted with the installed Sharp package to WebP, quality 78, approximately 92 KiB. No original photo is bundled in the public application.
