'use client';

import Image from 'next/image';
import React from 'react';

import { ThemeToggleWrapper } from '@/app/theme/ThemeToggleWrapper';

import { aquireFont } from '../../fonts';
import { UniqHeader, SubUniqHeader } from '../Headers';

interface IDesktopMenuProps {
  colorMode?: React.ReactNode;
}

export const DesktopMenu = ({ colorMode }: IDesktopMenuProps) => {
  return (
    <div className='flex items-center justify-between p-4 lg:p-6'>
      <div className='text-4xl flex items-center gap-2'>
        <Image src='/logo_blue.svg' alt='Deep Logo' width={36} height={36} className='w-6 md:w-9' />
        <UniqHeader
          props={{
            children: (
              <>
                Deep <SubUniqHeader props={{ children: 'foundation' }} />
              </>
            ),
          }}
        />
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
