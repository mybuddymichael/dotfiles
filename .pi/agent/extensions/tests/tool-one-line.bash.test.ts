import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { truncateTail } from "@mariozechner/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { rebuildHeadTruncatedBashContentFromFullOutput } from "../tool-one-line.bash.ts";

function buildNumberedOutput(lineCount: number): string {
	return Array.from({ length: lineCount }, (_, index) => (
		`${String(index + 1).padStart(4, "0")}: preview-test ${"x".repeat(40)}`
	)).join("\n");
}

describe("tool-one-line bash helpers", () => {
	it("rewrites truncated bash output to show the first lines from full output", async () => {
		const fullOutput = buildNumberedOutput(3000);
		const tempDir = await mkdtemp(join(tmpdir(), "tool-one-line-"));
		const fullOutputPath = join(tempDir, "bash-output.log");
		await writeFile(fullOutputPath, fullOutput, "utf8");

		const tail = truncateTail(fullOutput);
		expect(tail.truncated).toBe(true);

		const originalTailText = `${tail.content}\n\n[Showing lines ${tail.totalLines - tail.outputLines + 1}-${tail.totalLines} of ${tail.totalLines}. Full output: ${fullOutputPath}]`;
		const rebuilt = rebuildHeadTruncatedBashContentFromFullOutput(
			fullOutput,
			originalTailText,
			fullOutputPath,
			tail,
		);

		expect(rebuilt.text).toContain("0001: preview-test");
		expect(rebuilt.text).toContain("[Showing lines 1-");
		expect(rebuilt.text).not.toContain("[Showing lines 2636-3000");
		expect(rebuilt.text).not.toContain("3000: preview-test");
		expect(rebuilt.truncation.truncated).toBe(true);
		expect(rebuilt.truncation.outputLines).toBeGreaterThan(0);
	});

	it("preserves bash exit-code suffix when rebuilding head-truncated output", () => {
		const fullOutput = buildNumberedOutput(3000);
		const tail = truncateTail(fullOutput);
		const rebuilt = rebuildHeadTruncatedBashContentFromFullOutput(
			fullOutput,
			`${tail.content}\n\nCommand exited with code 2`,
			"/tmp/fake.log",
			tail,
		);

		expect(rebuilt.text.endsWith("Command exited with code 2")).toBe(true);
		expect(rebuilt.text).toContain("0001: preview-test");
	});
});
