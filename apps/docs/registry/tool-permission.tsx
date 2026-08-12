"use client";

import * as React from "react";
import {
  ToolPermission,
  ToolPermissionList as ToolPermissionListPrimitive,
  ToolPermissionName,
  ToolPermissionRevoke,
  ToolPermissionScope,
} from "handoff-ui";
import type { GrantScope, ToolGrant } from "handoff-ui";
import { cn } from "./lib/utils";

export interface ToolPermissionListProps {
  grants: readonly ToolGrant[];
  onScopeChange?: (scope: GrantScope, grant: ToolGrant) => void;
  onRevoke?: (grant: ToolGrant) => void;
  className?: string;
}

/** Styled list of standing tool grants. */
export function ToolPermissionList({
  grants,
  onScopeChange,
  onRevoke,
  className,
}: ToolPermissionListProps) {
  return (
    <ToolPermissionListPrimitive
      className={cn(
        "divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel",
        className,
      )}
    >
      {grants.map((grant) => (
        <ToolPermission
          key={grant.toolName}
          grant={grant}
          onScopeChange={onScopeChange}
          onRevoke={onRevoke}
          className="flex flex-wrap items-center gap-3 px-3 py-2.5"
        >
          <ToolPermissionName
            className={cn(
              "min-w-0 flex-1 truncate font-mono text-[13px] text-fg",
              "[&_[data-handoff-slot=constraint]]:text-fg-faint",
            )}
          />

          <ToolPermissionScope
            className={cn(
              "rounded-chip border border-line bg-bg px-2 py-1 text-[12px] text-fg-muted",
            )}
          />

          <ToolPermissionRevoke
            className="rounded-chip px-2 py-1 text-[12px] text-fg-faint transition-colors hover:text-danger"
          />
        </ToolPermission>
      ))}
    </ToolPermissionListPrimitive>
  );
}
