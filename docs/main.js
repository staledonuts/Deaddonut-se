const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

const BG_COLOR = '#1a1a2e';
const logoImg = new Image();
logoImg.src = "https://raw.githubusercontent.com/staledonuts/Deaddonut-se/main/docs/images/logo.png";

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

Module.onRuntimeInitialized = () => {
    //console.log("WASM Laddat och redo!");
    document.fonts.ready.then(() => {
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
            send_mouse_move(e.clientX - rect.left, e.clientY - rect.top);
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

            ctx.fillStyle = BG_COLOR;
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
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, cr);
                    ctx.fill();
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
                    ctx.font = `${fontSize}px "Pixelify Sans", sans-serif`;
                    ctx.textBaseline = "middle";
                    ctx.fillText(str, x, y + (h / 2));
                }
                else if (type === CLAY_RENDER_COMMAND_TYPE_IMAGE) {
                    const x = memoryView.getFloat32(ptr_x, true);
                    const y = memoryView.getFloat32(ptr_y, true);
                    const w = memoryView.getFloat32(ptr_w, true);
                    const h = memoryView.getFloat32(ptr_h, true);
                    const imageId = memoryView.getFloat32(ptr_r, true);
                    
                    if (imageId === 1 && logoImg.complete) {
                        ctx.drawImage(logoImg, x, y, w, h);
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