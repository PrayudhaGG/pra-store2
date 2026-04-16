// api/claim.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const GITHUB_OWNER = process.env.GITHUB_OWNER || "PrayudhaGG";
    const GITHUB_REPO = process.env.GITHUB_REPO || "pra-store2";
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/akun.json`;

    try {
        const getRes = await fetch(GITHUB_API, {
            headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" }
        });
        const fileData = await getRes.json();
        const sha = fileData.sha;
        const accounts = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

        if (!accounts.length) {
            return res.status(400).json({ success: false, error: "Stok habis" });
        }

        const claimed = accounts.shift();
        const newContent = JSON.stringify(accounts, null, 2);
        const encodedContent = Buffer.from(newContent).toString('base64');

        await fetch(GITHUB_API, {
            method: 'PUT',
            headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Claim account: ${claimed.substring(0, 30)}...`,
                content: encodedContent,
                sha: sha,
                branch: "main"
            })
        });

        res.status(200).json({ success: true, account: claimed, remaining: accounts.length });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
}
