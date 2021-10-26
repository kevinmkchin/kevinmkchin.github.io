/*
 * UBC CPSC 314, 2021WT1
 * Assignment 2 Template
 */

// Setup and return the scene and related objects.
// You should look into js/setup.js to see what exactly is done here.
const {
  renderer,
  scene,
  camera,
  worldFrame,
} = setup();

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

// Initialize uniforms

const lightOffset = { type: 'v3', value: new THREE.Vector3(10.0, 50.0, -30.0) };

//HINT: Use this is uniform to pass a rotation matrix to a vertex shader to animate the armadillo's pelvis
const rotationMatrix = {type: 'mat4', value: new THREE.Matrix4()};

// Materials: specifying uniforms and shaders

const sphereMaterial = new THREE.ShaderMaterial();

const coneMaterial = new THREE.ShaderMaterial();

const eyeMaterial = new THREE.ShaderMaterial();

const boxMaterial = new THREE.ShaderMaterial();

const hitboxMaterial = new THREE.ShaderMaterial();

const armadilloFrame = new THREE.Object3D();
armadilloFrame.position.set(0, 0, -8);
scene.add(armadilloFrame);

const rotationFrame = new THREE.Object3D();
rotationFrame.rotation.y = Math.PI;
rotationFrame.position.set(0, 5.3, 0);
armadilloFrame.add(rotationFrame);

const armadilloMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPosition: lightOffset,
    rotationMatrix: rotationMatrix,
  }
});

// Load shaders.t
const shaderFiles = [
  'glsl/armadillo.vs.glsl',
  'glsl/armadillo.fs.glsl',
  'glsl/sphere.vs.glsl',
  'glsl/sphere.fs.glsl',
  'glsl/eye.vs.glsl',
  'glsl/eye.fs.glsl',
  'glsl/cone.vs.glsl',
  'glsl/cone.fs.glsl',
  'glsl/box.vs.glsl',
  'glsl/box.fs.glsl',
  'glsl/hitbox.vs.glsl',
  'glsl/hitbox.fs.glsl',
];

new THREE.SourceLoader().load(shaderFiles, function (shaders) {
  armadilloMaterial.vertexShader = shaders['glsl/armadillo.vs.glsl'];
  armadilloMaterial.fragmentShader = shaders['glsl/armadillo.fs.glsl'];

  sphereMaterial.vertexShader = shaders['glsl/sphere.vs.glsl'];
  sphereMaterial.fragmentShader = shaders['glsl/sphere.fs.glsl'];

  eyeMaterial.vertexShader = shaders['glsl/eye.vs.glsl'];
  eyeMaterial.fragmentShader = shaders['glsl/eye.fs.glsl'];

  coneMaterial.vertexShader = shaders['glsl/cone.vs.glsl'];
  coneMaterial.fragmentShader = shaders['glsl/cone.fs.glsl'];

  boxMaterial.vertexShader = shaders['glsl/box.vs.glsl'];
  boxMaterial.fragmentShader = shaders['glsl/box.fs.glsl'];

  hitboxMaterial.vertexShader = shaders['glsl/hitbox.vs.glsl'];
  hitboxMaterial.fragmentShader = shaders['glsl/hitbox.fs.glsl'];
});

// Load and place the Armadillo geometry.
loadAndPlaceOBJ('obj/armadillo.obj', armadilloMaterial, armadilloFrame, function (armadillo) {
  armadillo.rotation.y = Math.PI;
  armadillo.position.y = 5.3
  armadillo.scale.set(0.1, 0.1, 0.1);
});

// Eyes (Q1c)
// Create the eye ball geometry
const eyeGeometry = new THREE.SphereGeometry(1.0, 32, 32);
const eye_l = new THREE.Mesh(eyeGeometry, eyeMaterial);
const eye_r = new THREE.Mesh(eyeGeometry, eyeMaterial);
rotationFrame.add(eye_l);
eye_l.position.set(-1.15, 7, -3.5);
rotationFrame.add(eye_r);
eye_r.position.set(1.15, 7, -3.5);

rotx = 0.0;
roty = 0.0;

let bCanJump = true;
let bArmadilloJumping = false;
let armaYVelocity = 0.0;
const jumpVelocity = 0.6;
const gravity = -0.015;

// Listen to keyboard events.
const keyboard = new THREEx.KeyboardState();
function checkKeyboard() {

  //Use keyboard.pressed to check for keyboard input. 
  //Example: keyboard.pressed("A") to check if the A key is pressed.
  if(keyboard.pressed("A"))
  {
    armadilloFrame.position.x += 0.43;
  }
  if(keyboard.pressed("D"))
  {
    armadilloFrame.position.x -= 0.43;
  }

  if(keyboard.pressed('space') && bCanJump)
  {
    bCanJump = false;
    armaYVelocity = jumpVelocity;
    bArmadilloJumping = true;
  }

  rotationFrame.rotation.order = 'YXZ';
  if(keyboard.pressed("Q"))
  {
    rotationFrame.rotation.z += 0.02;
    rotx += 0.02;
  }
  if(keyboard.pressed("E"))
  {
    rotationFrame.rotation.z -= 0.02;
    rotx -= 0.02
  }
  rotationMatrix.value.makeRotationFromEuler(new THREE.Euler(0, roty, rotx, 'YXZ'));

  // The following tells three.js that some uniforms might have changed.
  armadilloMaterial.needsUpdate = true;
  sphereMaterial.needsUpdate = true;
  eyeMaterial.needsUpdate = true;
  coneMaterial.needsUpdate = true;
  hitboxMaterial.needsUpdate = true;
  boxMaterial.needsUpdate = true;
}

// Create the icecream scoop geometry
// https://threejs.org/docs/#api/en/geometries/SphereGeometry
const sphereGeometry = new THREE.SphereGeometry(1.0, 32.0, 32.0);
const coneGeometry = new THREE.ConeGeometry(1, 3, 32);
const boxGeometry = new THREE.BoxGeometry(12, 15, 5);
const tallboxGeometry = new THREE.BoxGeometry(12, 16, 5);

const armadilloHitboxGeometry = new THREE.BoxGeometry(8, 8, 0.6);
armadilloHitboxGeometry.computeBoundingBox();
const armadilloHitbox = new THREE.Mesh(armadilloHitboxGeometry, hitboxMaterial);
armadilloHitbox.material.transparent = true;
armadilloHitbox.position.y = 4;
armadilloFrame.add(armadilloHitbox);

let icecreams = [];
let obstacles = [];
let time1 = 2;
let score = 0;
document.getElementById("info").innerHTML = "SCORE: " + score;
let bStopGame = false;

function spawnIcecream(xpos)
{
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  cone.rotation.set(Math.PI, 0, 0);
  cone.position.set(xpos, 3, 500);
  sphere.position.set(0, -2, 0);
  cone.add(sphere);
  scene.add(cone);
  icecreams.push(cone);
}

function spawnObstacle(xpos, tall)
{
  let box;
  if(tall)
  {
    box = new THREE.Mesh(tallboxGeometry, boxMaterial)
    box.position.set(xpos, 8, 500);
  }
  else
  {
    box = new THREE.Mesh(boxGeometry, boxMaterial)
    box.position.set(xpos, 0, 500);
  }
  scene.add(box);
  obstacles.push(box);
}

let moveUnitsPerTick = 0.7;
const distanceBetweenRows = 100;

function update() {
  checkKeyboard();

  if(bArmadilloJumping)
  {
    armaYVelocity += gravity;
    armadilloFrame.position.y += armaYVelocity;

    // check if landed
    if(armadilloFrame.position.y < 0.0)
    {
      armadilloFrame.position.y = 0.0;
      bCanJump = true;
      bArmadilloJumpin = false;
    }
  }

  if(moveUnitsPerTick < 1.3)
  {
    moveUnitsPerTick += 0.0002;
  }
  

  time1 -= 1/60;
  let timeBetweenRows = distanceBetweenRows / moveUnitsPerTick / 60.0;
  if(time1 < 0)
  {
    const roll = Math.floor(Math.random() * 20);


    switch(roll) {
      case 0:
        spawnObstacle(-16, true);
        spawnIcecream(0);
        spawnObstacle(16, true);
        break;
      case 1:
        spawnObstacle(-16);
        spawnIcecream(0);
        spawnObstacle(16);
        break;
      case 2:
        spawnObstacle(-16);
        spawnIcecream(0);
        spawnObstacle(16, true);
        break;
      case 4:
        spawnObstacle(-16, true);
        spawnIcecream(0);
        spawnObstacle(16);
        break;

      case 5:
        spawnObstacle(0, true);
        spawnIcecream(-16);
        spawnObstacle(16, true);
        break;
      case 6:
        spawnObstacle(0);
        spawnIcecream(-16);
        spawnObstacle(16);
        break;
      case 7:
        spawnObstacle(0);
        spawnIcecream(-16);
        spawnObstacle(16, true);
        break;
      case 8:
        spawnObstacle(0, true);
        spawnIcecream(-16);
        spawnObstacle(16);
        break;

      case 9:
        spawnObstacle(0, true);
        spawnIcecream(16);
        spawnObstacle(-16, true);
        break;
      case 10:
        spawnObstacle(0);
        spawnIcecream(16);
        spawnObstacle(-16);
        break;
      case 11:
        spawnObstacle(0);
        spawnIcecream(16);
        spawnObstacle(-16, true);
        break;
      case 12:
        spawnObstacle(0, true);
        spawnIcecream(16);
        spawnObstacle(-16);
        break;

      case 13:
        spawnObstacle(-16, true);
        spawnObstacle(0);
        spawnObstacle(16, true);
        break;
      case 14:
        spawnObstacle(-16);
        spawnObstacle(0);
        spawnObstacle(16);
        break;
      case 15:
        spawnObstacle(-16);
        spawnObstacle(0);
        spawnObstacle(16, true);
        break;
      case 16:
        spawnObstacle(-16, true);
        spawnObstacle(0);
        spawnObstacle(16);
        break;

      case 17:
        spawnObstacle(-16, true);
        spawnObstacle(0);
        spawnObstacle(16, true);
        break;
      case 18:
        spawnObstacle(-16);
        spawnObstacle(0, true);
        spawnObstacle(16, true);
        break;
      case 19:
        spawnObstacle(-16, true);
        spawnObstacle(0, true);
        spawnObstacle(16);
        break;
      default:
        spawnObstacle(-16);
        spawnIcecream(0);
        spawnObstacle(16);
    }

    time1 = timeBetweenRows;
  }


  let armaHitBox3 = new THREE.Box3().setFromObject(armadilloHitbox);

  for(let i = 0; i < icecreams.length; ++i)
  {
    icecreams[i].position.z -= moveUnitsPerTick;
    let icecream_hitbox = new THREE.Box3().setFromObject(icecreams[i]);

    if(icecream_hitbox.intersectsBox(armaHitBox3))
    {
      score += 1;
      scene.remove(icecreams[i]);
      document.getElementById("info").innerHTML = "SCORE: " + score;
      icecreams.splice(i, 1); 
      --i;
    }
    else if(icecreams[i].position.z < -50)
    {
      scene.remove(icecreams[i]);
      icecreams.splice(i, 1);
      --i;
    }
  }

  for(let i = 0; i < obstacles.length; ++i)
  {
    obstacles[i].position.z -= moveUnitsPerTick;
    let obstacle_hitbox = new THREE.Box3().setFromObject(obstacles[i]);

    if(obstacle_hitbox.intersectsBox(armaHitBox3))
    {
      bStopGame = true;
      document.getElementById("info").innerHTML = "GAMEOVER SCORE: " + score;
    }

    if(obstacles[i].position.z < -50)
    {
      scene.remove(obstacles[i]);
      obstacles.splice(i, 1);
      --i;
    }
  }

  // HINT: Use one of the lookAt funcitons available in three.js to make the eyes look at the ice cream.
  // eye_l.lookAt(cone.position);
  // eye_r.lookAt(cone.position);

  // Requests the next update call, this creates a loop
  if(bStopGame == false)
  {
    requestAnimationFrame(update);
  }
  renderer.render(scene, camera);
}

fig8_time = 0
function figure8() {
  // Q1(b) Use fig8_time to animate the ice cream cone.
  // When you define fig8_time as a uniform, remember to replace this with its value
  fig8_time += 1/60; //Assumes 60 frames per second

  const fig8_duration = 8.0;
  const fig8_x_distance = 9.0;
  const fig8_y_distance = 4.0;
  const fig8_y_default = 10.0;

  // fig8_xtheta = [0, 2PI]
  const fig8_xtheta = 2.0*Math.PI * ((fig8_time % fig8_duration) / fig8_duration);
  const fig8_xscale = Math.sin(fig8_xtheta);
  const fig8_xpos = fig8_xscale * fig8_x_distance;
  cone.position.x = fig8_xpos;
  
  const fig8_ytheta = 2.0*Math.PI * ((fig8_time % (fig8_duration/2)) / (fig8_duration/2));
  const fig8_yscale = Math.sin(fig8_ytheta);
  const fig8_ypos = fig8_yscale * fig8_y_distance;
  cone.position.y = fig8_ypos + fig8_y_default;
}

// Start the animation loop.
update();
