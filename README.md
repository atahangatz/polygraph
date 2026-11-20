# Polygraph guide and update file

This repository holds Polygraph's guide, served at https://atahangatz.github.io/polygraph/, and `version.json`, the file Polygraph's update check reads. `editions/` only forwards to the guide's Editions section, which the add-on's report links to.

Polygraph is a scene statistics add-on for Blender. The copies sold outside extensions.blender.org (Free from the store, Pro and Studio) can look here once a day to see whether a newer version is out, but only if the user turns on Check for Updates in Polygraph's preferences and Blender is allowed online. They read `https://atahangatz.github.io/polygraph/version.json` and send nothing but the request for it. The copy on extensions.blender.org has no update check, because Blender updates it itself.

## Releasing a new version

Edit `version.json` and commit to `main`:

- `version`: the new version as it is in the add-on's manifest, for example `2.0.1`.
- `notes`: one sentence on what changed, shown in Preferences under the note. At most 300 characters.
- `pages`: where each edition is bought or downloaded, keyed `free`, `pro` and `studio`. Each must start with `https://`.
- `page`: used for an edition that has no page of its own in `pages`.

GitHub Pages serves the new file a minute or two later. Copies that already looked that day see it on their next daily look, or at once with Check Now.

A pre-release such as `2.1.0-beta.1` counts as older than `2.1.0` but newer than `2.0.9`, so only put one here if every buyer should be told about it.
