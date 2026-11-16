// Real reference photos (free-licensed, Pexels) per movement pattern, used instead of the
// line-art pictograms wherever possible. Falls back to pictograms.js for anything missing.
const EXERCISE_PHOTOS = {
  bench_press: "images/bench_press.jpg",
  fly: "images/fly.jpg",
  pushup: "images/pushup.jpg",
  pulldown: "images/pulldown.jpg",
  row: "images/row.jpg",
  deadlift: "images/deadlift.jpg",
  pullup: "images/pullup.jpg",
  overhead_press: "images/overhead_press.jpg",
  lateral_raise: "images/lateral_raise.jpg",
  face_pull: "images/face_pull.jpg",
  curl: "images/curl.jpg",
  triceps: "images/triceps.jpg",
  dip: "images/dip.jpg",
  squat: "images/squat.jpg",
  leg_press: "images/leg_press.jpg",
  leg_extension: "images/leg_extension.jpg",
  leg_curl: "images/leg_curl.jpg",
  lunge: "images/lunge.jpg",
  calf_raise: "images/calf_raise.jpg",
  hip_thrust: "images/hip_thrust.jpg",
  plank: "images/plank.jpg",
  crunch: "images/crunch.jpg",
  hanging_raise: "images/hanging_raise.jpg",
  twist: "images/twist.jpg",
};

// Returns an <img> or inline-SVG markup string for the exercise's thumbnail/reference image.
function exerciseThumbHtml(ex) {
  if (ex.photo) return `<img src="${ex.photo}" />`;
  const pattern = (EXERCISE_INFO[ex.name] || {}).pattern;
  const photoPath = EXERCISE_PHOTOS[pattern];
  if (photoPath) return `<img src="${photoPath}" loading="lazy" />`;
  return PICTOGRAMS[pattern] || PICTOGRAMS.generic;
}
