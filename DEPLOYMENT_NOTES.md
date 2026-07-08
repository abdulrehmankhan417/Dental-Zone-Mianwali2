# Dental Zone Mianwali — v2 Deployment Notes

This is the upgraded, real-content version of the site. Below is what changed, what's still a placeholder, and how to deploy it.

## Files

| File | Purpose |
|---|---|
| `index.html` | The site — semantic HTML, full SEO + schema, real booking flow |
| `styles.css` | All styling |
| `script.js` | All interactivity: 3D tooth, gallery lightbox, reviews carousel, FAQ accordion, language switch, doctor auto-assignment, Friday blocking, WhatsApp booking |
| `images/` | Your real clinic photos + Dr. Hanif's photo + branded placeholder avatars for the other 3 doctors |
| `favicon.svg/.ico`, `apple-touch-icon.png`, `og-image.jpg` | Icons and social share image |
| `robots.txt`, `sitemap.xml` | Search engine crawling files |
| `Code.gs` | Optional Google Apps Script backend (see note below — not required for the current booking flow) |

## What's real vs. placeholder — please read before launch

- **Dr. Hanif Niazi's photo and bio** are real (from your uploads and the facts you gave me). Nothing about his qualifications was invented — only publicly-stated/user-provided facts are used.
- **Dr. Saad Abdullah, Dr. Arshad Malik, and Dr. Tehseen Khatoon** currently have branded initials placeholders instead of real photos, since none were uploaded for them yet. Send me their photos and I'll swap them in with the same professional crop treatment used for Dr. Hanif. I have **not** invented any qualifications, degrees, or experience for these three — their cards only state the role, timing, and services you gave me.
- **Before/after images** on the services grid are illustrative SVG diagrams (a simple tooth icon transitioning from a problem state to a healthy state), not real clinical photos. This was a deliberate choice: stock "before/after" photos claiming clinical results on a real medical business's site carry real legal/ethical risk if they aren't actually your patients' results, and hotlinking random web images (as you also asked me to avoid) is fragile and licensing-uncertain. These are clearly generic/illustrative, not photographic — happy to swap in real patient before/after photos (with consent) whenever you have them.
- **Patient reviews** are clearly labeled placeholders. I could not verify any public Google reviews for Dental Zone Mianwali to pull from, so invented "real-sounding" reviews were deliberately avoided — the section says so directly on the page. Replace with real reviews as they come in.
- **Urdu translations** were written by me (AI-assisted) covering the full site — nav, hero, services, doctors, timings, FAQ, reviews, footer, and the booking form. I'd still recommend a native Urdu speaker (e.g., your front desk staff) skims it once before launch, particularly the medical terminology, which I intentionally left in English/Latin script in a few places (e.g., treatment names in service lists) since that's how they're commonly used in Pakistani dental practices.

## What's new in this version

- **Real images** wired in with `loading="lazy"` (except Dr. Hanif's hero-priority photo, which loads eager for speed) and consistent aspect-ratio cropping — note the source photos you sent were fairly low resolution (~200px wide), so they've been cropped cleanly rather than upscaled (upscaling would blur them further).
- **Four separate doctor profile cards** with exact services, timing, and role per your spec.
- **Services grid** limited to exactly the services you listed, each tagged with the doctor who performs it, plus the Cosmetic Dentistry card listing its six sub-treatments.
- **Clinic gallery** with a masonry-style grid and a keyboard-navigable lightbox (arrow keys + Escape work).
- **Appointment form** reduced to Name, Phone, Service, Date, Time. Selecting a service automatically shows the assigned doctor above the submit button — there's no manual doctor picker.
- **Friday blocking**: selecting a Friday date shows the exact warning text you specified and blocks submission both on date-change and on submit.
- **WhatsApp booking**: submitting the form opens `wa.me/923187520272` in a new tab with the exact message format you specified, pre-filled and ready to send.
- **Language switcher** (EN / اردو) in the nav — toggles text site-wide via `data-en`/`data-ur` attributes and switches the whole page to right-to-left with the Noto Nastaliq Urdu web font.
- **Schema markup** expanded: the existing `Dentist`/LocalBusiness schema now has correct hours (Mon–Thu, Sat–Sun 9–3; Friday absent = closed) and all four doctors listed as `employee` entries, plus new `FAQPage`, `BreadcrumbList`, and service `ItemList` schema blocks.

## About the Google Apps Script backend (`Code.gs`)

Your original spec (an earlier round) asked for bookings to be written to a Google Sheet via Apps Script. Your latest spec replaced the booking flow with a simpler WhatsApp-only submission, so the live form now only opens WhatsApp — it does **not** currently also write to a Sheet. `Code.gs` is included in case you still want a written record of every booking (useful for reporting/backup beyond WhatsApp chat history). If you want both, tell me and I'll wire a background `fetch()` call back in alongside the WhatsApp handoff — the current form already collects everything needed (name, phone, service, date, time).

## Deploying

1. Upload every file in this package to your web host, keeping `images/` as a subfolder next to `index.html` (paths are relative: `images/dr-hanif-niazi.jpg`, etc.).
2. Replace the placeholders still marked `REPLACE_...`:
   - `google-site-verification` meta tag → your real Search Console code
   - `G-REPLACE_WITH_YOUR_ID` (×2) → your real GA4 Measurement ID
   - `https://dentalzonemianwali.com/` → your real domain, if different, throughout `index.html`, `sitemap.xml`, and `robots.txt`
3. Submit `sitemap.xml` in Google Search Console once the domain is live.
4. Test the booking form end-to-end on a phone: fill it out, confirm WhatsApp opens with the correct pre-filled message, and confirm a Friday date correctly blocks submission with the right message.
5. Test the language switcher on both desktop and mobile widths to confirm the RTL layout doesn't break anywhere unexpected — flag me if any section looks off in Urdu and I'll fix that specific spot.

## Still to do on your side

- Send the remaining doctor photos (Dr. Saad Abdullah, Dr. Arshad Malik, Dr. Tehseen Khatoon) — for Dr. Tehseen, I'll keep her real photo untouched and only add a decorative background behind it, as you asked.
- Confirm whether you want real before/after clinical photos to eventually replace the illustrative diagrams (with patient consent).
- Send real patient reviews (with permission) to replace the placeholder testimonials.
- Have someone review the Urdu translation before go-live.
