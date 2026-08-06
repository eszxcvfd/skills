# skills

Agent skills for real engineering — fork of [mattpocock/skills](https://github.com/mattpocock/skills) plus a Paseo supervisor/root/peer hierarchy.

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
- Trong agent, chạy `/setup-matt-pocock-skills` một lần/repo.
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

### Flow Paseo

Sau khi cài:

1. `/setup-matt-pocock-skills`
2. `/ask-matt` nếu không chắc skill nào.
3. `codex-supervisor` → `codex-root` → `codex-peer` cho flow lớn; ba profile chứa role instructions inline.
4. Với flow nhỏ: `/grill-with-docs` → `/implement` → `/code-review`; effort lớn hoặc còn mù đường bắt đầu bằng `/wayfinder`.

Root đọc `WORKSPACE_PROTOCOL.md`; peer không đọc file đó. `SUPERVISOR_NOTEBOOK.md` là memory của supervisor cho failure/anti-pattern quan sát được. `config.model` giữ provider/model/thinking mặc định cho supervisor/root/peer theo từng project, để đổi model mà không sửa prompt. Root giữ design/lead; coding/TDD/bugfix/test/proof/code-review mặc định đẩy xuống peer khi vượt quá một bước inline nhỏ, trừ khi bạn yêu cầu root tự làm.

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

Skills I use daily for code work. The promoted surface currently has thirteen
skills, within the requested 10–15 range; specialized utilities remain in
`skills/misc/`.

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** — Ask which active engineering skill or preserved specialized workflow fits the situation.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)** — Configure this repo for the engineering skills (issue tracker, triage labels, domain docs, root control docs, `WORKSPACE_PROTOCOL.md`, `SUPERVISOR_NOTEBOOK.md`, and `config.model`). Run once per repo.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)** — Map a very large, foggy effort as decision tickets until the route is clear.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** — Sharpen a plan through a one-question-at-a-time interview while recording terms and decisions.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)** — Turn an aligned conversation into a spec with architecture placement, invariants, and proof.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)** — Split a spec or plan into tracer-bullet tickets with blocking edges and required proof.
- **[implement](./skills/engineering/implement/SKILL.md)** — Build the work described by a spec or set of tickets, maintaining `ACTIVE_EXECUTION_PLAN.md`, applying TDD inline, proving per policy, and closing with `/code-review` before committing.

**Model-invoked**

- **[architecture-council](./skills/engineering/architecture-council/SKILL.md)** — Mandatory pre-code gate for every architecture decision or unclear architectural next step.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./skills/engineering/research/SKILL.md)** — Investigate questions against high-trust primary sources and leave cited findings.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Drive implementation with a red-green-refactor loop and seam-level proof.
- **[prototype](./skills/engineering/prototype/SKILL.md)** — Build a throwaway artifact to answer a design or state-model question.
- **[code-review](./skills/engineering/code-review/SKILL.md)** — Review a fixed-point diff along Standards and Spec axes, including the proof gate.

The three Paseo role sources are intentionally not promoted as user skills:
`skills/misc/supervisor`, `skills/misc/root`, and `skills/misc/peer` remain
repository references. The matching Codex profiles contain their role
instructions inline. Other specialized utilities remain available from a
repository clone but are not shipped in the promoted plugin.

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
