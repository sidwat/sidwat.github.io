"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildQuadtree } from "@/lib/quadtree";

const CB = new THREE.Color("#4c7dff");
const CR = new THREE.Color("#ff5c8a");
/** Flat regions sit just above the page background, so they read as absence. */
const FLAT = new THREE.Color("#141829");

/** World units per unit of quadtree space. The frame is 2:1, so 13 x 6.5. */
const UNIT = 6.5;

function Partition({
  maxDepth,
  animate,
}: {
  maxDepth: number;
  animate: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const leaves = useMemo(() => buildQuadtree(maxDepth), [maxDepth]);

  // Colour runs from the flat-region grey out along the chroma axes: the more
  // structure a block carries, the further from neutral it sits.
  const colors = useMemo(() => {
    const array = new Float32Array(leaves.length * 3);
    const color = new THREE.Color();

    leaves.forEach((leaf, i) => {
      // Chroma runs continuously along the Cb–Cr axis rather than switching at
      // a hard boundary, so the contour reads as one gradient of colour.
      const axis = THREE.MathUtils.clamp(
        0.5 + 0.5 * Math.sin(leaf.x * 2.4 - leaf.y * 2.1 - 0.6),
        0,
        1,
      );
      // Weighted so only genuinely detailed blocks pick up chroma; the flat
      // majority stays near background and the partition reads as structure.
      const weight = Math.pow(leaf.detail, 1.6);
      color.copy(CB).lerp(CR, axis);
      color.lerpColors(FLAT, color, weight);
      color.toArray(array, i * 3);
    });

    return array;
  }, [leaves]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = animate ? clock.getElapsedTime() : 0;

    leaves.forEach((leaf, i) => {
      // Residual energy breathing: blocks carrying more detail move further,
      // phase-offset across the frame so the relief ripples rather than pulses.
      const wobble = animate
        ? Math.sin(t * 0.5 + leaf.x * 6 + leaf.y * 4) * leaf.detail * 0.14
        : 0;

      dummy.position.set(
        (leaf.x - 1) * UNIT,
        (0.5 - leaf.y) * UNIT,
        leaf.detail * 0.55 + wobble,
      );
      // Gapped to 0.88 so every block boundary stays visible: the partition is
      // the subject, the relief only gives it depth.
      const edge = leaf.size * UNIT * 0.88;
      dummy.scale.set(edge, edge, 0.09);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, leaves.length]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </boxGeometry>
      <meshStandardMaterial
        vertexColors
        roughness={0.62}
        metalness={0.12}
        transparent
        opacity={0.96}
      />
    </instancedMesh>
  );
}

export default function QuadtreeScene({
  maxDepth = 6,
  animate = true,
}: {
  maxDepth?: number;
  animate?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 12.2], fov: 38 }}
      // With motion off there is nothing to redraw, so the loop renders once
      // and stops rather than rebuilding every matrix each frame forever.
      frameloop={animate ? "always" : "demand"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 5, 8]} intensity={1.5} />
      <directionalLight position={[-6, -3, 4]} intensity={0.6} color="#4c7dff" />
      {/* A shallow tilt only: the partition should read as a frame being
          analysed, seen near face-on, not as a wall of bricks. */}
      <group rotation={[-0.13, 0.2, 0.02]}>
        <Partition maxDepth={maxDepth} animate={animate} />
      </group>
    </Canvas>
  );
}
