#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Generate Apple-style password
// @raycast.mode silent

// Optional parameters:
// @raycast.icon 🤖
// @raycast.packageName password-utils

// Documentation:
// @raycast.description Generates an Apple-style password
// @raycast.author hnsn
// @raycast.authorURL https://raycast.com/hnsn

const { randomInt } = require("node:crypto");
const { spawnSync } = require("node:child_process");

const CONSONANTS = "bcdfghjkmnpqrstvwxz";
const VOWELS = "aeiyu";
const DIGITS = "23456789";
const WORD_COUNT = 3;
const WORD_LENGTH = 6;
const SEPARATOR = "-";

function choose(characters) {
  return characters[randomInt(characters.length)];
}

function generateWord() {
  return [
    choose(CONSONANTS),
    choose(VOWELS),
    choose(CONSONANTS),
    choose(CONSONANTS),
    choose(VOWELS),
    choose(CONSONANTS),
  ];
}

function replaceOneEdgeWithDigit(words) {
  const wordIndex = randomInt(words.length);
  const characterIndex = wordIndex === 0 || randomInt(2) === 1 ? WORD_LENGTH - 1 : 0;

  words[wordIndex][characterIndex] = choose(DIGITS);
}

function capitalizeOneLetter(words) {
  const letterPositions = [];

  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    for (let characterIndex = 0; characterIndex < words[wordIndex].length; characterIndex++) {
      if (/[a-z]/.test(words[wordIndex][characterIndex])) {
        letterPositions.push([wordIndex, characterIndex]);
      }
    }
  }

  const [wordIndex, characterIndex] = letterPositions[randomInt(letterPositions.length)];
  words[wordIndex][characterIndex] = words[wordIndex][characterIndex].toUpperCase();
}

function generatePassword() {
  const words = Array.from({ length: WORD_COUNT }, generateWord);

  replaceOneEdgeWithDigit(words);
  capitalizeOneLetter(words);

  return words.map((word) => word.join("")).join(SEPARATOR);
}

function copyToClipboard(text) {
  const result = spawnSync("pbcopy", { input: text, encoding: "utf8" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `pbcopy exited with status ${result.status}`);
  }
}

function main() {
  try {
    const password = generatePassword();
    copyToClipboard(password);
    console.log(`Copied: ${password}`);
  } catch (error) {
    console.error(`Failed to copy password to clipboard: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generatePassword,
};
