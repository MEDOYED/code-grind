### build command

`npx @vscode/vsce package --no-dependencies`

### install extension after build file was created:

you need to change (0.2.0) version to last version that exist in root pachage.json or copy generated file name after build command finish

`code --install-extension code-grind-0.2.0.vsix --force`
