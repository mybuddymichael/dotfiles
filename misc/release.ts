#!/usr/bin/env bun

import { $ } from 'bun'

// Set strict error handling
$.throws(true)

try {
	// Check if we have uncommitted changes
	const statusOutput = await $`jj status`.text()
	if (!statusOutput.includes('The working copy has no changes.')) {
		console.error('Error: Working copy has uncommitted changes. Please commit or stash them first.')
		process.exit(1)
	}

	// Get the current version from git-cliff
	console.log('Generating changelog...')
	await $`git-cliff --bump -o CHANGELOG.md`

	// Check if CHANGELOG.md was actually modified
	const statusOutputAfter = await $`jj status`.text()
	if (statusOutputAfter.includes('CHANGELOG.md')) {
		// Stage and commit the changelog
		console.log('Committing changelog...')
		await $`jj commit -m "chore: Update changelog"`

		// Get the version from the changelog (extract from the first ## line)
		const changelogContent = await Bun.file('CHANGELOG.md').text()
		const versionMatch = changelogContent.match(/^## \[([^\]]+)\] - /m)

		if (!versionMatch || !versionMatch[1]) {
			console.error('Error: Could not extract version from changelog')
			process.exit(1)
		}

		const version = versionMatch[1]

		// Update package.json version
		console.log(`Updating package.json version to ${version}...`)
		const packageJson = await Bun.file('package.json').json()
		packageJson.version = version
		await Bun.write('package.json', JSON.stringify(packageJson, null, '\t') + '\n')

		// Commit the package.json update
		console.log('Committing package.json version update...')
		await $`jj commit -m "chore: Bump version to ${version}"`

		console.log(`Creating tag v${version}...`)
		await $`git tag v${version}`

		console.log('Setting main bookmark to current revision...')
		await $`jj bookmark set main -r @-`

		console.log('Pushing main and tag to GitHub...')
		await $`jj git push --bookmark main`
		await $`git push --tags`

		console.log(`Release v${version} completed successfully!`)
	} else {
		console.log('No changes to changelog detected. Release not needed.')
	}
} catch (error) {
	console.error('Release script failed:', error)
	process.exit(1)
}
