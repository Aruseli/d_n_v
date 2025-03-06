'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'motion/react';
import React, { useEffect } from 'react';

import { MotionBox } from '../components/motion-components/MotionBox';
import { useTheme } from '../context/ThemeContext';

const variantsMoon = {
  active: {
    opacity: 1,
    y: '0',
    x: '0',
    scale: 1,
    rotate: 0,
    transition: {
      delay: 0.2,
      duration: 0.5,
    },
  },
  inactive: {
    opacity: 0,
    y: '1em',
    x: '0.5rem',
    rotate: -30,
    scale: 0.1,
    transition: {
      duration: 0.5,
    },
  },
};

const variantsSun = {
  active: {
    opacity: 1,
    y: '0',
    x: '0',
    scale: 1,
    rotate: 0,
    transition: {
      delay: 0.2,
      duration: 0.5,
    },
  },
  inactive: {
    opacity: 0,
    y: '1em',
    x: '0.5rem',
    rotate: -30,
    scale: 0.1,
    transition: {
      duration: 0.5,
    },
  },
};

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className='w-8 h-8 lg:w-12 h-10 relative overflow-hidden'>
      <div
        className='
        w-full
        h-[3rem]
        rounded-full
        absolute
        -bottom-11
        shadow-earth
        transition-color duration-900
      '
      />
      <button
        onClick={toggleTheme}
        className='relative
                  w-8 h-8 lg:w-12 h-10
                  hover:text-gray-700 
                  dark:hover:text-gray-500
                  focus:outline-none'
        aria-label={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
      >
        {/* Иконка солнца (светлая тема) */}
        <MotionBox
          className='w-4 h-4 lg:w-6 h-6 absolute top-2 left-[25%]'
          variants={variantsSun}
          animate={theme === 'dark' ? variantsSun.active : variantsSun.inactive}
        >
          <SunIcon />
        </MotionBox>

        {/* Иконка луны (темная тема) */}
        <MotionBox
          className='w-4 h-4 lg:w-6 h-6 absolute top-2 left-[25%]'
          variants={variantsMoon}
          animate={theme === 'light' ? variantsMoon.active : variantsMoon.inactive}
        >
          <MoonIcon />
        </MotionBox>
      </button>
    </div>
  );
};
