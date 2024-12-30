// DynamicSocialIcon.tsx

import React from 'react';
import { SocialIcon } from 'react-social-icons';

interface DynamicSocialIconProps {
  appName: string;
  size?: number;
  style?: React.CSSProperties;
}

const DynamicSocialIcon: React.FC<DynamicSocialIconProps> = ({ appName, size = 40, style }) => {
  // Construct the URL based on the appName
  const url = `https://www.${appName}.com`;

  return (
    <SocialIcon
      url={url}
      style={{ height: size, width: size, ...style }} // Apply size and custom styles
    />
  );
};

export default DynamicSocialIcon;
