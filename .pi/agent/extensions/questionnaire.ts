/**
 * Questionnaire Tool - Unified tool for asking single or multiple questions
 *
 * Single question: simple options list
 * Multiple questions: tab bar navigation between questions
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
	Container,
	type Component,
	Editor,
	type EditorTheme,
	Key,
	matchesKey,
	Text,
	truncateToWidth,
	visibleWidth,
	wrapTextWithAnsi,
} from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
import {
	resetContainer,
	WrappedStatusText,
} from "./pi-simple/tool-one-line/render-shared.ts";

// Types
interface QuestionOption {
	value: string;
	label: string;
	description?: string;
}

type RenderOption = QuestionOption & { isOther?: boolean };

interface Question {
	id: string;
	label: string;
	prompt: string;
	options: QuestionOption[];
	allowOther: boolean;
}

interface Answer {
	id: string;
	value: string;
	label: string;
	wasCustom: boolean;
	index?: number;
	note?: string;
}

interface QuestionnaireResult {
	questions: Question[];
	answers: Answer[];
	cancelled: boolean;
}

class IndentedLinesText implements Component {
	constructor(
		private lines: string[],
		private indent = "  ",
	) {}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const indentWidth = visibleWidth(this.indent);
		const contentWidth = Math.max(1, safeWidth - indentWidth);
		return this.lines.flatMap((line) => {
			const wrapped = wrapTextWithAnsi(line, contentWidth);
			const chunks = wrapped.length > 0 ? wrapped : [""];
			return chunks.map((chunk) => (
				truncateToWidth(`${this.indent}${chunk}`, safeWidth, "", true)
			));
		});
	}

	invalidate(): void {}
}

// Schema
const QuestionOptionSchema = Type.Object({
	value: Type.String({ description: "The value returned when selected" }),
	label: Type.String({ description: "Display label for the option" }),
	description: Type.Optional(
		Type.String({ description: "Optional description shown below label" }),
	),
});

const QuestionSchema = Type.Object({
	id: Type.String({ description: "Unique identifier for this question" }),
	label: Type.Optional(
		Type.String({
			description:
				"Short contextual label for tab bar, e.g. 'Scope', 'Priority' (defaults to Q1, Q2)",
		}),
	),
	prompt: Type.String({ description: "The full question text to display" }),
	options: Type.Array(QuestionOptionSchema, {
		description: "Available options to choose from",
	}),
	allowOther: Type.Optional(
		Type.Boolean({
			description: "Allow 'Type something' option (default: true)",
		}),
	),
});

const QuestionnaireParams = Type.Object({
	questions: Type.Array(QuestionSchema, {
		description: "Questions to ask the user",
	}),
});

function errorResult(
	message: string,
	questions: Question[] = [],
): { content: { type: "text"; text: string }[]; details: QuestionnaireResult } {
	return {
		content: [{ type: "text", text: message }],
		details: { questions, answers: [], cancelled: true },
	};
}

function questionCountLabel(count: number): string {
	return `${count} ${count === 1 ? "question" : "questions"}`;
}

export default function questionnaire(pi: ExtensionAPI) {
	pi.registerTool({
		name: "questionnaire",
		label: "Questionnaire",
		description:
			"Ask the user one or more questions. Use for clarifying requirements, getting preferences, or confirming decisions. For single questions, shows a simple option list. For multiple questions, shows a tab-based interface.",
		parameters: QuestionnaireParams,
		renderShell: "self",

		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			if (!ctx.hasUI) {
				return errorResult(
					"Error: UI not available (running in non-interactive mode)",
				);
			}
			if (params.questions.length === 0) {
				return errorResult("Error: No questions provided");
			}

			// Normalize questions with defaults
			const questions: Question[] = params.questions.map((q, i) => ({
				...q,
				label: q.label || `Q${i + 1}`,
				allowOther: q.allowOther !== false,
			}));

			const isMulti = questions.length > 1;
			const totalTabs = questions.length + 1; // questions + Submit
			let finishQuestionnaire: ((cancelled: boolean) => void) | undefined;
			const abortQuestionnaire = () => finishQuestionnaire?.(true);
			const setWorkingVisible = (visible: boolean) => {
				(ctx.ui as { setWorkingVisible?: (visible: boolean) => void }).setWorkingVisible?.(visible);
			};
			signal?.addEventListener("abort", abortQuestionnaire, { once: true });

			setWorkingVisible(false);
			let result: QuestionnaireResult;
			try {
				result = await ctx.ui.custom<QuestionnaireResult>(
					(tui, theme, _kb, done) => {
					// State
					let currentTab = 0;
					let optionIndex = 0;
					let inputMode: "custom" | "note" | null = null;
					let inputQuestionId: string | null = null;
					let inputOption: RenderOption | null = null;
					let inputOptionIndex: number | undefined;
					let cachedLines: string[] | undefined;
					let submitted = false;
					const answers = new Map<string, Answer>();

					// Editor for "Type something" option
					const editorTheme: EditorTheme = {
						borderColor: (s) => theme.fg("accent", s),
						selectList: {
							selectedPrefix: (t) => theme.fg("accent", t),
							selectedText: (t) => theme.fg("accent", t),
							description: (t) => theme.fg("muted", t),
							scrollInfo: (t) => theme.fg("dim", t),
							noMatch: (t) => theme.fg("warning", t),
						},
					};
					const editor = new Editor(tui, editorTheme);

					// Helpers
					function refresh() {
						cachedLines = undefined;
						tui.requestRender();
					}

					function submit(cancelled: boolean) {
						if (submitted) return;
						submitted = true;
						done({
							questions,
							answers: Array.from(answers.values()),
							cancelled,
						});
					}

					finishQuestionnaire = submit;
					if (signal?.aborted) queueMicrotask(() => submit(true));

					function currentQuestion(): Question | undefined {
						return questions[currentTab];
					}

					function currentOptions(): RenderOption[] {
						const q = currentQuestion();
						if (!q) return [];
						const opts: RenderOption[] = [...q.options];
						if (q.allowOther) {
							opts.push({
								value: "__other__",
								label: "Type something.",
								isOther: true,
							});
						}
						return opts;
					}

					function allAnswered(): boolean {
						return questions.every((q) => answers.has(q.id));
					}

					function advanceAfterAnswer() {
						if (!isMulti) {
							submit(false);
							return;
						}
						if (currentTab < questions.length - 1) {
							currentTab++;
						} else {
							currentTab = questions.length; // Submit tab
						}
						optionIndex = 0;
						refresh();
					}

					function saveAnswer(
						questionId: string,
						value: string,
						label: string,
						wasCustom: boolean,
						index?: number,
						note?: string,
					) {
						answers.set(questionId, {
							id: questionId,
							value,
							label,
							wasCustom,
							index,
							...(note ? { note } : {}),
						});
					}

					// Editor submit callback
					editor.onSubmit = (value) => {
						if (!inputQuestionId) return;

						if (inputMode === "note" && inputOption) {
							const note = value.trim();
							saveAnswer(
								inputQuestionId,
								inputOption.value,
								inputOption.label,
								false,
								inputOptionIndex,
								note || undefined,
							);
						} else {
							const trimmed = value.trim() || "(no response)";
							saveAnswer(inputQuestionId, trimmed, trimmed, true);
						}

						inputMode = null;
						inputQuestionId = null;
						inputOption = null;
						inputOptionIndex = undefined;
						editor.setText("");
						advanceAfterAnswer();
					};

					function handleInput(data: string) {
						// Input mode: route to editor
						if (inputMode) {
							if (matchesKey(data, Key.escape)) {
								inputMode = null;
								inputQuestionId = null;
								inputOption = null;
								inputOptionIndex = undefined;
								editor.setText("");
								refresh();
								return;
							}
							editor.handleInput(data);
							refresh();
							return;
						}

						const q = currentQuestion();
						const opts = currentOptions();

						// Tab navigation (multi-question only)
						if (isMulti) {
							if (matchesKey(data, Key.tab) || matchesKey(data, Key.right)) {
								currentTab = (currentTab + 1) % totalTabs;
								optionIndex = 0;
								refresh();
								return;
							}
							if (
								matchesKey(data, Key.shift("tab")) ||
								matchesKey(data, Key.left)
							) {
								currentTab = (currentTab - 1 + totalTabs) % totalTabs;
								optionIndex = 0;
								refresh();
								return;
							}
						}

						// Submit tab
						if (currentTab === questions.length) {
							if (matchesKey(data, Key.enter) && allAnswered()) {
								submit(false);
							} else if (matchesKey(data, Key.escape)) {
								submit(true);
							}
							return;
						}

						// Option navigation
						if (matchesKey(data, Key.up)) {
							optionIndex = Math.max(0, optionIndex - 1);
							refresh();
							return;
						}
						if (matchesKey(data, Key.down)) {
							optionIndex = Math.min(opts.length - 1, optionIndex + 1);
							refresh();
							return;
						}

						// Add note to prefilled option
						if (data === "n" && q) {
							const opt = opts[optionIndex];
							if (!opt.isOther) {
								const existing = answers.get(q.id);
								inputMode = "note";
								inputQuestionId = q.id;
								inputOption = opt;
								inputOptionIndex = optionIndex + 1;
								editor.setText(
									existing && !existing.wasCustom && existing.index === optionIndex + 1
										? existing.note || ""
										: "",
								);
								refresh();
								return;
							}
						}

						// Select option
						if (matchesKey(data, Key.enter) && q) {
							const opt = opts[optionIndex];
							if (opt.isOther) {
								inputMode = "custom";
								inputQuestionId = q.id;
								editor.setText("");
								refresh();
								return;
							}
							const existing = answers.get(q.id);
							const note = existing && !existing.wasCustom && existing.index === optionIndex + 1
								? existing.note
								: undefined;
							saveAnswer(q.id, opt.value, opt.label, false, optionIndex + 1, note);
							advanceAfterAnswer();
							return;
						}

						// Cancel
						if (matchesKey(data, Key.escape)) {
							submit(true);
						}
					}

					function render(width: number): string[] {
						if (cachedLines) return cachedLines;

						const lines: string[] = [];
						const q = currentQuestion();
						const opts = currentOptions();

						const add = (s: string) => lines.push(truncateToWidth(s, width));
						const addWrappedBlock = (
							text: string,
							firstPrefix: string,
							continuationPrefix: string,
							style: (s: string) => string = (s) => s,
						) => {
							const logicalLines = text.replace(/\t/g, "   ").split(/\r?\n/);

							for (let logicalIndex = 0; logicalIndex < logicalLines.length; logicalIndex++) {
								const rawLine = logicalLines[logicalIndex] ?? "";
								const startingPrefix =
									logicalIndex === 0 ? firstPrefix : continuationPrefix;
								const availableWidth = Math.max(
									1,
									width - visibleWidth(startingPrefix),
								);

								if (rawLine.length === 0) {
									lines.push(truncateToWidth(startingPrefix, width, ""));
									continue;
								}

								const wrapped = wrapTextWithAnsi(style(rawLine), availableWidth);
								for (let wrappedIndex = 0; wrappedIndex < wrapped.length; wrappedIndex++) {
									const prefix =
										logicalIndex === 0 && wrappedIndex === 0
											? firstPrefix
											: continuationPrefix;
									lines.push(prefix + wrapped[wrappedIndex]);
								}
							}
						};

						add(theme.fg("accent", "─".repeat(width)));

						// Tab bar (multi-question only)
						if (isMulti) {
							const tabs: string[] = ["← "];
							for (let i = 0; i < questions.length; i++) {
								const isActive = i === currentTab;
								const isAnswered = answers.has(questions[i].id);
								const lbl = questions[i].label;
								const box = isAnswered ? "■" : "□";
								const color = isAnswered ? "success" : "muted";
								const text = ` ${box} ${lbl} `;
								const styled = isActive
									? theme.bg("selectedBg", theme.fg("text", text))
									: theme.fg(color, text);
								tabs.push(`${styled} `);
							}
							const canSubmit = allAnswered();
							const isSubmitTab = currentTab === questions.length;
							const submitText = " ✓ Submit ";
							const submitStyled = isSubmitTab
								? theme.bg("selectedBg", theme.fg("text", submitText))
								: theme.fg(canSubmit ? "success" : "dim", submitText);
							tabs.push(`${submitStyled} →`);
							add(` ${tabs.join("")}`);
							lines.push("");
						}

						function renderOptions() {
							const answer = q ? answers.get(q.id) : undefined;
							for (let i = 0; i < opts.length; i++) {
								const opt = opts[i];
								const selected = i === optionIndex;
								const isOther = opt.isOther === true;
								const isAnsweredOption =
									!isOther && answer && !answer.wasCustom && answer.index === i + 1;
								const selectionPrefix = selected ? theme.fg("accent", "> ") : "  ";
								const labelPrefix = `${i + 1}. `;
								const continuationPrefix = " ".repeat(
									visibleWidth(selectionPrefix) + visibleWidth(labelPrefix),
								);
								const descriptionPrefix = " ".repeat(
									visibleWidth(selectionPrefix) + visibleWidth(labelPrefix) + 2,
								);
								const color = selected ? "accent" : "text";
								const displayLabel = `${
									isOther && inputMode === "custom" ? `${opt.label} ✎` : opt.label
								}${isAnsweredOption ? " ✓" : ""}`;

								addWrappedBlock(
									displayLabel,
									selectionPrefix + theme.fg(color, labelPrefix),
									continuationPrefix,
									(s) => theme.fg(color, s),
								);

								if (opt.description) {
									addWrappedBlock(
										opt.description,
										descriptionPrefix,
										descriptionPrefix,
										(s) => theme.fg("muted", s),
									);
								}

								if (isAnsweredOption && answer.note) {
									addWrappedBlock(
										`note: ${answer.note}`,
										descriptionPrefix,
										descriptionPrefix,
										(s) => theme.fg("muted", s),
									);
								}
							}
						}

						// Content
						if (inputMode && q) {
							addWrappedBlock(q.prompt, theme.fg("text", " "), " ", (s) =>
								theme.fg("text", s),
							);
							lines.push("");
							// Show options for reference
							renderOptions();
							lines.push("");
							const inputLabel = inputMode === "note" && inputOption
								? ` Note for: ${inputOption.label}`
								: " Your answer:";
							add(theme.fg("muted", inputLabel));
							for (const line of editor.render(width - 2)) {
								add(` ${line}`);
							}
							lines.push("");
							add(theme.fg("dim", " Enter to submit • Esc to cancel"));
						} else if (currentTab === questions.length) {
							add(theme.fg("accent", theme.bold(" Ready to submit")));
							lines.push("");
							for (const question of questions) {
								const answer = answers.get(question.id);
								if (answer) {
									const prefix = answer.wasCustom ? "(wrote) " : "";
									add(
										`${theme.fg("muted", ` ${question.label}: `)}${theme.fg("text", prefix + answer.label)}`,
									);
									if (answer.note) {
										add(theme.fg("muted", `   note: ${answer.note}`));
									}
								}
							}
							lines.push("");
							if (allAnswered()) {
								add(theme.fg("success", " Press Enter to submit"));
							} else {
								const missing = questions
									.filter((q) => !answers.has(q.id))
									.map((q) => q.label)
									.join(", ");
								add(theme.fg("warning", ` Unanswered: ${missing}`));
							}
						} else if (q) {
							addWrappedBlock(q.prompt, theme.fg("text", " "), " ", (s) =>
								theme.fg("text", s),
							);
							lines.push("");
							renderOptions();
						}

						lines.push("");
						if (!inputMode) {
							const help = isMulti
								? " Tab/←→ navigate • ↑↓ select • Enter confirm • n add note • Esc cancel"
								: " ↑↓ navigate • Enter select • n add note • Esc cancel";
							add(theme.fg("dim", help));
						}
						add(theme.fg("accent", "─".repeat(width)));

						cachedLines = lines;
						return lines;
					}

					return {
						render,
						invalidate: () => {
							cachedLines = undefined;
						},
						handleInput,
					};
					},
				);
			} finally {
				signal?.removeEventListener("abort", abortQuestionnaire);
				finishQuestionnaire = undefined;
				setWorkingVisible(true);
			}

			if (result.cancelled) {
				return {
					content: [{ type: "text", text: "User cancelled the questionnaire" }],
					details: result,
				};
			}

			const answerLines = result.answers.map((a) => {
				const qLabel = questions.find((q) => q.id === a.id)?.label || a.id;
				const note = a.note ? `\n  note: ${a.note}` : "";
				if (a.wasCustom) {
					return `${qLabel}: user wrote: ${a.label}${note}`;
				}
				return `${qLabel}: user selected: ${a.index}. ${a.label}${note}`;
			});

			return {
				content: [{ type: "text", text: answerLines.join("\n") }],
				details: result,
			};
		},

		renderCall(args, theme, context) {
			if (!context.isPartial) {
				return resetContainer(context);
			}
			const qs = (args.questions as Question[]) || [];
			const count = qs.length;
			const label = `${theme.fg("toolTitle", theme.bold("Questionnaire"))} ${theme.fg("muted", questionCountLabel(count))}`;
			const component = context.lastComponent instanceof WrappedStatusText
				? context.lastComponent
				: new WrappedStatusText();
			component.setParts(theme.fg("accent", "?"), label);
			return component;
		},

		renderResult(result, _options, theme, context) {
			const details = result.details as QuestionnaireResult | undefined;
			if (!details) {
				const text = result.content[0];
				return new Text(text?.type === "text" ? text.text : "", 0, 0);
			}

			const count = details.questions.length;
			const label = `${theme.fg("toolTitle", theme.bold("Questionnaire"))} ${theme.fg("muted", questionCountLabel(count))}`;
			const header = context.lastComponent instanceof WrappedStatusText
				? context.lastComponent
				: new WrappedStatusText();
			header.setParts(
				details.cancelled ? theme.fg("warning", "✕") : theme.fg("success", "✓"),
				label,
			);

			const container = new Container();
			container.addChild(header);

			if (details.cancelled) {
				const lines = [theme.fg("warning", "Cancelled")];
				for (let i = 0; i < details.questions.length; i++) {
					const question = details.questions[i];
					const questionLabel = question.label || `Q${i + 1}`;
					lines.push(
						`${theme.fg("accent", questionLabel)}: ${theme.fg("muted", question.prompt)}`,
					);
				}
				container.addChild(new IndentedLinesText(lines));
				return container;
			}

			const lines = details.answers.flatMap((a) => {
				const question = details.questions.find((q) => q.id === a.id);
				const questionLabel = question?.label || a.id;
				const styledQuestionLabel = theme.fg("accent", questionLabel);
				const answerLine = a.wasCustom
					? `${styledQuestionLabel}: ${theme.fg("muted", "(wrote) ")}${a.label}`
					: `${styledQuestionLabel}: ${a.index ? `${a.index}. ${a.label}` : a.label}`;
				return a.note
					? [answerLine, theme.fg("muted", `  note: ${a.note}`)]
					: [answerLine];
			});
			container.addChild(new IndentedLinesText(lines));
			return container;
		}, 
	});
}
