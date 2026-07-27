# Pi Workflow Patterns

Use these as shapes, not boilerplate. Keep names and keys stable after launch.

## GitHub Issue To Herdr

Use [workflows/github-issue-to-herdr.js](workflows/github-issue-to-herdr.js) for the reviewed two-agent flow:

```text
GitHub issue
  -> planner agent reads gh issue + ask-matt + selected SKILL.md files
  -> schema-validated task DAG
  -> checkpoint approve-herdr-plan
  -> executor agent follows orchestrator-herdr
  -> Herdr workers execute one selected skill per task
  -> executor ingests STATUS/artifacts/transcripts
```

The Pi agents are sequential. Only Herdr fans out implementation workers.

## Structured Fan-Out

```js
const reportSchema = {
  type: "object",
  properties: {
    status: { enum: ["done", "blocked", "failed"] },
    summary: { type: "string" },
    evidence: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
  },
  required: ["status", "summary", "evidence", "risks"],
  additionalProperties: false,
};

const reports = await parallel("review", {
  correctness: () => agent("Review correctness using the code-review skill.", {
    outputSchema: reportSchema,
    tools: ["read", "grep"],
  }),
  security: () => agent("Review security boundaries and return concrete evidence.", {
    outputSchema: reportSchema,
    tools: ["read", "grep"],
  }),
});

return await agent(prompt(
  "Deduplicate and prioritize these reports. Preserve evidence:\n\n{reports}",
  { reports },
));
```

## Approval Boundary

```js
const plan = await agent("Produce a concise plan with risks and verification.");
const decision = await checkpoint({
  name: "approve-plan",
  prompt: "Approve this implementation plan?",
  context: { plan },
});

if (decision !== "approved") {
  return { status: "cancelled", plan };
}

return await agent(prompt("Implement the approved plan:\n\n{plan}", { plan }));
```

Use this in background mode when the checkpoint should be answered through `workflow_respond`.

## Isolated Writers

```js
const changes = await parallel("isolated-changes", {
  api: () => withWorktree("api-change", async ({ path, branch }) =>
    agent(`Implement the API change in ${path} on ${branch}.`, {
      tools: ["read", "bash", "edit", "write"],
    }),
  ),
  docs: () => withWorktree("docs-change", async ({ path, branch }) =>
    agent(`Update the documentation in ${path} on ${branch}.`, {
      tools: ["read", "bash", "edit", "write"],
    }),
  ),
});

return changes;
```

Do not use this shape when both agents must edit the same files. Sequence that work in one named worktree instead.

## Implement Then Verify

```js
return await withWorktree("implementation", async ({ path }) => {
  const implementation = await agent(
    `Implement the approved change in ${path}. Return changed files and proof.`,
    { tools: ["read", "bash", "edit", "write"] },
  );

  const tests = await shell("npm test", { timeoutMs: 600000 });
  const review = await agent(prompt(
    "Review the implementation and test result. Reject unsupported claims.\n\n" +
      "Implementation: {implementation}\nTests: {tests}",
    { implementation, tests },
  ), {
    tools: ["read", "grep"],
  });

  return { implementation, tests, review };
});
```

`shell()` returning a nonzero exit code is inspectable output, not an automatic workflow failure.

## Recovery Map

```text
failed            -> workflow_retry({ runId })
budget_exhausted  -> workflow_resume({ runId, budget? })
pending checkpoint -> workflow_respond({ runId, name, approved })
pending budget proposal -> workflow_respond({ runId, proposalId, approved })
active cancellation -> workflow_stop({ runId })
terminal worktree reuse -> workflow({ ..., parentRunId })
```
