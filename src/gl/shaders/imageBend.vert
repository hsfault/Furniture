// Pictures bow like paper with scroll/drag velocity (px per frame).
uniform vec2 uVelocity;
varying vec2 vUv;

#define PI 3.141592653589793

void main() {
  vUv = uv;
  vec3 p = position;
  p.y -= sin(uv.x * PI) * uVelocity.y * 0.0025;
  p.x -= sin(uv.y * PI) * uVelocity.x * 0.0025;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
