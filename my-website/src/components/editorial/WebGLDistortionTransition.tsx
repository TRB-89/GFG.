"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface WebGLDistortionTransitionProps {
  label?: string;
  sublabel?: string;
}

export function WebGLDistortionTransition({
  label = "SEAMLESS TRANSITION // FROM REFLECTION TO MOMENTUM",
  sublabel = "EXPERIENCE REIGNITED",
}: WebGLDistortionTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;
    let material: THREE.ShaderMaterial | null = null;

    try {
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Custom Liquid Silk & Organic Refractive Displacement Shader
      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float uProgress;
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        // Simplex/Perlin-inspired smooth wave synthesis
        float silkNoise(vec2 p) {
          float wave1 = sin(p.x * 6.0 + uTime * 0.8 + p.y * 4.0);
          float wave2 = cos(p.y * 8.0 - uTime * 0.6 + p.x * 5.0);
          float wave3 = sin((p.x + p.y) * 10.0 + uTime * 1.2);
          return (wave1 + wave2 + wave3) / 3.0;
        }

        void main() {
          vec2 uv = vUv;
          
          // Bell curve envelope for transition activation (peaks at progress = 0.5)
          float envelope = sin(uProgress * 3.14159265);
          
          // Organic silk displacement vector
          float noise = silkNoise(uv * 1.5);
          vec2 displacement = vec2(
            cos(noise * 3.1415 + uTime * 0.5),
            sin(noise * 3.1415 + uTime * 0.5)
          ) * envelope * 0.12;

          // Color palette: Espresso #171310, Cocoa #59382D, Terracotta #B66C4B, Champagne #D8B58C, Ivory #F4EDE3
          vec3 espresso = vec3(0.09, 0.075, 0.063);
          vec3 cocoa = vec3(0.349, 0.220, 0.176);
          vec3 terracotta = vec3(0.714, 0.424, 0.294);
          vec3 champagne = vec3(0.847, 0.710, 0.549);
          vec3 ivory = vec3(0.957, 0.929, 0.890);

          // Chromatic dispersion along wave crests
          float dispR = silkNoise(uv + displacement * 1.08);
          float dispG = silkNoise(uv + displacement * 1.0);
          float dispB = silkNoise(uv + displacement * 0.92);

          // Layer gradient interpolations
          vec3 baseColor = mix(espresso, cocoa, uv.y + displacement.y);
          vec3 silkHighlight = mix(terracotta, champagne, dispR * 0.5 + 0.5);
          vec3 crestLight = mix(silkHighlight, ivory, envelope * 0.45);

          // Compose final output with soft liquid light intensity
          vec3 finalColor = mix(baseColor, crestLight, envelope * 0.75 + (dispG * 0.15 * envelope));
          
          // Add subtle light glint on wave folds
          float glint = pow(max(0.0, dispB), 4.0) * envelope * 0.6;
          finalColor += glint * champagne;

          gl_FragColor = vec4(finalColor, 0.92 * envelope);
        }
      `;

      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        },
        transparent: true,
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Animation & ScrollTrigger integration
      let animId: number;
      const clock = new THREE.Clock();

      const render = () => {
        animId = requestAnimationFrame(render);
        if (material) {
          material.uniforms.uTime.value = clock.getElapsedTime();
        }
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      render();

      let st: ScrollTrigger | null = null;
      if (containerRef.current) {
        st = ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          onUpdate: (self) => {
            if (material) {
              material.uniforms.uProgress.value = self.progress;
            }
          },
        });
      }

      // Handle WebGL Context Loss & Restoration safely
      const handleContextLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(animId);
      };

      const handleContextRestored = () => {
        render();
      };

      canvas.addEventListener("webglcontextlost", handleContextLost, false);
      canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

      const handleResize = () => {
        if (!renderer || !material) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("webglcontextlost", handleContextLost);
        canvas.removeEventListener("webglcontextrestored", handleContextRestored);
        if (st) st.kill();
        geometry.dispose();
        material?.dispose();
        renderer?.dispose();
      };
    } catch (err) {
      console.warn("WebGL distortion initialized fallback", err);
      setWebglSupported(false);
    }
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[60vh] sm:h-[75vh] overflow-hidden bg-[#171310] flex items-center justify-center select-none"
    >
      {/* WebGL Displacement Canvas */}
      {webglSupported && !prefersReducedMotion ? (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      ) : (
        /* CSS Liquid Light Gradient Fallback */
        <div className="absolute inset-0 bg-gradient-to-b from-[#171310] via-[#59382D]/40 to-[#171310] opacity-80" />
      )}

      {/* Atmospheric Editorial Divider & Narrative Stamp */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#221B17]/90 border border-[#D8B58C]/25 text-[10px] font-mono uppercase tracking-[0.22em] text-[#D8B58C]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B66C4B] animate-pulse" />
          {label}
        </div>
        <h3 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F4EDE3] uppercase font-serif italic">
          &ldquo;{sublabel}&rdquo;
        </h3>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D8B58C]/60 to-transparent mx-auto pt-1" />
      </div>
    </div>
  );
}
