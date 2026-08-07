```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy this skill with `npx skills@latest add eszxcvfd/skills --skill=supervisor`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/supervisor)

## What it does

`supervisor` is an external Paseo observer and detached-Lead launcher. It
starts a fresh autonomous `root` when a human asks, then observes lifecycle,
logs, artifacts, and proof without becoming part of the project's doctrine.

## When to reach for it

You invoke this by typing `/supervisor` — the agent won't reach for it on its
own.

Reach for it when a human wants a new detached Lead started or wants read-only
observation of an existing Lead. For project planning, use
[root](https://aihero.dev/skills-root); for bounded work, use
[peer](https://aihero.dev/skills-peer).

## External boundary

The observer passes Root a neutral `ROOT_BRIEF`, never a supervisor-specific
decision packet. It does not edit project files, inject hidden instructions,
call Peer, require Root callbacks, or create `SUPERVISOR_NOTEBOOK.md` in the
repository. Optional observer notes stay under `$CODEX_HOME`.

## Where it fits

`supervisor` sits outside the project execution path:

```text
human → external observer → detached Root → bounded Peer
```

It is an operator-side monitor, not a project authority. The
[ask-matt router](https://aihero.dev/skills-ask-matt) points to it only when
the human needs lifecycle observation or a new detached Root.
