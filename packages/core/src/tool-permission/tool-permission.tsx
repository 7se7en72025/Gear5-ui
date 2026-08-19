import * as React from "react";
import type { GrantScope, ToolGrant } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

interface ToolPermissionContextValue {
  grant: ToolGrant;
  setScope: (scope: GrantScope) => void;
  revoke: () => void;
  canRevoke: boolean;
  labelId: string;
}

const [ToolPermissionProvider, useToolPermissionContext] =
  createContext<ToolPermissionContextValue>("ToolPermission");

/** Read the grant this row is for. */
export function useToolPermission(): ToolPermissionContextValue {
  return useToolPermissionContext("useToolPermission");
}

export interface ToolPermissionListProps
  extends React.HTMLAttributes<HTMLUListElement> {
  label?: string;
  asChild?: boolean;
}

/** The set of standing grants. */
export const ToolPermissionList = React.forwardRef<
  HTMLUListElement,
  ToolPermissionListProps
>(function ToolPermissionList(
  { label = "Tool permissions", asChild = false, ...rest },
  forwardedRef,
) {
  const Comp = resolveElement(asChild, "ul");
  return (
    <Comp
      ref={forwardedRef}
      aria-label={label}
      data-handoff-part="tool-permission-list"
      {...rest}
    />
  );
});

export interface ToolPermissionProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "onChange"> {
  grant: ToolGrant;
  onScopeChange?: (scope: GrantScope, grant: ToolGrant) => void;
  onRevoke?: (grant: ToolGrant) => void;
  asChild?: boolean;
}

/**
 * A standing permission for one tool.
 *
 * Approval covers the single moment. This covers the answer to "stop asking
 * me", which is the setting people grant in a hurry and then cannot find again.
 * Every grant is listed, adjustable, and revocable in one place.
 *
 * ```tsx
 * <ToolPermissionList>
 *   {grants.map((grant) => (
 *     <ToolPermission key={grant.toolName} grant={grant} onRevoke={revoke}>
 *       <ToolPermissionName />
 *       <ToolPermissionScope />
 *       <ToolPermissionRevoke />
 *     </ToolPermission>
 *   ))}
 * </ToolPermissionList>
 * ```
 */
export const ToolPermission = React.forwardRef<HTMLLIElement, ToolPermissionProps>(
  function ToolPermission(
    { grant, onScopeChange, onRevoke, asChild = false, children, ...rest },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const labelId = `handoff-grant-${reactId}-label`;

    const setScope = React.useCallback(
      (scope: GrantScope) => onScopeChange?.(scope, grant),
      [onScopeChange, grant],
    );
    const revoke = React.useCallback(() => onRevoke?.(grant), [onRevoke, grant]);

    const Comp = resolveElement(asChild, "li");

    return (
      <ToolPermissionProvider
        value={{ grant, setScope, revoke, canRevoke: Boolean(onRevoke), labelId }}
      >
        <Comp
          ref={forwardedRef}
          data-handoff-part="tool-permission"
          data-scope={grant.scope}
          {...rest}
        >
          {children}
        </Comp>
      </ToolPermissionProvider>
    );
  },
);

export interface ToolPermissionNameProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The tool name, plus any constraint the grant is narrowed to. */
export const ToolPermissionName = React.forwardRef<
  HTMLSpanElement,
  ToolPermissionNameProps
>(function ToolPermissionName({ asChild = false, children, ...rest }, forwardedRef) {
  const { grant, labelId } = useToolPermissionContext("ToolPermissionName");
  const Comp = resolveElement(asChild, "span");

  return (
    <Comp ref={forwardedRef} id={labelId} {...rest}>
      {children ?? grant.toolName}
      {grant.constraint ? (
        <span data-handoff-slot="constraint"> {grant.constraint}</span>
      ) : null}
    </Comp>
  );
});

const SCOPE_LABEL: Record<GrantScope, string> = {
  once: "Ask every time",
  session: "For this session",
  always: "Always allow",
};

export interface ToolPermissionScopeProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "value" | "onChange"
  > {
  labels?: Partial<Record<GrantScope, string>>;
}

/**
 * How long the grant lasts.
 *
 * A real select, and labelled against the tool so a page full of these does not
 * read as a column of identical unlabelled dropdowns.
 */
export const ToolPermissionScope = React.forwardRef<
  HTMLSelectElement,
  ToolPermissionScopeProps
>(function ToolPermissionScope({ labels, ...rest }, forwardedRef) {
  const { grant, setScope, labelId } =
    useToolPermissionContext("ToolPermissionScope");
  const selfId = React.useId();

  return (
    <>
      <span id={selfId} style={visuallyHidden}>
        Permission for
      </span>
      <select
        ref={forwardedRef}
        aria-labelledby={`${selfId} ${labelId}`}
        value={grant.scope}
        onChange={(event) => setScope(event.target.value as GrantScope)}
        data-handoff-slot="scope"
        {...rest}
      >
        {(["once", "session", "always"] as GrantScope[]).map((scope) => (
          <option key={scope} value={scope}>
            {labels?.[scope] ?? SCOPE_LABEL[scope]}
          </option>
        ))}
      </select>
    </>
  );
});

export interface ToolPermissionRevokeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Drop the grant entirely. Named against its tool. */
export const ToolPermissionRevoke = React.forwardRef<
  HTMLButtonElement,
  ToolPermissionRevokeProps
>(function ToolPermissionRevoke(
  { asChild = false, onClick, children, ...rest },
  forwardedRef,
) {
  const { revoke, canRevoke, labelId } =
    useToolPermissionContext("ToolPermissionRevoke");
  const selfId = React.useId();

  if (!canRevoke) return null;

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      id={selfId}
      type="button"
      aria-labelledby={`${selfId} ${labelId}`}
      data-handoff-slot="revoke"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        revoke();
      }}
      {...rest}
    >
      {children ?? "Revoke"}
    </Comp>
  );
});
