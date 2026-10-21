"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BookOpen, Sparkles, ChevronRight, Compass, Award } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CareerComebackPortalProps {
  onStartComeback: () => void;
  onOpenLearningHub: () => void;
  onOpenRoadmap: () => void;
  onOpenPassport: () => void;
}

export function CareerComebackPortal({
  onStartComeback,
  onOpenLearningHub,
  onOpenRoadmap,
  onOpenPassport,
}: CareerComebackPortalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x171310, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 2. Lighting Architecture (Warm Champagne #D8B58C, Terracotta #B66C4B, Cocoa #59382D)
    const ambientLight = new THREE.AmbientLight(0x221a16, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xd8b58c, 3.2);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xb66c4b, 4.5, 15);
    rimLight.position.set(-4, -2, 2);
    scene.add(rimLight);

    const centerGlow = new THREE.PointLight(0xd8b58c, 3.0, 10);
    centerGlow.position.set(0, 0, -0.5);
    scene.add(centerGlow);

    // 3. Layered Sculptural Portal Geometry
    const portalGroup = new THREE.Group();
    scene.add(portalGroup);

    // Ring Materials
    const champagneMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8b58c,
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });

    const terracottaStoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x59382d,
      metalness: 0.25,
      roughness: 0.65,
    });

    const innerBevelMaterial = new THREE.MeshStandardMaterial({
      color: 0xb66c4b,
      metalness: 0.75,
      roughness: 0.35,
    });

    // Ring 1: Outer Architectural Colonnade Ring
    const outerTorusGeo = new THREE.TorusGeometry(3.0, 0.22, 32, 100);
    const outerRing = new THREE.Mesh(outerTorusGeo, terracottaStoneMaterial);
    portalGroup.add(outerRing);

    // Ring 2: Stepped Concentric Fluted Ring
    const midTorusGeo = new THREE.TorusGeometry(2.45, 0.16, 32, 100);
    const midRing = new THREE.Mesh(midTorusGeo, champagneMetalMaterial);
    portalGroup.add(midRing);

    // Ring 3: Deep Sculptural Bevel
    const innerTorusGeo = new THREE.TorusGeometry(1.95, 0.12, 32, 80);
    const innerRing = new THREE.Mesh(innerTorusGeo, innerBevelMaterial);
    portalGroup.add(innerRing);

    // Ring 4: Radiant Aperture Ring
    const apertureTorusGeo = new THREE.TorusGeometry(1.55, 0.06, 24, 72);
    const apertureRing = new THREE.Mesh(
      apertureTorusGeo,
      new THREE.MeshStandardMaterial({
        color: 0xf4ede3,
        emissive: 0xd8b58c,
        emissiveIntensity: 0.6,
        roughness: 0.1,
      })
    );
    portalGroup.add(apertureRing);

    // 4. Floating Ambient Stardust Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.2 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
      particleScales[i] = Math.random() * 0.05 + 0.02;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd8b58c,
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    portalGroup.add(particles);

    // 5. Mouse Parallax Variables
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handlePointerMove);

    // 6. GSAP ScrollTrigger Camera Scrubbing
    let trigger: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      // Hero entrance reveal
      gsap.fromTo(
        camera.position,
        { z: 9.5 },
        { z: 7.2, duration: 2.2, ease: "power3.out" }
      );

      gsap.fromTo(
        portalGroup.rotation,
        { z: -0.4 },
        { z: 0, duration: 2.5, ease: "power3.out" }
      );

      // Scroll-scrub camera movement through the portal
      if (containerRef.current) {
        trigger = ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 1.0,
          onUpdate: (self) => {
            const progress = self.progress;
            // Plunge camera through portal opening
            camera.position.z = 7.2 - progress * 6.2;
            camera.fov = 45 + progress * 25;
            camera.updateProjectionMatrix();

            // Rotate concentric rings in counter-motion
            outerRing.rotation.z = progress * 0.8;
            midRing.rotation.z = -progress * 1.2;
            innerRing.rotation.z = progress * 1.6;
            particles.rotation.z = progress * 0.5;

            // Fade and mask out typography during zoom-through
            if (contentRef.current) {
              const textOpacity = Math.max(0, 1 - progress * 1.8);
              const textTranslate = -progress * 140;
              contentRef.current.style.opacity = `${textOpacity}`;
              contentRef.current.style.transform = `translateY(${textTranslate}px) scale(${
                1 - progress * 0.15
              })`;
            }
          },
        });
      }
    }, containerRef);

    // 7. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damped mouse parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      portalGroup.rotation.x = currentMouseY * 0.15;
      portalGroup.rotation.y = currentMouseX * 0.2;

      // Subtle ambient pulsation
      outerRing.rotation.z += 0.001;
      midRing.rotation.z -= 0.0018;
      innerRing.rotation.z += 0.0024;
      particles.rotation.y = elapsedTime * 0.03;

      centerGlow.intensity = 2.8 + Math.sin(elapsedTime * 2.5) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive Resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (trigger) trigger.kill();
      ctx.revert();
      renderer.dispose();
      outerTorusGeo.dispose();
      midTorusGeo.dispose();
      innerTorusGeo.dispose();
      apertureTorusGeo.dispose();
      champagneMetalMaterial.dispose();
      terracottaStoneMaterial.dispose();
      innerBevelMaterial.dispose();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative w-full h-screen overflow-hidden bg-[#171310] flex items-center justify-center select-none"
    >
      {/* 3D WebGL Canvas or Static Architectural Fallback */}
      {webglSupported && !prefersReducedMotion ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          aria-hidden="true"
        />
      ) : (
        /* Static High-End Editorial Architectural Gateway Fallback */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-40">
          <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full border border-[#D8B58C]/25 shadow-[0_0_120px_rgba(216,181,140,0.15)] flex items-center justify-center">
            <div className="w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] rounded-full border border-[#B66C4B]/30 flex items-center justify-center">
              <div className="w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] rounded-full border border-[#D8B58C]/40 bg-radial from-[#D8B58C]/10 to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Atmospheric Lighting Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,transparent_20%,#171310_90%)] z-1" />

      {/* Hero Typography & Interactive Actions */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 text-center flex flex-col items-center space-y-6 pt-16 transition-all duration-300"
      >
        {/* Curated Editorial Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#221B17]/85 border border-[#D8B58C]/30 backdrop-blur-md shadow-lg animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#D8B58C] shadow-[0_0_8px_#D8B58C]" />
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.24em] text-[#D8B58C] font-semibold">
            GFG // CAREER COMEBACK PORTAL
          </span>
          <span className="text-[10px] text-[#A89B90] hidden sm:inline">•</span>
          <span className="text-[10px] font-mono text-[#F4EDE3]/80 hidden sm:inline tracking-wider">
            SCULPTURAL RE-ENTRY SYSTEM
          </span>
        </div>

        {/* Monumental Editorial Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light tracking-tighter leading-[0.92] text-[#F4EDE3] uppercase">
          <span>YOUR COMEBACK </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D8B58C] via-[#F4EDE3] to-[#B66C4B] font-serif italic tracking-normal">
            STARTS HERE.
          </span>
        </h1>

        {/* Mission Statement */}
        <p className="text-sm sm:text-lg md:text-xl text-[#A89B90] max-w-2xl font-light leading-relaxed px-2">
          A career break is not a gap — it is an active phase of life experience, resilience, and perspective. 
          Step through the gateway to verified skills, personalized AI roadmaps, and dignified opportunities.
        </p>

        {/* Primary Action Buttons (Always Clickable) */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <button
            onClick={onStartComeback}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D8B58C] via-[#B66C4B] to-[#D8B58C] hover:from-[#F4EDE3] hover:to-[#F4EDE3] text-[#171310] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(216,181,140,0.35)] hover:scale-[1.03] flex items-center gap-2"
          >
            <span>Begin Comeback Journey</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={onOpenLearningHub}
            className="px-6 py-3.5 rounded-full bg-[#221B17]/90 hover:bg-[#2F241F] border border-[#D8B58C]/30 text-xs font-semibold text-[#F4EDE3] tracking-wider uppercase transition-all backdrop-blur-md flex items-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D8B58C]" />
            <span>Explore Learning Hub</span>
          </button>

          <button
            onClick={onOpenPassport}
            className="px-6 py-3.5 rounded-full bg-[#221B17]/60 hover:bg-[#2F241F] border border-[#D8B58C]/20 text-xs font-semibold text-[#D8B58C] tracking-wider uppercase transition-all backdrop-blur-md flex items-center gap-2"
          >
            <Award className="w-3.5 h-3.5 text-[#B66C4B]" />
            <span>Career Passport</span>
          </button>
        </div>

        {/* Scroll Instruction Indicator */}
        <div className="pt-8 flex flex-col items-center gap-1.5 opacity-70 animate-bounce">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D8B58C]">
            Scroll to Enter Portal
          </span>
          <div className="w-4 h-6 rounded-full border border-[#D8B58C]/40 flex justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-[#D8B58C] animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
