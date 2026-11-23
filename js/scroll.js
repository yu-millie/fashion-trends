/* ══ scroll: reveal-on-scroll, nav highlight, solid nav after the hero ═════ */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(n => io.observe(n));

const navLinks = [...document.querySelectorAll("#links a")];
const sections = navLinks.map(a => document.querySelector(a.getAttribute("href")));
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  let i = sections.indexOf(e.target);
  if (i < 0 && e.target.dataset.nav) i = sections.indexOf(document.querySelector(e.target.dataset.nav));   // a section that continues another one
  navLinks.forEach((a, j) => a.classList.toggle("on", j === i));
}), { threshold: 0, rootMargin: "-45% 0px -50% 0px" });
sections.forEach(s => s && spy.observe(s));
document.querySelectorAll("[data-nav]").forEach(s => spy.observe(s));

const nav = document.getElementById("nav");
const cover = document.getElementById("cover");
const navSolid = () => nav.classList.toggle("solid", scrollY > cover.offsetHeight - 80);
addEventListener("scroll", navSolid, { passive: true });
navSolid();
