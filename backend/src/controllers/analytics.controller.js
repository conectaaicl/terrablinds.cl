const jwt  = require('jsonwebtoken');
const axios = require('axios');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

let _token = null;
let _tokenExp = 0;

async function getAccessToken() {
    if (_token && Date.now() < _tokenExp) return _token;

    const sa = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON);
    const now = Math.floor(Date.now() / 1000);

    const assertion = jwt.sign(
        { iss: sa.client_email, sub: sa.client_email, scope: GA4_SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 },
        sa.private_key,
        { algorithm: 'RS256' }
    );

    const { data } = await axios.post(
        TOKEN_URL,
        `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${assertion}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    _token = data.access_token;
    _tokenExp = Date.now() + 55 * 60 * 1000;
    return _token;
}

async function runReport(propertyId, token, startDate, endDate, extra = {}) {
    const { data } = await axios.post(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        { dateRanges: [{ startDate, endDate }], ...extra },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
}

function extractTotals(report) {
    const row = report.rows?.[0];
    if (!row) return { users: 0, sessions: 0, pageviews: 0 };
    return {
        users:     parseInt(row.metricValues?.[0]?.value || 0),
        sessions:  parseInt(row.metricValues?.[1]?.value || 0),
        pageviews: parseInt(row.metricValues?.[2]?.value || 0),
    };
}

exports.getSummary = async (req, res) => {
    try {
        const propertyId = process.env.GA4_PROPERTY_ID;
        if (!propertyId || !process.env.GA4_SERVICE_ACCOUNT_JSON) {
            return res.json({ configured: false });
        }

        const token = await getAccessToken();

        const baseMetrics = [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
        ];

        const [todayR, weekR, monthR, topR] = await Promise.all([
            runReport(propertyId, token, 'today',      'today',      { metrics: baseMetrics }),
            runReport(propertyId, token, '7daysAgo',   'today',      { metrics: baseMetrics }),
            runReport(propertyId, token, '30daysAgo',  'today',      { metrics: baseMetrics }),
            runReport(propertyId, token, '7daysAgo',   'today', {
                dimensions: [{ name: 'pagePath' }],
                metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
                limit: 8,
            }),
        ]);

        const topPages = (topR.rows || []).map(r => ({
            path:  r.dimensionValues?.[0]?.value || '/',
            views: parseInt(r.metricValues?.[0]?.value || 0),
            users: parseInt(r.metricValues?.[1]?.value || 0),
        }));

        res.json({
            configured: true,
            today: extractTotals(todayR),
            week:  extractTotals(weekR),
            month: extractTotals(monthR),
            topPages,
        });
    } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        console.error('[GA4]', msg);
        if (err.message?.includes('GA4_SERVICE_ACCOUNT_JSON')) return res.json({ configured: false });
        res.status(500).json({ error: msg });
    }
};
