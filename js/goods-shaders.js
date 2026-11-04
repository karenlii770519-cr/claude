// 取自 card-demo（雷射卡 3D 預覽）的材質與 shader
export const FILMS=[{id:"gold",name:"\u4EAE\u91D1",kind:0,color:[1,.72,.29],roughness:.18,swatch:["#a8741a","#f7dc8a","#c99a2e","#fff1c1","#b5852a"]},{id:"rosegold",name:"\u73AB\u7470\u91D1",kind:0,color:[.98,.6,.52],roughness:.2,swatch:["#a5604f","#f6c4b4","#c9806c","#ffe3d8","#b46f5d"]},{id:"silver",name:"\u4EAE\u9280",kind:0,color:[.92,.93,.95],roughness:.15,swatch:["#8d939c","#f2f4f7","#aab0b9","#ffffff","#9aa1aa"]},{id:"antique",name:"\u53E4\u9285\u91D1",kind:0,color:[.72,.5,.25],roughness:.42,swatch:["#6e4b22","#c69a5c","#8a6232","#d9b27a","#7a5528"]},{id:"matteblack",name:"\u9727\u9ED1",kind:0,color:[.035,.035,.04],roughness:.62,swatch:["#1b1b1e","#3a3a40","#222226","#45454b","#1e1e22"]},{id:"holo",name:"\u5F69\u8679\u96F7\u5C04",kind:1,color:[.85,.87,.9],roughness:.15,swatch:["#ff9ad5","#ffe58a","#9dffc6","#8fd3ff","#c7a2ff"]},{id:"glitter",name:"\u4EAE\u7247\u96F7\u5C04",kind:2,color:[.8,.82,.86],roughness:.2,swatch:["#d6d9e0","#ffffff","#c0f0ff","#ffd6f5","#e6e9ee"]},{id:"shatter",name:"\u788E\u73BB\u7483\u96F7\u5C04",kind:3,color:[.85,.86,.9],roughness:.12,swatch:["#b8f1ff","#ffc7e8","#fff3b0","#c8ffd9","#d6c8ff"]}];
export const VERT=`
varying vec3 vPosW;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec2 vDesign;
uniform float uFlipX; // > 0\uFF1A\u80CC\u9762\uFF0C\u8A2D\u8A08\u5EA7\u6A19 x \u4EE5 uFlipX \u2212 x \u5DE6\u53F3\u7FFB\u8F49
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vTangentW = normalize(mat3(modelMatrix) * vec3(1.0, 0.0, 0.0));
  vDesign = vec2(uFlipX > 0.0 ? uFlipX - position.x : position.x, -position.y);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const FRAG=`
uniform sampler2D uPrint;
uniform sampler2D uFoil;
uniform sampler2D uWhite;
uniform vec4 uRegion;
uniform vec3 uLightPos;
uniform float uLightIntensity;
uniform vec3 uFilmColor[8];
uniform float uFilmKind[8];
uniform float uFilmRough[8];
uniform float uAcrylic;
uniform float uPaperGloss;
uniform float uSubstrate;   // < 0 = \u4E00\u822C\u7D19\uFF1B\u5426\u5247\u70BA\u819C\u6750\u7DE8\u865F\uFF08\u96F7\u5C04\u5361\u5E95\u6750\uFF09
uniform float uInkClarity;
uniform float uCut;    // > 0.5：依印刷 alpha 裁切外型（異形卡）
uniform float uSheet;  // 壓克力／透卡板材本身的最低不透明度  // \u6C92\u767D\u58A8\u8655\u5370\u5237\u7684\u900F\u5149\u7A0B\u5EA6

varying vec3 vPosW;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec2 vDesign;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec3 spectrum(float t) {
  vec3 c = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
  return pow(c, vec3(1.6)) * 1.15;
}

// \u7A0B\u5E8F\u5316\u651D\u5F71\u68DA\u74B0\u5883\uFF1A\u4E0A\u4EAE\u4E0B\u6697\u3001\u5169\u76DE\u67D4\u5149\u7BB1\u3001\u52A0\u4E0A\u53EF\u62D6\u66F3\u7684\u4E3B\u5149
vec3 studioEnv(vec3 r, vec3 L, float rough) {
  float up = r.y * 0.5 + 0.5;
  vec3 c = mix(vec3(0.03, 0.032, 0.04), vec3(0.5, 0.52, 0.58), smoothstep(0.2, 1.0, up));
  float box1 = smoothstep(0.80 - rough * 0.4, 0.97, dot(r, normalize(vec3(-0.55, 0.65, 0.52))));
  float box2 = smoothstep(0.86 - rough * 0.4, 0.985, dot(r, normalize(vec3(0.75, 0.15, 0.64))));
  float strip = smoothstep(0.06 + rough * 0.2, 0.0, abs(r.x + 0.15)) * smoothstep(-0.2, 0.4, r.z);
  c += vec3(1.25, 1.22, 1.15) * box1 + vec3(0.6, 0.65, 0.75) * box2 + vec3(0.35) * strip;
  // \u6B63\u524D\u65B9\u7684\u9577\u689D\u67D4\u5149\uFF1A\u5E73\u9762\u71D9\u91D1\u5728\u8F49\u52D5\u6642\u6703\u6709\u4E00\u9053\u4EAE\u5E36\u6383\u904E
  float front = smoothstep(0.2, 0.75, r.z);
  float bands = smoothstep(0.16 + rough * 0.3, 0.0, abs(r.x * 0.9 + r.y * 0.35 - 0.12))
              + 0.55 * smoothstep(0.1 + rough * 0.3, 0.0, abs(r.x * 0.9 + r.y * 0.35 + 0.34));
  c += vec3(1.5, 1.47, 1.4) * bands * front;
  c += vec3(0.35) * front * (0.5 + 0.5 * r.y);
  float shin = mix(900.0, 14.0, rough);
  c += vec3(1.0, 0.97, 0.9) * pow(max(dot(r, L), 0.0), shin) * (shin + 8.0) / 30.0 * uLightIntensity;
  return c;
}

vec3 shadeMetal(vec3 base, float rough, vec3 N, vec3 V, vec3 L) {
  vec3 R = reflect(-V, N);
  float NdotV = max(dot(N, V), 0.0);
  vec3 F = base + (1.0 - base) * pow(1.0 - NdotV, 5.0);
  vec3 H = normalize(L + V);
  float shin = mix(500.0, 16.0, rough);
  float ndh = max(dot(N, H), 0.0);
  float spec = pow(ndh, shin) * (shin + 8.0) / 40.0;
  float broad = pow(ndh, mix(48.0, 6.0, rough)) * 1.1;
  vec3 e = studioEnv(R, L, rough);
  float diff = max(dot(N, L), 0.0);
  return F * (e * 0.8 + (spec + broad) * uLightIntensity) + base * diff * 0.12 * rough;
}

vec3 shadePaper(vec3 albedo, vec3 N, vec3 V, vec3 L) {
  float diff = max(dot(N, L), 0.0);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 70.0) * uPaperGloss;
  float rim = pow(1.0 - max(dot(N, V), 0.0), 4.0) * 0.06;
  return albedo * (0.5 + 0.62 * diff * uLightIntensity) + vec3(spec + rim) * uLightIntensity;
}

vec3 shadeFilm(int kind, vec3 base, float rough, vec2 d, vec3 N, vec3 T, vec3 B, vec3 V, vec3 L) {
  vec3 H = normalize(L + V);
  // \u71D9\u91D1\u8868\u9762\u7684\u5FAE\u76BA\u8936\uFF0C\u8B93\u9AD8\u5149\u4E0D\u6703\u50CF\u5851\u81A0\u4E00\u6A23\u5747\u52FB
  vec2 n2 = vec2(vnoise(d * 0.28), vnoise(d * 0.28 + 17.0)) - 0.5;
  n2 += (vec2(vnoise(d * 1.1 + 3.0), vnoise(d * 1.1 + 29.0)) - 0.5) * 0.35;
  vec3 Np = normalize(N + (T * n2.x + B * n2.y) * 0.09);
  if (kind == 0) {
    return shadeMetal(base, rough, Np, V, L);
  }
  vec3 metal = shadeMetal(vec3(0.72, 0.74, 0.78), 0.22, Np, V, L);
  float ndh = max(dot(Np, H), 0.0);
  float lobe = pow(ndh, 5.0);
  vec3 dir = normalize(T + B);
  float g = dot(H - Np * dot(H, Np), dir);
  if (kind == 1) {
    // \u5F69\u8679\u96F7\u5C04\uFF1A\u7E5E\u5C04\u8272\u5E36
    float t = g * 2.6 + dot(V, T) * 0.7 + (d.x + d.y) * 0.011 + vnoise(d * 0.12) * 0.35;
    vec3 rainbow = spectrum(t);
    float fine = 0.85 + 0.15 * sin((d.x - d.y) * 9.0 + g * 40.0);
    return metal * 0.42 + rainbow * fine * (0.42 + 2.1 * lobe) * uLightIntensity + vec3(pow(ndh, 140.0)) * 1.6 * uLightIntensity;
  }
  if (kind == 2) {
    // \u4EAE\u7247\u96F7\u5C04\uFF1A\u5169\u7A2E\u5927\u5C0F\u7684\u4EAE\u7247
    vec3 col = metal * 0.45 + spectrum(g * 2.0 + (d.x + d.y) * 0.01) * 0.3 * lobe * uLightIntensity;
    for (int s = 0; s < 2; s++) {
      float size = s == 0 ? 0.42 : 0.95;
      vec2 gp = d / size + float(s) * 13.7;
      vec2 cell = floor(gp);
      vec2 f = fract(gp);
      vec2 rnd = hash22(cell);
      float r3 = hash12(cell + 5.3);
      vec2 c = 0.5 + (hash22(cell + 9.1) - 0.5) * 0.4;
      float flake = smoothstep(0.42, 0.28, length(f - c));
      vec3 tn = normalize(N + (T * (rnd.x - 0.5) + B * (rnd.y - 0.5)) * 1.1);
      float spark = pow(max(dot(tn, H), 0.0), s == 0 ? 320.0 : 180.0) * flake;
      vec3 sc = mix(vec3(1.0), spectrum(r3 + g * 1.5), 0.75);
      col += sc * spark * (s == 0 ? 14.0 : 8.0) * uLightIntensity;
    }
    return col;
  }
  // \u788E\u73BB\u7483\u96F7\u5C04
  vec2 p = d / 3.2;
  vec2 ip = floor(p);
  float md = 9.0;
  vec2 mc = ip;
  for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec2 o = vec2(float(i), float(j));
      vec2 r = o + hash22(ip + o) - fract(p);
      float dd = dot(r, r);
      if (dd < md) { md = dd; mc = ip + o; }
    }
  vec2 h = hash22(mc);
  vec3 tn = normalize(N + (T * (h.x - 0.5) + B * (h.y - 0.5)) * 0.55);
  float l2 = pow(max(dot(tn, H), 0.0), 36.0);
  vec3 c = spectrum(hash12(mc) + dot(H, T) * 1.6);
  return metal * 0.42 + c * (0.18 + 2.4 * l2) * uLightIntensity + vec3(pow(max(dot(tn, H), 0.0), 400.0)) * 3.0 * uLightIntensity;
}

void main() {
  vec2 uv = vec2((vDesign.x - uRegion.x) / uRegion.z, 1.0 - (vDesign.y - uRegion.y) / uRegion.w);
  vec3 N = normalize(vNormalW);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uLightPos - vPosW);
  vec3 T = normalize(vTangentW - N * dot(vTangentW, N));
  vec3 B = cross(N, T);

  vec4 pr = texture2D(uPrint, uv);
  vec4 fo = texture2D(uFoil, uv);
  float wh = texture2D(uWhite, uv).a;

  vec3 albedo = pr.rgb;
  float alpha = 1.0;
  if (uAcrylic > 0.5) {
    // \u58D3\u514B\u529B\uFF1A\u6C92\u767D\u58A8\u7684\u5730\u65B9\u5370\u5237\u6703\u5FAE\u900F\u5149
    albedo = mix(vec3(0.97), pr.rgb, pr.a);
    alpha = max(pr.a * mix(0.8, 1.0, wh), wh * 0.96);
  }
  vec3 col = shadePaper(albedo, N, V, L);

  if (uSubstrate > -0.5 && uAcrylic < 0.5) {
    // \u96F7\u5C04\u5361\u5E95\u6750\uFF1A\u6574\u5F35\u5361\u662F\u96F7\u5C04\u819C\uFF0C\u5370\u5237\u662F\u900F\u660E\u58A8\uFF0C\u767D\u58A8\u6C7A\u5B9A\u54EA\u88E1\u4E0D\u900F\u5149
    int sIdx = int(uSubstrate + 0.5);
    vec3 sBase = vec3(0.85);
    float sRough = 0.15;
    int sKind = 1;
    for (int i = 0; i < 8; i++) {
      if (i == sIdx) { sBase = uFilmColor[i]; sRough = uFilmRough[i]; sKind = int(uFilmKind[i] + 0.5); }
    }
    vec3 film = shadeFilm(sKind, sBase, sRough, vDesign, N, T, B, V, L);
    vec3 ink = mix(vec3(1.0), pr.rgb, pr.a);
    // \u900F\u660E\u58A8\u50CF\u6FFE\u8272\u7247\uFF1A\u96F7\u5C04\u5149\u88AB\u5716\u6848\u984F\u8272\u67D3\u8272\uFF1B\u518D\u88DC\u4E00\u9EDE\u58A8\u672C\u8EAB\u7684\u6F2B\u53CD\u5C04\uFF0C\u8B93\u5716\u6848\u5728\u6697\u89D2\u5EA6\u4E5F\u770B\u5F97\u6E05\u695A
    float lum = dot(ink, vec3(0.299, 0.587, 0.114));
    vec3 inkFilter = mix(ink, vec3(lum), 0.15);
    vec3 through = film * inkFilter * (1.0 + uInkClarity * 0.6) + shadePaper(ink, N, V, L) * (1.0 - uInkClarity) * 0.9;
    through = mix(shadePaper(ink, N, V, L), through, mix(0.35, 1.0, uInkClarity));
    // \u6709\u767D\u58A8\uFF1A\u4E00\u822C\u4E0D\u900F\u660E\u5370\u5237
    vec3 solid = shadePaper(ink, N, V, L);
    col = mix(through, solid, wh);
  }

  if (fo.a > 0.004) {
    int idx = int(clamp(floor(fo.r * 255.0 / 32.0 + 0.02), 0.0, 7.0));
    vec3 base = vec3(1.0);
    float rough = 0.2;
    int kind = 0;
    for (int i = 0; i < 8; i++) {
      if (i == idx) { base = uFilmColor[i]; rough = uFilmRough[i]; kind = int(uFilmKind[i] + 0.5); }
    }
    vec3 fc = shadeFilm(kind, base, rough, vDesign, N, T, B, V, L);
    col = mix(col, fc, fo.a);
    alpha = max(alpha, fo.a);
  }
  if (uCut > 0.5) alpha = min(alpha, pr.a);
  if (uAcrylic > 0.5) alpha = max(alpha, uSheet);
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
