/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "", // Deixe em branco se não houver porta específica
        pathname: "/u/**", // Isso permite todos os avatares dos usuários (pode ajustar conforme necessário)
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "", // Deixe em branco se não houver porta específica
        pathname: "/vi/**", // Isso permite todos os avatares dos usuários (pode ajustar conforme necessário)
      },
      {
        protocol: "https",
        hostname: "cdn.folhape.com.br",
        port: "", // Deixe em branco se não houver porta específica
        pathname: "/**", // Isso permite todos os avatares dos usuários (pode ajustar conforme necessário)
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "", // Deixe em branco se não houver porta específica
        pathname: "/**", // Isso permite todos os avatares dos usuários (pode ajustar conforme necessário)
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**", // Isso permite o acesso a todas as imagens dentro do Firebase Storage
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/Dashboard",
        destination: "/dashboard", // Converta para minúsculas
        permanent: true, // Indica que o redirecionamento é permanente (código 308)
      },
      {
        source: "/Login",
        destination: "/login", // Converta para minúsculas
        permanent: true,
      },
      {
        source: "/Login/ForgetPassword",
        destination: "/login/forgetPassword", // Converta para minúsculas
        permanent: true,
      },
      {
        source: "/OurServices",
        destination: "/ourServices", // Converta para minúsculas
        permanent: true,
      },
      {
        source: "/Schedule",
        destination: "/schedule", // Converta para minúsculas
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
