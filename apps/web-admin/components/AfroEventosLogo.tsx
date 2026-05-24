import Image from 'next/image';

interface AfroEventosLogoProps {
  variant?: 'light' | 'dark';
  height?: number;
  className?: string;
}

export function AfroEventosLogo({
  variant = 'light',
  height = 36,
  className = '',
}: AfroEventosLogoProps) {
  const src = variant === 'dark' ? '/logo-negro.svg' : '/logo-blanco.svg';
  const ratio = variant === 'dark' ? 1831.1 / 684.4 : 1890.4 / 677.3;
  const width = Math.round(height * ratio);

  return (
    <Image
      src={src}
      alt="AfroEventos"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
