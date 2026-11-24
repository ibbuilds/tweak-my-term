// Amber CRT: soft glow, scanlines, light vignette. Shadertoy-style entry point.
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 px = 1.0 / iResolution.xy;
    vec3 base = texture(iChannel0, uv).rgb;

    // glow: 8-tap blur of the bright pixels, added back
    vec3 glow = vec3(0.0);
    for (int i = 0; i < 8; i++) {
        float a = 6.2831853 * float(i) / 8.0;
        vec2 d = vec2(cos(a), sin(a)) * px * 3.0;
        glow += texture(iChannel0, uv + d).rgb;
    }
    glow /= 8.0;
    vec3 col = base + glow * 0.45;

    // scanlines: ~every 3 device pixels, kept gentle so small text stays readable
    float scan = 0.82 + 0.18 * sin(fragCoord.y * 3.14159 * 2.0 / 3.0);
    col *= scan;

    // vignette
    vec2 c = uv - 0.5;
    col *= 1.0 - 0.35 * dot(c, c);

    fragColor = vec4(col, 1.0);
}
