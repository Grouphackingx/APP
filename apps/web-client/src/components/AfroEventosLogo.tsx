import Image from 'next/image';

interface AfroEventosLogoProps {
  /** 'light' = logo blanco para fondos oscuros (default)
   *  'dark'  = logo negro para fondos claros */
  variant?: 'light' | 'dark';
  /** Altura del logo en px (el ancho se ajusta proporcionalmente — ratio ~2.79:1) */
  height?: number;
  /** Clases extra para el contenedor */
  className?: string;
}

export function AfroEventosLogo({
  variant = 'light',
  height = 36,
  className = '',
}: AfroEventosLogoProps) {
  const src = variant === 'dark' ? '/logo-negro.svg' : '/logo-blanco.svg';
  // viewBox ratio: blanco 1890.4×677.3 ≈ 2.793 | negro 1831.1×684.4 ≈ 2.675
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
