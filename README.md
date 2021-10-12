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

Be careful not to save edits to the text document with other editors. We have not yet implemented synchronization and so if this happens strange things will begin to occur and there's no way to reconcile the two versions yet.

Do not merge changes from another user when you have unsaved work. This will probably also break things.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.1

Initial release. Undoubtedly fragile and broken.

-----------------------------------------------------------------------------------------------------------
