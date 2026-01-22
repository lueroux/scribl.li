import type { ImgHTMLAttributes } from 'react';

export type LogoProps = ImgHTMLAttributes<HTMLImageElement>;

export const BrandingLogo = ({ ...props }: LogoProps) => {
  return (
    <img 
      src="/logo.png" 
      alt="Scriblli"
      {...props}
    />
  );
};
