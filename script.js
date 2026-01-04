/* script.js - الكود النهائي (نقاط كثيفة جداً + صوت بالسكرول + ألوان ثابتة) */

/* =========================================
   1. المتغيرات العامة
   ========================================= */
const siteAudio = document.getElementById('siteMusic');
const favAudio = document.getElementById('favMusic');
const toast = document.getElementById('toast');

/* =========================================
   2. محرك القلوب (الخلفية)
   ========================================= */
const initHearts = () => {
    const canvas = document.getElementById('bgCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let hearts = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    class Heart {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 50;
            this.size = Math.random() * 8 + 4; 
            this.speed = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() { this.y -= this.speed; if(this.y < -20) this.reset(); }
        draw() {
            ctx.fillStyle = `rgba(255, 10, 84, ${this.opacity})`;
            ctx.beginPath();
            let topCurveHeight = this.size * 0.3;
            ctx.moveTo(this.x, this.y + topCurveHeight);
            ctx.bezierCurveTo(this.x, this.y, this.x - this.size / 2, this.y, this.x - this.size / 2, this.y + topCurveHeight);
            ctx.bezierCurveTo(this.x - this.size / 2, this.y + (this.size + topCurveHeight) / 2, this.x, this.y + (this.size + topCurveHeight) / 2, this.x, this.y + this.size);
            ctx.bezierCurveTo(this.x, this.y + (this.size + topCurveHeight) / 2, this.x + this.size / 2, this.y + (this.size + topCurveHeight) / 2, this.x + this.size / 2, this.y + topCurveHeight);
            ctx.bezierCurveTo(this.x + this.size / 2, this.y, this.x, this.y, this.x, this.y + topCurveHeight);
            ctx.fill();
        }
    }
    for(let i=0; i<70; i++) hearts.push(new Heart());
    const animate = () => {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        hearts.forEach(h=>{h.update(); h.draw()});
        requestAnimationFrame(animate);
    }
    animate();
};
initHearts();

/* =========================================
   3. التحكم في صفحة الدخول
   ========================================= */
const errorMessages = [
    "ممنوع الدخول طالما ناسية", "يبنتى عيد ميلادك انتى",
    "حاولى تفتكرى طيب", "اكيد انتى مش ريتاج"
];

function checkPass() {
    const input = document.getElementById('passInput');
    const errorDiv = document.getElementById('errorMsg');
    
    if(input && input.value === "23/12") {
        window.location.href = "home.html";
    } else if (input) {
        const randomMsg = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        errorDiv.innerText = randomMsg;
        const box = document.querySelector('.login-card');
        box.classList.remove('shake');
        void box.offsetWidth; 
        box.classList.add('shake');
        input.value = "";
    }
}

/* =========================================
   4. نظام الصوت الذكي
   ========================================= */
if(siteAudio && favAudio) {
    const attemptPlay = () => {
        if(siteAudio.paused && favAudio.paused) {
            siteAudio.volume = 0.5;
            const playPromise = siteAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    removeInteractionListeners();
                }).catch(() => {});
            }
        }
    };

    const interactionEvents = ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'];
    interactionEvents.forEach(evt => {
        document.addEventListener(evt, attemptPlay, { passive: true });
    });

    function removeInteractionListeners() {
        interactionEvents.forEach(evt => {
            document.removeEventListener(evt, attemptPlay);
        });
    }

    window.playFavorite = function() {
        const playBtn = document.querySelector('.play-fav-btn');
        if (favAudio.paused) {
            siteAudio.pause();
            favAudio.currentTime = 0;
            favAudio.play();
            playBtn.innerText = "🎵 إيقاف الأغنية المفضلة"; 
            if(toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 5000); }
        } else {
            favAudio.pause();
            siteAudio.play();
            playBtn.innerText = "🎵 تشغيل أغنيتكِ المفضلة";
        }
    };

    favAudio.addEventListener('ended', () => {
        siteAudio.play();
        const playBtn = document.querySelector('.play-fav-btn');
        if(playBtn) playBtn.innerText = "🎵 تشغيل أغنيتكِ المفضلة";
    });
}

/* =========================================
   5. السلايدر
   ========================================= */
let currentIndex = 0;
let autoSlideTimer = null;

function performMove(direction) {
    const track = document.getElementById('sliderTrack');
    const cards = document.querySelectorAll('.memory-card');
    if(!track || cards.length === 0) return;

    const cardsPerView = window.innerWidth >= 768 ? 3 : 1; 
    const maxIndex = cards.length - cardsPerView;

    currentIndex += direction;

    if (currentIndex < 0) currentIndex = maxIndex; 
    else if (currentIndex > maxIndex) currentIndex = 0;

    const percentage = currentIndex * (100 / cardsPerView);
    track.style.transform = `translateX(${percentage}%)`;
}

function startTimer() {
    if(autoSlideTimer) clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => { performMove(1); }, 3000);
}

window.moveSlide = function(direction) {
    clearInterval(autoSlideTimer);
    performMove(direction);
    startTimer();
};

startTimer();

/* =========================================
   6. المودال (مع إيقاف السلايدر الذكي)
   ========================================= */

window.openMemory = function(imgSrc, text) {
    // 1. إيقاف السلايدر فوراً عند فتح الصورة
    clearInterval(autoSlideTimer);

    const modal = document.getElementById('imgModal');
    const modalImg = document.getElementById('modalImg');
    const modalText = document.getElementById('modalText');
    
    if(modal && modalImg && modalText) {
        modalImg.src = imgSrc;
        modalText.innerText = text;
        modal.classList.add('active');
    }
};

window.closeModal = function() {
    const modal = document.getElementById('imgModal');
    if(modal) modal.classList.remove('active');

    // 2. إعادة تشغيل السلايدر عند إغلاق الصورة
    startTimer();
};

document.querySelectorAll('.shine-effect').forEach(card => {
    card.style.animationDelay = `${Math.random() * 5}s`;
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.5 });
const poem = document.querySelector('.poem-text');
if(poem) observer.observe(poem);


/* =========================================
   7. الألعاب النارية (نسخة الكثافة العالية High Density)
   ========================================= */
let fwCanvas, fwCtx, fwW, fwH, fwCurrent;
let fwDuration = 5000; 
let fwStr = ['LOVE', 'YOU', 'RITAG'];
let fwTriggered = false;
let fwStartTime = null;

const fwColors = { 
    'LOVE': '#a11851ff',
    'YOU': '#ffd700',
    'RITAG': '#a11851ff'
};

function initFireworks() {
    fwCanvas = document.createElement('canvas');
    Object.assign(fwCanvas.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '9999'
    });
    document.body.appendChild(fwCanvas);
    fwCtx = fwCanvas.getContext('2d');
    resizeFw();
}

function resizeFw() {
    fwW = fwCanvas.width = window.innerWidth;
    fwH = fwCanvas.height = window.innerHeight;
}

function makeChar(c) {
    let tmp = document.createElement('canvas');
    let size = tmp.width = tmp.height = fwW < 500 ? 150 : 300;
    let tmpCtx = tmp.getContext('2d');
    // تكبير الخط قليلاً لزيادة المساحة المتاحة للنقاط
    tmpCtx.font = 'bold ' + (fwW < 500 ? 90 : 160) + 'px Arial';
    tmpCtx.fillStyle = 'white';
    tmpCtx.textBaseline = "middle";
    tmpCtx.textAlign = "center";
    tmpCtx.fillText(c, size / 2, size / 2);
    
    let char2 = tmpCtx.getImageData(0, 0, size, size);
    let particles = [];
    
    // --- التعديل هنا: تقليل الخطوة لزيادة الكثافة ---
    // جعلناها 2 بدلاً من 3 لأخذ نقاط أكثر دقة
    for (let y = 0; y < size; y += 2) { 
        for (let x = 0; x < size; x += 2) {
            if (char2.data[(y * size * 4) + (x * 4)] > 128) { 
                particles.push([x - size / 2, y - size / 2]);
            }
        }
    }
    
    let final = [];
    // --- التعديل هنا: زيادة الحد الأقصى للنقاط ---
    // 1000 للموبايل و 2500 للكمبيوتر (كانت 400 و 800)
    let limit = fwW < 500 ? 1000 : 2500;
    
    for(let i=0; i<limit; i++) {
        if(particles.length) {
            let p = particles[Math.floor(Math.random() * particles.length)];
            let jitter = 2; 
            final.push([p[0] + (Math.random()-0.5)*jitter, p[1] + (Math.random()-0.5)*jitter]);
        }
    }
    return final;
}

let fwChars = [];

function renderFw(t) {
    if (!fwStartTime) fwStartTime = t;
    let elapsed = t - fwStartTime;
    let actual = Math.floor(elapsed / fwDuration);

    if (actual >= fwStr.length) {
        fwCtx.clearRect(0, 0, fwW, fwH);
        if (fwCanvas.parentNode) document.body.removeChild(fwCanvas);
        return;
    }

    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = 'rgba(0, 0, 0, 0.25)'; 
    fwCtx.fillRect(0, 0, fwW, fwH);
    fwCtx.globalCompositeOperation = 'lighter'; 

    let word = fwStr[actual];
    if (fwCurrent !== actual) {
        fwCurrent = actual;
        fwChars = [...word].map(makeChar);
    }
    let progress = (elapsed % fwDuration) / fwDuration;

    fwChars.forEach((pts, i) => {
        let spacing = fwW < 500 ? 70 : 140; 
        let dx = (fwW / 2) + (i - (fwChars.length - 1) / 2) * spacing;
        let targetY = fwH * 0.4;
        let tMod = (progress - i * 0.05);
        if (tMod < 0) return;

        if (tMod < 0.25) {
            let rT = tMod / 0.25;
            fwCtx.fillStyle = '#ffeba7';
            let cY = fwH - (fwH - targetY) * rT;
            fwCtx.fillRect(dx, cY, 3, 10); 
        } else {
            let explosionProgress = (tMod - 0.25) / 0.75; 
            let ease = 1 - Math.pow(1 - explosionProgress, 3);
            let opacity = 1 - explosionProgress; 
            
            fwCtx.globalAlpha = Math.max(0, opacity);
            fwCtx.fillStyle = fwColors[word];

            pts.forEach((xy) => {
                let px = dx + (xy[0] * ease * 1.6);
                let py = targetY + (xy[1] * ease * 1.6);
                
                // تقليل حجم النقطة قليلاً (2 بدلاً من 2.5) لكي لا تتداخل النقاط الكثيرة بشكل سيء
                if (opacity > 0.01) fwCtx.fillRect(px, py, 2, 2);
            });
            fwCtx.globalAlpha = 1; 
        }
    });
    requestAnimationFrame(renderFw);
}

window.addEventListener('scroll', () => {
    let scrollPos = window.innerHeight + window.scrollY;
    let pageBottom = document.documentElement.scrollHeight;
    if (!fwTriggered && scrollPos >= pageBottom - 20) {
        fwTriggered = true;
        initFireworks();
        requestAnimationFrame(renderFw);
    }
});