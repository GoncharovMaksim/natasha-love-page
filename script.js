(function () {
  const TOTAL_SECONDS = 5;
  let remainingSeconds = TOTAL_SECONDS;
  let timerInterval = null;

  const timerView = document.getElementById('timer-view');
  const revealView = document.getElementById('reveal-view');
  const countdownNumber = document.getElementById('countdown-number');
  const ringProgress = document.getElementById('ring-progress');
  const replayBtn = document.getElementById('replay-btn');
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  const circumference = 2 * Math.PI * 96; // radius 96 -> ~603.185

  let particles = [];
  let animationFrameId = null;
  let ambientActive = false;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function createParticles() {
    particles = [];
    const count = window.innerWidth < 600 ? 25 : 45;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.4 + 0.2,
        color: Math.random() > 0.4 ? 'rgba(251, 113, 133,' : 'rgba(254, 205, 211,'
      });
    }
  }

  function renderAmbient() {
    if (!ctx || !ambientActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y -= p.speedY;
      p.x += Math.sin(p.angle) * 0.5 + p.speedX;
      p.angle += p.rotationSpeed;

      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = `${p.color} ${p.opacity})`;
      ctx.beginPath();
      // Draw small soft petal/oval shape
      ctx.ellipse(0, 0, p.size, p.size * 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(renderAmbient);
  }

  function startAmbient() {
    if (ambientActive) return;
    ambientActive = true;
    createParticles();
    renderAmbient();
  }

  function stopAmbient() {
    ambientActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function setProgress(current) {
    const offset = circumference - (current / TOTAL_SECONDS) * circumference;
    ringProgress.style.strokeDashoffset = offset;
  }

  function startCountdown() {
    remainingSeconds = TOTAL_SECONDS;
    countdownNumber.textContent = remainingSeconds;
    setProgress(TOTAL_SECONDS);

    timerView.classList.remove('hidden');
    revealView.classList.add('hidden');
    stopAmbient();

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds > 0) {
        countdownNumber.textContent = remainingSeconds;
        countdownNumber.style.animation = 'none';
        void countdownNumber.offsetWidth;
        countdownNumber.style.animation = 'numPop 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        setProgress(remainingSeconds);
      } else {
        clearInterval(timerInterval);
        setProgress(0);
        countdownNumber.textContent = '0';
        setTimeout(revealFlower, 400);
      }
    }, 1000);
  }

  function revealFlower() {
    timerView.classList.add('hidden');

    // Re-trigger SVG animations by cloning flower container or resetting innerHTML
    const currentContainer = revealView.querySelector('.flower-container');
    if (currentContainer) {
      const clone = currentContainer.cloneNode(true);
      currentContainer.parentNode.replaceChild(clone, currentContainer);
    }

    revealView.classList.remove('hidden');
    startAmbient();
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      startCountdown();
    });
  }

  // Initialize
  startCountdown();
})();
