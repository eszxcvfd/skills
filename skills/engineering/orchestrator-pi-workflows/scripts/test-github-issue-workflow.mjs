import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../workflows/github-issue-to-herdr.js", import.meta.url),
  "utf8",
);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const runWorkflow = new AsyncFunction(
  "args",
  "shell",
  "agent",
  "prompt",
  "phase",
  "checkpoint",
  source,
);

const prompt = (template) => template;
const phase = () => {};
const validTask = {
  id: "implement",
  problem: "Missing requested behavior",
  objective: "Implement the issue",
  skill: "implement",
  skillPath: "/skills/engineering/implement/SKILL.md",
  mode: "AFK",
  dependsOn: [],
  inputs: ["GitHub issue"],
  requiredProof: ["Tests pass"],
};
const validPlan = {
  issue: {
    reference: "123",
    title: "Implement behavior",
    url: "https://github.com/owner/repo/issues/123",
  },
  problem: "Requested behavior is missing",
  assumptions: [],
  tasks: [validTask],
};

const blocked = await runWorkflow(
  { issue: "123", runKey: "issue-123" },
  async () => ({ exitCode: 1, stdout: "", stderr: "not in Herdr" }),
  async () => assert.fail("agent must not run after failed preflight"),
  prompt,
  phase,
  async () => assert.fail("checkpoint must not run after failed preflight"),
);
assert.equal(blocked.stage, "preflight");

const cyclicPlan = {
  ...validPlan,
  tasks: [
    { ...validTask, id: "a", dependsOn: ["b"] },
    { ...validTask, id: "b", dependsOn: ["a"] },
  ],
};
let cycleAgents = 0;
const cycleResult = await runWorkflow(
  { issue: "123", runKey: "issue-123" },
  async () => ({ exitCode: 0, stdout: "", stderr: "" }),
  async () => {
    cycleAgents += 1;
    return cyclicPlan;
  },
  prompt,
  phase,
  async () => assert.fail("cyclic plan must not reach approval"),
);
assert.equal(cycleResult.stage, "plan-validation");
assert.equal(cycleAgents, 1);

let happyAgents = 0;
let checkpoints = 0;
const execution = {
  status: "done",
  runKey: "issue-123",
  acceptedTasks: ["implement"],
  rejectedTasks: [],
  evidence: ["tests"],
  risks: [],
  summary: "Implemented",
};
const happyResult = await runWorkflow(
  { issue: "123", runKey: "issue-123" },
  async () => ({ exitCode: 0, stdout: "", stderr: "" }),
  async () => {
    happyAgents += 1;
    return happyAgents === 1 ? validPlan : execution;
  },
  prompt,
  phase,
  async (input) => {
    checkpoints += 1;
    assert.equal(input.name, "approve-herdr-plan");
    return "approved";
  },
);

assert.equal(happyResult.status, "done");
assert.equal(happyAgents, 2);
assert.equal(checkpoints, 1);
console.log("ok - GitHub issue to Herdr workflow runtime contract");

