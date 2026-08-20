/**
 * Everything the site knows about each component.
 *
 * Kept free of JSX so both server components and the route generator can read
 * it. Demos are wired up separately by slug in `components/demo-registry.tsx`.
 */

export type Category = "decide" | "execute" | "output" | "input" | "signal";

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface CatalogEntry {
  slug: string;
  name: string;
  category: Category;
  /** One line, shown on cards and in the index. */
  tagline: string;
  /** The case for the component existing. Two or three sentences. */
  why: string;
  /** What we got right that a quick build would miss. */
  details: string[];
  props: PropRow[];
  example: string;
}

export const CATEGORIES: Record<Category, { label: string; blurb: string }> = {
  decide: {
    label: "Decisions",
    blurb: "Moments where the agent stops and a person has to answer.",
  },
  execute: {
    label: "Execution",
    blurb: "What the agent is doing, and what it already did.",
  },
  output: {
    label: "Output",
    blurb: "The things the agent produces and the sources behind them.",
  },
  input: { label: "Input", blurb: "Getting the next instruction out of a person." },
  signal: { label: "Signals", blurb: "Status, cost, and how much room is left." },
};

export const CATALOG: CatalogEntry[] = [
  {
    slug: "approval",
    name: "Approval",
    category: "decide",
    tagline: "A gate the agent cannot walk through on its own.",
    why: "Your agent wants to delete twelve files. Everything about that moment is a design problem: how much detail to show, how hard to make the yes, what happens if nobody answers. Most teams ship a bare confirm dialog and move on. This is the component we spent the most time on.",
    details: [
      "High risk actions need two presses. Approvals turn up mid scroll and a single button is far too easy to hit by reflex.",
      "Deny is always one press. The safe answer should never be the slower one.",
      "Escape backs out of a half pressed confirm instead of denying, so a stray keystroke cannot resolve anything.",
      "Announced assertively, unlike everything else in the library, because the run is genuinely blocked on the person reading it.",
      "An expiry deadline auto denies rather than auto approving. If nobody was watching, nothing should have happened.",
    ],
    props: [
      { name: "action", type: "string", description: "Short summary of what will happen." },
      { name: "detail", type: "string", description: "Consequences, shown under the action." },
      { name: "input", type: "unknown", description: "The exact payload under review." },
      { name: "risk", type: '"low" | "medium" | "high"', default: '"medium"', description: "Drives emphasis and the confirm rule." },
      { name: "status", type: "ApprovalStatus", default: '"pending"', description: "Controlled outcome." },
      { name: "requireConfirm", type: "boolean", default: "risk === high", description: "Force or skip the second press." },
      { name: "expiresAt", type: "number", description: "Epoch ms after which it auto denies." },
      { name: "onDecision", type: "(d: ApprovalDecision) => void", description: "Fires with approve, deny, or always." },
      { name: "autoFocus", type: "boolean", default: "false", description: "Move focus to deny when it appears." },
    ],
    example: `<Approval
  action="Overwrite src/retry.ts"
  detail="Replaces the retry helper with a looping version."
  risk="high"
  input={{ path: "src/retry.ts" }}
  onDecision={(decision) => respond(decision)}
/>`,
  },
  {
    slug: "tool-call",
    name: "ToolCall",
    category: "execute",
    tagline: "One tool invocation, open it up if you want the details.",
    why: "A run is mostly tool calls, and most of the time you only care that one happened and whether it worked. Collapsed by default, with the arguments and result one click away when something looks wrong.",
    details: [
      "A real button with aria-expanded pointing at a labelled region, so it behaves like every other disclosure a screen reader user has met.",
      "Arguments stream in as partial JSON. Rendering them never throws, it just shows what has arrived so far.",
      "Duration ticks live while the call runs and freezes when it settles.",
      "Only the finish is announced, not every status change, or a long run would talk over itself.",
    ],
    props: [
      { name: "name", type: "string", description: "Tool identifier." },
      { name: "status", type: "ToolCallStatus", description: "pending, running, success, error, or cancelled." },
      { name: "input", type: "unknown", description: "Arguments, possibly partial." },
      { name: "output", type: "unknown", description: "Result once it resolves." },
      { name: "error", type: "string", description: "Message shown when status is error." },
      { name: "startedAt", type: "number", description: "Epoch ms, enables the live duration." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Start expanded." },
    ],
    example: `<ToolCall
  name="read_file"
  status="running"
  input={{ path: "src/index.ts" }}
  startedAt={startedAt}
/>`,
  },
  {
    slug: "reasoning",
    name: "Reasoning",
    category: "execute",
    tagline: "Thinking that shows up live, then gets out of the way.",
    why: "People want to watch the model think, and then they want the answer without scrolling past a wall of it. Open while streaming, folded once it settles.",
    details: [
      "Auto collapse stops the instant you click. An explicit choice always wins over the automatic behaviour.",
      "The live region switches off once streaming ends, otherwise every later re-render would read the whole block again.",
      "Shows how long it thought for, which is usually the only part anyone reads.",
    ],
    props: [
      { name: "text", type: "string", description: "The reasoning, growing as tokens arrive." },
      { name: "streaming", type: "boolean", default: "false", description: "True while tokens are still coming." },
      { name: "autoCollapse", type: "boolean", default: "false", description: "Open while streaming, fold when done." },
      { name: "startedAt", type: "number", description: "Epoch ms, enables the duration label." },
    ],
    example: `<Reasoning
  text={part.text}
  streaming={part.streaming}
  startedAt={part.startedAt}
  autoCollapse
/>`,
  },
  {
    slug: "diff",
    name: "Diff",
    category: "output",
    tagline: "See the edit before it lands, even while it is still arriving.",
    why: "Agents edit files, and a diff that only renders once the write finishes is useless for deciding whether to let the write happen. This one diffs partial content on every chunk.",
    details: [
      "Ships its own line diff rather than pulling in a dependency, with common prefixes and suffixes trimmed first.",
      "That trim is what makes streaming cheap. Appending to a long file leaves the whole head untouched.",
      "There is a hard cap on the diff table. Past it the change degrades to a block replacement instead of locking the main thread for several seconds.",
      "Rendered as an ordered list with spoken Added and Removed prefixes. A table would make screen readers announce the gutter on every single cell.",
      "contextLines hides unchanged lines far from any change, so one edited function does not come with nine hundred lines of context.",
    ],
    props: [
      { name: "path", type: "string", description: "File path, used as the accessible name." },
      { name: "before", type: "string", description: "Original content. Omit for a new file." },
      { name: "after", type: "string", description: "New content. Omit for a deletion." },
      { name: "streaming", type: "boolean", default: "false", description: "True while after is still arriving." },
      { name: "contextLines", type: "number", description: "Collapse unchanged lines beyond this distance." },
    ],
    example: `<Diff
  path="src/retry.ts"
  before={before}
  after={after}
  streaming={isWriting}
  contextLines={3}
/>`,
  },
  {
    slug: "empty-state",
    name: "EmptyState",
    category: "output",
    tagline: "The screen before there is anything to show yet.",
    why: "No runs yet, no results, a search that matched nothing — every product hits this screen constantly, and left blank it reads as broken rather than new. It is the one component here with nothing behind it but layout, which is exactly why it gets skipped until someone notices the app looks empty rather than unstarted.",
    details: [
      "No default copy. A generic \"Nothing here\" is worse than nothing, because it tells the reader nothing about what to do next.",
      "The action slot takes any element, not a fixed button prop, so the way out of the empty state is never a compromise on what it needs to be.",
      "A dashed border rather than a solid one, so it reads as a placeholder and not as a card that failed to load.",
    ],
    props: [
      { name: "title", type: "string", description: "What is missing, said plainly." },
      { name: "description", type: "string", description: "Why, or what to do about it." },
      { name: "icon", type: "React.ReactNode", description: "Small glyph above the title." },
      { name: "action", type: "React.ReactNode", description: "A way out — usually a button." },
    ],
    example: `<EmptyState
  title="No runs yet"
  description="Trigger the agent from the composer to see it here."
  action={<Button onClick={startRun}>Start a run</Button>}
/>`,
  },
  {
    slug: "feedback",
    name: "Feedback",
    category: "signal",
    tagline: "Thumbs up or down, one active at a time.",
    why: "The signal that a response was wrong is worth more than almost anything else in an agent product, and it is usually bolted on as an afterthought that does not even remember what you clicked. This one does one thing: hold a single rating per response, and let picking the same answer twice clear it.",
    details: [
      "Selecting the pressed value again clears the rating, rather than leaving it stuck. A misclick should not commit you to a verdict.",
      "Both buttons are real toggle buttons with aria-pressed, not divs with a click handler, so the state is announced without extra wiring.",
      "Controlled or uncontrolled, matching every other stateful primitive in the set, so it drops into a list of messages without a rating store to wire up first.",
    ],
    props: [
      { name: "rating", type: '"up" | "down" | null', description: "Controlled value." },
      { name: "defaultRating", type: '"up" | "down" | null', default: "null", description: "Uncontrolled initial value." },
      { name: "onRatingChange", type: "(rating: FeedbackRating) => void", description: "Fires on every change, including to null." },
      { name: "disabled", type: "boolean", default: "false", description: "Freezes the current rating." },
    ],
    example: `<Feedback onRatingChange={(rating) => logRating(messageId, rating)} />`,
  },
  {
    slug: "badge",
    name: "Badge",
    category: "output",
    tagline: "A small coloured label for a state that is simply true.",
    why: "Half the components in this set need to say \"pending\", \"denied\", \"medium risk\", or \"stale\" somewhere in their corner, and each one used to invent its own span with its own colours. Badge exists so that invention happens once. It is deliberately inert — no hover state, no click handler — because everything else with colour in this library means the reader owes it a decision, and a badge does not.",
    details: [
      "Five tones, not an open colour prop. A label component that accepts any hex code stops meaning anything after the first three shades of blue get used for three different things.",
      "className passes through last, so a consumer can still override without forking the component.",
      "Renders a <span>, not a <div> — a label sits inline with the text describing it, not on its own line.",
    ],
    props: [
      { name: "tone", type: '"neutral" | "accent" | "success" | "danger" | "warning"', default: '"neutral"', description: "Which token pair fills and colours the label." },
      { name: "className", type: "string", description: "Merged after the tone, so it can override." },
    ],
    example: `<Badge tone="warning">Medium risk</Badge>`,
  },
  {
    slug: "log-stream",
    name: "LogStream",
    category: "execute",
    tagline: "Command output that follows along without fighting you.",
    why: "Agents shell out constantly. Two things always go wrong: raw escape codes render as garbage, and autoscroll yanks you back down the second you try to read something further up.",
    details: [
      "Full ANSI parsing, including 256 colour and truecolor. The sixteen named colours come through as data attributes so your theme decides what red means.",
      "Cursor and erase sequences get stripped rather than printed, so a progress bar redrawing itself does not fill the pane with junk.",
      "Autoscroll releases the moment you scroll up and offers a button to come back. It does not silently drag you to the bottom mid sentence.",
      "The live region is off by default. A build emitting hundreds of lines a second through one would make the page unusable.",
      "The scroll container is focusable, because otherwise keyboard users cannot reach old output at all.",
    ],
    props: [
      { name: "lines", type: "LogLine[]", description: "Output lines, each with an id." },
      { name: "streaming", type: "boolean", default: "false", description: "Controls whether autoscroll runs." },
      { name: "label", type: "string", default: '"Output"', description: "Accessible name for the region." },
      { name: "announce", type: "boolean", default: "false", description: "Read new lines aloud. Use sparingly." },
    ],
    example: `<LogStream
  lines={lines}
  streaming={isRunning}
  label="Build output"
/>`,
  },
  {
    slug: "artifact",
    name: "Artifact",
    category: "output",
    tagline: "What the agent wrote, including the drafts it replaced.",
    why: "Agents rewrite their output over and over. Losing the earlier draft is a real failure, and so is reading an old one without realising the agent has moved on.",
    details: [
      "Version history is built in rather than bolted on, and the switcher is a real select element so it works on touch and by keyboard for free.",
      "Looking at an older draft puts a notice on screen. Quietly showing stale content is how people act on the wrong thing.",
      "The switcher hides itself until there is actually a second version.",
      "One region for the whole artifact. Nesting a second one with the same name makes screen readers announce it twice on entry.",
    ],
    props: [
      { name: "title", type: "string", description: "Artifact name, labels the section." },
      { name: "versions", type: "ArtifactVersion[]", description: "Every revision, oldest first." },
      { name: "activeVersionId", type: "string", description: "Controlled selection." },
      { name: "streaming", type: "boolean", default: "false", description: "True while the newest version is being written." },
    ],
    example: `<Artifact
  title="incident-report.md"
  versions={versions}
  streaming={isWriting}
/>`,
  },
  {
    slug: "code-block",
    name: "CodeBlock",
    category: "output",
    tagline: "Code with a copy button that actually reports back.",
    why: "Every agent app renders code and every one of them needs copy to work. The interesting parts are the failure cases nobody handles.",
    details: [
      "Copy falls back to the old selection trick when the Clipboard API is unavailable, which is the case on plain HTTP and inside some webviews.",
      "When copying fails it says so and tells you to press Control C, rather than pretending it worked.",
      "The result goes through a live region. A button whose label quietly changes to Copied tells a screen reader user nothing.",
      "No syntax highlighter is bundled. Yours would weigh more than this entire library, so there is a render prop instead.",
    ],
    props: [
      { name: "code", type: "string", description: "The code." },
      { name: "language", type: "string", description: "Language id, used as a label and a class." },
      { name: "filename", type: "string", description: "Path shown in the header instead of the language." },
      { name: "streaming", type: "boolean", default: "false", description: "True while the code is still being written." },
      { name: "renderCode", type: "(code, lang) => ReactNode", description: "Plug in your own highlighter." },
    ],
    example: `<CodeBlock code={snippet} language="ts" filename="retry.ts" />`,
  },
  {
    slug: "citation",
    name: "Citation",
    category: "output",
    tagline: "Inline sources you can actually open.",
    why: "Grounded answers need references, and references you can only see by hovering a mouse are useless to half the people reading.",
    details: [
      "Built as a disclosure, not a tooltip. Keyboard and touch users get the same access as everyone else.",
      "Tabbing to the marker opens the card, so you can walk through an answer and read its sources without extra keystrokes.",
      "Clicking does not fight the focus that the click itself caused, which is the bug this pattern usually ships with.",
      "The bare number gets a real accessible name. Hearing just one tells you nothing.",
      "Excerpts are marked up as blockquotes with a cite attribute, because that is what they are.",
    ],
    props: [
      { name: "source", type: "SourceRef", description: "Title, and optionally a url and snippet." },
      { name: "index", type: "number", description: "The marker number." },
      { name: "openOnHover", type: "boolean", default: "true", description: "Also open on pointer hover." },
    ],
    example: `<p>
  The index was dropped by a migration
  <Citation source={sources[0]} index={1} />.
</p>`,
  },
  {
    slug: "composer",
    name: "Composer",
    category: "input",
    tagline: "The prompt box, with the details everyone gets wrong.",
    why: "Every agent app has one and most of them have the same three bugs. This is a real form element, so Enter, mobile go keys, and assistive tech all behave the way people already expect.",
    details: [
      "Enter during a Japanese, Chinese, or Korean composition commits the text instead of sending the message. Missing that eats the first word your user typed.",
      "Send becomes Stop while the agent is running, and Stop is a plain button so cancelling never submits the draft sitting in the box.",
      "The textarea grows as you type and shrinks back, capped at a row count you choose.",
      "Whitespace only drafts cannot be sent.",
    ],
    props: [
      { name: "value", type: "string", description: "Controlled value." },
      { name: "onValueChange", type: "(v: string) => void", description: "Fires on every keystroke." },
      { name: "onSubmit", type: "(v: string) => void", description: "Fires with the trimmed value." },
      { name: "busy", type: "boolean", default: "false", description: "Swaps send for stop." },
      { name: "onStop", type: "() => void", description: "Fires when a run is cancelled." },
      { name: "maxRows", type: "number", default: "10", description: "Grow to this many rows, then scroll." },
    ],
    example: `<Composer
  value={value}
  onValueChange={setValue}
  onSubmit={send}
  busy={isRunning}
  onStop={abort}
/>`,
  },
  {
    slug: "checkpoint",
    name: "Checkpoint",
    category: "decide",
    tagline: "Rewind the run, once you know what that costs.",
    why: "Long agent runs go wrong somewhere in the middle, and the fix is usually to go back rather than push on. The catch is that rewinding silently deletes every step after the point you picked, which is very easy to miss.",
    details: [
      "Restoring takes two presses by default, for the same reason Approval does. This one throws work away.",
      "The count of steps about to be discarded is stated in words, not left as a bare number next to a button.",
      "Each restore button is named against its checkpoint, so a list of them does not read as Restore, Restore, Restore.",
      "The checkpoint you are already at is disabled and says so, rather than looking identical to the rest.",
      "Escape backs out of an armed restore.",
    ],
    props: [
      { name: "checkpoint", type: "CheckpointRef", description: "Id, label, and how many steps it discards." },
      { name: "current", type: "boolean", default: "false", description: "True when the run is already here." },
      { name: "onRestore", type: "(c: CheckpointRef) => void", description: "Fires once confirmed." },
      { name: "requireConfirm", type: "boolean", default: "true", description: "Set false to restore in one press." },
    ],
    example: `<Checkpoint checkpoint={point} onRestore={rewind}>
  <CheckpointLabel />
  <CheckpointDiscardCount />
  <CheckpointRestore />
</Checkpoint>`,
  },
  {
    slug: "attachment",
    name: "Attachment",
    category: "input",
    tagline: "Files on a prompt, with their upload state legible.",
    why: "Attachments are a list of near identical chips, which is exactly the shape that produces a screen reader reading Remove three times with no way to tell which is which.",
    details: [
      "Every remove button is named against its file, so it reads Remove trace.json.",
      "Upload state is spoken as well as shown. A spinner and a tick look different and announce identically when they are only an icon.",
      "A failed upload reads out its reason instead of just turning the chip red.",
      "Progress is a real progressbar and only exists while an upload is actually running.",
      "The fill is published as a CSS variable, so you draw the bar however you like.",
    ],
    props: [
      { name: "file", type: "AttachmentFile", description: "Name, size, status, and optional progress." },
      { name: "onRemove", type: "(f: AttachmentFile) => void", description: "Omit to hide the remove button." },
      { name: "label", type: "string", default: '"Attachments"', description: "On AttachmentList, names the list." },
    ],
    example: `<AttachmentList>
  {files.map((file) => (
    <Attachment key={file.id} file={file} onRemove={remove}>
      <AttachmentName />
      <AttachmentMeta />
      <AttachmentRemove />
    </Attachment>
  ))}
</AttachmentList>`,
  },
  {
    slug: "tool-permission",
    name: "ToolPermission",
    category: "decide",
    tagline: "The answer to stop asking me, somewhere you can find it again.",
    why: "Approval covers one moment. This covers the standing grant people hand out in a hurry to get unblocked, and then cannot locate when they want it back. Every grant listed, adjustable, revocable, in one place.",
    details: [
      "Scope is a real select, so it works on touch and by keyboard without a popup layer.",
      "Each select is labelled against its tool, so a column of them does not read as identical unlabelled dropdowns.",
      "Same for revoke. A page of Revoke buttons with no context is unusable with a screen reader.",
      "A grant can carry a constraint, like a path prefix, so allowing a write tool does not have to mean allowing it everywhere.",
    ],
    props: [
      { name: "grant", type: "ToolGrant", description: "Tool name, scope, and optional constraint." },
      { name: "onScopeChange", type: "(scope, grant) => void", description: "Fires when the scope select changes." },
      { name: "onRevoke", type: "(grant) => void", description: "Omit to hide the revoke button." },
      { name: "label", type: "string", default: '"Tool permissions"', description: "On the list, names it." },
    ],
    example: `<ToolPermissionList>
  {grants.map((grant) => (
    <ToolPermission key={grant.toolName} grant={grant} onRevoke={revoke}>
      <ToolPermissionName />
      <ToolPermissionScope />
      <ToolPermissionRevoke />
    </ToolPermission>
  ))}
</ToolPermissionList>`,
  },
  {
    slug: "run-controls",
    name: "RunControls",
    category: "execute",
    tagline: "A brake for a run that is going the wrong way.",
    why: "Long runs need pause, resume, step, and stop. The awkward part is that most of those are illegal most of the time, and a row of buttons that look clickable but do nothing is worse than having no buttons.",
    details: [
      "Which actions are legal in which state lives in one table, so a new state cannot quietly enable the wrong control.",
      "Illegal actions are unmounted by default rather than disabled, so you never tab onto something that cannot do anything. Pass keepMounted when a stable layout matters more.",
      "A control with no handler never appears, so there is no dead button to click.",
      "Pausing changes nothing on screen except a label, so the state change is announced outright.",
    ],
    props: [
      { name: "state", type: "RunControlState", description: "idle, running, paused, or stopped." },
      { name: "onPause", type: "() => void", description: "Legal only while running." },
      { name: "onResume", type: "() => void", description: "Legal only while paused." },
      { name: "onStep", type: "() => void", description: "Advance one step. Legal only while paused." },
      { name: "onStop", type: "() => void", description: "Legal while running or paused." },
      { name: "keyboardShortcuts", type: "boolean", default: "false", description: "Bind Space on the group to pause and resume." },
    ],
    example: `<RunControls state={state} onPause={pause} onResume={resume} onStop={stop}>
  <RunControlButton action="pause" />
  <RunControlButton action="resume" />
  <RunControlButton action="stop" />
</RunControls>`,
  },
  {
    slug: "context-list",
    name: "ContextList",
    category: "input",
    tagline: "What the agent can actually see right now.",
    why: "Why did it not know about that file is one of the most common questions people have about an agent, and the answer is nearly always that the file was never in context. This makes that visible, and shows what each item costs.",
    details: [
      "Per item token cost, so it is obvious which attachment is eating the window.",
      "The total is a progressbar against your budget, with the value spoken exactly rather than left as a bar.",
      "Going over budget says what happens next, that the oldest items get dropped, instead of just turning a colour.",
      "The bar clamps at full, because a progressbar cannot be more than complete.",
      "Pinned items are marked for screen readers, not only with an icon.",
    ],
    props: [
      { name: "items", type: "ContextItem[]", description: "What is in context, each with an id and name." },
      { name: "budget", type: "number", description: "Token budget. Drives the bar and the warning." },
      { name: "onRemove", type: "(item) => void", description: "Omit to hide the remove buttons." },
      { name: "label", type: "string", default: '"Context"', description: "Accessible name for the list." },
    ],
    example: `<ContextList items={items} budget={200_000} onRemove={drop}>
  <ContextSummary />
  <ContextEntries>
    {items.map((item) => (
      <ContextEntry key={item.id} item={item}>
        <ContextEntryName />
        <ContextEntryTokens />
        <ContextEntryRemove />
      </ContextEntry>
    ))}
  </ContextEntries>
</ContextList>`,
  },
  {
    slug: "agent-handoff",
    name: "AgentHandoff",
    category: "execute",
    tagline: "Which agent just took over, and why.",
    why: "Multi agent runs fail in a specific way. The wrong agent picks up the work and nobody notices until the output is wrong. Showing each transfer with its reason catches that at the moment it happens.",
    details: [
      "The three visible fragments are hidden from assistive tech and the whole thing is rendered once as a readable sentence, instead of making a screen reader user assemble it from a name, an arrow, and another name.",
      "The transfer is announced politely as it happens, and that can be turned off for a static history where every row would otherwise fire.",
      "The reason element disappears entirely when there is no reason, rather than leaving empty brackets.",
    ],
    props: [
      { name: "from", type: "string", description: "The agent giving up control." },
      { name: "to", type: "string", description: "The agent taking over." },
      { name: "reason", type: "string", description: "Why control moved." },
      { name: "announce", type: "boolean", default: "true", description: "Announce the transfer as it happens." },
    ],
    example: `<AgentHandoff from="researcher" to="writer" reason="Research complete">
  <AgentHandoffFrom />
  <AgentHandoffArrow />
  <AgentHandoffTo />
  <AgentHandoffReason />
</AgentHandoff>`,
  },
  {
    slug: "retry-after",
    name: "RetryAfter",
    category: "signal",
    tagline: "Rate limited, with the retry gated until it will work.",
    why: "Providers hand back a retry-after and most apps turn it into a toast saying try again later, which leaves people poking a button that keeps failing. Here the button simply is not available until it will succeed.",
    details: [
      "The countdown is not announced tick by tick. Only the moment it clears is, which is the part anyone cares about.",
      "onReady fires exactly once, and re-arms if you hand it a new deadline.",
      "The remaining time is null until mount, so a live countdown cannot cause a hydration mismatch.",
    ],
    props: [
      { name: "until", type: "number", description: "Epoch ms when retrying becomes allowed." },
      { name: "onRetry", type: "() => void", description: "Fires only once the wait has cleared." },
      { name: "onReady", type: "() => void", description: "Fires once when the countdown reaches zero." },
    ],
    example: `<RetryAfter until={resetAt} onRetry={rerun}>
  <RetryAfterMessage />
  <RetryAfterButton />
</RetryAfter>`,
  },
  {
    slug: "streaming-text",
    name: "StreamingText",
    category: "output",
    tagline: "Model output that reads aloud like a person would.",
    why: "Putting aria-live on a growing paragraph is the obvious move and it is close to unusable: a screen reader restarts the whole answer on every token. This splits the two jobs apart.",
    details: [
      "The visible text is hidden from assistive tech while streaming, and a separate region is fed one completed sentence at a time.",
      "Sentence boundaries allow trailing quotes and brackets, so a quoted line is not cut in the wrong place.",
      "Whatever never ends in punctuation gets flushed once the stream stops, so the last fragment is never lost.",
      "The visible copy becomes readable again the moment streaming ends, so it can be navigated normally afterwards.",
      "The caret is decorative and hidden.",
    ],
    props: [
      { name: "text", type: "string", description: "The output, growing as tokens arrive." },
      { name: "streaming", type: "boolean", default: "false", description: "True while tokens are still coming." },
      { name: "announce", type: "boolean", default: "true", description: "Read completed sentences aloud." },
    ],
    example: `<StreamingText text={part.text} streaming={part.streaming}>
  <StreamingTextBody />
  <StreamingTextCaret />
</StreamingText>`,
  },
  {
    slug: "suggestions",
    name: "Suggestions",
    category: "input",
    tagline: "Follow up prompts that cost one tab stop, not six.",
    why: "A row of suggestion chips is usually a row of tab stops, so a keyboard user has to press Tab six times to get past something they did not want. A toolbar with roving tabindex is the fix, and it is the pattern almost nobody implements.",
    details: [
      "One tab stop for the whole group. Arrow keys move between chips, Home and End jump to the ends, and the selection wraps.",
      "Clicking straight into a later chip moves the roving index with it, so the next arrow press goes where you expect.",
      "A shrinking list cannot orphan the active index on an item that no longer exists.",
      "Each chip can carry a value distinct from its label, for when the visible text is shorter than the prompt you want to send.",
    ],
    props: [
      { name: "items", type: "Suggestion[]", description: "Chips, each with an id and label." },
      { name: "onSelect", type: "(value, item) => void", description: "Fires with the value or the label." },
      { name: "label", type: "string", default: '"Suggestions"', description: "Accessible name for the toolbar." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Which arrow keys move between chips." },
    ],
    example: `<Suggestions items={prompts} onSelect={send} label="Follow up prompts">
  {prompts.map((item, i) => (
    <SuggestionItem key={item.id} item={item} index={i} />
  ))}
</Suggestions>`,
  },
  {
    slug: "run-error",
    name: "RunError",
    category: "signal",
    tagline: "The run broke, and here is what you can do about it.",
    why: "Agent runs fail constantly, for reasons from a timeout to a malformed tool argument. The usual treatment is a red toast that disappears before anyone finishes reading it, which throws away the only information the user had.",
    details: [
      "An alert, so it is announced the moment it appears rather than scrolling past in silence.",
      "The stack trace stays collapsed. Otherwise a screen reader reads the entire trace before the sentence explaining what actually broke.",
      "Retry disables itself while a retry is in flight, so an impatient double click does not fire two runs.",
      "No retry handler means no retry button, instead of a dead control.",
    ],
    props: [
      { name: "title", type: "string", default: '"Something went wrong"', description: "Short summary." },
      { name: "message", type: "string", description: "What happened, in words the user can act on." },
      { name: "details", type: "string", description: "Stack trace, kept behind a disclosure." },
      { name: "onRetry", type: "() => void", description: "Omit to hide the retry button." },
      { name: "retrying", type: "boolean", default: "false", description: "Locks the button while a retry runs." },
    ],
    example: `<RunError
  title="The run stopped"
  message="The model timed out after 60 seconds."
  details={stack}
  onRetry={rerun}
/>`,
  },
  {
    slug: "run-timeline",
    name: "RunTimeline",
    category: "execute",
    tagline: "The trace, in the order it happened.",
    why: "Steps happened in sequence and assistive tech should say so, rather than reading out a pile of unrelated divs.",
    details: [
      "A real ordered list, so it announces as a list with a count.",
      "Markers are decorative and hidden. Their status is exposed as text, because a coloured circle means nothing to a screen reader.",
      "The running step is marked as the current one.",
    ],
    props: [
      { name: "label", type: "string", default: '"Agent run"', description: "Accessible name for the list." },
      { name: "status", type: "RunStepStatus", description: "On RunStep: pending, active, done, failed, or skipped." },
    ],
    example: `<RunTimeline label="Agent run">
  <RunStep status="done">
    <ToolCall name="read_file" status="success" />
  </RunStep>
</RunTimeline>`,
  },
  {
    slug: "task-list",
    name: "TaskList",
    category: "execute",
    tagline: "The plan, and how much of it is left.",
    why: "Agents write themselves a plan and revise it mid run. Watching items tick over is the clearest signal that progress is real.",
    details: [
      "Progress is aggregated into one progressbar. Announcing every item as it flips would be unbearable on a long plan.",
      "Every status has a spoken label, so done is not conveyed by a green tick alone.",
      "The list takes its name from aria-label, which leaves you free to render a visible heading without it being read twice.",
    ],
    props: [
      { name: "items", type: "TaskItem[]", description: "The plan. Fully controlled, since agents rewrite it." },
      { name: "label", type: "string", default: '"Plan"', description: "Accessible name for the list." },
    ],
    example: `<TaskList items={items} label="Plan" />`,
  },
  {
    slug: "agent-status",
    name: "AgentStatus",
    category: "signal",
    tagline: "Whether it is working, stuck, or waiting on you.",
    why: "The single most common question during a run is whether anything is still happening.",
    details: [
      "Waiting and error interrupt. Everything else stays polite so a long run does not talk over the person watching it.",
      "The indicator dot is hidden from assistive tech and the label carries the meaning.",
    ],
    props: [
      { name: "status", type: "AgentRunStatus", description: "idle, thinking, running, waiting, error, or done." },
      { name: "label", type: "string", description: "Override the wording, for example to name the running tool." },
    ],
    example: `<AgentStatus status="running" label="Running read_file" />`,
  },
  {
    slug: "usage-meter",
    name: "UsageMeter",
    category: "signal",
    tagline: "Tokens, cost, and how close you are to the edge.",
    why: "Running out of context is not a quiet failure, it is the point where earlier turns start disappearing. Worth seeing coming.",
    details: [
      "Context fill is a real progressbar with spoken values, not a decorative strip.",
      "Costs are handled in micros so fractions of a cent do not drift.",
      "Token counts are abbreviated on screen and read out exactly.",
      "The fill is published as a CSS variable, so you draw the bar however you like without recomputing anything.",
    ],
    props: [
      { name: "usage", type: "UsageStats", description: "Token counts, context window, and cost in micros." },
      { name: "warnAt", type: "number", default: "0.8", description: "Fraction above which the bar is flagged." },
    ],
    example: `<UsageMeter
  usage={{
    inputTokens: 24800,
    outputTokens: 1940,
    contextWindow: 200000,
    costMicros: 68000,
  }}
/>`,
  },
  {
    slug: "model-picker",
    name: "ModelPicker",
    category: "input",
    tagline: "Choosing which model runs, with a reason for each option.",
    why: "A model choice is not one label picked from a row of identical-looking options — it is a tradeoff between speed, cost, and capability that the person picking usually cannot see. A native select cannot carry a second line of text under each option, so every model picker either drops that context or gives up on being a select at all. This one is a real listbox for exactly that reason.",
    details: [
      "Each option is a listbox item with an optional description line, not a flat label — \"Fast, cheap, weaker reasoning\" fits under the model name instead of nowhere.",
      "Closes on an outside pointerdown and on Escape, and Enter commits the highlighted option — the three things people actually expect from a dropdown.",
      "A disabled option is reachable by pointer but skipped by arrow-key navigation, so keyboard users never get stuck on a choice they cannot make.",
      "Controlled or uncontrolled, like the rest of the set.",
    ],
    props: [
      { name: "options", type: "ModelOption[]", description: "value, label, optional description, optional disabled." },
      { name: "value", type: "string", description: "Controlled selection." },
      { name: "defaultValue", type: "string", description: "Uncontrolled initial selection." },
      { name: "onValueChange", type: "(value: string) => void", description: "Fires when a new option is committed." },
    ],
    example: `<ModelPicker
  options={[
    { value: "fast", label: "Fast", description: "Cheaper, weaker reasoning." },
    { value: "quality", label: "Quality", description: "Slower, best for hard tasks." },
  ]}
  value={model}
  onValueChange={setModel}
/>`,
  },
  {
    slug: "one-piece-background",
    name: "One Piece Background",
    category: "output",
    tagline: "An animated ocean sunset to sit a hero or an empty state on.",
    why: "Purely decorative, and the only component here that is. Empty states and landing heroes need something behind them, and reaching for a stock gradient every time is how products end up looking like every other product. It renders no interactive surface, so it is the one component with nothing to get wrong accessibility-wise beyond staying out of the way.",
    details: [
      "Three wave layers with distinct silhouettes rather than one path repeated, so the water reads as layered instead of as a single blob.",
      "Each layer is drawn wider than its container, because a layer that drifts horizontally at its exact width exposes the edge underneath.",
      "Decorative elements are sized as a fraction of the box, so it holds up at a 360px card as well as a full screen.",
      "The drift animation is dropped entirely under prefers-reduced-motion, and every layer is aria-hidden.",
      "No height of its own. The consumer sets it, rather than fighting a min-height baked into the component.",
    ],
    props: [
      { name: "children", type: "React.ReactNode", description: "Content rendered above the background." },
      { name: "className", type: "string", description: "Sets the height and anything else you need." },
    ],
    example: `<OnePieceBackground className="h-[420px]">
  <div className="flex h-full items-center justify-center">
    <h1>Grand Line Awaits</h1>
  </div>
</OnePieceBackground>`,
  },
];

export function getEntry(slug: string): CatalogEntry | undefined {
  return CATALOG.find((entry) => entry.slug === slug);
}

export function byCategory(): { category: Category; entries: CatalogEntry[] }[] {
  return (Object.keys(CATEGORIES) as Category[])
    .map((category) => ({
      category,
      entries: CATALOG.filter((entry) => entry.category === category),
    }))
    .filter((group) => group.entries.length > 0);
}
