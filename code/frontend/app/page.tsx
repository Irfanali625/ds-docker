import { cookies } from "next/headers";
import { LandingView } from "@/views/landing/LandingView";

export default function Home() {
  return <LandingView signedIn={!!cookies().get("auth_token")?.value} />;
}
