const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

const BG_COLOR = '#1a1a2e';
const images = {};
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isUsingGyro = false;

function clamp(val) {
    return Math.max(0, Math.min(1, val));
}

function loadImage(id, url) {
    const img = new Image();
    img.src = url;
    images[id] = img;
}
loadImage(1, "https://raw.githubusercontent.com/staledonuts/Deaddonut-se/main/docs/images/logo.png");
loadImage(99, "https://raw.githubusercontent.com/staledonuts/Deaddonut-se/main/docs/images/profilepic.jpg");
const baseUrl = "https://raw.githubusercontent.com/staledonuts/Deaddonut-se/main/docs/images/images/";
const portfolioFiles = ["mclegends-ich000.png", "mclegends-ich001.png"];

portfolioFiles.forEach((filename, index) => {
    loadImage(index + 2, baseUrl + filename); // IDs start at 2
});




function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);




const CLAY_RENDER_COMMAND_TYPE_NONE = 0;
const CLAY_RENDER_COMMAND_TYPE_RECTANGLE = 1;
const CLAY_RENDER_COMMAND_TYPE_BORDER = 2;
const CLAY_RENDER_COMMAND_TYPE_TEXT = 3;
const CLAY_RENDER_COMMAND_TYPE_IMAGE = 4;
const CLAY_RENDER_COMMAND_TYPE_SCISSOR_START = 5;
const CLAY_RENDER_COMMAND_TYPE_SCISSOR_END = 6;
const CLAY_RENDER_COMMAND_TYPE_CUSTOM = 7;

Module.onRuntimeInitialized = () => 
{
    document.fonts.ready.then(() => 
    {
        const init_ui = Module.cwrap('init_ui', 'void', ['number', 'number']);
        const process_frame = Module.cwrap('process_frame', 'void', ['number']);
        const reset_command_iterator = Module.cwrap('reset_command_iterator', 'void', []);
        const send_mouse_move = Module.cwrap('send_mouse_move', 'void', ['number', 'number']);
        const send_mouse_down = Module.cwrap('send_mouse_down', 'void', ['number', 'number', 'number']);
        const send_mouse_up = Module.cwrap('send_mouse_up', 'void', ['number', 'number', 'number']);
        const update_resolution = Module.cwrap('update_resolution', 'void', ['number', 'number']);
        const send_mouse_wheel = Module.cwrap('send_mouse_wheel', 'void', ['number', 'number']);

        const get_next_command = Module.cwrap('get_next_command', 'number', 
            ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);

        init_ui(canvas.width, canvas.height);

        canvas.addEventListener('wheel', (e) => {
            send_mouse_wheel(e.deltaX, e.deltaY);
        }, { passive: true });
        
        window.addEventListener('resize', () => {
            update_resolution(canvas.width, canvas.height);
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;

            if (!isUsingGyro) {
                mouseX = localX;
                mouseY = localY;
            }
            
            send_mouse_move(localX, localY);
        });

        window.addEventListener('deviceorientation', (e) => {
            if (e.gamma === null || e.beta === null) return;

            isUsingGyro = true; // Lock out the mouse parallax!

            const maxTilt = 45; 
            let xTilt = Math.max(-maxTilt, Math.min(maxTilt, e.gamma)) / maxTilt;
            let yTilt = Math.max(-maxTilt, Math.min(maxTilt, e.beta - 45)) / maxTilt;

            mouseX = (window.innerWidth / 2) + (xTilt * window.innerWidth / 2);
            mouseY = (window.innerHeight / 2) + (yTilt * window.innerHeight / 2);
        });

        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            send_mouse_down(e.clientX - rect.left, e.clientY - rect.top, 0);
        });

        canvas.addEventListener('mouseup', (e) => {
            const rect = canvas.getBoundingClientRect();
            send_mouse_up(e.clientX - rect.left, e.clientY - rect.top, 0);
        });

        const ptr_type = Module._malloc(4);
        const ptr_x = Module._malloc(4);
        const ptr_y = Module._malloc(4);
        const ptr_w = Module._malloc(4);
        const ptr_h = Module._malloc(4);
        const ptr_r = Module._malloc(4);
        const ptr_g = Module._malloc(4);
        const ptr_b = Module._malloc(4);
        const ptr_a = Module._malloc(4);
        const ptr_cr = Module._malloc(4);
        const text_buf = Module._malloc(256);
        let lastTime = 0;

        function renderLoop(timestamp) 
        {
            if (lastTime === 0) {
                lastTime = timestamp;
            }

            const deltaTime = (timestamp - lastTime) / 1000.0;
            lastTime = timestamp;

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const offsetX = (mouseX - centerX) * 0.15; 
            const offsetY = (mouseY - centerY) * 0.15;

            const startX = canvas.width + offsetX;
            const startY = canvas.height + offsetY;
            const endX = 0 + offsetX;
            const endY = 0 + offsetY;

            const grad = ctx.createLinearGradient(startX, startY, endX, endY);

            const time = timestamp * 0.0004;
            
            const step1 = clamp(0.20 + Math.sin(time * 0.9) * 0.05);
            const step2 = clamp(0.40 + Math.cos(time * 0.7) * 0.05);
            const step3 = clamp(0.60 + Math.sin(time * 1.1) * 0.05);
            const step4 = clamp(0.80 + Math.cos(time * 1.3) * 0.05);

            const c1 = 'rgb(37, 21, 63)';
            const c2 = 'rgb(79, 54, 118)';
            const c3 = 'rgb(134, 96, 175)';
            const c4 = 'rgb(198, 148, 217)';
            const c5 = 'rgb(239, 221, 238)';

            grad.addColorStop(0, c1);
            grad.addColorStop(step1, c1);

            grad.addColorStop(step1, c2);
            grad.addColorStop(step2, c2);

            grad.addColorStop(step2, c3);
            grad.addColorStop(step3, c3);

            grad.addColorStop(step3, c4);
            grad.addColorStop(step4, c4);

            grad.addColorStop(step4, c5);
            grad.addColorStop(1, c5);

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            process_frame(deltaTime);
            reset_command_iterator();

            if (typeof HEAPU8 === 'undefined' || !HEAPU8.buffer) {
                console.error("Kritiskt fel: Hittar inte HEAPU8-minnet.");
                return;
            }
            const memoryView = new DataView(HEAPU8.buffer);
            
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.clip();

            while (get_next_command(ptr_type, ptr_x, ptr_y, ptr_w, ptr_h, ptr_r, ptr_g, ptr_b, ptr_a, ptr_cr, text_buf)) 
            {
                const type = memoryView.getInt32(ptr_type, true);
                
                if (type === CLAY_RENDER_COMMAND_TYPE_RECTANGLE) {
                    const x = memoryView.getFloat32(ptr_x, true);
                    const y = memoryView.getFloat32(ptr_y, true);
                    const w = memoryView.getFloat32(ptr_w, true);
                    const h = memoryView.getFloat32(ptr_h, true);
                    const r = memoryView.getFloat32(ptr_r, true);
                    const g = memoryView.getFloat32(ptr_g, true);
                    const b = memoryView.getFloat32(ptr_b, true);
                    const a = memoryView.getFloat32(ptr_a, true);
                    const cr = memoryView.getFloat32(ptr_cr, true);
                    
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 15;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 8;
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, cr);
                    ctx.fill();
                    
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                } 
                else if (type === CLAY_RENDER_COMMAND_TYPE_TEXT) {
                    const x = memoryView.getFloat32(ptr_x, true);
                    const y = memoryView.getFloat32(ptr_y, true);
                    const h = memoryView.getFloat32(ptr_h, true);
                    const r = memoryView.getFloat32(ptr_r, true);
                    const g = memoryView.getFloat32(ptr_g, true);
                    const b = memoryView.getFloat32(ptr_b, true);
                    const a = memoryView.getFloat32(ptr_a, true);
                    const fontSize = memoryView.getFloat32(ptr_cr, true);

                    let len = 0;
                    while (memoryView.getUint8(text_buf + len) !== 0) {
                        len++;
                    }

                    const textArray = new Uint8Array(HEAPU8.buffer, text_buf, len);
                    const str = new TextDecoder('utf-8').decode(textArray);
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                    ctx.font = `${fontSize}px "Nunito", sans-serif`;
                    ctx.textBaseline = "middle";
                    ctx.fillText(str, x, y + (h / 2));
                }
                else if (type === CLAY_RENDER_COMMAND_TYPE_IMAGE) 
                {
                    const x = memoryView.getFloat32(ptr_x, true);
                    const y = memoryView.getFloat32(ptr_y, true);
                    const w = memoryView.getFloat32(ptr_w, true);
                    const h = memoryView.getFloat32(ptr_h, true);
                    const imageId = memoryView.getFloat32(ptr_r, true);
                    const cr = memoryView.getFloat32(ptr_cr, true); 
                    
                    const img = images[imageId];
                    
                    if (img && img.complete && img.naturalWidth > 0) 
                    {
                        ctx.save();
                        
                        ctx.beginPath();
                        ctx.roundRect(x, y, w, h, cr);
                        ctx.clip();
                        
                        ctx.drawImage(img, x, y, w, h);
                        
                        ctx.restore();
                    }
                }
                else if (type === CLAY_RENDER_COMMAND_TYPE_SCISSOR_START) {
                    const x = memoryView.getFloat32(ptr_x, true);
                    const y = memoryView.getFloat32(ptr_y, true);
                    const w = memoryView.getFloat32(ptr_w, true);
                    const h = memoryView.getFloat32(ptr_h, true);
                    
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(x, y, w, h);
                    ctx.clip();
                }
                else if (type === CLAY_RENDER_COMMAND_TYPE_SCISSOR_END) {
                    ctx.restore();
                }
            }

            requestAnimationFrame(renderLoop);
        }

        renderLoop(lastTime);
    });
};