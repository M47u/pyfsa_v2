import { chromium } from 'playwright';

const BASE = 'http://localhost/pyfsasoftware_orig/';
const OUT  = 'C:/xampp/htdocs/pyfsasoftware_orig/screenshots';

const browser = await chromium.launch();

async function forceAOS(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-aos]').forEach(el => {
      el.classList.add('aos-animate');
    });
  });
  await page.waitForTimeout(200);
}

async function scrollTo(page, selector, offset = 60) {
  await page.evaluate(({ sel, off }) => {
    const el = document.querySelector(sel);
    if (el) window.scrollTo(0, el.offsetTop - off);
  }, { sel: selector, off: offset });
  await forceAOS(page);
  await page.waitForTimeout(400);
}

// Desktop 1280px
const pg = await browser.newPage();
await pg.setViewportSize({ width: 1280, height: 900 });
await pg.goto(BASE, { waitUntil: 'networkidle' });
await pg.waitForTimeout(800);
await forceAOS(pg);
await pg.screenshot({ path: `${OUT}/desktop-hero.png` });

await scrollTo(pg, '#features');
await pg.screenshot({ path: `${OUT}/desktop-services.png` });

await scrollTo(pg, '#team');
await pg.screenshot({ path: `${OUT}/desktop-team.png` });

await scrollTo(pg, '#testimonials');
await pg.screenshot({ path: `${OUT}/desktop-testimonials.png` });

await pg.close();
console.log('desktop done');

// Mobile 375px
const mob = await browser.newPage();
await mob.setViewportSize({ width: 375, height: 812 });
await mob.goto(BASE, { waitUntil: 'networkidle' });
await mob.waitForTimeout(800);
await forceAOS(mob);
await mob.screenshot({ path: `${OUT}/mobile-hero.png` });

await scrollTo(mob, '#features');
await mob.screenshot({ path: `${OUT}/mobile-services.png` });

await scrollTo(mob, '#team');
await mob.screenshot({ path: `${OUT}/mobile-team.png` });

await scrollTo(mob, '#contact', 0);
await mob.screenshot({ path: `${OUT}/mobile-contact.png` });

await mob.close();
console.log('mobile done');

await browser.close();
