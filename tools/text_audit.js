/* Text-size audit: run inside a page (Playwright evaluate). Reports every visible text run inside the
   scene canvas whose font size is below the minimum, in CANVAS pixels (the 1920×1080 design size).
   Usage from Playwright:  await page.evaluate(src + '; textAudit(24)')  → [{ px, text, cls }] */
function textAudit(min) {
    var out = [], seen = new Set();
    var roots = document.querySelectorAll('.dks-fit > *');
    roots.forEach(function (root) {
        var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        var n;
        while ((n = w.nextNode())) {
            var t = n.textContent.trim();
            if (!t) continue;
            var el = n.parentElement;
            if (!el || seen.has(el)) continue;
            seen.add(el);
            if (el.closest('.dks-sr, [hidden], svg')) continue;
            var cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none') continue;
            var o = 1, p = el;
            while (p && p !== document.body) { var s = getComputedStyle(p); if (s.display === 'none') { o = 0; break; } o *= +s.opacity; p = p.parentElement; }
            if (o < 0.05) continue;
            var r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
            var px = parseFloat(cs.fontSize);
            if (px < min) out.push({ px: Math.round(px), text: t.slice(0, 50), cls: el.className && el.className.baseVal === undefined ? el.className : '' });
        }
    });
    return out;
}
