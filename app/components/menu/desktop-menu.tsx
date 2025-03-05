'use client'

import React from "react";
import { aquireFont } from "../../fonts";
import { ThemeToggleWrapper } from "@/app/theme/ThemeToggleWrapper";
import Image from "next/image";

interface IDesktopMenuProps {
  colorMode?: React.ReactNode;
}

export const DesktopMenu = ({colorMode}:IDesktopMenuProps) => {
  return (
    <div className="flex items-center justify-between p-4 lg:p-6">
      <div className="text-4xl flex items-center gap-2">
        <Image
          src="/logo_blue.svg"
          width={36}
          height={36}
          alt="Deep Logo"
        />
        <h1>
          <span className={`${aquireFont.className} text-4xl`}>Deep</span><span className={`${aquireFont.className} text-sm`}>foundation</span>
        </h1>
      </div>
      <div className={`${aquireFont.className} text-base flex items-center justify-center gap-4`}>
        <h2>Our Philosophy</h2>
        <h2>Documentation</h2>
        <h2>GitHub</h2>
        <h2>Contact Us</h2>
        <ThemeToggleWrapper />
      </div>
    </div>
  );
};