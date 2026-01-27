// Animated Counters
// Live counters: compute totals from portfolio cards and animate values
function animateValue(el, start, end, duration = 800){
    if (!el) return;
    const range = end - start;
    if (range === 0){ el.innerText = end; return; }
    const startTime = performance.now();
    function step(now){
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(start + range * eased);
        el.innerText = current;
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

const counters = { total: 0, completed: 0, inprogress: 0 };

function computeAndUpdateCounts(){
    const cards = document.querySelectorAll('.portfolio-card');
    const total = cards.length;
    let completed = 0, inprogress = 0;
    cards.forEach(c => {
        const s = (c.getAttribute('data-status') || '').toLowerCase();
        if (s === 'completed') completed++;
        else if (s === 'inprogress' || s === 'in-progress' || s === 'in progress') inprogress++;
    });

    // animate from previous values
    const elTotal = document.getElementById('total');
    const elCompleted = document.getElementById('completed');
    const elInprogress = document.getElementById('inprogress');

    animateValue(elTotal, counters.total, total);
    animateValue(elCompleted, counters.completed, completed);
    animateValue(elInprogress, counters.inprogress, inprogress);

    counters.total = total;
    counters.completed = completed;
    counters.inprogress = inprogress;
}

document.addEventListener('DOMContentLoaded', ()=>{
    // initial compute
    computeAndUpdateCounts();

    // observe changes to portfolio grid to auto-update counts
    const grid = document.querySelector('.portfolio-grid');
    if (grid){
        const mo = new MutationObserver(()=>{ computeAndUpdateCounts(); });
        mo.observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-status'] });
    }
});
