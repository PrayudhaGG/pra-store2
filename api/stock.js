// api/stock.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const GITHUB_OWNER = process.env.GITHUB_OWNER || "PrayudhaGG";
    const GITHUB_REPO = process.env.GITHUB_REPO || "pra-store2";
    const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/akun.json`;

    try {
        const response = await fetch(RAW_URL, { cache: 'no-store' });
        const accounts = await response.json();
        const stock = Array.isArray(accounts) ? accounts.length : 0;
        res.status(200).json({ success: true, stock });
    } catch (error) {
        console.error('Stock error:', error);
        res.status(500).json({ success: false, stock: 0, error: error.message });
    }
}
