uniform sampler2D uTex;
uniform vec2 uImageSize;   // natural image size in px
uniform vec2 uSize;        // plane size in CSS px
uniform vec2 uRadii;       // corner radius: x = top corners, y = bottom corners (CSS px)
uniform vec2 uMouse;       // hover point in uv
uniform float uHover;      // 0 -> 1
uniform float uProgress;   // reveal wipe 0 -> 1
uniform float uZoom;       // reveal zoom 1.3 -> 1
uniform float uParallax;   // -1 .. 1, where the frame sits in the viewport
uniform float uParallaxAmt;// 0 when inner parallax is off
uniform float uTime;
uniform float uOpacity;
uniform vec4 uClip;        // left, top, right, bottom in CSS px (or -1e5 .. 1e5)
uniform float uViewportH;
uniform float uDpr;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

// Rounded box SDF with separate top and bottom radii (iq).
float sdBox(vec2 p, vec2 b, vec2 r) {
  float rad = p.y > 0.0 ? r.x : r.y;
  vec2 q = abs(p) - b + rad;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - rad;
}

vec2 cover(vec2 uv) {
  float rs = uSize.x / uSize.y;
  float ri = uImageSize.x / uImageSize.y;
  vec2 s = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  // Clip to an ancestor's box (screen space).
  vec2 css = vec2(gl_FragCoord.x / uDpr, uViewportH - gl_FragCoord.y / uDpr);
  if (css.x < uClip.x || css.y < uClip.y || css.x > uClip.z || css.y > uClip.w) discard;

  // Shape mask: arch / pill / rounded rect.
  vec2 px = (vUv - 0.5) * uSize;
  float d = sdBox(px, uSize * 0.5, min(uRadii, vec2(min(uSize.x, uSize.y) * 0.5)));
  float mask = 1.0 - smoothstep(-1.0, 0.5, d);

  // Reveal: a soft diagonal wipe with a torn, noisy edge, top-left first.
  float diag = (1.0 - vUv.y) * 0.65 + vUv.x * 0.35;
  float n = (noise(vUv * vec2(7.0, 5.0) + 3.1) - 0.5) * 0.22;
  float edge = uProgress * 1.4 - 0.2;
  float reveal = 1.0 - smoothstep(edge - 0.08, edge, diag + n);

  // Zoom (parallax room + hover + reveal), then inner parallax.
  float zoom = mix(1.0, 1.2, uParallaxAmt) * mix(1.0, 1.04, uHover) * uZoom;
  vec2 c = (vUv - 0.5) / zoom + 0.5;
  c.y -= uParallax * 0.08 * uParallaxAmt;

  // Hover ripple from the pointer.
  vec2 aspect = vec2(uSize.x / min(uSize.x, uSize.y), uSize.y / min(uSize.x, uSize.y));
  vec2 dir = (vUv - uMouse) * aspect;
  float dist = length(dir);
  float ripple = sin(dist * 30.0 - uTime * 5.0) * 0.006 * uHover * smoothstep(0.65, 0.0, dist);
  c += normalize(dir + 1e-5) * ripple / aspect;

  vec2 uv = cover(c);
  float shift = 0.002 * uHover;
  vec3 col = vec3(
    texture2D(uTex, uv + vec2(shift, 0.0)).r,
    texture2D(uTex, uv).g,
    texture2D(uTex, uv - vec2(shift, 0.0)).b
  );

  // A brief shadow line rides the reveal edge, like cloth unfolding.
  float shade = smoothstep(edge - 0.2, edge - 0.02, diag + n) * (1.0 - step(0.999, uProgress)) * 0.35;
  col *= 1.0 - shade;

  gl_FragColor = vec4(col, mask * reveal * uOpacity);
}
