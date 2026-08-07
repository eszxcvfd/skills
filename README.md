# skills

Agent skills for real engineering — fork of [mattpocock/skills](https://github.com/mattpocock/skills) plus detached Paseo Lead/Peer execution and an external lifecycle observer.

**Repo:** https://github.com/eszxcvfd/skills

Use this README to pull the set into **any other project**.

---

## Tải xuống / cài vào project khác

Làm trong thư mục project đích.

### Cài bằng `skills`

```bash
cd /path/to/your-project
npx skills@latest add eszxcvfd/skills
```

- Chọn skill cần dùng và agent: Claude Code, Codex, OpenCode, Cursor, …
- Nên tick `setup-matt-pocock-skills`.
- Trong agent, chạy `/setup-matt-pocock-skills` một lần/repo để tạo toàn bộ
  canonical project docs trong một manifest và một lần xác nhận.
- Tải lại một skill đã cài: `npx skills@latest update <skill-name>`.
- Đổi bộ skill hoặc thêm skill mới: chạy lại `npx skills@latest add eszxcvfd/skills`.

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

### Paseo workflow bootstrap

Repo này có `paseo.json` với script `bootstrap` để chuẩn bị clone local và validate plugin:

```bash
paseo script start bootstrap --cwd /path/to/skills
```

Nếu đang ở repo đã mở trong Paseo:

```bash
paseo script start bootstrap
```

Workflow chạy `npm ci` rồi `claude plugin validate . --strict`. Nếu `paseo script ls --cwd /path/to/skills` báo `WORKSPACE_NOT_FOUND`, mở repo trong Paseo trước hoặc chạy trực tiếp:

```bash
npm ci && claude plugin validate . --strict
```

### Flow Paseo / detached Lead

Sau khi cài:

1. `/setup-matt-pocock-skills`
2. `/ask-matt` nếu không chắc skill nào.
3. External Paseo observer starts a detached `codex-root`; Root creates
   `codex-peer` only for bounded packets. The project itself manages only
   Root/Peer routing.
4. Với flow nhỏ: `/grill-with-docs` → `/implement` → `/code-review`; effort lớn hoặc còn mù đường bắt đầu bằng `/wayfinder`.

Project execution is deliberately small: task prompt → detached Root →
bounded Peer. Root owns project doctrine, planning, integration, and
acceptance; Peer owns task-local execution and evidence. The external observer
is configured outside the repository and does not add a project document,
callback, or authority path. Root reads `WORKSPACE_PROTOCOL.md`; Peer does
not. `config.model` contains only Root/Peer defaults.

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

Promoted skills for code work, architecture, delivery, and the SLP agent roles.
The role contract is kept in [`WORKSPACE_PROTOCOL.md`](./WORKSPACE_PROTOCOL.md)
so runtime guidance has one source of truth.

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** — Route an unclear engineering request to the right skill or SLP role.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)** — Bootstrap canonical project docs, Work Routing, and optional Paseo defaults.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)** — Turn a large foggy effort into decision tickets until the route is clear.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** — Sharpen a plan through a one-question interview while recording decisions.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)** — Synthesize an aligned conversation into a spec with placement, invariants, and proof.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)** — Split a spec into tracer-bullet tickets with blocking edges and proof.
- **[implement](./skills/engineering/implement/SKILL.md)** — Execute a settled spec or ticket with TDD, proof, review, and commit discipline.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** — Find and explore deepening opportunities in an existing codebase.
- **[triage](./skills/engineering/triage/SKILL.md)** — Move issues and external PRs through the configured triage state machine.
- **[wizard](./skills/engineering/wizard/SKILL.md)** — Generate an interactive shell wizard for a manual setup or one-off transition.
- **[supervisor](./skills/engineering/supervisor/SKILL.md)** — Observe Paseo lifecycle and launch detached Root sessions from outside the project.
- **[root](./skills/engineering/root/SKILL.md)** — Act as the autonomous Lead (runtime `codex-root`) that plans, delegates, integrates, and accepts.
- **[peer](./skills/engineering/peer/SKILL.md)** — Execute one bounded Root packet with task-local engineering judgment and evidence handback.

**Model-invoked**

- **[architecture-council](./skills/engineering/architecture-council/SKILL.md)** — Mandatory pre-code gate for every architecture decision or unclear architectural next step.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — Provide the deep-module vocabulary: interface, depth, seam, adapter, leverage, and locality.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** — Sharpen domain language, scenarios, context, and consequential decisions.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./skills/engineering/research/SKILL.md)** — Investigate questions against high-trust primary sources and leave cited findings.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Drive implementation with a red-green-refactor loop and seam-level proof.
- **[prototype](./skills/engineering/prototype/SKILL.md)** — Build a throwaway artifact to answer a design or state-model question.
- **[code-review](./skills/engineering/code-review/SKILL.md)** — Review a fixed-point diff along Standards and Spec axes, including the proof gate.
- **[resolving-merge-conflicts](./skills/engineering/resolving-merge-conflicts/SKILL.md)** — Resolve an active merge or rebase conflict by preserving intent.

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
