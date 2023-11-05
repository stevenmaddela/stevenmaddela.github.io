function openNewTab(url) {
  window.open(url, '_blank');
}


$(document).ready(function() {
  // Carousel code
  $num = $('.my-card').length;
  $even = $num / 2;
  $odd = ($num + 1) / 2;

  // Set the first card as active and its siblings as prev and next
  $('.my-card:first-child').addClass('active --selected-index');
  $('.my-card:first-child').prev().addClass('prev');
  $('.my-card:first-child').next().addClass('next');

  // Check if any card has the --selected-index class
  if (!$('.my-card').hasClass('--selected-index')) {
    $('.active').addClass('--selected-index');
  }

  
  
  $('.my-card').click(function() {
    $slide = $('.active').outerWidth(true);
 if ($(this).hasClass('--selected-index')) {
    const url = $(this).data('url');
    const target = ($(this).index() === 4) ? '_top' : '_blank';

    if (url) {
      window.open(url, target);
    }
  } console.log($('.active').position().left);

    if ($(this).hasClass('next')) {
      $('.card-carousel').stop(false, true).animate({left: '-=' + $slide});
    } else if ($(this).hasClass('prev')) {
      $('.card-carousel').stop(false, true).animate({left: '+=' + $slide});
    }
    $(this).removeClass('prev next');
    $(this).siblings().removeClass('prev active next');

    $(this).addClass('active');
    $(this).prev().addClass('prev');
    $(this).next().addClass('next');

    // Remove --selected-index class from all cards, and add it to the active card
    $('.my-card').removeClass('--selected-index');
    $('.active').addClass('--selected-index');
  });

  // Keyboard nav
  $('html body').keydown(function(e) {
    if (e.keyCode == 37) { // left
      $('.active').prev().trigger('click');
    } else if (e.keyCode == 39) { // right
      $('.active').next().trigger('click');
    }
  });

App({ el: 'background' });

function App(conf) {
  
  conf = {
    fov: 75,
    cameraZ: 75,
    xyCoef: 50,
    zCoef: 10,
    lightIntensity: 0.5,
    ambientColor: 0x000000,
    light1Color: 0x0E09DC,
    light2Color: 0x1CD1E1,
    light3Color: 0x18C02C,
    light4Color: 0xee3bcf,
    ...conf
  };

  let renderer, scene, camera, cameraCtrl;
  let width, height, cx, cy, wWidth, wHeight;
  const TMath = THREE.Math;

  let plane;
  const simplex = new SimplexNoise();

  const mouse = new THREE.Vector2();
  const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const mousePosition = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();

  const noiseInput = document.getElementById('noiseInput');
  const heightInput = document.getElementById('heightInput');

  var boatColor = 0xff3d3d;
var boatWidth = 35;
var boatHeight = 6;
var boatDepth = 8;

var boatMaterial = new THREE.MeshLambertMaterial({ color: boatColor,
    emissive: boatColor,                                                 });

var boat = new THREE.Mesh(new THREE.CubeGeometry(boatWidth, boatHeight, boatDepth), boatMaterial);
boat.castShadow = true;
  var sailGeometry = new THREE.Geometry();

sailGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
sailGeometry.vertices.push(new THREE.Vector3(boatWidth + 3, 0, 0));
sailGeometry.vertices.push(new THREE.Vector3(boatWidth + 3, 36, 0));
// a 2D object (with material.side = DoubleSide) is not enough because shadow works only for one side
sailGeometry.vertices.push(new THREE.Vector3(0, 0, 0.1));
sailGeometry.vertices.push(new THREE.Vector3(boatWidth + 3, 0, 0.1));
sailGeometry.vertices.push(new THREE.Vector3(boatWidth + 3, 36, 0.1));

sailGeometry.faces.push(new THREE.Face3(0, 1, 2));
sailGeometry.faces.push(new THREE.Face3(5, 4, 3));
sailGeometry.computeFaceNormals();

var sailMaterial = new THREE.MeshLambertMaterial({color:0xffffff,
     emissive: 0xffffff,
                                                });

var sail = new THREE.Mesh(sailGeometry, sailMaterial);
sail.castShadow = true;
sail.position.set(-boatWidth / 2 - 8, boatHeight / 2, 0);
boat.add(sail);
  var bowGeometry = new THREE.Geometry();
bowGeometry.vertices.push(new THREE.Vector3(0, boatHeight / 2, boatDepth / 2));
bowGeometry.vertices.push(new THREE.Vector3(0, -boatHeight / 2, boatDepth / 2));
bowGeometry.vertices.push(new THREE.Vector3(0, boatHeight / 2, -boatDepth / 2));
bowGeometry.vertices.push(new THREE.Vector3(0, -boatHeight / 2, -boatDepth / 2));
bowGeometry.vertices.push(new THREE.Vector3(-15, boatHeight / 2, 0));

bowGeometry.faces.push(new THREE.Face3(0, 2, 4));
bowGeometry.faces.push(new THREE.Face3(4, 1, 0));
bowGeometry.faces.push(new THREE.Face3(4, 3, 1));
bowGeometry.faces.push(new THREE.Face3(2, 3, 4));
bowGeometry.computeFaceNormals();

var bow = new THREE.Mesh(bowGeometry, boatMaterial);
bow.castShadow = true;
bow.position.set(-boatWidth / 2, 0, 0);
boat.add(bow);
  boat.position.set(0, 0, 0);
      boat.step = -.15;
boat.scale.set(0.175, 0.175, 0.175);

     let frameCount = 0;
  const updateDelay = 1; // Update every 3 frames
  init();
scene.add(boat);

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(conf.el), antialias: true, alpha: true });
    camera = new THREE.PerspectiveCamera(conf.fov);
    camera.position.z = conf.cameraZ;

    updateSize();
    window.addEventListener('resize', updateSize, false);

    document.addEventListener('mousemove', e => {
      const v = new THREE.Vector3();
      camera.getWorldDirection(v);
      v.normalize();
      mousePlane.normal = v;
      raycaster.setFromCamera(mouse, camera);
     
    });

    initScene();
    initGui();
    animate();
  }
  
function rotateBoat(boat) {
    boat.rotation.y = boat.rotation.y === 0 ? Math.PI : 0; 
    boat.step *= -1;
}
  function initGui() {
    noiseInput.value = 101 - conf.xyCoef;
    heightInput.value = conf.zCoef * 100 / 25;

    noiseInput.addEventListener('input', e => {
      conf.xyCoef = 101 - noiseInput.value;
    });
    heightInput.addEventListener('input', e => {
      conf.zCoef = heightInput.value * 25 / 100;
    });
    document.getElementById('trigger').addEventListener('click', e => {
      updateLightsColors();
    });
    
    
  }

  function initScene() {
    scene = new THREE.Scene();
    initLights();

    let mat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    // let mat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    // let mat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.5, metalness: 0.8 });
    let geo = new THREE.PlaneBufferGeometry(wWidth, wHeight, wWidth / 2, wHeight / 2);
    plane = new THREE.Mesh(geo, mat);
    scene.add(plane);

    plane.rotation.x = -Math.PI / 2 - 0.2;
    plane.position.y = -25;
    camera.position.z = 60;
  }

  function initLights() {
    const r = 30;
    const y = 10;
    const lightDistance = 500;

    // light = new THREE.AmbientLight(conf.ambientColor);
    // scene.add(light);

    light1 = new THREE.PointLight(conf.light1Color, conf.lightIntensity, lightDistance);
    light1.position.set(0, y, r);
    scene.add(light1);
    light2 = new THREE.PointLight(conf.light2Color, conf.lightIntensity, lightDistance);
    light2.position.set(0, -y, -r);
    scene.add(light2);
    light3 = new THREE.PointLight(conf.light3Color, conf.lightIntensity, lightDistance);
    light3.position.set(r, y, 0);
    scene.add(light3);
    light4 = new THREE.PointLight(conf.light4Color, conf.lightIntensity, lightDistance);
    light4.position.set(-r, y, 0);
    scene.add(light4);
  }
  

  function animate() {
    frameCount++;
    if (frameCount % updateDelay === 0) {
      let boatPos = boat.position;
      // Update boat position based on step
      if (boatPos.x + boat.step < 75 && boatPos.x + boat.step > -75) {
        boatPos.x += boat.step;
      } else {
        rotateBoat(boat);
      }
  
      // Update boat's vertical position based on simplex noise
      const floatHeight = 17; // Or whatever value keeps the boat above the wave
      let waveHeight = simplex.noise2D(
        boatPos.x / conf.xyCoef,
        boatPos.z / conf.xyCoef
      ) * conf.zCoef + plane.position.y - floatHeight;
  
      // Collision detection
      if (boatPos.y < waveHeight) {
        boatPos.y = waveHeight;
      }
      waveHeight*=.5;
  
      boat.position.y = waveHeight;
  
      // Calculate slope and set boat rotation
      let x1 = boat.position.x;
      let z1 = boat.position.z;
      let y1 = simplex.noise2D(x1 / conf.xyCoef, z1 / conf.xyCoef) * conf.zCoef + plane.position.y;
  
      let x2 = x1 + 0.01;  // small step in x direction
      let y2 = simplex.noise2D(x2 / conf.xyCoef, z1 / conf.xyCoef) * conf.zCoef + plane.position.y;
  
      let slope;
  
      if (boat.step < 0) { // moving right
        slope = (y2 - y1) / (x2 - x1);
      } else { // moving left
        slope = -(y2 - y1) / (x2 - x1);  // flip the sign of the slope
      }
  
      slope *= 0.5;
  
      boat.rotation.z = Math.atan(slope);
    }
              

    animatePlane();
    animateLights();
    
    renderer.render(scene, camera);
        requestAnimationFrame(animate);

  };

  
  function animatePlane() {
    gArray = plane.geometry.attributes.position.array;
    const time = Date.now() * 0.0002;
    for (let i = 0; i < gArray.length; i += 3) {
      gArray[i + 2] = simplex.noise4D(gArray[i] / conf.xyCoef, gArray[i + 1] / conf.xyCoef, time, mouse.x + mouse.y) * conf.zCoef;
    }
    plane.geometry.attributes.position.needsUpdate = true;
    // plane.geometry.computeBoundingSphere();
  }

  function animateLights() {
    const time = Date.now() * 0.001;
    const d = 50;
    light1.position.x = Math.sin(time * 0.1) * d;
    light1.position.z = Math.cos(time * 0.2) * d;
    light2.position.x = Math.cos(time * 0.3) * d;
    light2.position.z = Math.sin(time * 0.4) * d;
    light3.position.x = Math.sin(time * 0.5) * d;
    light3.position.z = Math.sin(time * 0.6) * d;
    light4.position.x = Math.sin(time * 0.7) * d;
    light4.position.z = Math.cos(time * 0.8) * d;
  }

  function updateLightsColors() {
    conf.light1Color = chroma.random().hex();
    conf.light2Color = chroma.random().hex();
    conf.light3Color = chroma.random().hex();
    conf.light4Color = chroma.random().hex();
    light1.color = new THREE.Color(conf.light1Color);
    light2.color = new THREE.Color(conf.light2Color);
    light3.color = new THREE.Color(conf.light3Color);
    light4.color = new THREE.Color(conf.light4Color);
    // console.log(conf);
  }

  function updateSize() {
    width = window.innerWidth; cx = width / 2;
    height = window.innerHeight; cy = height / 2;
    if (renderer && camera) {
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const wsize = getRendererSize();
      wWidth = wsize[0];
      wHeight = wsize[1];
    }
  }

  function getRendererSize() {
    const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect);
    const vFOV = cam.fov * Math.PI / 180;
    const height = 2 * Math.tan(vFOV / 2) * Math.abs(conf.cameraZ);
    const width = height * cam.aspect;
    return [width, height];
  }
}

  // ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

class TextScramble {
  constructor(el) {
    this.el = el
    this.chars = '!<>-_\\/[]{}—=+*^?#________'
    this.update = this.update.bind(this)
  }
  setText(newText) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => this.resolve = resolve)
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }
    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }
  update() {
    let output = ''
    let complete = 0
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class="dud">${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }
}

// ——————————————————————————————————————————————————
// Example
// ——————————————————————————————————————————————————

const phrases = [
  'Neo,',
  'sooner or later',
  'you\'re going to realize',
  'just as I did',
  'that there\'s a difference',
  'between knowing the path',
  'and walking the path',
  'My Projects: ',
    'Fit\'nSocial',
    'Feedy',
    'Stock Profit / Loss Calculator',
    'Grand Reunion',
  'Impossible Maze: Escape',
  'Please Hire Me',

]

const el = document.querySelector('.centered-text')
const fx = new TextScramble(el)

let counter = 0
const next = () => {
  fx.setText(phrases[counter]).then(() => {
    setTimeout(next, 1750)
  })
  counter = (counter + 1) % phrases.length
}

next()
 
});
