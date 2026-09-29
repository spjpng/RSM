import Image from "next/image";
import { siteConfig } from "@/config/site";

export function Logo() {
  const { logo, brand } = siteConfig;
  return (
    <span className="inline-flex items-center gap-3">
      {logo.src ? (
        <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} priority />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-10 w-10 place-items-center rounded-full border border-primary font-serif text-sm tracking-wider text-primary"
        >
          {logo.mark}
        </span>
      )}
      <span className="font-serif text-base text-ink">{brand.name}</span>
    </span>
  );
}
