# vscode-automerge-tracker README

The VSCode automerge tracker extension can record all edits made in VSCode to a document in a companion .mrg document.

The .mrg document is a simple Automerge document with this schema:

```{ text: Automerge.Text }``` 

If a document is opened that has a .mrg file, it will be used automatically, but new .mrg files will only be created if a user runs the `automerge-sync.begin` (show as "Begin sync to an Automerge document") in the Ctrl-Shift-P command menu.

## Operation

Every edit to the buffer in question is recorded to a local automerge document in memory. Both documents are saved at the same time.

Turning on sync for a document will also do a one-time import, inserting all the existing characters as a single change. 

## Merging with other users

The vscode-automerge-tracker doesn't handle merges. Rather, a user should use the [automerge-git-merge-driver](https://github.com/pvh/automerge-git-merge-driver).  

## Known Issues

There is some attempt to synchronize the text buffer to the contents of the .mrg but it is fragile and probably wrong! When you open a document, the extension will report if it thinks the .mrg is in sync or not with the text buffer, and if not, it will wrench it into place.

Be careful not to save edits to the text document with other editors. It might break things!

Do not merge changes from another user when you have unsaved work. This will probably also break things.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.1

Initial release. Undoubtedly fragile and broken.

-----------------------------------------------------------------------------------------------------------
