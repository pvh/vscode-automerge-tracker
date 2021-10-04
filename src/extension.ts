// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as Automerge from 'automerge'
import {promises as fs} from 'fs'

interface AutoText {
	text: Automerge.Text
}

const openAutomergeDocuments: { [id: string]: AutoText } = {}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('okay')

	function load(fileName: string) {
		return fs.readFile(fileName + ".mrg").then(binary => {
			if (!binary.length) { return }
			const doc = Automerge.load<AutoText>((binary as Uint8Array) as Automerge.BinaryDocument)
			return doc
		})
	}
	function save(fileName: string, doc: AutoText) {
		const binary = Automerge.save(doc)
		console.log("saving: ", doc.text.join(''))
		fs.writeFile(fileName + ".mrg", binary)
		return doc
	}
	function init(fileName: string, text: string) {
		const init = Automerge.init()
		const doc = Automerge.change<AutoText>(init as any, (theDoc: AutoText) => {
			theDoc.text = new Automerge.Text(text)
		})
		openAutomergeDocuments[fileName] = doc
	}
	function change(d: AutoText, e: vscode.TextDocumentChangeEvent) {
		if (!d) { return }
		const doc = Automerge.change(d, (doc: AutoText) => {
			e.contentChanges.forEach(c => {
				const t = doc.text
				if (t) {
					if (c.rangeLength) { t.deleteAt!(c.rangeOffset, c.rangeLength) }
					if (c.text) { t.insertAt!(c.rangeOffset, ...c.text) }
				}
			})
		})
		return doc
	}

	vscode.workspace.onDidOpenTextDocument(doc => {
		console.log('open', {fileName: doc.fileName})
		load(doc.fileName).then(d => {
			if (!d) { return }
			openAutomergeDocuments[doc.fileName] = d
			console.log("loaded: ", d.text.join(''))
		})
	})
	
	vscode.workspace.onDidCloseTextDocument(doc => {
		console.log('closed', {fileName: doc.fileName})
		delete openAutomergeDocuments[doc.fileName]
	})

	vscode.workspace.onDidSaveTextDocument(doc => {
		console.log('save', {fileName: doc.fileName})

		const fileName = doc.fileName
		const d = openAutomergeDocuments[fileName]

		if (!d) { console.log(`Document ${fileName} has no open automerge document.`)}

		save(fileName, d)
	})

	vscode.workspace.onDidChangeTextDocument(e => {
		console.log('change event', e)

		const fileName = e.document.fileName
		const d = openAutomergeDocuments[fileName]

		if (!d) { console.log(`Document ${fileName} has no open automerge document.`)}

		const d2 = change(d,e)
		if (!d2) { console.log(`Change returned no document!`); return }

		openAutomergeDocuments[fileName] = d2
	})

	let disposable = vscode.commands.registerCommand('automerge-sync.begin', () => {
		const editor = vscode.window.activeTextEditor
		if (!editor) { return }
		const text = editor.document.getText()
		init(editor.document.fileName, text)
	})

	context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
