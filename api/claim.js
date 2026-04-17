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

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ success: false, error: 'GITHUB_TOKEN not set' });
    }

    try {
        // Ambil file akun.json
        const getRes = await fetch(GITHUB_API, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        if (!getRes.ok) {
            throw new Error(`GitHub error: ${getRes.status}`);
        }

        const fileData = await getRes.json();
        const sha = fileData.sha;
        const accounts = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

        if (!accounts || accounts.length === 0) {
            return res.status(400).json({ success: false, error: "Stok habis!" });
        }

        // Ambil akun pertama
        const claimed = accounts.shift();

        // Update file
        const newContent = JSON.stringify(accounts, null, 2);
        const encodedContent = Buffer.from(newContent).toString('base64');

        const updateRes = await fetch(GITHUB_API, {
            method: 'PUT',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Claim account: ${claimed.substring(0, 30)}`,
                content: encodedContent,
                sha: sha,
                branch: "main"
            })
        });

        if (!updateRes.ok) {
            throw new Error('Failed to update GitHub');
        }

        return res.status(200).json({ 
            success: true, 
            account: claimed,
            remaining: accounts.length 
        });

    } catch (error) {
        console.error('Claim error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
