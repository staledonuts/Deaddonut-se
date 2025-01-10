export const vertexShaderSource = `#version 300 es

// 光源
const vec4 pl = vec4(3.0, 4.0, 5.0, 1.0);           // 位置

// 頂点属性
in vec4 pv;                                         // ローカル座標系の頂点位置
in vec4 nv;                                         // 頂点の法線ベクトル
in vec2 tv;                                         // 頂点のテクスチャ座標

// 変換行列
uniform mat4 mw;                                    // 視点座標系への変換行列
uniform mat4 mc;                                    // クリッピング座標系への変換行列
uniform mat4 mg;                                    // 法線ベクトルの変換行列

// ラスタライザに送る頂点属性
out vec3 l;                                         // 光線ベクトル
out vec3 h;                                         // 中間ベクトル
out vec2 tc;                                        // テクスチャ座標

void main(void)
{
  vec3 n = normalize((mg * nv).xyz);                // 法線ベクトル
  vec3 t = normalize(vec3(n.z, 0.0, -n.x));         // 接線ベクトル
  vec3 b = cross(n, t);                             // 従接線ベクトル
  mat3 m = transpose(mat3(t, b, n));                // 接空間基底行列

  vec4 p = mw * pv;                                 // 視点座標系の頂点の位置
  vec3 v = -m * normalize(p.xyz / p.w);             // 頂点の接空間における視線ベクトル

  l = normalize(m * vec3(4.0, 5.0, 6.0));           // 頂点の接空間における光線ベクトル
  h = normalize(l + v);                             // 頂点の接空間における中間ベクトル
  tc = tv;                                          // テクスチャ座標

  gl_Position = mc * pv;
}
`;

export const fragmentShaderSource = `#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// 光源
const vec4 lamb   = vec4(0.2, 0.2, 0.2, 1.0);       // 環境光成分の強度
const vec4 ldiff  = vec4(1.0, 1.0, 1.0, 0.0);       // 拡散反射成分の強度
const vec4 lspec  = vec4(1.0, 1.0, 1.0, 0.0);       // 鏡面反射成分の強度

// 材質
const vec4 kamb   = vec4(0.6, 0.6, 0.6, 1.0);       // 環境光の反射係数
const vec4 kdiff  = vec4(0.6, 0.6, 0.6, 1.0);       // 拡散反射係数
const vec4 kspec  = vec4(0.4, 0.4, 0.4, 1.0);       // 鏡面反射係数
const float kshi  = 40.0;                           // 輝き係数

// ラスタライザから受け取る頂点属性の補間値
in vec3 l;                                          // 補間された光線ベクトル
in vec3 h;                                          // 補間された中間ベクトル
in vec2 tc;                                         // 補間されたテクスチャ座標

// テクスチャ座標のサンプラ
uniform sampler2D color;                            // カラーマップ
uniform sampler2D normal;                           // 法線マップ

// フレームバッファに出力するデータ
out vec4 fc;                                        // フラグメントの色

void main(void)
{
  vec3 nn = vec3(0.0, 0.0, 1.0);     // 接空間における法線ベクトル
  vec3 nl = normalize(l);                           // 光線ベクトル
  vec3 nh = normalize(h);                           // 中間ベクトル

  vec4 iamb = kamb * lamb;
  vec4 idiff = max(dot(nn, nl), 0.0) * kdiff * ldiff;
  vec4 ispec = pow(max(dot(nn, nh), 0.0), kshi) * kspec * lspec;

  fc = texture(color, tc) * (iamb + idiff) + step(texture(normal, tc).x, 0.0) * ispec;
}
`;
