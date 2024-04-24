class Experience {
  constructor(
    options = {
      containerSelector: "[data-app-container]"
    }
  ) {
    this.options = options;
    this.container = document.querySelector(this.options.containerSelector);

    // GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Time
    this.clock = new THREE.Clock();
    this.time = 0;

    // THREE items
    this.renderer;
    this.camera;
    this.scene;
    this.controls;
    this.meshes = [];

    // Rotation
    this.targetRotation = 0;

    // Settings
    this.settings = {
      cameraDistance: 5,
      scalePeriod: 8
    };

    this.init();
  }

  init = () => {

    this.createApp();

    // GLTF img
    this.loadGLTFModel(
      'https://raw.githubusercontent.com/ahmedwael17/Project5/main/camera.gltf(1)/scene.gltf',
      { x: -2.5, y: 10, z: 0 },
      0.6,
      { x: 0, y: 2, z: 0 }  // Rotate 45 degrees around the Y axis
    );
    this.loadGLTFModel(
      'https://raw.githubusercontent.com/ahmedwael17/Project5/main/camera.gltf(2)/scene.gltf',
      { x: 0, y: 4, z: 0 },
      4,
      { x: 0, y: 45, z: 0 }  // Rotate 90 degrees around the Y axis
    );

    // this.loadGLTFModel(
    //   'https://raw.githubusercontent.com/ahmedwael17/Project5/main/camera.gltf(3)/scene.gltf',
    //   { x: 2.8, y: 0, z: 0 },
    //   12,
    //   { x: 0, y: -45, z: 0 }  // Rotate 180 degrees around the Y axis
    // );

    this.rotateModelContinuously(
      'https://raw.githubusercontent.com/ahmedwael17/Project5/main/camera.gltf(3)/scene.gltf',
      { x: 2.5, y: 0, z: 0 },
      12,
      60 // Speed of rotation
    );



    this.initScroll();
    this.update();

    this.container.classList.add("is-ready");
  };

  createApp = () => {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1.5);
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(45, this.container.offsetWidth / this.container.offsetHeight, 1, 10000);
    this.camera.position.set(0, 0, this.settings.cameraDistance);
    this.scene = new THREE.Scene();

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableKeys = false;
    this.controls.enableZoom = false;
    this.controls.enableDamping = false;

    window.addEventListener("resize", () => {
      this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }, true);

    // Ambient Light
    let ambientLight = new THREE.AmbientLight(0xffffff, 3);
    this.scene.add(ambientLight);

    // Directional Light
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
    directionalLight.position.set(1, 5, 1);
    directionalLight.target.position.set(1, 5, 1);
    this.scene.add(directionalLight);
  };

  createItems = (shapeType) => {
    let geometry, material;

    switch (shapeType) {
      case 'box':
        geometry = new THREE.BoxBufferGeometry(2, 2, 2);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 32, 16);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(1, 2, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(1, 0);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(1, 0);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(1, 0);
        break;
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(1, 0);
        break;
      // Add more cases for other shapes as needed
      default:
        geometry = new THREE.BoxBufferGeometry(2, 2, 2); // Default to a box
    }

    material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const itemCount = 40;
    for (let i = 0; i < itemCount; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 13 * (Math.random() * 2 - 1);
      mesh.position.x = 3 * (Math.random() * 2 - 1);
      mesh.position.z = 4 * (Math.random() * 2 - 1);
      mesh.rotation.y = Math.PI * Math.random();
      mesh.rotationSpeed = Math.random() * 0.01 + 0.005;
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }
  };

  loadGLTFModel = (modelUrl, position, scale, rotation) => {
    const loader = new THREE.GLTFLoader();

    // Convert degrees to radians
    const rotationRadians = {
      x: THREE.MathUtils.degToRad(rotation.x),
      y: THREE.MathUtils.degToRad(rotation.y),
      z: THREE.MathUtils.degToRad(rotation.z)
    };

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(position.x, position.y, position.z);
        model.scale.set(scale, scale, scale);
        model.rotation.set(rotationRadians.x, rotationRadians.y, rotationRadians.z); // Set rotation
        this.scene.add(model);

        // Call the method to rotate the model continuously
        this.rotateModelContinuously(model, 0.01); // Adjust speed as needed
      },
      // Progress and error handling...
    );
  };

  rotateModelContinuously = (modelUrl, position, scale, speed) => {
    const loader = new THREE.GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(position.x, position.y, position.z);
        model.scale.set(scale, scale, scale);
        this.scene.add(model);
        // Start rotating the model continuously
        this.startRotation(model, speed);
      },
      // Progress and error handling...
    );
  };

  startRotation = (model, speed) => {
    const update = () => {
      model.rotation.y += speed * this.clock.getDelta(); // Rotate the model
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(update);
    };
    update(); // Start the rotation animation
  };


  initScroll = () => {
    this.scrollSmoother = ScrollSmoother.create({ content: "#content", smooth: 1.2 });
    document.querySelectorAll("span").forEach((span) => {
      ScrollTrigger.create({
        trigger: span,
        start: "top 90%",
        end: "bottom 10%",
        onUpdate: (self) => {
          const dist = Math.abs(self.progress - 0.5);
          const lightness = this.mapToRange(dist, 0, 0.5, 80, 100);
          span.style.setProperty("--l", lightness + "%");
        }
      });
    });
  };

  updateItems = () => {
    const time = this.time;
    const amplitude = 0.05;
    const period = this.settings.scalePeriod;

    const baseScale = 0.2;
    const scaleEffect =
      baseScale + amplitude * Math.sin(Math.PI * 2 * (time / period));

    this.meshes.forEach((mesh) => {
      mesh.scale.set(scaleEffect, scaleEffect, scaleEffect);

      // Update rotation
      mesh.rotation.x += mesh.rotationSpeed;
    });

    // Update camera
    const cameraRange = 10;
    this.camera.position.y = this.mapToRange(
      this.scrollSmoother.progress,
      0,
      1,
      cameraRange,
      -cameraRange
    );
  };

  mapToRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  update = () => {
    this.time = this.clock.getElapsedTime();

    this.updateItems();

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.update);
  };
}

new Experience();
