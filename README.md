# skills

Agent skills for real engineering — fork of [mattpocock/skills](https://github.com/mattpocock/skills) plus a Paseo supervisor/root/peer hierarchy.

**Repo:** https://github.com/eszxcvfd/skills

Use this README to pull the set into **any other project**.

---

## Install vào project khác

Làm trong thư mục project đích.

### Claude Code — cách mới, khuyến nghị

```bash
claude plugin marketplace add eszxcvfd/skills
claude plugin install mattpocock-skills@eszxcvfd
```

Cập nhật:

```bash
claude plugin update mattpocock-skills@eszxcvfd
```

Nếu muốn bản upstream gốc của Matt:

```bash
claude plugin marketplace add mattpocock/skills
claude plugin install mattpocock-skills@mattpocock
```

### Agent khác — copy skill vào repo

```bash
cd /path/to/your-project
npx skills@latest add eszxcvfd/skills
```

- Chọn skill cần dùng và agent: Claude Code, Codex, OpenCode, Cursor, …
- Nên tick `setup-matt-pocock-skills`.
- Trong agent, chạy `/setup-matt-pocock-skills` một lần/repo.
- Cập nhật: chạy lại cùng lệnh `npx skills@latest add eszxcvfd/skills`.

### Một clone global — nhiều project

```bash
git clone https://github.com/eszxcvfd/skills.git ~/src/skills
cd ~/src/skills
./scripts/link-skills.sh
```

Script link toàn bộ skill, trừ `deprecated/`, vào:

- `~/.claude/skills`
- `~/.agents/skills`

Cập nhật:

```bash
cd ~/src/skills && git pull && ./scripts/link-skills.sh
```

OpenCode / Pi: trỏ skill path tới `~/src/skills/skills`, hoặc copy/symlink bucket cần dùng.

### Flow Paseo

Sau khi cài:

1. `/setup-matt-pocock-skills`
2. `/ask-matt` nếu không chắc skill nào.
3. `/supervisor` → `/root` → `/peer` cho flow lớn.
4. Với flow nhỏ: `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement`.

Root đọc `WORKSPACE_PROTOCOL.md`; peer không đọc file đó. `SUPERVISOR_NOTEBOOK.md` là memory của supervisor cho failure/anti-pattern quan sát được. `config.model` giữ provider/model/thinking mặc định cho supervisor/root/peer theo từng project, để đổi model mà không sửa prompt. Root không tạo peer trước khi thật sự có lát việc độc lập.

---

## Layout repo

```
skills/
  engineering/   # promoted — code work (install vào project)
  productivity/  # promoted — workflow
  personal/      # setup riêng — không ship plugin
  misc/          # hiếm dùng
  in-progress/   # draft
  deprecated/    # bỏ
```

Promoted = an toàn copy sang project khác.

---


## Reference

These split on one axis — who can invoke them. **User-invoked** skills are reachable only when you type them (e.g. `/grill-me`); their job is to orchestrate. **Model-invoked** skills can be invoked by you _or_ reached for automatically by the agent when the task fits; they hold the reusable discipline. A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.

### Engineering

Skills I use daily for code work.

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** — Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[supervisor](./skills/engineering/supervisor/SKILL.md)** — Decision proxy above root: handles macro decisions, momentum recovery, quality, and progress truth.
- **[root](./skills/engineering/root/SKILL.md)** — Active project lead that reads `WORKSPACE_PROTOCOL.md`, uses repo-local `config.model` for peer defaults, preserves momentum, allocates peers only when needed, and gates output.
- **[peer](./skills/engineering/peer/SKILL.md)** — Independent worker for any bounded packet from root.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** — Grilling session that also builds your project's domain model, sharpening terminology and updating `CONTEXT.md` and ADRs inline.
- **[triage](./skills/engineering/triage/SKILL.md)** — Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** — Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)** — Configure this repo for the engineering skills (issue tracker, triage labels, domain docs, root control docs, `WORKSPACE_PROTOCOL.md`, `SUPERVISOR_NOTEBOOK.md`, and `config.model`). Run once per repo.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)** — Break any plan, spec, or conversation into tracer-bullet tickets with blocking edges, control notes, and required proof — local markdown or native tracker links.
- **[implement](./skills/engineering/implement/SKILL.md)** — Build the work described by a spec or set of tickets, maintaining `ACTIVE_EXECUTION_PLAN.md`, driving `/tdd`, proving per policy, and closing with `/code-review` before committing.
- **[repo-refresh](./skills/engineering/repo-refresh/SKILL.md)** — Explicit repository-wide cleanup for stale docs, dead plans, stale proof machinery, generated debris, and obsolete tests.
- **[ultra-review](./skills/engineering/ultra-review/SKILL.md)** — Maximum-recall peer review pipeline that preserves every candidate in one durable report.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)** — Plan a huge chunk of work, more than one agent session can hold, as a shared map of investigation tickets on the issue tracker — resolve them one at a time until the way to the destination is clear.

**Model-invoked**

- **[architecture-council](./skills/engineering/architecture-council/SKILL.md)** — Mandatory pre-code gate for every architecture decision or unclear architectural next step, evaluated by dedicated Paseo root agents.
- **[architecture-premise-audit](./skills/engineering/architecture-premise-audit/SKILL.md)** — Broad premise audit for wrong system archetypes before trusting repo vocabulary, proof, or module boundaries.
- **[prototype](./skills/engineering/prototype/SKILL.md)** — Build a throwaway prototype to answer a design question — a runnable terminal app for state/logic questions, or several radically different UI variations toggleable from one route.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./skills/engineering/research/SKILL.md)** — Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a focused research packet.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** — Actively build and sharpen a project's domain model — challenge terms against the glossary, stress-test with edge-case scenarios, and update `CONTEXT.md` and ADRs inline.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — Shared discipline and vocabulary for designing deep modules: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface.
- **[structural-antipatterns](./skills/engineering/structural-antipatterns/SKILL.md)** — Design-control lens for structural misfit, weak-owner workarounds, proof laundering, overengineering, and avoidable tax.
- **[code-review](./skills/engineering/code-review/SKILL.md)** — Two-axis review of the diff since a fixed point: **Standards** (including control docs and Fowler smells) and **Spec**, plus a proof gate.
- **[resolving-merge-conflicts](./skills/engineering/resolving-merge-conflicts/SKILL.md)** — Work through an in-progress git merge or rebase conflict hunk by hunk, resolving by intent traced to each side's primary source, then finish the operation — never `--abort`.

### Productivity

General workflow tools, not code-specific.

**User-invoked**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.
- **[handoff](./skills/productivity/handoff/SKILL.md)** — Compact the current conversation into a handoff document so another agent can continue the work.
- **[teach](./skills/productivity/teach/SKILL.md)** — Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.
- **[writing-great-skills](./skills/productivity/writing-great-skills/SKILL.md)** — Reference for writing and editing skills well: the vocabulary and principles that make a skill predictable.

**Model-invoked**

- **[grilling](./skills/productivity/grilling/SKILL.md)** — Interview the user relentlessly about a plan, decision, or idea until every branch of the decision tree is resolved. The reusable loop behind `grill-me` and `grill-with-docs`.

### Personal (this fork)

Not in the Claude plugin / skills.sh promoted set. Install via clone + `link-skills.sh`.

- **[edit-article](./skills/personal/edit-article/SKILL.md)** — Edit and improve articles.
- **[obsidian-vault](./skills/personal/obsidian-vault/SKILL.md)** — Notes in an Obsidian vault.

---

## Upstream

Based on [mattpocock/skills](https://github.com/mattpocock/skills). Newsletter / original docs: [aihero.dev](https://www.aihero.dev/s/skills-newsletter).
