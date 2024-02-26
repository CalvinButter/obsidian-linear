import LinearPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface LinearSettings {
	apiKey: string;
	workspaceName: string;
	ticketPrefixes: string;
}
export const DEFAULT_SETTINGS: LinearSettings = {
	apiKey: "",
	workspaceName: "",
	ticketPrefixes: "",
};

export default class SettingsTab extends PluginSettingTab {
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

		// TODO: support multiple workspaces, each with its own set of prefixes
		new Setting(containerEl)
			.setName("Workspace Name")
			.setDesc(
				"found in the url of an issue, i.e https://linear.app/{WorkspaceName}/issue/PREF-9745",
			)
			.addText((text) => {
				text.setValue(this.plugin.settings.workspaceName).onChange(
					async (value) => {
						this.plugin.settings.workspaceName = value;
						await this.plugin.saveSettings();
					},
				);
			});

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
