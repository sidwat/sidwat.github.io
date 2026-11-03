import Image from "next/image";
import { site } from "@/lib/site";

export default function Portrait() {
  return (
    <div className="identity-portrait">
      <Image src="/media/portrait.jpg" width={720} height={900} sizes="(max-width: 767px) 144px, 200px" alt={site.name} priority />
    </div>
  );
}
