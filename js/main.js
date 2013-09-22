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
var shape_type = 'tesseract';

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

  camera.position.set(200, 300, 200);
  camera.lookAt(scene.position);

  // Initialize the renderer
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setClearColor(0x00000);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // scene.fog = new THREE.Fog(0xdbf7ff, 300, 700);
  // post processing
  /*composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  var fxaa = new THREE.ShaderPass(THREE.FXAAShader);
  fxaa.uniforms['resolution'].value = new THREE.Vector2(1/window.innerWidth, 1/window.innerHeight);
  composer.addPass(fxaa);
*/
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

var floorMaterial;
var projection;
// var floor;
function initGeometry(){
//  floorTexture = new THREE.ImageUtils.loadTexture( "textures/tile.jpg" );
//  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
//  floorTexture.repeat.set(50, 50);
//  floorTexture.anisotropy = 8;
//
//  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, transparent:true, opacity:0.80 } );
//  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
//  floor = new THREE.Mesh(floorGeometry, floorMaterial);
//  floor.rotation.x = -Math.PI / 2;
//  floor.position.y = -150;
//  scene.add(floor);
  var vertices = shapes[shape_type].vertices;
  var edges = shapes[shape_type].edges;
  hyper_shape = new Shape(vertices, edges);

  projection = hyper_shape.project();
  scene.add(projection);
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

  document.getElementById("shapes").addEventListener("click", function(){
    var el = document.getElementById("shapes-text");
    el.style.display = (el.style.display == "none") ? "" : "none";
  });

  var elems = document.getElementsByClassName('shape_type');
  for (var i=0; i<elems.length; i++){
    var elem = elems[i];
    elem.addEventListener('click', function(){
      shape_type = this.id;

      var vertices = shapes[shape_type].vertices;
      var edges = shapes[shape_type].edges;
      hyper_shape = new Shape(vertices, edges);
    });
  }
  window.addEventListener('resize', onResize, false);

  time          = Date.now();
  bodyAngle     = 0;
  bodyAxis      = new THREE.Vector3(0, 0, 1);
  bodyPosition  = new THREE.Vector3(0, 0, 0);

  initScene();
  initGeometry();
  initLights();

  oculusBridge = new OculusBridge({
    "debug" : true,
    "onOrientationUpdate" : bridgeOrientationUpdated,
    "onConfigUpdate"      : bridgeConfigUpdated
  });
  oculusBridge.connect();
  //var oculusConfig = oculusBridge.getConfiguration();
  //oculusConfig.lensSeparationDistance *= 2;
  //oculusConfig.interpupillaryDistance *= 2;
//debugger
  //oculusBridge.updateConfig(oculusConfig);
    var options = {worldFactor: 500.0};
  riftCam = new THREE.OculusRiftEffect(renderer, options);
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

var numToAxis = {
  1:'xy',
  2:'yz',
  3:'xz',
  4:'xw',
  5:'yw',
  6:'zw'
};

var keys = [];
function onKeyDown(event) {
  // prevent repeat keystrokes.
 keys[event.keyCode] = true;
}

function onKeyUp(event) {
  keys[event.keyCode] = false;
}

function updateInput(delta) {
 for(var i=0; i<keys.length; i++){
    if(i >= 48 && i <= 57 && keys[i]){
      var axis = numToAxis[i - 48];
      if(keys[16]){
        hyper_shape.rotate(axis, -Math.PI*1/600);
      }
      else{
        hyper_shape.rotate(axis, Math.PI*1/600);
      }

    }
  }

  scene.remove(projection);
  projection = hyper_shape.project();
  scene.add(projection);

  if(!useRift) {
    return;
  }

  var step = 100 * delta;

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
