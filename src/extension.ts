// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as Automerge from 'automerge'
import {promises as fs} from 'fs'

interface AutoText {
	text: Automerge.Text
}

const openAutomergeDocuments: { [id: string]: AutoText } = {}

export function activate(context: vscode.ExtensionContext) {
	function load(fileName: string) {
		return fs.readFile(fileName + ".mrg").then(binary => {
			if (!binary.length) { return }
			const doc = Automerge.load<AutoText>((binary as Uint8Array) as Automerge.BinaryDocument)
			return doc
		})
	}
	function save(fileName: string, doc: AutoText) {
		const binary = Automerge.save(doc)
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
		load(doc.fileName).then(d => {
			if (!d) { return }
			const mrgText = d.text.join('')
			const bufferText = doc.getText()

			if (mrgText !== bufferText) {
				console.log('mrgtext: ', mrgText)
				console.log('bufferText: ', bufferText)
				
				const editor = vscode.window.visibleTextEditors.find(e => e.document === doc)
				if (!editor) {
					vscode.window.showErrorMessage("Found a mismatched .mrg / source document and couldn't correct it. Don't save anything and report this bug!")
				} else {
					editor.edit(editBuilder => {
						editBuilder.replace(new vscode.Range(doc.positionAt(0), doc.positionAt(bufferText.length)), mrgText)
					})
					vscode.window.showErrorMessage("Replaced buffer contents with document found .mrg to prevent desynchronization.")
				}				
			}
			else {
				vscode.window.showInformationMessage("Loaded companion .mrg file (and it matches this buffer.)")
			}
			
			// wait until the onDidTextChange
			setTimeout( () => { openAutomergeDocuments[doc.fileName] = d }, 0)
		})
	})
	
	vscode.workspace.onDidCloseTextDocument(doc => {
		delete openAutomergeDocuments[doc.fileName]
	})

	vscode.workspace.onDidSaveTextDocument(doc => {
		const fileName = doc.fileName
		const d = openAutomergeDocuments[fileName]
		if (d) { save(fileName, d) }
	})

	vscode.workspace.onDidChangeTextDocument(e => {
		const fileName = e.document.fileName
		const d = openAutomergeDocuments[fileName]

		if (!d) { return }

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
