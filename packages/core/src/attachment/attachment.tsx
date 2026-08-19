import * as React from "react";
import type { AttachmentFile } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";
import { formatBytes } from "../utils/format";

interface AttachmentContextValue {
  file: AttachmentFile;
  remove: () => void;
  canRemove: boolean;
  labelId: string;
}

const [AttachmentProvider, useAttachmentContext] =
  createContext<AttachmentContextValue>("Attachment");

/** Read the file this chip is for. */
export function useAttachment(): AttachmentContextValue {
  return useAttachmentContext("useAttachment");
}

export interface AttachmentListProps
  extends React.HTMLAttributes<HTMLUListElement> {
  label?: string;
  asChild?: boolean;
}

/** The list of attached files. */
export const AttachmentList = React.forwardRef<
  HTMLUListElement,
  AttachmentListProps
>(function AttachmentList(
  { label = "Attachments", asChild = false, ...rest },
  forwardedRef,
) {
  const Comp = resolveElement(asChild, "ul");
  return (
    <Comp
      ref={forwardedRef}
      aria-label={label}
      data-handoff-part="attachment-list"
      {...rest}
    />
  );
});

export interface AttachmentProps extends React.LiHTMLAttributes<HTMLLIElement> {
  file: AttachmentFile;
  onRemove?: (file: AttachmentFile) => void;
  asChild?: boolean;
}

/**
 * One attached file.
 *
 * ```tsx
 * <AttachmentList>
 *   {files.map((file) => (
 *     <Attachment key={file.id} file={file} onRemove={remove}>
 *       <AttachmentName />
 *       <AttachmentMeta />
 *       <AttachmentRemove />
 *     </Attachment>
 *   ))}
 * </AttachmentList>
 * ```
 */
export const Attachment = React.forwardRef<HTMLLIElement, AttachmentProps>(
  function Attachment({ file, onRemove, asChild = false, children, ...rest }, forwardedRef) {
    const reactId = React.useId();
    const labelId = `handoff-attachment-${reactId}-label`;

    const status = file.status ?? "ready";
    const canRemove = Boolean(onRemove);
    const remove = React.useCallback(() => onRemove?.(file), [onRemove, file]);

    const Comp = resolveElement(asChild, "li");

    return (
      <AttachmentProvider value={{ file, remove, canRemove, labelId }}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="attachment"
          data-status={status}
          {...rest}
        >
          {children}
        </Comp>
      </AttachmentProvider>
    );
  },
);

export interface AttachmentNameProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

export const AttachmentName = React.forwardRef<
  HTMLSpanElement,
  AttachmentNameProps
>(function AttachmentName({ asChild = false, children, ...rest }, forwardedRef) {
  const { file, labelId } = useAttachmentContext("AttachmentName");
  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} id={labelId} title={file.name} {...rest}>
      {children ?? file.name}
    </Comp>
  );
});

const STATUS_LABEL: Record<NonNullable<AttachmentFile["status"]>, string> = {
  pending: "Waiting to upload",
  uploading: "Uploading",
  ready: "Ready",
  error: "Failed to upload",
};

export interface AttachmentMetaProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/**
 * Size and state.
 *
 * Upload state is spoken as well as shown, since a spinner and a tick look
 * different but announce identically if they are only ever an icon.
 */
export const AttachmentMeta = React.forwardRef<
  HTMLSpanElement,
  AttachmentMetaProps
>(function AttachmentMeta({ asChild = false, children, ...rest }, forwardedRef) {
  const { file } = useAttachmentContext("AttachmentMeta");
  const status = file.status ?? "ready";
  const Comp = resolveElement(asChild, "span");

  if (children !== undefined) {
    return (
      <Comp ref={forwardedRef} {...rest}>
        {children}
      </Comp>
    );
  }

  const size = file.size === undefined ? null : formatBytes(file.size);

  return (
    <Comp ref={forwardedRef} data-status={status} data-handoff-slot="meta" {...rest}>
      {size ? <span aria-hidden="true">{size}</span> : null}
      <span style={visuallyHidden}>
        {size ? `${size}. ` : ""}
        {file.error ?? STATUS_LABEL[status]}
      </span>
    </Comp>
  );
});

export interface AttachmentProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** Upload progress. Present only while an upload is actually running. */
export const AttachmentProgress = React.forwardRef<
  HTMLDivElement,
  AttachmentProgressProps
>(function AttachmentProgress({ asChild = false, children, ...rest }, forwardedRef) {
  const { file } = useAttachmentContext("AttachmentProgress");
  if (file.status !== "uploading") return null;

  const fraction = Math.max(0, Math.min(1, file.progress ?? 0));
  const percent = Math.round(fraction * 100);
  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={forwardedRef}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}% uploaded`}
      data-handoff-slot="attachment-progress"
      style={{ "--handoff-upload-fill": String(fraction) } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Comp>
  );
});

export interface AttachmentRemoveProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Remove the file. Named against it, so a list does not read as "Remove" repeated. */
export const AttachmentRemove = React.forwardRef<
  HTMLButtonElement,
  AttachmentRemoveProps
>(function AttachmentRemove({ asChild = false, onClick, children, ...rest }, forwardedRef) {
  const { remove, canRemove, labelId } = useAttachmentContext("AttachmentRemove");
  // Ahead of the early return: hooks cannot run conditionally.
  const selfId = React.useId();

  if (!canRemove) return null;

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      id={selfId}
      type="button"
      aria-labelledby={`${selfId} ${labelId}`}
      data-handoff-slot="attachment-remove"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        remove();
      }}
      {...rest}
    >
      {children ?? "Remove"}
    </Comp>
  );
});
