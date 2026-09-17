const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');
const BG_COLOR = '#1a1a2e';
const images = {};
let targetMouseX = window.innerWidth / 2;
let targetMouseY = window.innerHeight / 2;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isUsingGyro = false;
let isTouchDevice = false;

function clamp(val) {
    return Math.max(0, Math.min(1, val));
}

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

Module.onRuntimeInitialized = async () => {
    try {
        if (document.fonts) {
            await document.fonts.load('24px "Lexend-Regular"');
            await document.fonts.load('28px "Lexend-Regular"');
            await document.fonts.load('32px "Lexend-Regular"');
            await document.fonts.ready;
        }
    } catch (e) {
        console.warn("Font load error:", e);
    }

    if (document.fonts) {
        document.fonts.ready.then(() => {
            Module._textWidthCache = {};
        });
    }

    const init_ui = Module.cwrap('init_ui', 'void', ['number', 'number']);
    const process_frame = Module.cwrap('process_frame', 'void', ['number']);
    const reset_command_iterator = Module.cwrap('reset_command_iterator', 'void', []);
    const send_mouse_move = Module.cwrap('send_mouse_move', 'void', ['number', 'number']);
    const send_mouse_down = Module.cwrap('send_mouse_down', 'void', ['number', 'number', 'number']);
    const send_mouse_up = Module.cwrap('send_mouse_up', 'void', ['number', 'number', 'number']);
    const update_resolution = Module.cwrap('update_resolution', 'void', ['number', 'number']);
    const send_mouse_wheel = Module.cwrap('send_mouse_wheel', 'void', ['number', 'number']);
    const set_mobile_mode = Module.cwrap('set_mobile_mode', 'void', ['number']);
    const open_window_by_tag = Module.cwrap('open_window_by_tag', 'void', ['string']);

        const get_next_command = Module.cwrap('get_next_command', 'number',
            ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);

        init_ui(canvas.width, canvas.height);

        function handleHashRoute() {
            let tag = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
            if (!tag && window.location.search) {
                const params = new URLSearchParams(window.location.search);
                tag = params.get('page') || params.get('window') || params.get('tab') || '';
                if (!tag && window.location.search.startsWith('?')) {
                    tag = window.location.search.substring(1).split('&')[0].split('=')[0].toLowerCase();
                }
            }
            if (tag) {
                open_window_by_tag(tag);
            }
        }

        handleHashRoute();
        window.addEventListener('hashchange', handleHashRoute);

        function updateMobileState() {
            const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            set_mobile_mode(isMobile ? 1 : 0);
        }

        updateMobileState();

        window.addEventListener('resize', () => {
            updateMobileState();
            update_resolution(canvas.width, canvas.height);
        });

        let lastPinchDistance = null;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isTouchDevice = true;
            const rect = canvas.getBoundingClientRect();
            if (e.touches.length === 2) {
                lastPinchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            } else if (e.touches.length === 1) {
                lastPinchDistance = null;
                const touch = e.touches[0];
                send_mouse_down(touch.clientX - rect.left, touch.clientY - rect.top, 0);
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            if (e.touches.length === 2) {
                const currentDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                if (lastPinchDistance !== null && lastPinchDistance > 0) {
                    const deltaDist = currentDist - lastPinchDistance;
                    // deltaDist > 0 (spreading) = zoom in (send negative dy)
                    send_mouse_wheel(0, -deltaDist * 6.0);
                }
                lastPinchDistance = currentDist;

                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
                send_mouse_move(midX, midY);
            } else if (e.touches.length === 1) {
                lastPinchDistance = null;
                const touch = e.touches[0];
                const localX = touch.clientX - rect.left;
                const localY = touch.clientY - rect.top;

                send_mouse_move(localX, localY);
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            if (e.touches.length < 2) {
                lastPinchDistance = null;
            }
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                send_mouse_up(touch.clientX - rect.left, touch.clientY - rect.top, 0);
            }
        }, { passive: false });

        window.addEventListener('deviceorientation', (e) => {
            if (e.gamma === null || e.beta === null) return;

            isUsingGyro = true;

            const maxTilt = 45;
            let xTilt = Math.max(-maxTilt, Math.min(maxTilt, e.gamma)) / maxTilt;
            let yTilt = Math.max(-maxTilt, Math.min(maxTilt, e.beta - 45)) / maxTilt;

            targetMouseX = (window.innerWidth / 2) + (xTilt * window.innerWidth / 2);
            targetMouseY = (window.innerHeight / 2) + (yTilt * window.innerHeight / 2);
        });

        canvas.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                send_mouse_wheel(0, e.deltaY * 5.0);
            } else {
                send_mouse_wheel(e.deltaX, e.deltaY);
            }
        }, { passive: false });

        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            send_mouse_down(e.clientX - rect.left, e.clientY - rect.top, 0);
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;

            if (!isUsingGyro && !isTouchDevice) {
                targetMouseX = localX;
                targetMouseY = localY;
            }

            send_mouse_move(localX, localY);
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

        function renderCyberpunkButton(ctx, x, y, w, h, r, g, b, a, cr, hoverBlend, timestamp) {
            const alpha = a / 255;
            if (alpha <= 0.001) return;

            ctx.save();

            // 1. Warm ambient halo / glow behind the right side when hovered
            if (hoverBlend > 0.02) {
                const glowAlpha = 0.45 * hoverBlend * alpha;
                const glowRadius = Math.max(h * 1.2, 50);
                const glowGrad = ctx.createRadialGradient(
                    x + w - 2, y + h * 0.5, 6,
                    x + w + 16, y + h * 0.5, glowRadius
                );
                glowGrad.addColorStop(0, `rgba(${Math.min(255, r + 20)}, ${g}, ${b}, ${glowAlpha})`);
                glowGrad.addColorStop(0.4, `rgba(${r}, ${Math.max(0, g - 25)}, ${b}, ${glowAlpha * 0.45})`);
                glowGrad.addColorStop(1, `rgba(${r}, ${Math.max(0, g - 40)}, ${b}, 0)`);

                ctx.fillStyle = glowGrad;
                ctx.fillRect(x + w - 25, y - 25, glowRadius + 30, h + 50);
            }

            // 2. Base rounded button body
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, cr);
            ctx.fill();

            // Subtle border outline when unhovered / transitioning
            if (cr > 0 && hoverBlend < 0.95) {
                const borderAlpha = alpha * 0.45 * (1.0 - hoverBlend);
                if (borderAlpha > 0.01) {
                    ctx.strokeStyle = `rgba(${r * 0.5}, ${g * 0.5}, ${b * 0.5}, ${borderAlpha})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            // 3. Pixelated disintegration effect on the right edge
            if (hoverBlend > 0.05) {
                const timeSec = timestamp * 0.001;
                const seed = (Math.floor(y * 11) + Math.floor(x * 7)) % 1000;

                // Step 3A: Edge silhouette blocks attached directly to the right border
                const stepBlocks = [
                    { dy: 0.10, out: 4, size: 9 },
                    { dy: 0.25, out: 7, size: 12 },
                    { dy: 0.44, out: 5, size: 10 },
                    { dy: 0.62, out: 8, size: 13 },
                    { dy: 0.80, out: 4, size: 8 }
                ];

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                for (let i = 0; i < stepBlocks.length; i++) {
                    const sb = stepBlocks[i];
                    const bx = x + w - (sb.size * 0.5) + (sb.out * hoverBlend);
                    const by = y + (h - sb.size) * sb.dy;
                    ctx.fillRect(bx, by, sb.size, sb.size);
                }

                // Step 3B: Detached floating square particles
                const particles = [
                    // Layer 1: Close dense cluster (large pixels ~9-13px)
                    { ry: 0.16, dist: 13, size: 10, tone: 1.0, seed: 1.3 },
                    { ry: 0.30, dist: 19, size: 12, tone: 0.95, seed: 2.8 },
                    { ry: 0.46, dist: 16, size: 11, tone: 1.0, seed: 4.4 },
                    { ry: 0.64, dist: 22, size: 13, tone: 0.95, seed: 5.7 },
                    { ry: 0.76, dist: 15, size: 9, tone: 0.9, seed: 3.5 },

                    // Layer 2: Mid-distance scatter (~6-9px)
                    { ry: 0.08, dist: 26, size: 7, tone: 0.85, seed: 0.8 },
                    { ry: 0.24, dist: 31, size: 8, tone: 0.9, seed: 6.4 },
                    { ry: 0.38, dist: 36, size: 9, tone: 0.95, seed: 7.6 },
                    { ry: 0.54, dist: 29, size: 8, tone: 0.85, seed: 1.9 },
                    { ry: 0.70, dist: 34, size: 7, tone: 0.8, seed: 8.5 },
                    { ry: 0.86, dist: 24, size: 6, tone: 0.75, seed: 2.2 },

                    // Layer 3: Far trailing embers (~3-6px)
                    { ry: 0.18, dist: 43, size: 5, tone: 0.7, seed: 9.3 },
                    { ry: 0.34, dist: 50, size: 6, tone: 0.75, seed: 3.9 },
                    { ry: 0.48, dist: 46, size: 5, tone: 0.65, seed: 6.1 },
                    { ry: 0.66, dist: 42, size: 4, tone: 0.6, seed: 8.9 },
                    { ry: 0.82, dist: 48, size: 4, tone: 0.55, seed: 4.7 }
                ];

                // Soft particle glow
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.7 * hoverBlend})`;
                ctx.shadowBlur = 8 * hoverBlend;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    // Gentle wave float
                    const waveX = Math.sin(timeSec * 2.8 + p.seed + seed) * 2.2;
                    const waveY = Math.cos(timeSec * 2.2 + p.seed * 1.7) * 1.6;

                    const px = x + w + (p.dist * hoverBlend) + waveX - 4;
                    const py = y + (h - p.size) * p.ry + waveY;

                    const particleAlpha = Math.min(1.0, hoverBlend * 1.25) * p.tone * alpha;
                    if (particleAlpha <= 0.01) continue;

                    // Subtle tone variations (amber gold, warm orange, highlight yellow)
                    const redTone = Math.min(255, Math.floor(r * (0.96 + 0.08 * Math.sin(p.seed))));
                    const greenTone = Math.min(255, Math.floor(g * (0.92 + 0.12 * Math.cos(p.seed))));
                    const blueTone = Math.floor(b * 0.75);

                    ctx.fillStyle = `rgba(${redTone}, ${greenTone}, ${blueTone}, ${particleAlpha})`;
                    ctx.fillRect(px, py, p.size, p.size);
                }
            }

            ctx.restore();
        }

        function renderLoop(timestamp) {
            if (lastTime === 0) {
                lastTime = timestamp;
            }

            const deltaTime = (timestamp - lastTime) / 1000.0;
            lastTime = timestamp;

            const lerpSpeed = 5.0;
            mouseX += (targetMouseX - mouseX) * lerpSpeed * deltaTime;
            mouseY += (targetMouseY - mouseY) * lerpSpeed * deltaTime;

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

            while (get_next_command(ptr_type, ptr_x, ptr_y, ptr_w, ptr_h, ptr_r, ptr_g, ptr_b, ptr_a, ptr_cr, text_buf)) {
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

                    const alpha = a / 255;
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, cr);
                    ctx.fill();

                    if (alpha > 0.01 && cr > 0) {
                        ctx.strokeStyle = `rgba(${r * 0.5}, ${g * 0.5}, ${b * 0.5}, ${alpha * 0.6})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
                else if (type === CLAY_RENDER_COMMAND_TYPE_TEXT) {
                    const x = memoryView.getFloat32(ptr_x, true);
                    const y = memoryView.getFloat32(ptr_y, true);
                    const w = memoryView.getFloat32(ptr_w, true);
                    const h = memoryView.getFloat32(ptr_h, true);
                    const r = memoryView.getFloat32(ptr_r, true);
                    const g = memoryView.getFloat32(ptr_g, true);
                    const b = memoryView.getFloat32(ptr_b, true);
                    const a = memoryView.getFloat32(ptr_a, true);
                    const fontInfo = memoryView.getFloat32(ptr_cr, true);
                    const fontStyle = Math.floor(fontInfo / 1000);
                    const fontSize = fontInfo % 1000;

                    let len = 0;
                    while (memoryView.getUint8(text_buf + len) !== 0) {
                        len++;
                    }

                    const textArray = new Uint8Array(HEAPU8.buffer, text_buf, len);
                    const str = new TextDecoder('utf-8').decode(textArray);

                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                    let fontPrefix = "";
                    if (fontStyle & 2) fontPrefix += "italic ";
                    if (fontStyle & 1) fontPrefix += "bold ";
                    ctx.font = `${fontPrefix}${fontSize}px "Lexend-Regular", sans-serif`;
                    ctx.textBaseline = "middle";
                    ctx.fillText(str, x, y + (h / 2));

                    const actualWidth = w > 0 ? w : ctx.measureText(str).width;

                    if (fontStyle & 4) { // Underline
                        ctx.beginPath();
                        ctx.strokeStyle = ctx.fillStyle;
                        ctx.lineWidth = Math.max(1, fontSize / 16);
                        const lineY = y + h - 2;
                        ctx.moveTo(x, lineY);
                        ctx.lineTo(x + actualWidth, lineY);
                        ctx.stroke();
                    }
                    if (fontStyle & 8) { // Strikethrough
                        ctx.beginPath();
                        ctx.strokeStyle = ctx.fillStyle;
                        ctx.lineWidth = Math.max(1, fontSize / 16);
                        const lineY = y + (h / 2);
                        ctx.moveTo(x, lineY);
                        ctx.lineTo(x + actualWidth, lineY);
                        ctx.stroke();
                    }
                }
                else if (type === CLAY_RENDER_COMMAND_TYPE_IMAGE) {
                    const x = memoryView.getFloat32(ptr_x, true);
                    const y = memoryView.getFloat32(ptr_y, true);
                    const w = memoryView.getFloat32(ptr_w, true);
                    const h = memoryView.getFloat32(ptr_h, true);
                    const imageId = memoryView.getFloat32(ptr_r, true);
                    const a = memoryView.getFloat32(ptr_a, true);
                    const cr = memoryView.getFloat32(ptr_cr, true);

                    const img = images[imageId];

                    if (img && img.complete && img.naturalWidth > 0) {
                        ctx.save();
                        ctx.globalAlpha = a / 255.0;

                        ctx.beginPath();
                        ctx.roundRect(x, y, w, h, cr);
                        ctx.clip();

                        if (img.frames > 1) {
                            const timeInSeconds = timestamp / 1000;
                            const currentFrame = Math.floor(timeInSeconds * img.fps) % img.frames;
                            const frameWidth = img.naturalWidth / img.frames;
                            const sx = currentFrame * frameWidth;

                            ctx.drawImage(img, sx, 0, frameWidth, img.naturalHeight, x, y, w, h);
                        }
                        else {
                            ctx.drawImage(img, x, y, w, h);
                        }

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
                else if (type === CLAY_RENDER_COMMAND_TYPE_CUSTOM) {
                    const x = memoryView.getFloat32(ptr_x, true);
                    const y = memoryView.getFloat32(ptr_y, true);
                    const w = memoryView.getFloat32(ptr_w, true);
                    const h = memoryView.getFloat32(ptr_h, true);
                    const r = memoryView.getFloat32(ptr_r, true);
                    const g = memoryView.getFloat32(ptr_g, true);
                    const b = memoryView.getFloat32(ptr_b, true);
                    const a = memoryView.getFloat32(ptr_a, true);
                    const cr = memoryView.getFloat32(ptr_cr, true);

                    let len = 0;
                    while (memoryView.getUint8(text_buf + len) !== 0) {
                        len++;
                    }
                    const textArray = new Uint8Array(HEAPU8.buffer, text_buf, len);
                    const hoverStr = new TextDecoder('utf-8').decode(textArray);
                    const hoverBlend = parseFloat(hoverStr) || 0.0;

                    renderCyberpunkButton(ctx, x, y, w, h, r, g, b, a, cr, hoverBlend, timestamp);
                }
            }

            requestAnimationFrame(renderLoop);
        }

        renderLoop(lastTime);
};