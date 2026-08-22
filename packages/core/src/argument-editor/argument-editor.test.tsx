import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ArgumentEditor,
  ArgumentEditorReset,
  ArgumentField,
  ArgumentFields,
} from "./index";
import type { ArgumentValues } from "./index";
import {
  EnvironmentBadge,
  EnvironmentName,
  EnvironmentWarning,
} from "../environment-badge";
import {
  Guardrail,
  GuardrailAction,
  GuardrailExplanation,
  GuardrailOverride,
  GuardrailPayload,
  GuardrailRule,
} from "../guardrail";

const ARGS: ArgumentValues = {
  path: "src/retry.ts",
  attempts: 3,
  overwrite: true,
  options: { encoding: "utf8" },
};

/** Controlled wrapper, since the editor never owns its values. */
function EditorExample({
  onChange,
  initial = ARGS,
  disabled,
}: {
  onChange?: (v: ArgumentValues) => void;
  initial?: ArgumentValues;
  disabled?: boolean;
}) {
  const [values, setValues] = React.useState(initial);
  return (
    <ArgumentEditor
      values={values}
      disabled={disabled}
      onChange={(next) => {
        setValues(next);
        onChange?.(next);
      }}
    >
      <ArgumentFields>
        {Object.keys(values).map((key) => (
          <ArgumentField key={key} name={key} />
        ))}
      </ArgumentFields>
      <ArgumentEditorReset />
    </ArgumentEditor>
  );
}

describe("ArgumentEditor", () => {
  it("renders a labelled control per argument", () => {
    render(<EditorExample />);
    expect(screen.getByLabelText("path")).toHaveValue("src/retry.ts");
    expect(screen.getByLabelText("attempts")).toHaveValue(3);
    expect(screen.getByLabelText("overwrite")).toBeChecked();
  });

  it("shows nested values read only rather than half editing them", () => {
    const { container } = render(<EditorExample />);
    const field = container.querySelector('[data-name="options"]');

    expect(field).not.toHaveAttribute("data-editable");
    expect(field?.querySelector("input")).toBeNull();
    expect(screen.getByText(/"encoding": "utf8"/)).toBeInTheDocument();
  });

  it("reports an edit to the caller", async () => {
    const onChange = vi.fn();
    render(<EditorExample onChange={onChange} />);

    await userEvent.clear(screen.getByLabelText("path"));
    await userEvent.type(screen.getByLabelText("path"), "a");

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({ path: "a" });
  });

  it("keeps the model's original visible next to the edit", async () => {
    render(<EditorExample />);

    await userEvent.clear(screen.getByLabelText("path"));
    await userEvent.type(screen.getByLabelText("path"), "src/other.ts");

    expect(
      screen.getByText("Edited. The model proposed src/retry.ts.", { exact: false }),
    ).toBeInTheDocument();
  });

  it("offers reset only on the fields that actually changed", async () => {
    render(<EditorExample />);
    expect(screen.queryByRole("button", { name: /Reset path/ })).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText("path"));
    await userEvent.type(screen.getByLabelText("path"), "x");

    expect(screen.getByRole("button", { name: "Reset path" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Reset attempts/ })).not.toBeInTheDocument();
  });

  it("puts a field back to what the model proposed", async () => {
    render(<EditorExample />);

    await userEvent.clear(screen.getByLabelText("path"));
    await userEvent.type(screen.getByLabelText("path"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Reset path" }));

    expect(screen.getByLabelText("path")).toHaveValue("src/retry.ts");
  });

  it("hides reset all until something is dirty, then restores everything", async () => {
    render(<EditorExample />);
    expect(screen.queryByRole("button", { name: "Reset all" })).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText("path"));
    await userEvent.type(screen.getByLabelText("path"), "x");
    await userEvent.click(screen.getByLabelText("overwrite"));

    await userEvent.click(screen.getByRole("button", { name: "Reset all" }));

    expect(screen.getByLabelText("path")).toHaveValue("src/retry.ts");
    expect(screen.getByLabelText("overwrite")).toBeChecked();
  });

  it("announces which arguments were edited", async () => {
    render(<EditorExample />);
    expect(screen.getByRole("status")).toHaveTextContent("");

    await userEvent.click(screen.getByLabelText("overwrite"));
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 argument edited: overwrite.",
    );
  });

  it("ignores a half typed number instead of committing NaN", async () => {
    const onChange = vi.fn();
    render(<EditorExample onChange={onChange} />);

    await userEvent.clear(screen.getByLabelText("attempts"));

    // Clearing a number input reports NaN, which must never reach the caller.
    for (const call of onChange.mock.calls) {
      expect(Number.isNaN(call[0].attempts)).toBe(false);
    }
  });

  it("locks every control when disabled", async () => {
    const onChange = vi.fn();
    render(<EditorExample onChange={onChange} disabled />);

    expect(screen.getByLabelText("path")).toBeDisabled();
    await userEvent.click(screen.getByLabelText("overwrite"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("EnvironmentBadge", () => {
  it("states the target as a sentence, not a colour", () => {
    render(
      <EnvironmentBadge environment={{ kind: "production", name: "api-prod-eu" }}>
        <EnvironmentName />
      </EnvironmentBadge>,
    );

    expect(
      screen.getByText(
        "Target: Production, api-prod-eu. Changes here affect real users.",
      ),
    ).toBeInTheDocument();
  });

  it("warns only on production, so the warning keeps its meaning", () => {
    const { rerender } = render(
      <EnvironmentBadge environment={{ kind: "production" }}>
        <EnvironmentWarning />
      </EnvironmentBadge>,
    );
    expect(screen.getByText("Live")).toBeInTheDocument();

    rerender(
      <EnvironmentBadge environment={{ kind: "staging" }}>
        <EnvironmentWarning />
      </EnvironmentBadge>,
    );
    expect(screen.queryByText("Live")).not.toBeInTheDocument();
  });

  it("calls out an irreversible target", () => {
    render(
      <EnvironmentBadge environment={{ kind: "staging", destructive: true }}>
        <EnvironmentName />
      </EnvironmentBadge>,
    );
    expect(
      screen.getByText(/Actions here cannot be undone\./),
    ).toBeInTheDocument();
  });

  it("falls back to the kind when there is no name", () => {
    render(
      <EnvironmentBadge environment={{ kind: "sandbox" }}>
        <EnvironmentName />
      </EnvironmentBadge>,
    );
    expect(screen.getByText("Sandbox")).toBeInTheDocument();
  });
});

const RULE = {
  id: "fs-1",
  name: "no-writes-outside-workspace",
  explanation: "The agent may only write inside the project directory.",
};

describe("Guardrail", () => {
  it("stays polite, since nothing is waiting on the user", () => {
    render(
      <Guardrail action="Write to /etc/hosts" rule={RULE}>
        <GuardrailAction />
      </Guardrail>,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Write to /etc/hosts").id,
    );
  });

  it("names the rule and its reason in one spoken sentence", () => {
    render(
      <Guardrail action="Write to /etc/hosts" rule={RULE}>
        <GuardrailAction />
        <GuardrailRule />
        <GuardrailExplanation />
      </Guardrail>,
    );

    expect(
      screen.getByText(
        /Blocked by no-writes-outside-workspace\. The agent may only write inside/,
      ),
    ).toBeInTheDocument();
  });

  it("keeps the rejected payload behind a disclosure", async () => {
    render(
      <Guardrail action="Write" rule={RULE} input={{ path: "/etc/hosts" }}>
        <GuardrailPayload />
      </Guardrail>,
    );

    expect(screen.queryByText(/\/etc\/hosts/)).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Show what was blocked" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(toggle);
    expect(screen.getByText(/\/etc\/hosts/)).toBeInTheDocument();
  });

  it("names the override against the action it would allow", async () => {
    const onOverride = vi.fn();
    render(
      <Guardrail action="Write to /etc/hosts" rule={RULE} onOverride={onOverride}>
        <GuardrailAction />
        <GuardrailOverride />
      </Guardrail>,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Allow anyway Write to /etc/hosts" }),
    );
    expect(onOverride).toHaveBeenCalledTimes(1);
  });

  it("shows no override at all on a hard block", () => {
    render(
      <Guardrail action="Write" rule={RULE}>
        <GuardrailAction />
        <GuardrailOverride />
      </Guardrail>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
