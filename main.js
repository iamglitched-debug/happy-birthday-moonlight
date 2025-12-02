(() => {
  // DOM elements
  const introStage = document.getElementById("introStage");
  const flowerStage = document.getElementById("flowerStage");
  const carouselStage = document.getElementById("carouselStage");
  
  const lightsButton = document.getElementById("lightsButton");
  const cameraRollButton = document.getElementById("cameraRollButton");
  const wishesButton = document.getElementById("wishesButton");
  
  const flowerCake = document.getElementById("flowerCake");
  const confettiLayer = document.getElementById("confettiLayer");
  
  const pamphletOverlay = document.getElementById("pamphletOverlay");
  const closePamphlet = document.getElementById("closePamphlet");
  
  const photoWheel = document.getElementById("photoWheel");
  const carouselContainer = document.getElementById("carouselContainer");
  
  let carouselInitialized = false;
  
  // Utility to switch stages
  function showStage(stageEl) {
    [introStage, flowerStage, carouselStage].forEach((el) => {
      if (!el) return;
      if (el === stageEl) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }
  
  // --------------------------
  // Confetti
  // --------------------------
  function randomConfettiColor() {
    const colors = ["#f4b41a", "#facc15", "#6366f1", "#22c55e", "#fb7185", "#e85a70"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  function burstConfetti(amount = 160) {
    const width = window.innerWidth;
    
    for (let i = 0; i < amount; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      const startX = Math.random() * width;
      const delay = Math.random() * 2;
      const scale = 0.6 + Math.random() * 1;
      
      piece.style.left = `${startX}px`;
      piece.style.top = `${-20 + Math.random() * 40}px`;
      piece.style.backgroundColor = randomConfettiColor();
      piece.style.animationDelay = `${delay}s`;
      piece.style.transform = `scale(${scale})`;
      piece.style.opacity = "0";
      
      confettiLayer.appendChild(piece);
      
      setTimeout(() => {
        piece.remove();
      }, 5000 + delay * 1000);
    }
  }
  
  // --------------------------
  // Flowers building cake shape
  // --------------------------
  const flowerEmojis = ["🌸", "🌼", "🌺", "💮", "💐"];
  
  function createFlower(xPercent, yPercent, delayMs) {
    const flower = document.createElement("div");
    flower.className = "flower";
    
    const inner = document.createElement("div");
    inner.className = "flower-inner";
    inner.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
    
    flower.appendChild(inner);
    
    flower.style.left = `${xPercent}%`;
    flower.style.top = `${yPercent}%`;
    
    flowerCake.appendChild(flower);
    
    setTimeout(() => {
      flower.classList.add("show");
    }, delayMs);
  }
  
  function startFlowerCake() {
    flowerCake.innerHTML = ""; // clear
    
    // Simple "cake" layout: base, mid, top, candles
    const layers = [
      { y: 70, count: 11 }, // base
      { y: 60, count: 9 },
      { y: 50, count: 7 },
      { y: 40, count: 5 },
    ];
    
    let delay = 0;
    layers.forEach((layer) => {
      const step = 80 / (layer.count - 1);
      for (let i = 0; i < layer.count; i++) {
        const x = 10 + step * i;
        createFlower(x, layer.y, delay);
        delay += 70;
      }
    });
    
    // candles
    const candlesY = 32;
    const candleXs = [40, 50, 60];
    candleXs.forEach((x) => {
      createFlower(x, candlesY, delay);
      delay += 80;
    });
    
    // sprinkles above
    for (let i = 0; i < 14; i++) {
      const x = 20 + Math.random() * 60;
      const y = 25 + Math.random() * 6;
      createFlower(x, y, delay);
      delay += 40;
    }
    
    burstConfetti();
  }
  
  // --------------------------
  // CSS 3D camera roll (circular wheel)
  // --------------------------
  let wheelRotation = 0;
  let isDragging = false;
  let lastClientX = 0;
  let autoSpinId;
  
  function initCarousel() {
    if (carouselInitialized) return;
    carouselInitialized = true;
    
    const imageUrls = [
      "hiya1.jpg",
      "hiya2.jpg",
      "hiya3.jpg",
      "hiya4.jpg",
      "hiya5.jpg",
    ];
    
    const count = imageUrls.length;
    const radius = 260; // px
    
    imageUrls.forEach((url, index) => {
      const item = document.createElement("div");
      item.className = "photo-item";
      
      const img = document.createElement("img");
      img.src = url;
      img.alt = "memory";
      
      item.appendChild(img);
      
      const angle = (index / count) * 360; // degrees
      item.dataset.baseAngle = angle;
      
      photoWheel.appendChild(item);
    });
    
    function updateWheelItems() {
      const items = photoWheel.querySelectorAll(".photo-item");
      items.forEach((item) => {
        const baseAngle = parseFloat(item.dataset.baseAngle);
        const totalAngle = baseAngle + wheelRotation;
        const rad = (totalAngle * Math.PI) / 180;
        const zNorm = Math.cos(rad); // front/back
        const x = Math.sin(rad) * radius;
        
        // rotate around Y and push out in Z
        item.style.transform = `
          rotateY(${totalAngle}deg)
          translateZ(${radius}px)
          translateX(${x * 0.0}px)
        `;
        
        // opacity / depth for 3D feel
        const alpha = 0.25 + (zNorm + 1) / 2 * 0.75;
        item.style.opacity = alpha.toFixed(2);
      });
    }
    
    updateWheelItems();
    
    // auto spin
    function startAutoSpin() {
      stopAutoSpin();
      autoSpinId = setInterval(() => {
        if (!isDragging) {
          wheelRotation += 0.4;
          updateWheelItems();
        }
      }, 40);
    }
    
    function stopAutoSpin() {
      if (autoSpinId) clearInterval(autoSpinId);
      autoSpinId = null;
    }
    
    startAutoSpin();
    
    // Drag / swipe controls
    function startDrag(clientX) {
      isDragging = true;
      lastClientX = clientX;
    }
    
    function moveDrag(clientX) {
      if (!isDragging) return;
      const deltaX = clientX - lastClientX;
      lastClientX = clientX;
      wheelRotation += deltaX * 0.4; // sensitivity
      updateWheelItems();
    }
    
    function endDrag() {
      isDragging = false;
    }
    
    // Mouse events
    carouselContainer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startDrag(e.clientX);
    });
    
    window.addEventListener("mousemove", (e) => {
      moveDrag(e.clientX);
    });
    
    window.addEventListener("mouseup", endDrag);
    
    // Touch events
    carouselContainer.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX);
    });
    
    carouselContainer.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      moveDrag(touch.clientX);
    });
    
    carouselContainer.addEventListener("touchend", endDrag);
    carouselContainer.addEventListener("touchcancel", endDrag);
  }
  
  // --------------------------
  // Pamphlet
  // --------------------------
  function openPamphlet() {
    pamphletOverlay.classList.add("active");
  }
  
  function closePamphletOverlay() {
    pamphletOverlay.classList.remove("active");
  }
  
  // --------------------------
  // Event bindings
  // --------------------------
  lightsButton.addEventListener("click", () => {
    showStage(flowerStage);
    startFlowerCake();
  });
  
  cameraRollButton.addEventListener("click", () => {
    showStage(carouselStage);
    initCarousel();
  });
  
  wishesButton.addEventListener("click", () => {
    openPamphlet();
  });
  
  closePamphlet.addEventListener("click", () => {
    closePamphletOverlay();
  });
  
  pamphletOverlay.addEventListener("click", (e) => {
    if (e.target === pamphletOverlay) {
      closePamphletOverlay();
    }
  });
  
  // Show intro explicitly
  showStage(introStage);
})();
