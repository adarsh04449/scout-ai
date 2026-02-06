import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  primaryLabel?: string;
  primaryHref?: string;
}

export default function Navbar({
  primaryLabel = "Research your idea",
  primaryHref = "/research",
}: NavbarProps) {
  return (
    <nav className="border-b border-[#1F2937] bg-[#0A0A0A]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0A]/70 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-5">
          <Image
            src="/logo.png"
            alt="ScoutAI Logo"
            width={60}
            height={70}
            className="object-contain"
            priority
          />
          <div className="flex flex-col leading-tight -ml-5">
            <span className="text-xl text-white font-semibold">ScoutAI</span>
            <span className="text-xs text-[#94A3B8]">Market Research Assistant</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href={primaryHref} className="px-4 py-2 rounded-xl bg-[#111111] transition-all text-sm font-medium text-white border border-white/20 hover:border-white/40 hover:shadow-[0_10px_24px_rgba(255,255,255,0.18)]">
            {primaryLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}

