import type { ImgHTMLAttributes } from 'react';

import { useTheme } from 'remix-themes';

export type LogoProps = ImgHTMLAttributes<HTMLImageElement>;

export const BrandingLogo = ({ ...props }: LogoProps) => {
  const [theme] = useTheme();
  const isDark = theme === 'dark';

  return (
    <img
      src="/logo.png"
      alt="Scriblli"
      style={{
        filter: isDark ? 'invert(1)' : 'none',
        ...props.style,
      }}
      {...props}
    />
  );
};
