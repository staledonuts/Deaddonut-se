import * as THREE from 'three';

let camera, scene, renderer;
let mesh;
let uniforms;

init();

function init() 
{

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.z = 2;
    // Vertex Shader
    const vertexShader = `
        varying vec2 vMainUv;
        varying vec2 vDistortUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform float uTime;

        float OutBounce(float t)
        {
            float div = 2.75;
            float mult = 7.5625;

            if (t < 1.0 / div)
            {
                return mult * t * t;
            }
            else if (t < 2.0 / div)
            {
                t -= 1.5 / div;
                return mult * t * t + 0.75;
            }
            else if (t < 2.5 / div)
            {
                t -= 2.25 / div;
                return mult * t * t + 0.9375;
            }
            else
            {
                t -= 2.625 / div;
                return mult * t * t + 0.984375;
            }
        }

        float InBounce(float t)
        {
            return 1.0 - OutBounce(1.0 - t);
        }

        float InOutBounce(float t)
        {
            if (t < 0.5) 
            {
                return InBounce(t * 2.0) / 2.0;
            }
            return 1.0 - InBounce((1.0 - t) * 2.0) / 2.0;
        }
        
        void main() 
        {
            vMainUv = uv;
            vDistortUv = uv + InOutBounce(uTime);
            vNormal = normal;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`;

    // Fragment Shader
    const fragmentShader = `
        varying vec2 vMainUv;
        varying vec2 vDistortUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform sampler2D uMainTexture;
        uniform sampler2D uDistortTexture;


        void main() 
        {
            vec4 distortColor = texture2D(uDistortTexture, vDistortUv);
            vec4 textureColor = texture2D(uMainTexture, vMainUv * distortColor.xy);
            vec3 normalColor = vNormal * 0.5 + 0.5;
            vec3 finalColor = textureColor.rgb * normalColor;
            gl_FragColor = vec4(finalColor, 1.0);
        }`;
    scene = new THREE.Scene();

    const mainTexture = new THREE.TextureLoader().load( 'textures/box.png' );
    const distortTexture = new THREE.TextureLoader().load( 'textures/box.png' );
    mainTexture.colorSpace = THREE.SRGBColorSpace;
    distortTexture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.BoxGeometry();
    //const material = new THREE.MeshBasicMaterial( { map: texture } );
    uniforms =
    {
        uMainTexture: { value: mainTexture }, // Texture uniform
        uDistortTexture: { value: distortTexture }, // Texture uniform
        uTime: { value: 0.0 }        // Time uniform (initialize to 0)
    };

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
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
    mesh.material.uniforms.uTime.value = performance.now();
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;

    renderer.render( scene, camera );

}