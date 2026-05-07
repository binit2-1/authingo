import type { Metadata } from "next";

export const siteName = "AuthInGo";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://authingo.vercel.app"
).replace(/\/$/, "");

export const siteDescription =
  "AuthInGo is a secure, cookie-based authentication toolkit for Go backends and React frontends with opaque sessions, PostgreSQL storage, and a tiny developer experience.";

export const siteKeywords = [
  "AuthInGo",
  "Go authentication",
  "Golang auth",
  "React authentication",
  "Next.js authentication",
  "cookie sessions",
  "opaque tokens",
  "PostgreSQL auth",
  "Better Auth for Go",
];

export const defaultOgImage = {
  path: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "AuthInGo authentication toolkit for Go and React",
};

type MetadataOptions = {
  title: string;
  description: string;
  path?: string;
  image?: typeof defaultOgImage;
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function titleWithSite(title: string) {
  return title === siteName ? siteName : `${title} | ${siteName}`;
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  image = defaultOgImage,
}: MetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image.path);
  const socialTitle = titleWithSite(title);
  const pageTitle: Metadata["title"] =
    title === siteName ? { absolute: siteName } : title;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [
        {
          url: imageUrl,
          alt: image.alt,
        },
      ],
    },
  };
}
