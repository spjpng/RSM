import Image from "next/image";
import { siteConfig } from "@/config/site";

/** Inherits its color from the parent so it works on light and dark backgrounds. */
export function Logo() {
  const { logo, brand } = siteConfig;
  return (
    <span className="inline-flex items-center gap-3">
      {logo.src ? (
        <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} priority />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-current text-xs font-bold tracking-wider"
        >
          {logo.mark}
        </span>
      )}
      <span className="text-[0.95rem] font-semibold tracking-tight">{brand.name}</span>
    </span>
  );
}
