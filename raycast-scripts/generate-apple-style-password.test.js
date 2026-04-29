const assert = require("node:assert/strict");
const test = require("node:test");

const { generatePassword } = require("./generate-apple-style-password.js");

const PASSWORD_PATTERN = /^[bcdfghjkmnpqrstvwxz aeiyu23456789-]+$/i;
const LOWERCASE_ALLOWED_LETTERS = new Set("bcdfghjkmnpqrstvwxzaeiyu");
const DIGITS = new Set("23456789");

test("generatePassword returns an Apple-style password", () => {
  for (let attempt = 0; attempt < 1_000; attempt++) {
    const password = generatePassword();
    const groups = password.split("-");
    const characters = [...password.replaceAll("-", "")];
    const letters = characters.filter((character) => /[a-z]/i.test(character));
    const digits = characters.filter((character) => /\d/.test(character));
    const uppercaseLetters = letters.filter((character) => character === character.toUpperCase());

    assert.equal(groups.length, 3);
    assert.deepEqual(groups.map((group) => group.length), [6, 6, 6]);
    assert.match(password, PASSWORD_PATTERN);
    assert.equal(/[01Ol]/.test(password), false);
    assert.equal(/^\d/.test(password), false);
    assert.equal(digits.length, 1);
    assert.equal(DIGITS.has(digits[0]), true);
    assert.equal(uppercaseLetters.length, 1);

    for (const letter of letters) {
      assert.equal(LOWERCASE_ALLOWED_LETTERS.has(letter.toLowerCase()), true);
    }
  }
});

test("generatePassword produces unique passwords across many attempts", () => {
  const passwords = new Set();

  for (let attempt = 0; attempt < 1_000; attempt++) {
    passwords.add(generatePassword());
  }

  assert.equal(passwords.size, 1_000);
});
