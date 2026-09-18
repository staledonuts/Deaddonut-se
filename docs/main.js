const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');
const BG_COLOR = '#0c0817';
window.images = window.images || {};
const images = window.images;
const brushTextureImg = new Image();
brushTextureImg.src = 'images/messy-white-paint-stains.jpg';
let brushTextureLoaded = false;
brushTextureImg.onload = () => {
    brushTextureLoaded = true;
};
if (brushTextureImg.complete && brushTextureImg.naturalWidth > 0) {
    brushTextureLoaded = true;
}
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

        // Button styles matching C enum
        const BUTTON_STYLE_STANDARD = 0;
        const BUTTON_STYLE_PIXEL_RIGHT = 1;
        const BUTTON_STYLE_PIXEL_UP = 2;
        const BUTTON_STYLE_BRUSH_STROKE = 3;

        // Pre-computed particle properties for zero-allocation flowing fire stream
        const CYBER_PARTICLES_COUNT = 32;
        const cyberParticles = [];
        for (let i = 0; i < CYBER_PARTICLES_COUNT; i++) {
            cyberParticles.push({
                phase: ((i * 1.618) % 1.0),                  // golden ratio distribution so spawning is perfectly staggered
                speed: 0.7 + ((i * 17) % 7) * 0.12,          // varying speeds
                relPos: ((i * 37 + 11) % 100) / 100,         // 0.0 to 1.0 along the dissolving edge
                baseSize: 6.0 + ((i * 23) % 4) * 2.5,        // 6px to 13.5px initial size
                maxDist: 45 + ((i * 29) % 6) * 12,           // 45px to 105px travel distance
                drift: -2.0 - ((i * 19) % 5) * 2.5,          // perpendicular drift
                seed: i * 4.31
            });
        }

        function renderBrushStrokeButton(ctx, x, y, w, h, r, g, b, a, cr, hoverBlend, timestamp, labelText) {
            const alpha = a / 255;
            if (alpha <= 0.001) return;

            // 1. Draw base unhovered button body with text (visible when unhovered or during sweep wipe)
            ctx.save();
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, cr || 8);
            ctx.fill();

            // Subtle border outline derived from button's base color
            const borderAlpha = alpha * 0.45;
            if (borderAlpha > 0.01) {
                const borderR = Math.min(255, Math.round(r * 1.5));
                const borderG = Math.min(255, Math.round(g * 1.4));
                const borderB = Math.min(255, Math.round(b * 1.4));
                ctx.strokeStyle = `rgba(${borderR}, ${borderG}, ${borderB}, ${borderAlpha})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, cr || 8);
                ctx.stroke();
            }

            // Base unhovered text: white for close buttons and red youtube buttons (r > 60), soft lilac for menu buttons
            if (labelText) {
                const cleanLabel = labelText.trim();
                const baseFontSize = Math.max(13, Math.min(20, Math.round(h * 0.40)));
                ctx.font = `600 ${baseFontSize}px 'Lexend-Regular', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = (r > 60) ? `rgba(255, 255, 255, ${alpha})` : `rgba(195, 182, 232, ${alpha})`;
                ctx.fillText(cleanLabel, x + w * 0.5, y + h * 0.5 + 1);
            }
            ctx.restore();

            // 2. If hoverBlend > 0.001, paint in the golden yellow brush stroke banner from left to right!
            if (hoverBlend > 0.001) {
                const progress = Math.min(1.0, Math.max(0.0, hoverBlend));

                // Bounding dimensions of the brush banner contained comfortably within the button area
                const padX = Math.min(6, Math.max(3, w * 0.03));
                const padY = Math.min(3, Math.max(2, h * 0.06));
                const strokeLeft = x - padX;
                const strokeRight = x + w + padX;
                const strokeTop = y - padY;
                const strokeBottom = y + h + padY;
                const strokeW = strokeRight - strokeLeft;
                const strokeH = strokeBottom - strokeTop;

                // sweepX: leading front of the wipe across the button
                // Extra margin at the end ensures complete reveal of frayed tips at progress = 1.0
                const sweepX = strokeLeft + (strokeW + 28) * progress;

                // Dynamic clipping mask with jagged bristle leading edge
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(strokeLeft - 25, strokeTop - 15);
                ctx.lineTo(sweepX, strokeTop - 15);

                // Trace down the front of the brush wipe with multi-frequency bristle teeth
                const steps = 16;
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const cy = (strokeTop - 15) + (strokeH + 30) * t;
                    const bristle = Math.sin(t * Math.PI * 4.8 + y * 0.08) * 7.5 +
                                    Math.cos(t * Math.PI * 8.6) * 4.2 +
                                    (((i * 19 + 7) % 7) - 3) * 1.5;
                    ctx.lineTo(sweepX + bristle, cy);
                }

                ctx.lineTo(strokeLeft - 25, strokeBottom + 15);
                ctx.closePath();
                ctx.clip();

                // Helper to trace the organic brush banner silhouette
                function drawBrushSilhouette() {
                    const x0 = strokeLeft;
                    const x1 = strokeRight;
                    const y0 = strokeTop;
                    const y1 = strokeBottom;
                    const bw = strokeW;
                    const bh = strokeH;

                    ctx.beginPath();
                    // Left start with slight organic curve
                    ctx.moveTo(x0 + 4, y0 + 3);

                    // Top undulating edge with organic curves
                    ctx.bezierCurveTo(x0 + bw * 0.22, y0 - 1.2, x0 + bw * 0.38, y0 + 2.0, x0 + bw * 0.55, y0);
                    ctx.bezierCurveTo(x0 + bw * 0.72, y0 - 2.0, x0 + bw * 0.88, y0 + 1.0, x1 - 3, y0 + 2);

                    // Right dry-brush bristle cutoff (organically textured, stays within button area)
                    ctx.bezierCurveTo(x1 + 1, y0 + bh * 0.22, x1 + 2, y0 + bh * 0.40, x1, y0 + bh * 0.50);
                    ctx.bezierCurveTo(x1 + 2, y0 + bh * 0.65, x1 + 1, y0 + bh * 0.82, x1 - 3, y1 - 3);

                    // Bottom undulating edge
                    ctx.bezierCurveTo(x0 + bw * 0.85, y1 + 2.0, x0 + bw * 0.68, y1 - 1.5, x0 + bw * 0.48, y1 + 1.0);
                    ctx.bezierCurveTo(x0 + bw * 0.32, y1 + 2.0, x0 + bw * 0.15, y1 - 1.0, x0 + 3, y1 - 3);

                    // Left start cutoff
                    ctx.bezierCurveTo(x0 - 1, y1 - bh * 0.30, x0 - 1, y0 + bh * 0.60, x0 + 1, y0 + bh * 0.30);
                    ctx.lineTo(x0 + 4, y0 + 3);
                    ctx.closePath();
                }

                // Layer 1: Warm amber undertone / shadow for paint depth
                ctx.save();
                ctx.fillStyle = `rgba(215, 135, 15, ${0.9 * alpha})`;
                ctx.translate(0.8, 1.2);
                drawBrushSilhouette();
                ctx.fill();
                ctx.restore();

                // Layer 2: Main golden yellow brush stroke body with subtle gradient
                const bodyGrad = ctx.createLinearGradient(strokeLeft, strokeTop, strokeLeft, strokeBottom);
                bodyGrad.addColorStop(0, `rgba(255, 195, 55, ${alpha})`);   // Bright warm gold top
                bodyGrad.addColorStop(0.45, `rgba(249, 180, 45, ${alpha})`); // Core reference golden yellow (#f9b42d)
                bodyGrad.addColorStop(1, `rgba(238, 158, 22, ${alpha})`);   // Deep rich gold bottom
                ctx.fillStyle = bodyGrad;
                drawBrushSilhouette();
                ctx.fill();

                // Layer 2.5: Real Acrylic Paint Texture (messy-white-paint-stains.jpg)
                if (brushTextureLoaded && brushTextureImg.naturalWidth > 0) {
                    ctx.save();
                    // Clip strictly inside the organic brush silhouette
                    drawBrushSilhouette();
                    ctx.clip();

                    const texH = brushTextureImg.naturalHeight;
                    const texW = brushTextureImg.naturalWidth;
                    // Slightly offset vertical crop by button y-coordinate for natural variety between buttons
                    const sliceY = (Math.abs(Math.floor(y * 11)) % Math.floor(texH * 0.35));
                    const sliceH = Math.floor(texH * 0.50);

                    // Fully cover and exceed silhouette bounds so 100% of the brush stroke has texture
                    const texDrawX = strokeLeft - 10;
                    const texDrawY = strokeTop - 10;
                    const texDrawW = strokeW + 20;
                    const texDrawH = strokeH + 20;

                    // Pass 1: 'overlay' to sculpt rich impasto highlights and tactile bristle volume
                    ctx.globalCompositeOperation = 'overlay';
                    ctx.globalAlpha = 0.65 * alpha;
                    ctx.drawImage(brushTextureImg, 0, sliceY, texW, sliceH, texDrawX, texDrawY, texDrawW, texDrawH);

                    // Pass 2: 'multiply' to deepen fine grooves and dry-brush scratches into warm amber
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.globalAlpha = 0.40 * alpha;
                    ctx.drawImage(brushTextureImg, 0, sliceY, texW, sliceH, texDrawX, texDrawY, texDrawW, texDrawH);

                    ctx.restore();
                }

                // Layer 4: Dark cursive brush script typography
                if (labelText) {
                    const cleanLabel = labelText.trim();
                    ctx.save();
                    const textFontSize = Math.max(14, Math.min(25, Math.round(h * 0.50)));
                    ctx.font = `bold ${textFontSize}px 'Kaushan Script', 'Caveat', 'Permanent Marker', cursive, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Center & apply subtle calligraphic tilt (~ -1.25 degrees)
                    const centerX = x + w * 0.5;
                    const centerY = y + h * 0.5;
                    ctx.translate(centerX, centerY);
                    ctx.rotate(-0.022);

                    // Subtle ink bleed shadow
                    ctx.fillStyle = `rgba(20, 16, 28, ${0.35 * alpha})`;
                    ctx.fillText(cleanLabel, 0.6, 1.2);

                    // Crisp dark ink text (#14101c)
                    ctx.fillStyle = `rgba(20, 16, 28, ${0.96 * alpha})`;
                    ctx.fillText(cleanLabel, 0, 0);
                    ctx.restore();
                }

                // Restore from clipping mask
                ctx.restore();

                // 3. Dynamic wet paint flecks / splatter at the leading brush front while wiping
                if (progress > 0.05 && progress < 0.94) {
                    ctx.save();
                    const fleckCount = 4;
                    for (let f = 0; f < fleckCount; f++) {
                        const ft = (f + 0.5) / fleckCount;
                        const fy = strokeTop + strokeH * ft + Math.sin(f * 2.3 + timestamp * 0.01) * 3;
                        const fx = sweepX + 3 + ((f * 11) % 8);
                        const rSize = 1.2 + (f % 2) * 1.0;
                        ctx.fillStyle = (f % 2 === 0) ? `rgba(249, 180, 45, ${0.85 * alpha})` : `rgba(255, 215, 90, ${0.85 * alpha})`;
                        ctx.beginPath();
                        ctx.arc(fx, fy, rSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }
            }
        }

        function renderCyberpunkButton(ctx, x, y, w, h, r, g, b, a, cr, hoverBlend, timestamp, style, labelText) {
            const alpha = a / 255;
            if (alpha <= 0.001) return;

            // Style 3: Golden Brush Stroke with dynamic paint-in wipe
            if (style === BUTTON_STYLE_BRUSH_STROKE) {
                renderBrushStrokeButton(ctx, x, y, w, h, r, g, b, a, cr, hoverBlend, timestamp, labelText);
                return;
            }

            ctx.save();

            // Style 0: Standard clean button (no particles/disintegration)
            if (style === BUTTON_STYLE_STANDARD) {
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, cr);
                ctx.fill();

                if (cr > 0) {
                    const borderAlpha = alpha * 0.45;
                    if (borderAlpha > 0.01) {
                        ctx.strokeStyle = `rgba(${r * 0.5}, ${g * 0.5}, ${b * 0.5}, ${borderAlpha})`;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.roundRect(x, y, w, h, cr);
                        ctx.stroke();
                    }
                }
                ctx.restore();
                return;
            }

            // 1. Warm ambient halo / glow behind the burning side when hovered
            if (hoverBlend > 0.02) {
                const glowAlpha = 0.45 * hoverBlend * alpha;
                if (style === BUTTON_STYLE_PIXEL_UP) {
                    const glowRadius = Math.max(w * 0.85, 50);
                    const glowGrad = ctx.createRadialGradient(
                        x + w * 0.5, y + 4, 6,
                        x + w * 0.5, y - 10, glowRadius
                    );
                    glowGrad.addColorStop(0, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, ${glowAlpha})`);
                    glowGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${glowAlpha * 0.45})`);
                    glowGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                    ctx.fillStyle = glowGrad;
                    ctx.fillRect(x - 20, y - glowRadius - 15, w + 40, glowRadius + 25);
                } else {
                    // PIXEL_RIGHT
                    const glowRadius = Math.max(h * 1.3, 55);
                    const glowGrad = ctx.createRadialGradient(
                        x + w - 2, y + h * 0.5, 6,
                        x + w + 20, y + h * 0.5, glowRadius
                    );
                    glowGrad.addColorStop(0, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, ${glowAlpha})`);
                    glowGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${glowAlpha * 0.45})`);
                    glowGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                    ctx.fillStyle = glowGrad;
                    ctx.fillRect(x + w - 25, y - 30, glowRadius + 40, h + 60);
                }
            }

            // 2. Base rounded button body
            // When hovered, flatten the edge corners where pixels dissolve:
            // PIXEL_RIGHT flattens right corners [cr, flatCr, flatCr, cr]
            // PIXEL_UP flattens top corners [flatCr, flatCr, cr, cr]
            const flatCr = cr * Math.max(0, 1.0 - hoverBlend * 1.5);
            let cornerRadii = cr;
            if (ctx.roundRect) {
                if (style === BUTTON_STYLE_PIXEL_UP) {
                    cornerRadii = [flatCr, flatCr, cr, cr];
                } else {
                    cornerRadii = [cr, flatCr, flatCr, cr];
                }
            }

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y, w, h, cornerRadii);
            } else {
                ctx.roundRect(x, y, w, h, cr);
            }
            ctx.fill();

            // Subtle border outline when unhovered / transitioning
            if (cr > 0 && hoverBlend < 0.95) {
                const borderAlpha = alpha * 0.45 * (1.0 - hoverBlend);
                if (borderAlpha > 0.01) {
                    ctx.strokeStyle = `rgba(${r * 0.5}, ${g * 0.5}, ${b * 0.5}, ${borderAlpha})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x, y, w, h, cornerRadii);
                    } else {
                        ctx.roundRect(x, y, w, h, cr);
                    }
                    ctx.stroke();
                }
            }

            // 3. Pixelated disintegration & continuous flowing fire stream
            if (hoverBlend > 0.02) {
                const timeSec = timestamp * 0.001;
                const seed = (Math.floor(y * 11) + Math.floor(x * 7)) % 1000;

                // Step 3A: Animated flickering edge teeth attached to the dissolving border
                const numEdgeBlocks = 6;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

                if (style === BUTTON_STYLE_PIXEL_UP) {
                    for (let i = 0; i < numEdgeBlocks; i++) {
                        const blockSeed = seed + i * 13.7;
                        const flicker = Math.sin(timeSec * 8.0 + blockSeed);
                        const blockSize = 8 + Math.floor(Math.abs(flicker) * 6);
                        const xPos = x + (w - blockSize) * (i / (numEdgeBlocks - 1));
                        const yOut = (Math.abs(flicker) * 3.5 + 2.0) * hoverBlend;
                        ctx.fillRect(xPos, y - yOut, blockSize, blockSize + 6);
                    }
                } else {
                    for (let i = 0; i < numEdgeBlocks; i++) {
                        const blockSeed = seed + i * 13.7;
                        const flicker = Math.sin(timeSec * 8.0 + blockSeed);
                        const blockSize = 8 + Math.floor(Math.abs(flicker) * 6);
                        const yPos = y + (h - blockSize) * (i / (numEdgeBlocks - 1));
                        const xOverlap = blockSize * 0.65 + 4;
                        const xOut = (Math.abs(flicker) * 3.5 + 2.0) * hoverBlend;
                        ctx.fillRect(x + w - xOverlap + xOut, yPos, blockSize, blockSize);
                    }
                }

                // Step 3B: Continuous stream of pixel embers flying right/up and burning out
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.85 * hoverBlend})`;
                ctx.shadowBlur = 9 * hoverBlend;

                for (let i = 0; i < CYBER_PARTICLES_COUNT; i++) {
                    const p = cyberParticles[i];

                    // Particle cycle: progress t goes from 0.0 (birth at edge) to 1.0 (disappearance)
                    const t = ((timeSec * p.speed + p.phase) % 1.0);

                    // Fade in quickly at spawn (0 -> 0.12), fade out as it travels and burns out (0.12 -> 1.0)
                    let lifeAlpha = 1.0;
                    if (t < 0.12) {
                        lifeAlpha = t / 0.12;
                    } else {
                        lifeAlpha = Math.pow(1.0 - t, 1.4);
                    }

                    const particleAlpha = lifeAlpha * hoverBlend * alpha;
                    if (particleAlpha <= 0.01) continue;

                    // Size shrinks as the ember burns away
                    const size = Math.max(2.5, p.baseSize * (1.0 - t * 0.65));

                    // Wave oscillation
                    const wave = Math.sin(timeSec * 6.0 + p.seed) * (t * 5.0);

                    let px, py;
                    if (style === BUTTON_STYLE_PIXEL_UP) {
                        const driftX = ((i % 2 === 0 ? 1 : -1) * (Math.abs(p.drift) * 0.6));
                        px = x + p.relPos * (w - size) + (driftX * t * hoverBlend) + wave;
                        py = y + 10 - (t * (p.maxDist + 10) * hoverBlend);
                    } else {
                        px = x + w - 10 + (t * (p.maxDist + 10) * hoverBlend);
                        py = y + p.relPos * (h - size) + (p.drift * t * hoverBlend) + wave;
                    }

                    // Color transitions based on base button color
                    let pR = r;
                    let pG = g;
                    let pB = b;

                    if (t < 0.22) {
                        // Hot core: bright whiter tint of the base color
                        const coreBoost = (1.0 - t / 0.22);
                        pR = Math.min(255, r + (255 - r) * 0.65 * coreBoost);
                        pG = Math.min(255, g + (255 - g) * 0.65 * coreBoost);
                        pB = Math.min(255, b + (255 - b) * 0.65 * coreBoost);
                    } else if (t > 0.55) {
                        // Dying ember: deep rich variant
                        const emberShift = (t - 0.55) / 0.45;
                        pR = Math.max(10, r * (1.0 - emberShift * 0.35));
                        pG = Math.max(10, g * (1.0 - emberShift * 0.35));
                        pB = Math.max(10, b * (1.0 - emberShift * 0.35));
                    }

                    ctx.fillStyle = `rgba(${Math.floor(pR)}, ${Math.floor(pG)}, ${Math.floor(pB)}, ${particleAlpha})`;
                    ctx.fillRect(px, py, size, size);
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

            const c1 = 'rgb(14, 9, 26)';
            const c2 = 'rgb(32, 20, 58)';
            const c3 = 'rgb(68, 30, 102)';
            const c4 = 'rgb(138, 52, 132)';
            const c5 = 'rgb(212, 108, 150)';

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
                    if (fontStyle & 1 || fontStyle & 16) fontPrefix += "bold ";
                    const fontFamily = (fontStyle & 16) ? '"Kaushan Script", "Caveat", "Permanent Marker", cursive, sans-serif' : '"Lexend-Regular", sans-serif';
                    ctx.font = `${fontPrefix}${fontSize}px ${fontFamily}`;
                    ctx.textBaseline = "middle";
                    ctx.fillText(str, x, y + (h / 2));

                    const actualWidth = w > 0 ? w : ctx.measureText(str).width;

                    if (fontStyle & 4) { // Underline
                        ctx.beginPath();
                        ctx.strokeStyle = ctx.fillStyle;
                        ctx.lineWidth = Math.max(1.5, fontSize / 14);
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

                    const img = images[imageId] || (window.images && window.images[imageId]);

                    if (img && (img.complete || img instanceof HTMLCanvasElement) && (img.naturalWidth > 0 || img.width > 0)) {
                        ctx.save();
                        const alpha = (a > 0) ? (a / 255.0) : 1.0;
                        ctx.globalAlpha = alpha;

                        ctx.beginPath();
                        ctx.roundRect(x, y, w, h, cr);
                        ctx.clip();

                        const natW = img.naturalWidth || img.width;
                        const natH = img.naturalHeight || img.height;

                        if (img.frames > 1) {
                            const timeInSeconds = timestamp / 1000;
                            const currentFrame = Math.floor(timeInSeconds * img.fps) % img.frames;
                            const frameWidth = natW / img.frames;
                            const sx = currentFrame * frameWidth;

                            ctx.drawImage(img, sx, 0, frameWidth, natH, x, y, w, h);
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
                    const customStr = new TextDecoder('utf-8').decode(textArray);
                    let style = 0;
                    let hoverBlend = 0.0;
                    let labelText = '';
                    if (customStr.includes(';')) {
                        const parts = customStr.split(';');
                        style = parseInt(parts[0], 10) || 0;
                        hoverBlend = parseFloat(parts[1]) || 0.0;
                        labelText = parts.slice(2).join(';');
                    } else {
                        hoverBlend = parseFloat(customStr) || 0.0;
                        style = 1;
                    }

                    renderCyberpunkButton(ctx, x, y, w, h, r, g, b, a, cr, hoverBlend, timestamp, style, labelText);
                }
            }

            requestAnimationFrame(renderLoop);
        }

        renderLoop(lastTime);
};