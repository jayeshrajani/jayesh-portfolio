"use client";

import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";

import { COLORS } from "@/data/theme";

type SignStyle = "dark" | "primary" | "wood";

type FacadeSignProps = {
  emphasized?: boolean;
  height?: number;
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
  subtitle: string;
  title: string;
  width?: number;
};

type LocationMarkerProps = {
  emphasized?: boolean;
  position: readonly [number, number, number];
  subtitle: string;
  title: string;
};

export function LocationMarker({
  emphasized = false,
  position,
  subtitle,
  title,
}: LocationMarkerProps) {
  return (
    <Html
      center
      position={position}
      pointerEvents="none"
      zIndexRange={[4, 1]}
    >
      <div className="world-marker" data-emphasized={emphasized}>
        <span className="world-marker__status">LOCATION</span>
        <strong>{title}</strong>
        <span className="world-marker__subtitle">{subtitle}</span>
      </div>
    </Html>
  );
}

function fitFont(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  weight: number,
  family: string,
) {
  let size = initialSize;
  context.font = `${weight} ${size}px ${family}`;

  while (context.measureText(text).width > maxWidth && size > 24) {
    size -= 2;
    context.font = `${weight} ${size}px ${family}`;
  }

  return size;
}

function useSignTexture(title: string, subtitle: string, style: SignStyle) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let disposed = false;
    let createdTexture: THREE.CanvasTexture | null = null;

    const createTexture = async () => {
      await document.fonts.ready;
      if (disposed) return;

      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      if (!context) return;

      const fontFamily =
        getComputedStyle(document.body).getPropertyValue("--font-mono").trim() || "monospace";
      const isWood = style === "wood";
      const isPrimary = style === "primary";

      if (!isWood) {
        context.fillStyle = isPrimary ? COLORS.accent : COLORS.charcoal;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = isPrimary ? COLORS.offWhite : COLORS.accent;
        context.fillRect(0, 0, 22, canvas.height);
        context.strokeStyle = isPrimary ? "rgba(37, 44, 45, 0.35)" : "rgba(238, 240, 234, 0.22)";
        context.lineWidth = 5;
        context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
      } else {
        context.fillStyle = "rgba(238, 240, 234, 0.94)";
        context.fillRect(26, 26, canvas.width - 52, canvas.height - 52);
        context.strokeStyle = "rgba(37, 44, 45, 0.72)";
        context.lineWidth = 8;
        context.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
      }

      context.textBaseline = "alphabetic";
      context.fillStyle = isWood || isPrimary ? COLORS.charcoal : COLORS.offWhite;
      const titleSize = fitFont(
        context,
        title,
        isWood ? 860 : 880,
        isWood ? 82 : 78,
        isWood ? 800 : 650,
        fontFamily,
      );
      context.font = `${isWood ? 800 : 650} ${titleSize}px ${fontFamily}`;
      context.textAlign = isWood ? "center" : "left";
      context.fillText(title, isWood ? 512 : 72, subtitle ? 116 : 150);

      if (subtitle) {
        context.fillStyle = isWood
          ? "rgba(37, 44, 45, 0.78)"
          : isPrimary
            ? "rgba(37, 44, 45, 0.78)"
            : COLORS.path;
        const subtitleSize = fitFont(
          context,
          subtitle,
          isWood ? 880 : 870,
          isWood ? 30 : 29,
          500,
          fontFamily,
        );
        context.font = `500 ${subtitleSize}px ${fontFamily}`;
        context.fillText(subtitle, isWood ? 512 : 72, 188);
      }

      createdTexture = new THREE.CanvasTexture(canvas);
      createdTexture.colorSpace = THREE.SRGBColorSpace;
      createdTexture.anisotropy = 4;
      createdTexture.needsUpdate = true;
      setTexture(createdTexture);
    };

    void createTexture();

    return () => {
      disposed = true;
      createdTexture?.dispose();
    };
  }, [style, subtitle, title]);

  return texture;
}

export function FacadeSign({
  emphasized = false,
  height = 0.72,
  position,
  rotation = [0, 0, 0],
  subtitle,
  title,
  width = 3.1,
}: FacadeSignProps) {
  const texture = useSignTexture(title, subtitle, emphasized ? "primary" : "dark");

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.12]} />
        <meshStandardMaterial
          color={emphasized ? COLORS.accent : COLORS.charcoal}
          roughness={0.82}
        />
      </mesh>
      {texture ? (
        <mesh position={[0, 0, 0.066]} renderOrder={2}>
          <planeGeometry args={[width - 0.04, height - 0.04]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}