import * as THREE from 'three';

let camera, scene, renderer;
let mesh;

init();

function init() 
{

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.z = 2;
    // Vertex Shader
    const vertexShader = `
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;

        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() 
        {
            vUv = uv;
            vNormal = normal;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`;

    // Fragment Shader
    const fragmentShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() 
        {
            // Example: Visualize normals
            vec3 color = vNormal * 0.5 + 0.5; // Map normals from [-1, 1] to [0, 1]
            gl_FragColor = vec4(color, 1.0);
        }`;
    scene = new THREE.Scene();

    const texture = new THREE.TextureLoader().load( 'textures/box.png' );
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.BoxGeometry();
    //const material = new THREE.MeshBasicMaterial( { map: texture } );
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() 
{

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() 
{

    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;

    renderer.render( scene, camera );

}