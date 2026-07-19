# skills

Agent skills for real engineering — fork of [mattpocock/skills](https://github.com/mattpocock/skills) plus personal extras (Herdr orchestrator).

**Repo:** https://github.com/eszxcvfd/skills

Use this README to pull the set into **any other project**.

---

## Install vào project khác

Chọn **một** cách. Làm trong thư mục project đích (app/repo bạn đang code).

### A. skills.sh (nhanh — copy skill vào project)

```bash
cd /path/to/your-project
npx skills@latest add eszxcvfd/skills
```

- Chọn skill cần dùng và agent (Claude Code, Codex, OpenCode, Cursor, …).
- **Nên tick** `setup-matt-pocock-skills`.
- Trong agent, chạy `/setup-matt-pocock-skills` một lần/repo (issue tracker, triage labels, docs layout).

Cập nhật sau này: chạy lại cùng lệnh `npx skills@latest add eszxcvfd/skills`.

### B. Clone + symlink global (một bản, nhiều project)

Giữ một clone; mọi agent đọc skill qua symlink home:

```bash
git clone https://github.com/eszxcvfd/skills.git ~/src/skills
cd ~/src/skills
./scripts/link-skills.sh
```

Script link toàn bộ skill (trừ `deprecated/`) vào:

- `~/.claude/skills` — Claude Code
- `~/.agents/skills` — Codex / Agent Skills standard

OpenCode / pi: trỏ skill path tới clone, hoặc copy/symlink thêm:

```bash
# OpenCode user config example — skills.paths
# "~/.config/opencode/opencode.json" → "skills": { "paths": ["~/src/skills/skills"] }

mkdir -p ~/.pi/agent/skills
# optional: link personal orchestrator for pi
ln -sfn ~/src/skills/skills/personal/orchestrator-herdr ~/.pi/agent/skills/orchestrator-herdr
```

Cập nhật:

```bash
cd ~/src/skills && git pull && ./scripts/link-skills.sh
```

### C. Git submodule / subtree (skill nằm trong monorepo)

```bash
cd /path/to/your-project
git submodule add https://github.com/eszxcvfd/skills.git vendor/skills
# hoặc sparse: chỉ lấy skills/engineering + skills/productivity
```

Rồi cấu hình agent trỏ vào `vendor/skills/skills` (hoặc copy promoted buckets vào `.agents/skills` / `.claude/skills` của project).

### D. Claude Code plugin (upstream managed bundle)

Plugin chính thức vẫn từ upstream Matt (read-only, auto-update theo release của ông ấy):

```bash
claude plugin marketplace add mattpocock/skills
claude plugin install mattpocock-skills@mattpocock
```

Dùng **A hoặc B** nếu bạn muốn bản **fork này** (có `orchestrator-herdr` và chỉnh sửa riêng).

---

## Sau khi cài — checklist 1 project

1. `/setup-matt-pocock-skills` trong agent (tracker + labels + docs).
2. Router: `/ask-matt` khi không chắc skill nào.
3. Flow thường: `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement`.
4. (Tuỳ chọn) Herdr multi-agent: cài [Herdr](https://herdr.dev), integration `pi` + `opencode`, dùng skill [`orchestrator-herdr`](./skills/personal/orchestrator-herdr/SKILL.md) — pi điều phối, worker OpenCode chạy từng skill project.

---

## Layout repo

```
skills/
  engineering/   # promoted — code work (install vào project)
  productivity/  # promoted — workflow
  personal/      # setup riêng (orchestrator-herdr, …) — không ship plugin
  misc/          # hiếm dùng
  in-progress/   # draft
  deprecated/    # bỏ
```

Promoted = an toàn copy sang project khác. `personal/` mang theo nếu bạn dùng Herdr orchestrator.

---

## Why these skills exist

Upstream framing (Matt Pocock) — common agent failure modes and the skills that fix them:

### #1: The Agent Didn't Do What I Want

> "No-one knows exactly what they want"
>
> David Thomas & Andrew Hunt, [The Pragmatic Programmer](https://www.amazon.co.uk/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833F1T3V)

**The Problem**. The most common failure mode in software development is misalignment. You think the dev knows what you want. Then you see what they've built - and you realize it didn't understand you at all.

This is just the same in the AI age. There is a communication gap between you and the agent. The fix for this is a **grilling session** - getting the agent to ask you detailed questions about what you're building.

**The Fix** is to use:

- [`/grill-me`](./skills/productivity/grill-me/SKILL.md) - for non-code uses
- [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) - same as [`/grill-me`](./skills/productivity/grill-me/SKILL.md), but adds more goodies (see below)

These are my most popular skills. They help you align with the agent before you get started, and think deeply about the change you're making. Use them _every_ time you want to make a change.

### #2: The Agent Is Way Too Verbose

> With a ubiquitous language, conversations among developers and expressions of the code are all derived from the same domain model.
>
> Eric Evans, [Domain-Driven-Design](https://www.amazon.co.uk/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)

**The Problem**: At the start of a project, devs and the people they're building the software for (the domain experts) are usually speaking different languages.

I felt the same tension with my agents. Agents are usually dropped into a project and asked to figure out the jargon as they go. So they use 20 words where 1 will do.

**The Fix** for this is a shared language. It's a document that helps agents decode the jargon used in the project.

<details>
<summary>
Example
</summary>

Here's an example [`CONTEXT.md`](https://github.com/mattpocock/course-video-manager/blob/076a5a7a182db0fe1e62971dd7a68bcadf010f1c/CONTEXT.md), from my `course-video-manager` repo. Which one is easier to read?

- **BEFORE**: "There's a problem when a lesson inside a section of a course is made 'real' (i.e. given a spot in the file system)"
- **AFTER**: "There's a problem with the materialization cascade"

This concision pays off session after session.

</details>

This is built into [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md). It's a grilling session, but that helps you build a shared language with the AI, and document hard-to-explain decisions in ADR's.

It's hard to explain how powerful this is. It might be the single coolest technique in this repo. Try it, and see.

> [!TIP]
> A shared language has many other benefits than reducing verbosity:
>
> - **Variables, functions and files are named consistently**, using the shared language
> - As a result, the **codebase is easier to navigate** for the agent
> - The agent also **spends fewer tokens on thinking**, because it has access to a more concise language

### #3: The Code Doesn't Work

> "Always take small, deliberate steps. The rate of feedback is your speed limit. Never take on a task that’s too big."
>
> David Thomas & Andrew Hunt, [The Pragmatic Programmer](https://www.amazon.co.uk/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833F1T3V)

**The Problem**: Let's say that you and the agent are aligned on what to build. What happens when the agent _still_ produces crap?

It's time to look at your feedback loops. Without feedback on how the code it produces actually runs, the agent will be flying blind.

**The Fix**: You need the usual tranche of feedback loops: static types, browser access, and automated tests.

For automated tests, a red-green-refactor loop is critical. This is where the agent writes a failing test first, then fixes the test. This helps give the agent a consistent level of feedback that results in far better code.

I've built a **[`/tdd`](./skills/engineering/tdd/SKILL.md) skill** you can slot into any project. It encourages red-green-refactor and gives the agent plenty of guidance on what makes good and bad tests.

For debugging, I've also built a **[`/diagnosing-bugs`](./skills/engineering/diagnosing-bugs/SKILL.md)** skill that wraps best debugging practices into a simple loop.

### #4: We Built A Ball Of Mud

> "Invest in the design of the system _every day_."
>
> Kent Beck, [Extreme Programming Explained](https://www.amazon.co.uk/Extreme-Programming-Explained-Embrace-Change/dp/0321278658)

> "The best modules are deep. They allow a lot of functionality to be accessed through a simple interface."
>
> John Ousterhout, [A Philosophy Of Software Design](https://www.amazon.co.uk/Philosophy-Software-Design-2nd/dp/173210221X)

**The Problem**: Most apps built with agents are complex and hard to change. Because agents can radically speed up coding, they also accelerate software entropy. Codebases get more complex at an unprecedented rate.

**The Fix** for this is a radical new approach to AI-powered development: caring about the design of the code.

This is built in to every layer of these skills:

- [`/to-spec`](./skills/engineering/to-spec/SKILL.md) quizzes you about which modules you're touching before creating a spec

And crucially, [`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md) helps you rescue a codebase that has become a ball of mud. I recommend running it on your codebase once every few days.

### Summary

Software engineering fundamentals matter more than ever. These skills are my best effort at condensing these fundamentals into repeatable practices, to help you ship the best apps of your career. Enjoy.

## Reference

These split on one axis — who can invoke them. **User-invoked** skills are reachable only when you type them (e.g. `/grill-me`); their job is to orchestrate. **Model-invoked** skills can be invoked by you _or_ reached for automatically by the agent when the task fits; they hold the reusable discipline. A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.

### Engineering

Skills I use daily for code work.

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** — Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** — Grilling session that also builds your project's domain model, sharpening terminology and updating `CONTEXT.md` and ADRs inline.
- **[triage](./skills/engineering/triage/SKILL.md)** — Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** — Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)** — Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo before using the other engineering skills.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)** — Turn the current conversation into a spec and publish it to the issue tracker. No interview — just synthesizes what you've already discussed.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)** — Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges — written as text in a local file, or as native blocking links on a real tracker.
- **[implement](./skills/engineering/implement/SKILL.md)** — Build the work described by a spec or set of tickets, driving `/tdd` at pre-agreed seams and closing out with `/code-review` before committing.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)** — Plan a huge chunk of work, more than one agent session can hold, as a shared map of investigation tickets on the issue tracker — resolve them one at a time until the way to the destination is clear.

**Model-invoked**

- **[prototype](./skills/engineering/prototype/SKILL.md)** — Build a throwaway prototype to answer a design question — a runnable terminal app for state/logic questions, or several radically different UI variations toggleable from one route.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./skills/engineering/research/SKILL.md)** — Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a background agent.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** — Actively build and sharpen a project's domain model — challenge terms against the glossary, stress-test with edge-case scenarios, and update `CONTEXT.md` and ADRs inline.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — Shared discipline and vocabulary for designing deep modules: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface.
- **[code-review](./skills/engineering/code-review/SKILL.md)** — Two-axis review of the diff since a fixed point: **Standards** (does it follow the repo's coding standards, plus a Fowler smell baseline?) and **Spec** (does it faithfully implement the originating issue/PRD?), run as parallel sub-agents so neither pollutes the other.
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

Not in the Claude plugin set. Install via clone/link or pick them in skills.sh if listed.

- **[orchestrator-herdr](./skills/personal/orchestrator-herdr/SKILL.md)** — Pi on Herdr routes project skills (`ask-matt` map) to OpenCode worker panes.
- **[edit-article](./skills/personal/edit-article/SKILL.md)** — Edit and improve articles.
- **[obsidian-vault](./skills/personal/obsidian-vault/SKILL.md)** — Notes in an Obsidian vault.

---

## Upstream

Based on [mattpocock/skills](https://github.com/mattpocock/skills). Newsletter / original docs: [aihero.dev](https://www.aihero.dev/s/skills-newsletter).
