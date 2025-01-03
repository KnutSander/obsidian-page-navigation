import { MarkdownView, Plugin, TFile, TFolder } from 'obsidian';

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
		if(file && file.name !== 'README.md') {
			// Update the previous and current file names
			this.previousFile = this.currentFile;
			this.currentFile = file.basename;

			// Add a baclink if the file is a new note created via a link
			// If not, try to update the navigation list
			if(this.isNewNoteUsingLink(file)) {
				this.addBacklinkToNewNote();
			} else {
				this.updateNavigationList(file);
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
			let headerText = `### Navigation\n[[${this.previousFile}]]`;

			let activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

			if (activeView) {
				let editor = activeView.editor;
				let doc = editor.getDoc();

				// Add the backlink to the new note
				doc.setValue(headerText + '\n');
			}
		}
	}

	/** 
	 * Updates the navigation list in a file
	 */
	private async updateNavigationList(file: TFile) {
		let headerText = `### Navigation\n`;
		const parent = file.parent;
		if (!parent) return false;

		// Add a link to the parent at the top of the navigation list
		if(parent !== this.app.vault.getRoot()){
			// If the file is in a folder, link to the folder's file
			headerText += `[[${parent.name}]]\n`;
		} else {
			// If the file is in the root directory, link to the README file
			headerText += `[[README]]\n`;
		}
		
		// Check if the file has children in a folder
		// if yes, add links to the children at the bottom of the navigation list
		for (const child of parent.children) {
			// If true, this folder belongs to the current file
			if (child instanceof TFolder && child.name === file.basename) {

				// Sort the files in the folder alphanumerically
				const sortedFiles = child.children.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));

				// Add links to all files in the folder
				for (const file of sortedFiles) {
					if(file instanceof TFile){
						headerText += `[[${file.basename}]]\n`;
					}
				}
			break;
			}
		}

		// Get the file content
		const content = await this.app.vault.read(file);	

		// Regular expression to find and replace the "Navigation" section
		const navigationRegex = /### Navigation\n[\s\S]*?(?=\n#|$)/;

		let updatedContent;
		if (navigationRegex.test(content)) {
			// Replace the existing "Navigation" section
			updatedContent = content.replace(navigationRegex, headerText.trim());
		} else {
			// Append the "Navigation" section if it doesn't exist
			updatedContent = headerText.trim() + '\n\n' + content;
		}

		// Write the updated content back to the file
		await this.app.vault.modify(file, updatedContent);
	}
}
