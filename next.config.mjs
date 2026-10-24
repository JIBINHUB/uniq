/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    const cacheControl = "public, max-age=0, s-maxage=60, stale-while-revalidate=30";
    const pages = ["/", "/about", "/shop", "/carpets", "/guides", "/delivery", "/rooms", "/live-room", "/category/:id", "/product/:slug", "/flooring/:slug", "/retailers", "/retailers/register", "/retailers/catalogue"];
    return pages.map(source => ({ source, headers: [{ key: "Cache-Control", value: cacheControl }] }));
  },
};

export default nextConfig;
