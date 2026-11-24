// Amber CRT: scanlines, glow, vignette. Shadertoy-style entry (unverified against Ghostty 1.4 docs).
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec3 c = texture(iChannel0, uv).rgb;
    vec2 px = 1.0 / iResolution.xy;
    vec3 glow = vec3(0.0);
    for (int i = -3; i <= 3; i++) {
        glow += texture(iChannel0, uv + vec2(float(i) * 2.0, 0.0) * px).rgb;
        glow += texture(iChannel0, uv + vec2(0.0, float(i) * 2.0) * px).rgb;
    }
    glow /= 14.0;
    c += glow * 0.35;
    float scan = 0.82 + 0.18 * sin(fragCoord.y * 3.14159);
    c *= scan;
    vec2 d = uv - 0.5;
    c *= 1.0 - dot(d, d) * 0.9;
    fragColor = vec4(c, 1.0);
}
