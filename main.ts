import { MarkdownView, Plugin, TFile } from 'obsidian';

export default class PageNavigation extends Plugin {
	// Variables for the current file and the previous file
	currentFile: string | null = null;
	previousFile: string | null = null;

	async onload() {
		console.log('loading page-navigation plugin')

		// Register an event listener for the "file-open" event
		this.registerEvent(
			this.app.workspace.on('file-open', (file: TFile | null) => this.handleFileOpen(file))
		);
	}

	unload() {
		console.log('unloading page-navigation plugin')
	}

	/**
	 * Handles the event when a file is opened.
	 * Updates navigation lists and backlinks as needed.
	 */
	private handleFileOpen(file: TFile | null) {
		if(file) {
			// Update the previous and current file names
			this.previousFile = this.currentFile;
			this.currentFile = file.basename;

			// Add a baclink if the file is a new note created via a link
			// If not, try to update the navigation list
			if(this.isNewNoteUsingLink(file)) {
				this.addBacklinkToNewNote();
			} else {
				this.updateNavigationList();
			}
		}
	}

	/**
	 * Checks if a file is a new, empty note created via a link.
	 */
	private isNewNoteUsingLink(file: TFile): boolean {
		return file.extension === 'md' && file.stat.size === 0 && file.name !== 'Untitled.md';
	}

	/** 
	 * Adds a backlink to the previously opened file in a new note.
	 */
	private addBacklinkToNewNote() {
		// Ensure there is a previous file to link to
		if (this.previousFile) { 
			const headerText = `### Navigation\n[[${this.previousFile}]]`;

			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

			if (activeView) {
				const editor = activeView.editor;
				const doc = editor.getDoc();

				// Add the backlink to the new note
				doc.setValue(headerText + '\n');
			}
		}
	}

	/** 
	 * Updates the navigation list in a file
	 */
	private async updateNavigationList() {
		// Check if the file has a parent
		// If yes, add a link to the parent at the top of the navigation list
		
		// Check if the file has children in a folder
		// if yes, add links to the children at the bottom of the navigation list

		// Prepend the navigation list to the file
	}
}
