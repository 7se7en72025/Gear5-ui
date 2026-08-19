import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Citation,
  CitationCard,
  CitationLink,
  CitationSnippet,
  CitationTitle,
  CitationTrigger,
} from "./index";
import {
  Artifact,
  ArtifactContent,
  ArtifactHeader,
  ArtifactStaleNotice,
  ArtifactTitle,
  ArtifactVersionCount,
  ArtifactVersionSelect,
} from "../artifact";
import type { ArtifactVersion, SourceRef } from "../types";

const source: SourceRef = {
  id: "s1",
  title: "RFC 9110: HTTP Semantics",
  url: "https://example.com/rfc9110",
  snippet: "A client sends a request to a server.",
};

function CitationExample(props: { openOnHover?: boolean }) {
  return (
    <Citation source={source} index={1} {...props}>
      <CitationTrigger />
      <CitationCard>
        <CitationTitle />
        <CitationSnippet />
        <CitationLink />
      </CitationCard>
    </Citation>
  );
}

describe("Citation", () => {
  it("gives the bare marker a meaningful accessible name", () => {
    render(<CitationExample />);
    expect(
      screen.getByRole("button", { name: /Source 1: RFC 9110/ }),
    ).toBeInTheDocument();
  });

  it("starts closed and opens on click", async () => {
    render(<CitationExample openOnHover={false} />);

    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("RFC 9110: HTTP Semantics")).toBeInTheDocument();
  });

  it("opens on keyboard focus, so it is not mouse-only", async () => {
    render(<CitationExample />);

    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    expect(screen.getByText(/A client sends a request/)).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(<CitationExample openOnHover={false} />);

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the excerpt up as a quotation with its source", async () => {
    render(<CitationExample openOnHover={false} />);
    await userEvent.click(screen.getByRole("button"));

    const quote = screen.getByText(/A client sends a request/);
    expect(quote.tagName).toBe("BLOCKQUOTE");
    expect(quote).toHaveAttribute("cite", source.url);
  });

  it("opens external links safely and says so", async () => {
    render(<CitationExample openOnHover={false} />);
    await userEvent.click(screen.getByRole("button"));

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("(opens in a new tab)");
  });

  it("omits the link for a source with no URL", async () => {
    render(
      <Citation source={{ id: "s2", title: "Internal note" }} index={2} openOnHover={false}>
        <CitationTrigger />
        <CitationCard>
          <CitationTitle />
          <CitationLink />
        </CitationCard>
      </Citation>,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

const versions: ArtifactVersion[] = [
  { id: "v1", label: "First draft", content: "hello" },
  { id: "v2", label: "Second draft", content: "hello world" },
  { id: "v3", label: "Final", content: "hello world!" },
];

function ArtifactExample(props: { streaming?: boolean }) {
  return (
    <Artifact title="report.md" versions={versions} {...props}>
      <ArtifactHeader>
        <ArtifactTitle />
        <ArtifactVersionSelect />
        <ArtifactVersionCount />
      </ArtifactHeader>
      <ArtifactStaleNotice />
      <ArtifactContent />
    </Artifact>
  );
}

describe("Artifact", () => {
  it("shows the newest version by default", () => {
    render(<ArtifactExample />);
    expect(screen.getByText("hello world!")).toBeInTheDocument();
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
  });

  it("labels the section by its title", () => {
    render(<ArtifactExample />);
    const region = screen.getByRole("region");
    const title = screen.getByRole("heading", { name: "report.md" });
    expect(region).toHaveAttribute("aria-labelledby", title.id);
  });

  it("switches versions through a real select", async () => {
    render(<ArtifactExample />);

    const select = screen.getByRole("combobox", { name: "Version" });
    await userEvent.selectOptions(select, "v1");

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  it("warns when an older draft is on screen", async () => {
    render(<ArtifactExample />);
    expect(screen.queryByText(/earlier version/)).not.toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Version" }),
      "v2",
    );
    expect(screen.getByText(/You are viewing an earlier version/)).toBeInTheDocument();
  });

  it("hides the switcher until there is something to switch to", () => {
    render(
      <Artifact title="notes.md" versions={[versions[0] as ArtifactVersion]}>
        <ArtifactHeader>
          <ArtifactVersionSelect />
          <ArtifactVersionCount />
        </ArtifactHeader>
        <ArtifactContent />
      </Artifact>,
    );

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("1 of 1")).not.toBeInTheDocument();
  });

  it("marks the content busy while it is still being written", () => {
    const { container } = render(<ArtifactExample streaming />);
    const content = container.querySelector('[data-handoff-slot="artifact-content"]');
    expect(content).toHaveAttribute("aria-busy", "true");
  });

  it("exposes exactly one region, so the artifact is announced once", () => {
    render(<ArtifactExample />);
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });
});
