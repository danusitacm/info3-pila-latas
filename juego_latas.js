import * as THREE from './threejs/three.module.js';
import { OrbitControls } from './threejs/addons/OrbitControls.js';

try {

    //texturas
    const textureLoader = new THREE.TextureLoader();
    const chocloTexture = textureLoader.load('choclo.png');
    const cartelSanJuanTexture = textureLoader.load('CartelSanJuan.png');

chocloTexture.wrapS = THREE.ClampToEdgeWrapping;
chocloTexture.wrapT = THREE.ClampToEdgeWrapping;
chocloTexture.repeat.set(1, 1);
chocloTexture.minFilter = THREE.LinearFilter;
chocloTexture.magFilter = THREE.LinearFilter;
chocloTexture.flipY = true;

cartelSanJuanTexture.wrapS = THREE.ClampToEdgeWrapping;
cartelSanJuanTexture.wrapT = THREE.ClampToEdgeWrapping;
cartelSanJuanTexture.minFilter = THREE.LinearFilter;
cartelSanJuanTexture.magFilter = THREE.LinearFilter;
cartelSanJuanTexture.flipY = true; 

// configuracion del renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// configuracion de la cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 20);

// controles de orbita (con fallback)
let controls;
try {
  if (OrbitControls) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 5, 0);
    controls.enabled = false;
    console.log("OrbitControls creado exitosamente");
  } else {
    console.warn("OrbitControls no está disponible");
  }
} catch (error) {
    console.error("Error creando OrbitControls:", error);
    controls = null;
} 

// escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a2e); 

// iluminacion nocturna
const ambientLight = new THREE.AmbientLight(0x404080, 0.3); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

const carpaLight = new THREE.PointLight(0xffaa44, 0.8, 20);
carpaLight.position.set(0, 8, -5);
carpaLight.castShadow = true;
scene.add(carpaLight);

const gameLight = new THREE.PointLight(0xffffff, 0.6, 15);
gameLight.position.set(0, 10, 5);
scene.add(gameLight);

// suelo
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x1a2b0a, // Verde muy oscuro para la noche
  roughness: 0.8
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// mesa 
const mesaGroup = new THREE.Group();

// superficie de la mesa
const mesaWidth = 12;
const mesaDepth = 6;
const mesaHeight = 0.3;
const mesaElevacion = 5;

const mesaGeometry = new THREE.BoxGeometry(mesaWidth, mesaHeight, mesaDepth);
const mesaMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x8B4513,
  roughness: 0.7,
  metalness: 0.1
});
const mesaSuperficie = new THREE.Mesh(mesaGeometry, mesaMaterial);
mesaSuperficie.position.y = mesaElevacion;
mesaSuperficie.position.z = -5;
mesaSuperficie.castShadow = true;
mesaSuperficie.receiveShadow = true;
mesaGroup.add(mesaSuperficie);

// patas de la mesa
const pataWidth = 0.3;
const pataHeight = mesaElevacion - mesaHeight / 2;
const pataGeometry = new THREE.BoxGeometry(pataWidth, pataHeight, pataWidth);
const pataMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x654321,
  roughness: 0.8,
  metalness: 0.1
});

const posicionesPatas = [
  { x: mesaWidth / 2 - 0.5, z: mesaDepth / 2 - 0.5 },
  { x: -mesaWidth / 2 + 0.5, z: mesaDepth / 2 - 0.5 },
  { x: mesaWidth / 2 - 0.5, z: -mesaDepth / 2 + 0.5 },
  { x: -mesaWidth / 2 + 0.5, z: -mesaDepth / 2 + 0.5 }
];

posicionesPatas.forEach(pos => {
  const pata = new THREE.Mesh(pataGeometry, pataMaterial);
  pata.position.set(pos.x, pataHeight / 2, -5 + pos.z);
  pata.castShadow = true;
  mesaGroup.add(pata);
});

scene.add(mesaGroup);

// carpa de san juan
const carpaGroup = new THREE.Group();

// dimensiones de la carpa
const baseSize = 15; // tamaño de la base cuadrada
const alturaParedes = 14; // altura de las paredes
const alturaTecho = 6; // altura adicional del techo piramidal
const grosorPalo = 0.2; // grosor de los palos

// material para el techo
const techoMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x1E90FF,
  side: THREE.DoubleSide,
  roughness: 0.7,
  metalness: 0.1
});

// material para los palos
const paloMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x8B4513,
  roughness: 0.8,
  metalness: 0.1
});

// techo piramidal (base cuadrada)
// vertices de la piramide
const half = baseSize / 2;
const apex = alturaParedes + alturaTecho; // punto superior de la piramide
const base = alturaParedes; // altura de la base

// crear las 4 caras triangulares manualmente
const techoGroup = new THREE.Group();

// cara frontal (mirando hacia +Z)
const caraFrontal = new THREE.BufferGeometry();
const verticesFrontal = new Float32Array([
  -half, base, half,   // esquina izquierda
  half, base, half,    // esquina derecha
  0, apex, 0           // vértice superior
]);
caraFrontal.setAttribute('position', new THREE.BufferAttribute(verticesFrontal, 3));
caraFrontal.computeVertexNormals();
const meshFrontal = new THREE.Mesh(caraFrontal, techoMaterial);
meshFrontal.castShadow = true;
meshFrontal.receiveShadow = true;
techoGroup.add(meshFrontal);

// Cara trasera (mirando hacia -Z)
const caraTrasera = new THREE.BufferGeometry();
const verticesTrasera = new Float32Array([
  half, base, -half,   // esquina derecha
  -half, base, -half,  // esquina izquierda
  0, apex, 0           // vértice superior
]);
caraTrasera.setAttribute('position', new THREE.BufferAttribute(verticesTrasera, 3));
caraTrasera.computeVertexNormals();
const meshTrasera = new THREE.Mesh(caraTrasera, techoMaterial);
meshTrasera.castShadow = true;
meshTrasera.receiveShadow = true;
techoGroup.add(meshTrasera);

// cara izquierda (mirando hacia -X)
const caraIzquierda = new THREE.BufferGeometry();
const verticesIzquierda = new Float32Array([
  -half, base, -half,  // esquina trasera
  -half, base, half,   // esquina frontal
  0, apex, 0           // vértice superior
]);
caraIzquierda.setAttribute('position', new THREE.BufferAttribute(verticesIzquierda, 3));
caraIzquierda.computeVertexNormals();
const meshIzquierda = new THREE.Mesh(caraIzquierda, techoMaterial);
meshIzquierda.castShadow = true;
meshIzquierda.receiveShadow = true;
techoGroup.add(meshIzquierda);

// cara derecha (mirando hacia +X)
const caraDerecha = new THREE.BufferGeometry();
const verticesDerecha = new Float32Array([
  half, base, half,    // esquina frontal
  half, base, -half,   // esquina trasera
  0, apex, 0           // vértice superior
]);
caraDerecha.setAttribute('position', new THREE.BufferAttribute(verticesDerecha, 3));
caraDerecha.computeVertexNormals();
const meshDerecha = new THREE.Mesh(caraDerecha, techoMaterial);
meshDerecha.castShadow = true;
meshDerecha.receiveShadow = true;
techoGroup.add(meshDerecha);

carpaGroup.add(techoGroup);

// palos de las esquinas (4 palos verticales)
const paloGeometry = new THREE.CylinderGeometry(grosorPalo, grosorPalo, alturaParedes, 16);

const posicionesEsquinas = [
  { x: baseSize / 2, z: baseSize / 2 },
  { x: -baseSize / 2, z: baseSize / 2 },
  { x: baseSize / 2, z: -baseSize / 2 },
  { x: -baseSize / 2, z: -baseSize / 2 }
];

posicionesEsquinas.forEach(pos => {
  const palo = new THREE.Mesh(paloGeometry, paloMaterial);
  palo.position.set(pos.x, alturaParedes / 2, pos.z);
  palo.castShadow = true;
  carpaGroup.add(palo);
});

// cartel
const cartelWidth = 14;
const cartelHeight = 5;
const cartelGeometry = new THREE.PlaneGeometry(cartelWidth, cartelHeight);
const cartelMaterial = new THREE.MeshStandardMaterial({ 
  map: cartelSanJuanTexture,
  side: THREE.DoubleSide,
  roughness: 0.3,
  metalness: 0.1
});
const cartel = new THREE.Mesh(cartelGeometry, cartelMaterial);
cartel.position.set(0, cartelHeight / 2, baseSize / 2);
cartel.receiveShadow = true;
carpaGroup.add(cartel);

// posicionar la carpa sobre las latas
carpaGroup.position.z = -5;

scene.add(carpaGroup);

// función para crear una lata
function crearLata(color = 0x888888) {
  const radius = 0.6;
  const height = 1.5;
  const segments = 32;

  const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, segments, 1, true);
  const cylinderMaterial = new THREE.MeshStandardMaterial({ 
    map: chocloTexture,
    side: THREE.DoubleSide,
    metalness: 0.2,
    roughness: 0.8
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.castShadow = true;
  cylinder.rotation.y = Math.PI;

  const circleGeometry = new THREE.CircleGeometry(radius, segments);
  const metalMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    side: THREE.DoubleSide,
    metalness: 0.8,
    roughness: 0.2
  });
  const base = new THREE.Mesh(circleGeometry, metalMaterial);
  base.rotation.x = -Math.PI / 2;
  base.position.y = -height / 2;

  const top = new THREE.Mesh(circleGeometry, metalMaterial);
  top.rotation.x = -Math.PI / 2;
  top.position.y = height / 2;

  // borde superior
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
  const points = curve.getPoints(segments);
  const borderGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const borderMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
  const border = new THREE.LineLoop(borderGeometry, borderMaterial);
  border.rotation.x = Math.PI / 2;
  border.position.y = height / 2;

  // borde inferior
  const borderBottom = new THREE.LineLoop(borderGeometry, borderMaterial);
  borderBottom.rotation.x = Math.PI / 2;
  borderBottom.position.y = -height / 2;

  // grupo para la lata
  const lata = new THREE.Group();
  lata.add(cylinder);
  lata.add(base);
  lata.add(top);
  lata.add(border);
  lata.add(borderBottom);

  // propiedades físicas
  lata.userData.velocity = new THREE.Vector3();
  lata.userData.angularVelocity = new THREE.Vector3();
  lata.userData.radius = radius;
  lata.userData.height = height;
  lata.userData.mass = 1;
  lata.userData.derribada = false;
  lata.userData.nivel = 0;
  lata.userData.posicionInicial = new THREE.Vector3();

  return lata;
}
// color para las latas
const colorGris = 0x808080;

const heightPerCan = 1.5;
const latas = [];
const mesaTopY = 5 + 0.15; 
// contador de latas derribadas (debe declararse en módulos)
let latasDerribadas = 0;

// crear pirámide de latas
let lataIndex = 0;

// nivel 1: 4 latas
for (let i = 0; i < 4; i++) {
  const lata = crearLata(colorGris);
  lata.position.set((i - 1.5) * 1.5, mesaTopY + heightPerCan / 2, -5);
  lata.userData.nivel = 1;
  lata.userData.posicionInicial = lata.position.clone();
  scene.add(lata);
  latas.push(lata);
  console.log('Lata nivel 1:', lata.userData.posicionInicial);
  lataIndex++;
}

// nivel 2: 3 latas
for (let i = 0; i < 3; i++) {
  const lata = crearLata(colorGris);
  lata.position.set((i - 1) * 1.5, mesaTopY + heightPerCan * 1.5, -5);
  lata.userData.nivel = 2;
  lata.userData.posicionInicial = lata.position.clone();
  scene.add(lata);
  latas.push(lata);
  lataIndex++;
}

// nivel 3: 2 latas
for(let i = 0; i < 2; i++) {
  const lata = crearLata(colorGris);
  lata.position.set((i - 0.5) * 1.5, mesaTopY + heightPerCan * 2.5, -5);
  lata.userData.nivel = 3;
  lata.userData.posicionInicial = lata.position.clone();
  scene.add(lata);
  latas.push(lata);
  lataIndex++;
}

// nivel 4: 1 lata
const lataTop = crearLata(colorGris);
lataTop.position.set(0, mesaTopY + heightPerCan * 3.5, -5);
lataTop.userData.nivel = 4;
lataTop.userData.posicionInicial = lataTop.position.clone();
scene.add(lataTop);
latas.push(lataTop);

// pelota
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xff0000,
  metalness: 0.3,
  roughness: 0.4
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, cartelHeight, 10);
sphere.castShadow = true;
scene.add(sphere);

// flecha indicadora de dirección
const arrowHelper = new THREE.ArrowHelper(
  new THREE.Vector3(0, 0, -1),
  sphere.position,
  5,
  0xffff00,
  1,
  0.5
);
scene.add(arrowHelper);

// variables para el lanzamiento
let isLaunched = false;
let velocity = new THREE.Vector3();
const gravity = new THREE.Vector3(0, -0.01, 0);
const sphereRadius = 0.5;

// variables para el control de lanzamiento
let aimAngleH = 0;
let aimAngleV = 10;
const launchSpeed = 0.5;

// funcion para detectar colisión esfera-lata
function checkSphereCanCollision(sphere, lata) {
  const dx = sphere.position.x - lata.position.x;
  const dy = sphere.position.y - lata.position.y;
  const dz = sphere.position.z - lata.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  const collisionDistance = sphereRadius + lata.userData.radius;
  
  return distance < collisionDistance;
}

// función para detectar colisión entre dos latas
function checkCanCanCollision(lata1, lata2) {
  if (lata1 === lata2) {
    return false;
  }
  
  const dx = lata1.position.x - lata2.position.x;
  const dy = lata1.position.y - lata2.position.y;
  const dz = lata1.position.z - lata2.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  const collisionDistance = lata1.userData.radius + lata2.userData.radius;
  
  return distance < collisionDistance;
}

// función para manejar colisión entre dos latas
function handleCanCanCollision(lata1, lata2) {
  const dx = lata1.position.x - lata2.position.x;
  const dy = lata1.position.y - lata2.position.y;
  const dz = lata1.position.z - lata2.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  if (distance === 0) return; // Evitar división por cero
  
  // Normalizar vector de colisión
  const nx = dx / distance;
  const ny = dy / distance;
  const nz = dz / distance;
  
  // Separar las latas para evitar superposición
  const overlap = (lata1.userData.radius + lata2.userData.radius) - distance;
  const separacion = overlap * 0.5;
  
  lata1.position.x += nx * separacion;
  lata1.position.y += ny * separacion;
  lata1.position.z += nz * separacion;
  
  lata2.position.x -= nx * separacion;
  lata2.position.y -= ny * separacion;
  lata2.position.z -= nz * separacion;
  
  // Calcular velocidades relativas
  const v1x = lata1.userData.velocity.x;
  const v1y = lata1.userData.velocity.y;
  const v1z = lata1.userData.velocity.z;
  
  const v2x = lata2.userData.velocity.x;
  const v2y = lata2.userData.velocity.y;
  const v2z = lata2.userData.velocity.z;
  
  // Velocidad relativa en dirección de la normal
  const relativeVelocity = (v1x - v2x) * nx + (v1y - v2y) * ny + (v1z - v2z) * nz;
  
  // No resolver si las velocidades se separan
  if (relativeVelocity > 0) return;
  
  // Coeficiente de restitución (rebote)
  const restitution = 0.6;
  const impulse = -(1 + restitution) * relativeVelocity / 2; // Asumiendo masas iguales
  
  // Aplicar impulso
  lata1.userData.velocity.x += impulse * nx;
  lata1.userData.velocity.y += impulse * ny;
  lata1.userData.velocity.z += impulse * nz;
  
  lata2.userData.velocity.x -= impulse * nx;
  lata2.userData.velocity.y -= impulse * ny;
  lata2.userData.velocity.z -= impulse * nz;
  
  // Agregar algo de rotación por la colisión
  const angularImpulse = impulse * 0.2;
  lata1.userData.angularVelocity.x += (Math.random() - 0.5) * angularImpulse;
  lata1.userData.angularVelocity.z += (Math.random() - 0.5) * angularImpulse;
  
  lata2.userData.angularVelocity.x += (Math.random() - 0.5) * angularImpulse;
  lata2.userData.angularVelocity.z += (Math.random() - 0.5) * angularImpulse;
}

// funcion para verificar si una lata tiene soporte
function tieneSoporte(lata) {
  if (lata.userData.nivel === 1) {
    return true;
  }
  
  const dx = lata.position.x - lata.userData.posicionInicial.x;
  const dz = lata.position.z - lata.userData.posicionInicial.z;
  const distanciaHorizontal = Math.sqrt(dx * dx + dz * dz);
  
  if (distanciaHorizontal > 0.3) {
    return false;
  }
  
  const nivelInferior = lata.userData.nivel - 1;
  let latasDebajoEnPosicion = 0;
  
  latas.forEach(lataInferior => {
    if (lataInferior.userData.nivel === nivelInferior && !lataInferior.userData.derribada) {
      const dxInf = lataInferior.position.x - lataInferior.userData.posicionInicial.x;
      const dzInf = lataInferior.position.z - lataInferior.userData.posicionInicial.z;
      const distInf = Math.sqrt(dxInf * dxInf + dzInf * dzInf);
      
        if (distInf <= 0.3) {
        const dx2 = lata.position.x - lataInferior.position.x;
        const dz2 = lata.position.z - lataInferior.position.z;
        const dist2D = Math.sqrt(dx2 * dx2 + dz2 * dz2);
        
        if (dist2D < 1.2) {
          latasDebajoEnPosicion++;
        }
      }
    }
  });
  
  // OJO: se necesitan al menos 2 latas debajo para tener soporte estable
  return latasDebajoEnPosicion >= 2;
}

// funcion para hacer caer latas sin soporte
function verificarSoportes() {
  latas.forEach(lata => {
    if (!lata.userData.derribada && !tieneSoporte(lata)) {
      lata.userData.derribada = true;
      latasDerribadas++;
      
      lata.userData.velocity.set(
        (Math.random() - 0.5) * 0.05,
        -0.05,
        (Math.random() - 0.5) * 0.05
      );
      // Reducir velocidad angular cuando pierde soporte
      lata.userData.angularVelocity.set(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.15
      );
      
    }
  });
}

// funcion para actualizar la flecha
function updateAimArrow() {
  if (!isLaunched) {
    const angleVRad = (aimAngleV * Math.PI) / 180;
    const angleHRad = (aimAngleH * Math.PI) / 180;
    
    const direction = new THREE.Vector3(
      Math.sin(angleHRad),
      Math.sin(angleVRad),
      -Math.cos(angleHRad)
    );
    direction.normalize();
    
    arrowHelper.position.copy(sphere.position);
    arrowHelper.setDirection(direction);
    arrowHelper.setLength(5);
    arrowHelper.setColor(0xffff00);
  }
}

// funcion para lanzar la esfera
function launchSphere() {
  if (!isLaunched) {
    const angleVRad = (aimAngleV * Math.PI) / 180;
    const angleHRad = (aimAngleH * Math.PI) / 180;
    
    const direction = new THREE.Vector3(
      Math.sin(angleHRad),
      Math.sin(angleVRad),
      -Math.cos(angleHRad)
    );
    direction.normalize();
    
    velocity.copy(direction).multiplyScalar(launchSpeed);
    
    isLaunched = true;
    arrowHelper.visible = false;
  }
}

window.addEventListener('keydown', (event) => {
  console.log('Tecla presionada:', event.code);
  
  if (event.code === 'Space') {
    event.preventDefault();
    launchSphere();
  }
  if (event.code === 'KeyR') {
    console.log('Tecla R detectada, llamando resetGame()');
    event.preventDefault();
    resetGame();
  }
  
  if (!isLaunched) {
    if (event.code === 'ArrowLeft') {
      aimAngleH -= 3;
      updateAimArrow();
    }
    if (event.code === 'ArrowRight') {
      aimAngleH += 3;
      updateAimArrow();
    }
    if (event.code === 'ArrowUp') {
      aimAngleV = Math.min(45, aimAngleV + 2);
      updateAimArrow();
    }
    if (event.code === 'ArrowDown') {
      aimAngleV = Math.max(-10, aimAngleV - 2);
      updateAimArrow();
    }
  }
});

window.addEventListener('click', () => {
  launchSphere();
});

// funcion para reiniciar el juego
function resetGame() {
  console.log('=== REINICIANDO JUEGO ===');
  
  // Resetear pelota
  sphere.position.set(0, cartelHeight, 10);
  velocity.set(0, 0, 0);
  isLaunched = false;
  arrowHelper.visible = true;
  updateAimArrow();
  
  latasDerribadas = 0;
  
  // Eliminar latas actuales de la escena
  latas.forEach(lata => {
    scene.remove(lata);
  });
  
  // Vaciar array
  latas.length = 0;
  
  // Recrear pirámide desde cero
  const mesaTopY = 5 + 0.15;
  const heightPerCan = 1.5;
  
  // nivel 1: 4 latas
  for (let i = 0; i < 4; i++) {
    const lata = crearLata(colorGris);
    lata.position.set((i - 1.5) * 1.5, mesaTopY + heightPerCan / 2, -5);
    lata.userData.nivel = 1;
    lata.userData.posicionInicial = lata.position.clone();
    scene.add(lata);
    latas.push(lata);
  }
  
  // nivel 2: 3 latas
  for (let i = 0; i < 3; i++) {
    const lata = crearLata(colorGris);
    lata.position.set((i - 1) * 1.5, mesaTopY + heightPerCan * 1.5, -5);
    lata.userData.nivel = 2;
    lata.userData.posicionInicial = lata.position.clone();
    scene.add(lata);
    latas.push(lata);
  }
  
  // nivel 3: 2 latas
  for(let i = 0; i < 2; i++) {
    const lata = crearLata(colorGris);
    lata.position.set((i - 0.5) * 1.5, mesaTopY + heightPerCan * 2.5, -5);
    lata.userData.nivel = 3;
    lata.userData.posicionInicial = lata.position.clone();
    scene.add(lata);
    latas.push(lata);
  }
  
  // nivel 4: 1 lata
  const lataTop = crearLata(colorGris);
  lataTop.position.set(0, mesaTopY + heightPerCan * 3.5, -5);
  lataTop.userData.nivel = 4;
  lataTop.userData.posicionInicial = lataTop.position.clone();
  scene.add(lataTop);
  latas.push(lataTop);
  
  console.log('=== JUEGO REINICIADO - ' + latas.length + ' latas recreadas ===');
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// bucle de animación
function animate() {
  requestAnimationFrame(animate);
  
  if (isLaunched) {
    velocity.add(gravity);
    sphere.position.add(velocity);
    
    // Colisión con el suelo
    if (sphere.position.y - sphereRadius <= 0) {
      sphere.position.y = sphereRadius;
      velocity.y *= -0.5;
      velocity.x *= 0.95;
      velocity.z *= 0.95;
      
      if (Math.abs(velocity.y) < 0.01 && velocity.length() < 0.01) {
        velocity.set(0, 0, 0);
      }
    }
    
    // Colisión con la mesa
    const mesaX = 0;
    const mesaZ = -5;
    const mesaY = 5; 
    const mesaHalfWidth = 6; 
    const mesaHalfDepth = 3; 
    const mesaTopY = mesaY + 0.15; 
    
    // Verificar si la pelota está cerca de la mesa para colisiones laterales y superior
    const nearMesa = sphere.position.x >= mesaX - mesaHalfWidth - sphereRadius && 
                     sphere.position.x <= mesaX + mesaHalfWidth + sphereRadius &&
                     sphere.position.z >= mesaZ - mesaHalfDepth - sphereRadius && 
                     sphere.position.z <= mesaZ + mesaHalfDepth + sphereRadius &&
                     sphere.position.y >= mesaY - sphereRadius && 
                     sphere.position.y <= mesaTopY + sphereRadius;
    
    if (nearMesa) {
      if (sphere.position.x >= mesaX - mesaHalfWidth && 
          sphere.position.x <= mesaX + mesaHalfWidth &&
          sphere.position.z >= mesaZ - mesaHalfDepth && 
          sphere.position.z <= mesaZ + mesaHalfDepth &&
          sphere.position.y - sphereRadius <= mesaTopY && 
          sphere.position.y > mesaTopY - 1 &&
          velocity.y < 0) {
        sphere.position.y = mesaTopY + sphereRadius;
        velocity.y *= -0.7; 
        velocity.x *= 0.85; 
        velocity.z *= 0.85; 
      }
      
      if (sphere.position.x <= mesaX - mesaHalfWidth + sphereRadius &&
          sphere.position.z >= mesaZ - mesaHalfDepth && 
          sphere.position.z <= mesaZ + mesaHalfDepth &&
          sphere.position.y >= mesaY && sphere.position.y <= mesaTopY + sphereRadius &&
          velocity.x < 0) {
        sphere.position.x = mesaX - mesaHalfWidth - sphereRadius;
        velocity.x *= -0.8; 
      }
      
      if (sphere.position.x >= mesaX + mesaHalfWidth - sphereRadius &&
          sphere.position.z >= mesaZ - mesaHalfDepth && 
          sphere.position.z <= mesaZ + mesaHalfDepth &&
          sphere.position.y >= mesaY && sphere.position.y <= mesaTopY + sphereRadius &&
          velocity.x > 0) {
        sphere.position.x = mesaX + mesaHalfWidth + sphereRadius;
        velocity.x *= -0.8; 
      }
      
      if (sphere.position.z >= mesaZ + mesaHalfDepth - sphereRadius &&
          sphere.position.x >= mesaX - mesaHalfWidth && 
          sphere.position.x <= mesaX + mesaHalfWidth &&
          sphere.position.y >= mesaY && sphere.position.y <= mesaTopY + sphereRadius &&
          velocity.z > 0) {
        sphere.position.z = mesaZ + mesaHalfDepth + sphereRadius;
        velocity.z *= -0.8; 
      }
      
      if (sphere.position.z <= mesaZ - mesaHalfDepth + sphereRadius &&
          sphere.position.x >= mesaX - mesaHalfWidth && 
          sphere.position.x <= mesaX + mesaHalfWidth &&
          sphere.position.y >= mesaY && sphere.position.y <= mesaTopY + sphereRadius &&
          velocity.z < 0) {
        sphere.position.z = mesaZ - mesaHalfDepth - sphereRadius;
        velocity.z *= -0.8; 
      }
      
      
      if (Math.abs(velocity.y) < 0.01 && velocity.length() < 0.02) {
        velocity.set(0, 0, 0);
      }
    }
    
    // Colisión con el cartel
    const cartelX = 0; 
    const cartelZ = -5 + 15/2; 
    const cartelY = 5/2; 
    const cartelHalfWidth = 14/2; 
    const cartelHalfHeight = 5/2; 
    const cartelThickness = 0.1; 
    
    if (sphere.position.x >= cartelX - cartelHalfWidth && 
        sphere.position.x <= cartelX + cartelHalfWidth &&
        sphere.position.y >= cartelY - cartelHalfHeight && 
        sphere.position.y <= cartelY + cartelHalfHeight &&
        sphere.position.z >= cartelZ - cartelThickness - sphereRadius && 
        sphere.position.z <= cartelZ + cartelThickness + sphereRadius &&
        velocity.z < 0) { 
      
      
      sphere.position.z = cartelZ - cartelThickness - sphereRadius;
      velocity.z *= -0.9; 
      velocity.x *= 0.95; 
      velocity.y *= 0.95; 
    }
    
    latas.forEach(lata => {
      if (checkSphereCanCollision(sphere, lata) && !lata.userData.derribada) {
        lata.userData.derribada = true;
        latasDerribadas++;
        
        const impulse = velocity.clone().multiplyScalar(2);
        lata.userData.velocity.copy(impulse);
        
        // Reducir velocidad angular al ser golpeadas por la pelota
        lata.userData.angularVelocity.set(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.2
        );
        
        velocity.multiplyScalar(0.3);
    
      }
    });
    
    verificarSoportes();
    
    for (let i = 0; i < latas.length; i++) {
      for (let j = i + 1; j < latas.length; j++) {
        if (checkCanCanCollision(latas[i], latas[j])) {
          handleCanCanCollision(latas[i], latas[j]);
        }
      }
    }
    
    if (sphere.position.y < -5 || Math.abs(sphere.position.x) > 30 || 
        sphere.position.z < -30 || sphere.position.z > 30) {
      sphere.position.set(0, cartelHeight, 10);
      velocity.set(0, 0, 0);
      isLaunched = false;
      arrowHelper.visible = true;
      updateAimArrow();
    }
  }
  
  latas.forEach(lata => {
    if (lata.userData.derribada) {
      lata.userData.velocity.y -= 0.01;
      
      lata.position.add(lata.userData.velocity);
      
      lata.rotation.x += lata.userData.angularVelocity.x;
      lata.rotation.y += lata.userData.angularVelocity.y;
      lata.rotation.z += lata.userData.angularVelocity.z;
      
      // Colisión con la mesa
      const mesaY = 5 + 0.15;
      if (lata.position.y - lata.userData.height / 2 <= mesaY) {
        lata.position.y = mesaY + lata.userData.height / 2;
        lata.userData.velocity.y *= -0.3;
        lata.userData.velocity.x *= 0.8;
        lata.userData.velocity.z *= 0.8;
        lata.userData.angularVelocity.multiplyScalar(0.995);
        
        if (Math.abs(lata.userData.velocity.y) < 0.01 && 
            lata.userData.velocity.length() < 0.01) {
          lata.userData.velocity.set(0, 0, 0);
          lata.userData.angularVelocity.set(0, 0, 0);
        }
      }
      const mesaX = 0;
      const mesaZ = -5;
      const mesaHalfWidth = 6;
      const mesaHalfDepth = 3;
      
      if (lata.position.x < mesaX - mesaHalfWidth || 
          lata.position.x > mesaX + mesaHalfWidth ||
          lata.position.z < mesaZ - mesaHalfDepth || 
          lata.position.z > mesaZ + mesaHalfDepth) {
        // lata fuera de la mesa, cae al suelo
        if (lata.position.y - lata.userData.height / 2 <= 0) {
          lata.position.y = lata.userData.height / 2;
          lata.userData.velocity.y *= -0.3;
          lata.userData.velocity.x *= 0.8;
          lata.userData.velocity.z *= 0.8;
          lata.userData.angularVelocity.multiplyScalar(0.9);
          
          if (Math.abs(lata.userData.velocity.y) < 0.01 && 
              lata.userData.velocity.length() < 0.01) {
            lata.userData.velocity.set(0, 0, 0);
            lata.userData.angularVelocity.set(0, 0, 0);
          }
        }
      }
    }
  });
  
  verificarSoportes();  
  if (controls) {
    controls.update();
  }
  renderer.render(scene, camera);
}

updateAimArrow();
animate();

} catch (error) {
    console.error("Error en el juego:", error);
    document.body.innerHTML = '<h1>Error cargando el juego: ' + error.message + '</h1><p>Revisa la consola para más detalles</p>';
}
