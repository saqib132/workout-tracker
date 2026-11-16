const CACHE_NAME = "workout-tracker-v4";
const EXERCISE_IMAGE_KEYS = [
  "bench_press", "fly", "pushup", "pulldown", "row", "deadlift", "pullup",
  "overhead_press", "lateral_raise", "face_pull", "curl", "triceps", "dip",
  "squat", "leg_press", "leg_extension", "leg_curl", "lunge", "calf_raise",
  "hip_thrust", "plank", "crunch", "hanging_raise", "twist"
];
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./pictograms.js",
  "./exercise-info.js",
  "./exercise-photos.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  ...EXERCISE_IMAGE_KEYS.map((k) => `./images/${k}.jpg`)
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (event.request.method === "GET" && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
