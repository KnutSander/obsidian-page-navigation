import { MarkdownView, Plugin } from 'obsidian';

export default class PageNavigation extends Plugin {
	// Variables for the current file and the previous file
	currentFile = '';
	previousFile = '';

	async onload() {
		// Console message because it looks professional
		console.log('loading page-navigation plugin')

		// Register an event listener for the "file-open" event
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => {

				// Check if a file is open before updating paths
				if (file) {
					// Store the previous page's name
					this.previousFile = this.currentFile;
					// Update the current page's name
					this.currentFile = file.basename;

					// Check if the opened file is a new, empty note
					if (file.extension === 'md' && file.stat.size === 0) {
						// Create a Header 1 text
						const headerText = `### Navigation \n[[${this.previousFile}]]`

						// Get the active MarkdownView
						const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

						if (activeView) {
							// Get the current editor and document
							const editor = activeView.editor;
							const doc = editor.getDoc();

							// Insert the Header 1 text at the beginning of the document
							doc.setValue(headerText + '\n' + doc.getValue());
						}
					}
				}
			})
		);
	}

	onunload() {
		console.log('Unloading PageNavigation');
	}
}
