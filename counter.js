const counters = document.querySelectorAll('.metric h3');

counters.forEach(counter => {
  const target = +counter.getAttribute('data-target');
  let count = 0;
  const duration = 2000; // total animation time
  const stepTime = Math.max(Math.floor(duration / target), 10);

  const increment = () => {
    count++;
    counter.innerText = count;
    if(count < target) {
      setTimeout(increment, stepTime);
    } else {
      counter.innerText = target;
    }
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        increment();
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.6 });

  observer.observe(counter);
});
