"use client";

import NextLink from "next/link";
import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useEffect, type ComponentProps, type ReactNode } from "react";

/** Turn a route template like `/exams/$examId/topics` into a real path. */
export function buildPath(
  to: string,
  params?: Record<string, string>,
  search?: Record<string, string | number | boolean | undefined>,
) {
  let path = to;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`$${key}`, value);
    }
  }
  if (search) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    }
    const query = qs.toString();
    if (query) path += `?${query}`;
  }
  return path;
}

type AppLinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string | number | boolean | undefined>;
};

export function Link({ to, params, search, ...rest }: AppLinkProps) {
  return <NextLink href={buildPath(to, params, search)} {...rest} />;
}

type NavigateOptions = {
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string | number | boolean | undefined>;
  replace?: boolean;
};

export function useNavigate() {
  const router = useNextRouter();
  const pathname = usePathname();

  return (opts: NavigateOptions) => {
    const href = buildPath(opts.to ?? pathname, opts.params, opts.search);
    if (opts.replace) router.replace(href);
    else router.push(href);
  };
}

export function useRouterState<T>(opts: {
  select: (state: { location: { pathname: string } }) => T;
}): T {
  const pathname = usePathname();
  return opts.select({ location: { pathname } });
}

export function Navigate({
  to,
  params,
  replace,
}: {
  to: string;
  params?: Record<string, string>;
  replace?: boolean;
}) {
  const router = useNextRouter();
  const href = buildPath(to, params);

  useEffect(() => {
    if (replace) router.replace(href);
    else router.push(href);
  }, [href, replace, router]);

  return null;
}

/** Read a single query param in client page components. */
export function useRouteSearchParam(key: string): string {
  return useSearchParams().get(key) ?? "";
}

export function Outlet({ children }: { children?: ReactNode }) {
  return children ?? null;
}
