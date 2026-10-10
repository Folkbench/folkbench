import { Outlet } from '@tanstack/react-router'

/**
 * Passthrough until the shell milestone replaces it with the sidebar, header,
 * and context inspector defined in `docs/layout-architecture.md`.
 */
export function AuthenticatedLayout() {
  return <Outlet />
}
