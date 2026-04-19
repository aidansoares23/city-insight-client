/**
 * Static photo manifest for city gallery sections.
 *
 * To add photos for a city:
 *   1. Drop image files into /public/city-photos/{slug}/  (e.g. 1.jpg, 2.jpg …)
 *   2. Add an entry below mapping the slug to an array of public paths.
 *
 * Example:
 *   "redding-ca": [
 *     "/city-photos/redding-ca/1.jpg",
 *     "/city-photos/redding-ca/2.jpg",
 *   ],
 */
const CITY_PHOTOS = {
  "santa-barbara-ca": [
    "/city-photos/santa-barbara-ca/gerson-repreza-88_Wt6-3PA8-unsplash.jpg",
    "/city-photos/santa-barbara-ca/sean-mullowney-3BgUBmDKwiI-unsplash.jpg",
    "/city-photos/santa-barbara-ca/clay-banks-b6Bs19onFtY-unsplash.jpg",
    "/city-photos/santa-barbara-ca/harrison-lin-2OajIB8ustA-unsplash.jpg",
    "/city-photos/santa-barbara-ca/land-o-lakes-inc-iVINr8-ZFmY-unsplash.jpg",
  ],
};

/**
 * Returns the array of photo paths for a given city slug,
 * or an empty array if none have been configured.
 * @param {string} slug
 * @returns {string[]}
 */
export function getCityPhotos(slug) {
  return CITY_PHOTOS[slug] ?? [];
}
