import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { JapaneseConverter } from './japanese-utils';

interface JapaneseHelperSettings {
	showConversionNotice: boolean;
}

const DEFAULT_SETTINGS: JapaneseHelperSettings = {
	showConversionNotice: true
}

export default class JapaneseHelperPlugin extends Plugin {
	settings: JapaneseHelperSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('language', 'Japanese Helper', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Japanese Helper is active!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('japanese-helper-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('日本語');

		// Add command for converting selected text to hiragana
		this.addCommand({
			id: 'convert-to-hiragana',
			name: 'Convert to Hiragana',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.convertSelectedText(editor, 'hiragana');
			}
		});

		// Add command for converting selected text to katakana
		this.addCommand({
			id: 'convert-to-katakana',
			name: 'Convert to Katakana',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.convertSelectedText(editor, 'katakana');
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new JapaneseHelperSettingTab(this.app, this));
	}

	// Convert selected text based on specified mode
	convertSelectedText(editor: Editor, mode: 'hiragana' | 'katakana') {
		const selection = editor.getSelection();
		if (!selection) {
			new Notice('No text selected');
			return;
		}

		let convertedText: string;
		if (mode === 'hiragana') {
			convertedText = JapaneseConverter.romajiToHiragana(selection);
		} else {
			convertedText = JapaneseConverter.romajiToKatakana(selection);
		}

		editor.replaceSelection(convertedText);

		if (this.settings.showConversionNotice) {
			new Notice(`Converted to ${mode}`);
		}
	}

	onunload() {
		// Clean up plugin resources when disabled
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class JapaneseHelperSettingTab extends PluginSettingTab {
	plugin: JapaneseHelperPlugin;

	constructor(app: App, plugin: JapaneseHelperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Show conversion notice')
			.setDesc('Show a notice when text is converted')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showConversionNotice)
				.onChange(async (value: boolean) => {
					this.plugin.settings.showConversionNotice = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Usage instructions')
			.setHeading();

		const instructionsEl = containerEl.createEl('div', { cls: 'japanese-helper-instructions' });

		instructionsEl.createEl('p', { text: 'To use this plugin:' });

		const instructionsList = instructionsEl.createEl('ol');
		instructionsList.createEl('li', { text: 'Select romaji text in your note' });
		instructionsList.createEl('li', { text: 'Use the hotkey or command palette to convert to hiragana or katakana' });

		instructionsEl.createEl('p', { text: 'Example:' });
		instructionsEl.createEl('code', { text: 'watashi-ga keeki-wo taberu → わたしがけえきをたべる' });
	}
}
