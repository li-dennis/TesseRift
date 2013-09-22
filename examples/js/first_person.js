var renderer, camera;
var scene, element;
var ambient, point;
var aspectRatio, windowHalf;
var mouse, time;

var controls;
var clock;

var useRift = false;

var riftCam;

var ground, groundGeometry, groundMaterial;

var bodyAngle;
var bodyAxis;
var bodyPosition;
var viewAngle;

var oculusBridge;
var hyper_shape;

var vertices = [
    { x:  1, y:  1, z:  1, w:  1 },
    { x:  1, y:  1, z:  1, w: -1 },
    { x:  1, y:  1, z: -1, w:  1 },
    { x:  1, y:  1, z: -1, w: -1 },
    { x:  1, y: -1, z:  1, w:  1 },
    { x:  1, y: -1, z:  1, w: -1 },
    { x:  1, y: -1, z: -1, w:  1 },
    { x:  1, y: -1, z: -1, w: -1 },
    { x: -1, y:  1, z:  1, w:  1 },
    { x: -1, y:  1, z:  1, w: -1 },
    { x: -1, y:  1, z: -1, w:  1 },
    { x: -1, y:  1, z: -1, w: -1 },
    { x: -1, y: -1, z:  1, w:  1 },
    { x: -1, y: -1, z:  1, w: -1 },
    { x: -1, y: -1, z: -1, w:  1 },
    { x: -1, y: -1, z: -1, w: -1 }
  ];

var edges = [
    [ 0,  1], [ 0,  2], [ 0,  4], [ 0,  8],
              [ 1,  3], [ 1,  5], [ 1,  9],
              [ 2,  3], [ 2,  6], [ 2, 10],
                        [ 3,  7], [ 3, 11],
              [ 4,  5], [ 4,  6], [ 4, 12],
                        [ 5,  7], [ 5, 13],
                        [ 6,  7], [ 6, 14],
                                  [ 7, 15],
              [ 8,  9], [ 8, 10], [ 8, 12],
                        [ 9, 11], [ 9, 13],
                        [10, 11], [10, 14],
                                  [11, 15],
                        [12, 13], [12, 14],
                                  [13, 15],
                                  [14, 15]
  ];

// Map for key states
var keys = [];
for(var i = 0; i < 130; i++){
  keys.push(false);
}


function initScene() {
  clock = new THREE.Clock();
  mouse = new THREE.Vector2(0, 0);

  windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
  aspectRatio = window.innerWidth / window.innerHeight;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 10000);
  camera.useQuaternion = true;

  camera.position.set(3, 3, 3);
  camera.lookAt(scene.position);

  // Initialize the renderer
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setClearColor(0x00000);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // scene.fog = new THREE.Fog(0xdbf7ff, 300, 700);

  element = document.getElementById('viewport');
  element.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera);
}

function initLights(){
  ambient = new THREE.AmbientLight(0x222222);
  scene.add(ambient);

  point = new THREE.DirectionalLight( 0xffffff, 1, 0, Math.PI, 1 );
  point.position.set( -250, 250, 150 );

  scene.add(point);
}

var floortexture;
var lines;
function initGeometry(){
  hyper_shape = new Shape(vertices, edges);

  hyper_shape.rotate('xw', Math.PI*1/4);

  lines = hyper_shape.project();
  scene.add(lines);
}


function init(){
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
  document.addEventListener('mousedown', onMouseDown, false);
  document.addEventListener('mousemove', onMouseMove, false);

  document.getElementById("toggle-render").addEventListener("click", function(){
    useRift = !useRift;
    onResize();
  });

  window.addEventListener('resize', onResize, false);

  time          = Date.now();
  bodyAngle     = 0;
  bodyAxis      = new THREE.Vector3(0, 1, 0);
  bodyPosition  = new THREE.Vector3(0, 15, 0);

  initScene();
  initGeometry();
  initLights();

  oculusBridge = new OculusBridge({
    "debug" : true,
    "onOrientationUpdate" : bridgeOrientationUpdated,
    "onConfigUpdate"      : bridgeConfigUpdated
  });
  oculusBridge.connect();

  riftCam = new THREE.OculusRiftEffect(renderer);
}

function onResize() {
  if(!useRift){
    windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    aspectRatio = window.innerWidth / window.innerHeight;

    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  } else {
    riftCam.setSize(window.innerWidth, window.innerHeight);
  }
}

function bridgeConfigUpdated(config){
  console.log("Oculus config updated.");
  riftCam.setHMD(config);
}

function bridgeOrientationUpdated(quatValues) {

  // Do first-person style controls (like the Tuscany demo) using the rift and keyboard.

  // TODO: Don't instantiate new objects in here, these should be re-used to avoid garbage collection.

  // make a quaternion for the the body angle rotated about the Y axis.
  var quat = new THREE.Quaternion();
  quat.setFromAxisAngle(bodyAxis, bodyAngle);

  // make a quaternion for the current orientation of the Rift
  var quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w);

  // multiply the body rotation by the Rift rotation.
  quat.multiply(quatCam);

  // Apply the combined look/body angle to the camera.
  camera.quaternion.copy(quat);
}

function onMouseMove(event) {
  mouse.set( (event.clientX / window.innerWidth - 0.5) * 2, (event.clientY / window.innerHeight - 0.5) * 2);
}

function onMouseDown(event) {
  // Stub
}


function onKeyDown(event) {
 // Stub
}


function onKeyUp(event) {
  keys[event.keyCode] = false;
}


function updateInput(delta) {
  if(!useRift) {
    return;
  }

  var step = 0.1 * delta;

  if(keys[87] || keys[38]){ // W or UP
    camera.translateZ(-step)
  }

  if(keys[83] || keys[40]){ // S or DOWN
    camera.translateZ(step)
  }

  if(keys[65] || keys[37]){ // A or LEFT
    camera.translateX(-step)
  }

  if(keys[68] || keys[39]){ // D or RIGHT
    camera.translateX(step)
  }
}


function animate() {
  var delta = clock.getDelta();
  time += delta;

  updateInput(delta);
//  var bounds = 600;
//  for(var i = 0; i < dataPackets.length; i++){
//    dataPackets[i].obj.position.add( dataPackets[i].speed);
//    if(dataPackets[i].obj.position.x < -bounds) {
//      dataPackets[i].obj.position.x = bounds;
//    } else if(dataPackets[i].obj.position.x > bounds){
//      dataPackets[i].obj.position.x = -bounds;
//    }
//    if(dataPackets[i].obj.position.z < -bounds) {
//      dataPackets[i].obj.position.z = bounds;
//    } else if(dataPackets[i].obj.position.z > bounds){
//      dataPackets[i].obj.position.z = -bounds;
//    }
//  }

  requestAnimationFrame(animate);
  render();
}


function render() {
  if(useRift){
    riftCam.render(scene, camera);
  }else{
    controls.update();
    renderer.render(scene, camera);
  }
}


window.onload = function() {
  init();
  animate();
}
