(function () {
  const canvases = document.querySelectorAll('.js-three-scene');
  if (!canvases.length || typeof THREE === 'undefined') return;

  const hasWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !!window.WebGLRenderingContext && !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  })();

  canvases.forEach((canvas) => {
    const wrap = canvas.closest('.three-wrap');
    const fallback = wrap?.querySelector('.three-fallback');
    if (!hasWebGL) {
      fallback && (fallback.hidden = false);
      canvas.hidden = true;
      return;
    }
    fallback && (fallback.hidden = true);

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 4);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));

    const geo = canvas.dataset.scene === 'cube'
      ? new THREE.BoxGeometry(1.4, 1.4, 1.4)
      : new THREE.TorusKnotGeometry(0.9, 0.28, 160, 26);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      metalness: 0.25,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.2
    });
    const mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.2);
    light1.position.set(3, 2, 4);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x60a5fa, 1.4, 40);
    light2.position.set(-2, -1, 2);
    scene.add(light2);

    const ambient = new THREE.AmbientLight(0x9ec5ff, 0.6);
    scene.add(ambient);

    let mouseX = 0;
    let mouseY = 0;
    let speed = 0.006;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.45;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.35;
    });

    window.addEventListener('scroll', () => {
      speed = 0.004 + Math.min(window.scrollY / 10000, 0.02);
    });

    const animate = () => {
      mesh.rotation.x += speed * 0.7;
      mesh.rotation.y += speed;
      mesh.rotation.x += (mouseY - mesh.rotation.x) * 0.04;
      mesh.rotation.y += (mouseX - mesh.rotation.y) * 0.04;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('resize', () => {
      const { clientWidth, clientHeight } = wrap;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    });
  });
})();
