// DynamicSocialIcon.tsx

import React from 'react';
import { SocialIcon } from 'react-social-icons';

interface DynamicSocialIconProps {
  appName: string;
  url?: string; // New optional prop
  size?: number;
  style?: React.CSSProperties;
}

const DynamicSocialIcon: React.FC<DynamicSocialIconProps> = ({ appName, url, size = 40, style }) => {
  // Use the provided URL or default to https://www.${appName}.com
  const iconUrl = url ? url : `https://www.${appName}.com`;

  return (
    <SocialIcon
      url={iconUrl}
      style={{ height: size, width: size, ...style }} // Apply size and custom styles
      target="_blank"
      rel="noopener noreferrer"
    />
  );
};

export default DynamicSocialIcon;
