// src/components/ThemeToggle/ThemeToggle.tsx
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '@/config';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  showTooltip = true,
}) => {
  const { theme, toggleTheme } = useThemeContext();

  const icon = theme === 'light' ? <Brightness4 /> : <Brightness7 />;
  const tooltipText =
    theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  const button = (
    <IconButton
      onClick={toggleTheme}
      size={size}
      sx={{
        color: 'inherit',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      {icon}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={tooltipText} placement="bottom">
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ThemeToggle;
