"use client";

import * as React from "react";

import { validatePincode } from "../../lib/pincode";
import { cn } from "./field";
import { PincodeInput } from "./pincode-input";
import { StateSelect } from "./state-select";

export interface IndianAddress {
  line1: string;
  line2: string;
  landmark: string;
  pincode: string;
  city: string;
  /** Two-letter state code. */
  state: string;
}

export const EMPTY_ADDRESS: IndianAddress = {
  line1: "",
  line2: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
};

export interface AddressFormProps {
  value?: IndianAddress;
  defaultValue?: IndianAddress;
  onValueChange?: (address: IndianAddress) => void;
  /**
   * Called when a valid PIN code is entered. Resolve city/state from India
   * Post or your own dataset and return them — the form fills the rest in.
   * Without this, city and state stay manual.
   */
  onPincodeResolve?: (
    pincode: string,
  ) => Promise<{ city?: string; state?: string } | undefined>;
  /** Include a landmark line — expected on most Indian delivery forms. */
  showLandmark?: boolean;
  disabled?: boolean;
  className?: string;
}

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none transition placeholder:text-neutral-400 focus-visible:border-neutral-900 focus-visible:ring-[3px] focus-visible:ring-neutral-900/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:placeholder:text-neutral-600 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-100/10";

/**
 * A full Indian postal address: two address lines, an optional landmark, then
 * PIN code, city and state.
 *
 * PIN code comes *before* city and state because that's the order that lets a
 * lookup fill the rest in — the opposite of the Western house-number-first
 * convention most form libraries assume.
 */
export function AddressForm({
  value: controlledValue,
  defaultValue = EMPTY_ADDRESS,
  onValueChange,
  onPincodeResolve,
  showLandmark = true,
  disabled,
  className,
}: AddressFormProps) {
  const reactId = React.useId();
  const isControlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const address = isControlled ? controlledValue : uncontrolled;

  const [resolving, setResolving] = React.useState(false);

  // The ref keeps `update` stable while still reading the latest address. If
  // `update` closed over `address` directly, a PIN lookup resolving after the
  // user typed elsewhere would spread a stale address and wipe those edits.
  const addressRef = React.useRef(address);
  addressRef.current = address;

  const update = React.useCallback(
    (patch: Partial<IndianAddress>) => {
      const next = { ...addressRef.current, ...patch };
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  // Look up city/state whenever the PIN code becomes valid. The request is
  // guarded so a stale response can't overwrite a newer PIN code's result.
  const requestRef = React.useRef(0);
  React.useEffect(() => {
    if (!onPincodeResolve) return;
    if (!validatePincode(address.pincode).valid) return;

    const requestId = ++requestRef.current;
    setResolving(true);

    onPincodeResolve(address.pincode)
      .then((resolved) => {
        if (requestId !== requestRef.current || !resolved) return;
        update({
          city: resolved.city ?? addressRef.current.city,
          state: resolved.state ?? addressRef.current.state,
        });
      })
      .finally(() => {
        if (requestId === requestRef.current) setResolving(false);
      });
    // Keyed on the PIN code alone — `update` is stable and the rest of the
    // address is read through the ref, so editing other fields won't re-fire it.
  }, [address.pincode, onPincodeResolve, update]);

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <label
          htmlFor={`${reactId}-line1`}
          className="mb-1.5 block text-sm font-medium"
        >
          Address line 1
        </label>
        <input
          id={`${reactId}-line1`}
          value={address.line1}
          disabled={disabled}
          onChange={(event) => update({ line1: event.target.value })}
          placeholder="Flat / house no., building, apartment"
          autoComplete="address-line1"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor={`${reactId}-line2`}
          className="mb-1.5 block text-sm font-medium"
        >
          Address line 2
        </label>
        <input
          id={`${reactId}-line2`}
          value={address.line2}
          disabled={disabled}
          onChange={(event) => update({ line2: event.target.value })}
          placeholder="Area, street, sector, village"
          autoComplete="address-line2"
          className={inputClass}
        />
      </div>

      {showLandmark && (
        <div>
          <label
            htmlFor={`${reactId}-landmark`}
            className="mb-1.5 block text-sm font-medium"
          >
            Landmark{" "}
            <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input
            id={`${reactId}-landmark`}
            value={address.landmark}
            disabled={disabled}
            onChange={(event) => update({ landmark: event.target.value })}
            placeholder="Near…"
            className={inputClass}
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <PincodeInput
          label="PIN code"
          value={address.pincode}
          disabled={disabled}
          onValueChange={(pincode) => update({ pincode })}
          description={resolving ? "Looking up city and state…" : undefined}
        />

        <div>
          <label
            htmlFor={`${reactId}-city`}
            className="mb-1.5 block text-sm font-medium"
          >
            City / town
          </label>
          <input
            id={`${reactId}-city`}
            value={address.city}
            disabled={disabled}
            onChange={(event) => update({ city: event.target.value })}
            placeholder="City"
            autoComplete="address-level2"
            className={inputClass}
          />
        </div>
      </div>

      <StateSelect
        label="State"
        value={address.state}
        disabled={disabled}
        onValueChange={(state) => update({ state })}
      />
    </div>
  );
}
