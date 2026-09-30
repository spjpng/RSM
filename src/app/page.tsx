import { LandingPage } from "@/components/LandingPage";
import { SiteProvider } from "@/components/SiteProvider";

export default function Home() {
  return (
    <SiteProvider>
      <LandingPage />
    </SiteProvider>
  );
}
