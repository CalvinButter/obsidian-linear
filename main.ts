import { TAbstractFile, TFile, Plugin } from "obsidian";
import SettingsTab, { DEFAULT_SETTINGS, LinearSettings } from "./settings";

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
