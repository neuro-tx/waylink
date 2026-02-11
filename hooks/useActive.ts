import { usePathname } from "next/navigation";

/**
 * Hook that returns a function to check if any link is active
 * @returns A function that takes href and optional exact parameter
 */
export function useActive() {
  const pathName = usePathname();

  return (href: string, exact: boolean = false) => {
    if (exact) {
      return pathName === href;
    }

    return pathName === href || pathName.startsWith(href + "/");
  };
}
