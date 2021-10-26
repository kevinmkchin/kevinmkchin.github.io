/**
 * UBC CPSC 314
 * Assignment 1 Template setup
 */

/**
 * Creates a basic scene and returns necessary objects
 * to manipulate the scene, camera and render context.
 */
function setup() {
    // Check WebGL Version
    if (!WEBGL.isWebGL2Available()) {
        document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    }

    // Get the canvas element and its drawing context from the HTML document.
    const canvas = document.getElementById('webglcanvas');
    const context = canvas.getContext('webgl2');

    // Construct a THREEjs renderer from the canvas and context.
    const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true });
    renderer.setClearColor(0X80CEE1); // blue background colour
    const scene = new THREE.Scene();

    // Set up the camera.
    const camera = new THREE.PerspectiveCamera(30.0, 1.0, 0.05, 4000.0); // view angle, aspect ratio, near, far
    camera.position.set(0.0, 40.0, -135.0);
    camera.lookAt(new THREE.Vector3(0,0, 100));
    scene.add(camera);

    // Setup orbit controls for the camera.
    // const controls = new THREE.OrbitControls(camera, canvas);
    // controls.screenSpacePanning = true;
    // controls.damping = 0.2;
    // controls.autoRotate = false;

    // Update projection matrix based on the windows size.
    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    // World Coordinate Frame: other objects are defined with respect to it.
    const worldFrame = new THREE.Object3D();
    scene.add(worldFrame);

    // Diffuse texture map (this defines the main colors of the floor)
    let floorDiff = new THREE.TextureLoader().load('images/cobblestone_floor_diff.jpg');
    floorDiff.wrapS = floorDiff.wrapT = THREE.RepeatWrapping;
    floorDiff.repeat.set(2.5,25);
    floorDiff.anisotropy = 16;

    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorDiff,
        side: THREE.DoubleSide
    });
    const floorGeometry = new THREE.PlaneGeometry(50.0, 500.0);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2.0;
    floor.position.y = -0.3;
    floor.position.z = 200;
    scene.add(floor);
    floor.parent = worldFrame;

    // Cast a weak ambient light to make the floor visible.
    const light = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(light);

    return {
        renderer,
        scene,
        camera,
        worldFrame,
    };
}

/**
 * Utility function that loads obj files using THREE.OBJLoader
 * and places them in the scene using the given callback `place`.
 * 
 * The variable passed into the place callback is a THREE.Object3D.
 */
function loadAndPlaceOBJ(file, material, parentObject, place,) {
    const manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    const onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = xhr.loaded / xhr.total * 100.0;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    const loader = new THREE.OBJLoader(manager);
    loader.load(file, function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });
        parentObject.add(object);
        object.parent = parentObject;
        place(object);
    }, onProgress);

}
