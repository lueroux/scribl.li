import type { ImgHTMLAttributes } from 'react';

export type LogoProps = ImgHTMLAttributes<HTMLImageElement>;

export const BrandingLogoIcon = ({ ...props }: LogoProps) => {
  return (
    <img 
      src="/logo-icon.png" 
      alt="Scriblli"
      {...props}
    />
  );
};
