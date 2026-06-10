//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Hosts desde los que next/image puede optimizar imágenes remotas.
    // Las URLs de subidas se guardan absolutas (ver upload.controller.ts):
    //   prod  → https://api.afroeventos.com/uploads/...
    //   dev   → http://localhost:3000/uploads/...
    //   cloudinary (si STORAGE_PROVIDER=cloudinary) → res.cloudinary.com
    remotePatterns: [
      { protocol: 'https', hostname: 'api.afroeventos.com' },
      { protocol: 'http', hostname: 'localhost', port: '3000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    // Next 16 bloquea por anti-SSRF las imágenes que resuelven a IP privada.
    // En local (dev o build) las subidas viven en http://localhost:3000 (IP
    // privada), así que lo permitimos SOLO cuando la API es local. En Coolify
    // NEXT_PUBLIC_API_URL apunta a https://api.afroeventos.com (IP pública) →
    // queda desactivado y la protección anti-SSRF sigue activa.
    dangerouslyAllowLocalIP: /localhost|127\.0\.0\.1/.test(
      process.env.NEXT_PUBLIC_API_URL || 'localhost'
    ),
  },
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.svg',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
