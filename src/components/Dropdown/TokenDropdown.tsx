import type { FC } from "react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";

const DropDownItems: Array<{
  title: string;
  href: string;
}> = [
    {
      title: "Create",
      href: "/create",
    },
    {
      title: "Burn",
      href: "/burn",
    },
    {
      title: "Close",
      href: "/close",
    },
    {
      title: "Claim Transfer Fees",
      href: "/claim-fees",
    }
  ];

export const TokenDropdown: FC = () => {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLUListElement>(null);

  const openDropdown = useCallback(() => {
    setActive(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setActive(false);
  }, []);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return;

      closeDropdown();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, closeDropdown]);

  return (
    <div className="wallet-adapter-dropdown">
      <button
        aria-expanded={active}
        className="text-lg font-medium sm:text-xl"
        onClick={openDropdown}
      >
        <div className="flex items-center">
          <div>Tokens</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="ml-1 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </button>
      <ul
        aria-label="dropdown-list"
        className={`wallet-adapter-dropdown-list ${active && "wallet-adapter-dropdown-list-active bg-[#000000] mt-4 border"
          }`}
        ref={ref}
        role="menu"
      >
        {DropDownItems.map((item, key) => {
          return (
            <li key={key} className="wallet-adapter-dropdown-list-item px-4" role="menuitem">
              <Link href={item.href}>{item.title}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  );
};