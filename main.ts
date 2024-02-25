import {
	App,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { getIssue } from "api";

interface LinearSettings {
	apiKey: string;
	ticketPrefixes: string;
}
const DEFAULT_SETTINGS: LinearSettings = {
	apiKey: "",
	ticketPrefixes: "",
};

export default class LinearPlugin extends Plugin {
	settings: LinearSettings;

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "link-linear-tickets",
			name: "Link Linear Tickets",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				getIssue(this.settings.apiKey, "ENG");
			},
		});

		this.addSettingTab(new SettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingsTab extends PluginSettingTab {
	plugin: LinearPlugin;

	constructor(app: App, plugin: LinearPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Linear API key")
			.setDesc(
				"Personal API key for your Linear Account (https://linear.app/settings/api)",
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Ticket Prefixes")
			.setDesc(
				"Comma separated list of the ticket prefixes you want to detect",
			)
			.addText((text) =>
				text
					.setPlaceholder("ENG, SUP")
					.setValue(this.plugin.settings.ticketPrefixes)
					.onChange(async (value) => {
						this.plugin.settings.ticketPrefixes = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
