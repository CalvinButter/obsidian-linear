import { LinearClient, IssueConnection } from "@linear/sdk";

let client: LinearClient | undefined;
const getClient = (apiKey: string): LinearClient => {
	if (!client) {
		client = new LinearClient({ apiKey });
	}
	return client;
};

export const getIssue = async (
	apiKey: string,
	prefix: string,
	n: number = 5073,
): Promise<IssueConnection> => {
	try {
		const issues: IssueConnection = await getClient(apiKey).issues({
			filter: {
				team: { key: { eqIgnoreCase: prefix } },
				number: { eq: n },
			},
		});
		console.dir(issues);
		return issues;
	} catch (err) {
		console.dir(err);
		throw err;
	}
};
