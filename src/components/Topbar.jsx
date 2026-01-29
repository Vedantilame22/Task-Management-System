import { Link } from "react-router-dom";

/*
  Public topbar for landing pages.
  Color system aligned with application (Dashboard / Tasks / Calendar).
  Designed for enterprise-grade presentation.
*/

export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D3D9D4]">
      <div
        className="
          w-full
          px-6 sm:px-10 lg:px-16
          h-16
          flex items-center justify-between
        "
      >
        {/* LOGO */}
        <div className="flex items-center">
          <img
            src="/image/logo.png"
            alt="Graphura"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* ACTIONS */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {/* Secondary action */}
          <Link
            to="/login"
            className="
              px-3 py-2
              text-sm font-medium
              text-[#235857]
              rounded-lg
              hover:bg-[#D3D9D4]/40
              transition
            "
          >
            Sign in
          </Link>

          {/* Primary action */}
          <Link
            to="/signup"
            className="
              px-5 py-2.5
              rounded-lg
              bg-[#235857]
              text-white
              text-sm font-semibold
              shadow-sm
              hover:bg-[#1F6F68]
              hover:shadow-md
              active:scale-[0.98]
              focus:outline-none
              focus:ring-2 focus:ring-[#235857]/30
              transition
            "
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
