/**
 * Netlify Functions - Custom Analytics Endpoint
 * Serverless function to collect and process analytics data
 */

const crypto = require('crypto');

// In production, use environment variables
const ANALYTICS_SECRET = process.env.ANALYTICS_SECRET || 'your-secret-key';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'localhost,netlify.app').split(',');

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Validate request origin
        const origin = event.headers.origin || event.headers.host;
        if (!isValidOrigin(origin)) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Forbidden origin' })
            };
        }

        // Parse request body
        const data = JSON.parse(event.body);
        
        // Validate required fields
        if (!data.event || !data.properties) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Anonymize IP
        const anonymizedIP = anonymizeIP(event.headers['x-forwarded-for'] || 'unknown');
        
        // Create analytics record
        const analyticsRecord = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            event: data.event,
            properties: data.properties,
            url: data.url,
            referrer: data.referrer,
            ip: anonymizedIP,
            userAgent: event.headers['user-agent'],
            // Add geo data if available from Netlify
            country: event.headers['x-country'] || null,
            region: event.headers['x-subdivision-1'] || null
        };

        // Process the analytics data
        await processAnalytics(analyticsRecord);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: 'Analytics data received',
                id: analyticsRecord.id 
            })
        };

    } catch (error) {
        console.error('Analytics processing error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Processing failed'
            })
        };
    }
};

// Validate origin against allowed list
function isValidOrigin(origin) {
    if (!origin) return false;
    
    return ALLOWED_ORIGINS.some(allowed => 
        origin.includes(allowed) || 
        origin === 'http://localhost:3000' || 
        origin === 'http://127.0.0.1:3000'
    );
}

// Anonymize IP address for privacy
function anonymizeIP(ip) {
    if (!ip || ip === 'unknown') return 'anonymous';
    
    // For IPv4, zero out the last octet
    if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        }
    }
    
    // For IPv6, zero out the last 64 bits
    if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length >= 4) {
            return parts.slice(0, 4).join(':') + '::';
        }
    }
    
    return 'anonymous';
}

// Generate unique ID
function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

// Process analytics data - choose your storage method
async function processAnalytics(record) {
    // Option 1: Store in Netlify Analytics (if available)
    if (process.env.NETLIFY_ANALYTICS_ID) {
        await storeInNetlifyAnalytics(record);
    }
    
    // Option 2: Store in external database (Supabase, Firebase, etc.)
    if (process.env.DATABASE_URL) {
        await storeInDatabase(record);
    }
    
    // Option 3: Send to external analytics service
    if (process.env.WEBHOOK_URL) {
        await sendToWebhook(record);
    }
    
    // Option 4: Store in log files (simple option)
    console.log('Analytics Event:', JSON.stringify(record, null, 2));
}

// Store in external database (example with Supabase)
async function storeInDatabase(record) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        return;
    }

    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const { error } = await supabase
            .from('analytics_events')
            .insert([record]);

        if (error) {
            console.error('Supabase insert error:', error);
        }
    } catch (error) {
        console.error('Database storage error:', error);
    }
}

// Send to webhook for external processing
async function sendToWebhook(record) {
    try {
        const fetch = require('node-fetch');
        
        await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`
            },
            body: JSON.stringify(record)
        });
    } catch (error) {
        console.error('Webhook error:', error);
    }
}

// Store in Netlify Analytics (if available)
async function storeInNetlifyAnalytics(record) {
    // This would integrate with Netlify's analytics API
    // Implementation depends on Netlify's specific API
    console.log('Would store in Netlify Analytics:', record.event);
}
