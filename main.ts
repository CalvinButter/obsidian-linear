import {
	App,
	TAbstractFile,
	TFile,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { getIssue } from "api";

interface LinearSettings {
	apiKey: string;
	workspaceName: string;
	ticketPrefixes: string;
}
const DEFAULT_SETTINGS: LinearSettings = {
	apiKey: "",
	workspaceName: "",
	ticketPrefixes: "",
};

export default class LinearPlugin extends Plugin {
	settings: LinearSettings;

	async onload() {
		await this.loadSettings();

		this.registerEvent(
			this.app.vault.on("modify", (f: TAbstractFile) => {
				if (f instanceof TFile) {
					const prefixes: string = this.settings.ticketPrefixes
						.split(",")
						.map((s) => s.trim())
						.join("|");
					const regex = new RegExp(
						`\\[((?:${prefixes})-[0-9]{1,8})\\](?!\\(http)`,
						"g",
					);

					this.app.vault.process(f, (data: string) => {
						return data.replace(
							regex,
							(match, p1) =>
								`${match}(https://linear.app/${this.settings.workspaceName}/issue/${p1})`,
						);
					});
				}
			}),
		);

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
