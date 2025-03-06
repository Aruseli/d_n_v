'use client';

import { aquireFont } from '../fonts';

type HeaderProps = {
  props: React.HTMLAttributes<HTMLHeadingElement>;
};

export const UniqHeader = ({ props }: HeaderProps) => {
  return (
    <div className={`${aquireFont.className} text-base md:text-4xl m-0 ${props.className}`}>
      {props.children}
    </div>
  );
};

export const SubUniqHeader = ({ props }: HeaderProps) => {
  return (
    <span className={`${aquireFont.className} text-xs md:text-sm ${props.className}`}>
      {props.children}
    </span>
  );
};

export const Header1 = ({ props }: HeaderProps) => {
  return (
    <h1 className={`${aquireFont.className} text-2xl font-bold md:text-4xl m-0 ${props.className}`}>
      {props.children}
    </h1>
  );
};

export const Header2 = ({ props }: HeaderProps) => {
  return (
    <h2 className={`${aquireFont.className} text-xl font-bold md:text-3xl m-0 ${props.className}`}>
      {props.children}
    </h2>
  );
};

export const Header3 = ({ props }: HeaderProps) => {
  return (
    <h3 className={`${aquireFont.className} text-lg font-bold md:text-2xl m-0 ${props.className}`}>
      {props.children}
    </h3>
  );
};

export const MainDescription = ({ props }: HeaderProps) => {
  return (
    <div className={`${aquireFont.className} text-xl lg:text-6xl m-0 ${props.className}`}>
      {props.children}
    </div>
  );
};
