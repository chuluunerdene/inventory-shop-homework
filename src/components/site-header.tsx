"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart-provider";

const links = [
  { href: "/", label: "Бүтээгдэхүүн" },
  { href: "/inventory", label: "Агуулах" },
  { href: "/cart", label: "Сагс" },
];

type NavTintStyle = {
  height: number;
  opacity: number;
  width: number;
  x: number;
  y: number;
};

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const navRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [navTintStyle, setNavTintStyle] = useState<NavTintStyle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/inventory") {
      return (
        pathname === "/inventory" ||
        pathname === "/products/new" ||
        pathname.endsWith("/edit")
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useLayoutEffect(() => {
    const updateNavTint = () => {
      const activeLink = links.find((link) => isLinkActive(link.href));
      const navElement = navRef.current;
      const activeElement = activeLink ? linkRefs.current[activeLink.href] : null;

      if (!navElement || !activeElement) {
        setNavTintStyle((current) =>
          current.opacity === 0 ? current : { ...current, opacity: 0 },
        );
        return;
      }

      const navRect = navElement.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      setNavTintStyle({
        x: activeRect.left - navRect.left,
        y: activeRect.top - navRect.top,
        width: activeRect.width,
        height: activeRect.height,
        opacity: 1,
      });
    };

    const frameId = window.requestAnimationFrame(updateNavTint);
    window.addEventListener("resize", updateNavTint);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateNavTint);
    };
  }, [itemCount, pathname]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__panel">
          <Link href="/" className="brand">
            <span className="brand__mark" aria-hidden="true" />
            <span className="brand__copy">
              <span className="brand__title">Даалгавар</span>
              <span className="brand__label">Тавтай морилно уу</span>
            </span>
          </Link>

          <nav className="nav" ref={navRef}>
            <span
              className="nav__tint"
              aria-hidden="true"
              style={{
                width: navTintStyle.width,
                height: navTintStyle.height,
                opacity: navTintStyle.opacity,
                transform: `translate(${navTintStyle.x}px, ${navTintStyle.y}px)`,
              }}
            />
            {links.map((link) => {
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(element) => {
                    linkRefs.current[link.href] = element;
                  }}
                  className={`nav__link ${isActive ? "nav__link--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="nav__text">{link.label}</span>
                  {link.href === "/cart" ? (
                    <span className="nav__badge">{itemCount}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
