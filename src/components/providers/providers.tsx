"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/context/AuthContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </AuthProvider>
  );
}
