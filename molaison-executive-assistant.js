/**
 * Molaison Executive Assistant AI System
 * Comprehensive AI assistant for managing Molaison Agency & Molaison AI
 * Plus client project management and business operations
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class MolaisonExecutiveAssistant {
    constructor() {
        this.app = express();
        
        // Add CORS headers
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });
        
        this.app.use(express.json());
        this.app.use(express.static('.'));

        this.config = {
            businesses: {
                agency: {
                    name: 'Molaison Agency',
                    focus: 'Insurance & Business Services',
                    services: ['Insurance', 'CRM', 'Business Automation', 'Marketing'],
                    clientManagement: true
                },
                ai: {
                    name: 'Molaison AI',
                    focus: 'AI Tools & SEO Platform',
                    services: ['SEO Tools', 'AI Development', 'Content Generation', 'Video Automation'],
                    productManagement: true
                }
            },
            
            // API Integrations
            apis: {
                openai: {
                    key: process.env.OPENAI_API_KEY,
                    baseUrl: 'https://api.openai.com/v1'
                },
                perplexity: {
                    key: process.env.PERPLEXITY_API_KEY,
                    baseUrl: 'https://api.perplexity.ai'
                },
                whispr: {
                    key: process.env.WHISPR_API_KEY,
                    enabled: process.env.WHISPR_ENABLED === 'true'
                },
                twilio: {
                    accountSid: process.env.TWILIO_ACCOUNT_SID,
                    authToken: process.env.TWILIO_AUTH_TOKEN,
                    phoneNumber: process.env.TWILIO_PHONE_NUMBER
                },
                gmail: {
                    clientId: process.env.GMAIL_CLIENT_ID,
                    clientSecret: process.env.GMAIL_CLIENT_SECRET,
                    refreshToken: process.env.GMAIL_REFRESH_TOKEN
                }
            },

            // Assistant Modules
            assistants: {
                emailManager: true,
                calendarAssistant: true,
                phoneAssistant: true,
                researchAssistant: true,
                lifeCoach: true,
                socialMediaManager: true,
                webScraper: true,
                taskManager: true,
                clientProjectManager: true,
                businessIntelligence: true
            }
        };

        this.initializeSystem();
    }

    async initializeSystem() {
        console.log('🏢 Initializing Molaison Executive Assistant System...');
        
        // Initialize databases
        await this.initializeDatabase();
        
        // Setup API routes
        this.setupRoutes();
        
        // Initialize assistant modules
        await this.initializeAssistants();
        
        console.log('✅ Molaison Executive Assistant ready!');
    }

    async initializeDatabase() {
        // Simple JSON-based storage for now
        this.db = {
            businesses: this.config.businesses,
            clients: [],
            projects: [],
            tasks: [],
            conversations: [],
            businessData: {
                molaisonAgency: {
                    clients: [],
                    policies: [],
                    appointments: [],
                    leads: []
                },
                molaisonAI: {
                    customers: [],
                    products: ['SEO Platform', 'NOLA Content Generator', 'Video Automation'],
                    revenue: [],
                    metrics: []
                }
            }
        };
    }

    setupRoutes() {
        // Chat Interface
        this.app.post('/api/chat', this.handleChatMessage.bind(this));
        
        // Business Management
        this.app.get('/api/businesses', this.getBusinessOverview.bind(this));
        this.app.post('/api/business/:businessId/task', this.createBusinessTask.bind(this));
        
        // Email Management
        this.app.get('/api/emails', this.getEmails.bind(this));
        this.app.post('/api/emails/respond', this.respondToEmail.bind(this));
        
        // Calendar & Reservations
        this.app.get('/api/calendar', this.getCalendar.bind(this));
        this.app.post('/api/reservations/make', this.makeReservation.bind(this));
        
        // Phone Assistant
        this.app.post('/api/call/make', this.makePhoneCall.bind(this));
        
        // Research Assistant
        this.app.post('/api/research', this.performResearch.bind(this));
        
        // Social Media Management
        this.app.post('/api/social/post', this.createSocialPost.bind(this));
        this.app.get('/api/social/analytics', this.getSocialAnalytics.bind(this));
        
        // AI Prompt Generator (Billy Gene Style)
        this.app.post('/api/prompts/generate', this.generatePrompts.bind(this));
        this.app.get('/api/prompts/templates', this.getPromptTemplates.bind(this));
        this.app.post('/api/content/calendar', this.generateContentCalendar.bind(this));
        this.app.post('/api/content/viral-caption', this.generateViralCaption.bind(this));
        this.app.get('/api/content/optimal-times', this.getOptimalPostingTimes.bind(this));
        
        // Client Project Management
        this.app.get('/api/clients', this.getClients.bind(this));
        this.app.post('/api/projects', this.createProject.bind(this));
        this.app.get('/api/projects/:id/status', this.getProjectStatus.bind(this));
        
        // Life Coaching & Productivity
        this.app.get('/api/productivity/dashboard', this.getProductivityDashboard.bind(this));
        this.app.post('/api/goals/set', this.setGoal.bind(this));
        
        // Voice Integration
        this.app.post('/api/voice/process', this.processVoiceInput.bind(this));
        
        // Configuration Management
        this.app.get('/api/config/status', this.getConfigStatus.bind(this));
        this.app.post('/api/config/openai', this.updateOpenAIConfig.bind(this));
        this.app.post('/api/config/perplexity', this.updatePerplexityConfig.bind(this));
        this.app.post('/api/config/twilio', this.updateTwilioConfig.bind(this));
        this.app.post('/api/config/gmail', this.updateGmailConfig.bind(this));
        this.app.post('/api/config/whispr', this.updateWhisprConfig.bind(this));
        this.app.post('/api/config/social', this.updateSocialConfig.bind(this));
        this.app.post('/api/config/mcp', this.updateMCPConfig.bind(this));
        
        // Gmail OAuth Flow
        this.app.get('/auth/gmail', this.initiateGmailAuth.bind(this));
        this.app.get('/auth/gmail/callback', this.handleGmailCallback.bind(this));
        
        // Static file serving for frontend
        this.app.get('/', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'molaison-assistant-chat.html'));
        });
        
        this.app.get('/config', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'assistant-configuration.html'));
        });
    }

    async initializeAssistants() {
        this.assistants = {
            emailManager: new EmailManager(this.config.apis.gmail),
            calendarAssistant: new CalendarAssistant(),
            phoneAssistant: new PhoneAssistant(this.config.apis.twilio),
            researchAssistant: new ResearchAssistant(this.config.apis.perplexity),
            lifeCoach: new LifeCoach(),
            socialMediaManager: new SocialMediaManager(),
            webScraper: new WebScraper(),
            taskManager: new TaskManager(),
            clientProjectManager: new ClientProjectManager(),
            businessIntelligence: new BusinessIntelligence()
        };
    }

    // Core Chat Interface
    async handleChatMessage(req, res) {
        try {
            const { message, context, businessContext } = req.body;
            
            console.log(`💬 Processing message: "${message}"`);
            
            // Analyze intent using AI
            const intent = await this.analyzeIntent(message, context);
            
            let response;
            
            switch (intent.category) {
                case 'email':
                    response = await this.assistants.emailManager.handleRequest(intent, message);
                    break;
                case 'calendar':
                    response = await this.assistants.calendarAssistant.handleRequest(intent, message);
                    break;
                case 'phone':
                    response = await this.assistants.phoneAssistant.handleRequest(intent, message);
                    break;
                case 'research':
                    response = await this.assistants.researchAssistant.handleRequest(intent, message);
                    break;
                case 'social':
                    response = await this.assistants.socialMediaManager.handleRequest(intent, message);
                    break;
                case 'client_management':
                    response = await this.assistants.clientProjectManager.handleRequest(intent, message);
                    break;
                case 'business_intelligence':
                    response = await this.assistants.businessIntelligence.handleRequest(intent, message, businessContext);
                    break;
                case 'productivity':
                    response = await this.assistants.lifeCoach.handleRequest(intent, message);
                    break;
                case 'prompts':
                case 'content':
                    response = await this.handlePromptRequest(message, context, businessContext);
                    break;
                case 'general':
                default:
                    response = await this.handleGeneralRequest(message, context);
                    break;
            }
            
            // Log conversation
            this.logConversation(message, response, intent);
            
            res.json({
                success: true,
                response: typeof response === 'object' ? response.response : response,
                prompts: response && response.prompts ? response.prompts : undefined,
                calendar: response && response.calendar ? response.calendar : undefined,
                caption: response && response.caption ? response.caption : undefined,
                intent: intent.category,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Chat processing error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process message',
                fallback: "I'm having trouble processing that request. Could you please rephrase or try again?"
            });
        }
    }

    async handlePromptRequest(message, context, businessContext) {
        try {
            // Determine what type of prompt/content request
            if (message.toLowerCase().includes('image prompt') || message.toLowerCase().includes('high-end image') || message.toLowerCase().includes('generate')) {
                // Generate prompts directly without calling the method that expects req/res
                const billyGeneTemplates = {
                    'high-end-image': [
                        `Create a cinematic, high-budget commercial style image of ${businessContext || 'your business'}. Shot with professional lighting, shallow depth of field, and dramatic color grading. Include luxury brand aesthetics, premium materials, and sophisticated composition that conveys exclusivity and high value for business owners.`,
                        `Professional lifestyle photography showing business owners using ${businessContext || 'your business'} services in an aspirational setting. Clean, modern aesthetic with natural lighting. Show the transformation and elevated lifestyle this service enables. Include authentic human emotion and premium environment details.`,
                        `Split-screen comparison image showing 'before and after' or 'problem vs solution' for business owners. Left side shows business frustration/difficulty, right side shows ease/success with ${businessContext || 'your business'}. Professional photography with clear visual storytelling and emotional impact.`,
                        `Professional headshot/environment showing expertise and credibility around ${businessContext || 'your business'}. Include certifications, awards, professional setting, and visual elements that establish authority for business owners. Warm, trustworthy lighting with confidence-inspiring composition.`,
                        `Dynamic collage showing multiple happy business owners using ${businessContext || 'your business'}. Include diverse demographics, genuine expressions, and results/outcomes. Professional montage style with consistent branding and positive energy throughout.`
                    ]
                };

                const prompts = billyGeneTemplates['high-end-image'];

                return {
                    response: `Here are 5 professional high-end image prompts for ${businessContext || 'your business'}:`,
                    prompts: prompts,
                    promptType: 'high-end-image'
                };
            } else if (message.toLowerCase().includes('content calendar') || message.toLowerCase().includes('weekly calendar')) {
                // Generate content calendar directly
                const contentThemes = [
                    {
                        day: 'Monday',
                        theme: 'Motivation Monday',
                        content: `Inspirational content and success stories for business owners using ${businessContext || 'your business'}`,
                        postIdea: `Success story: How business owners transformed their results with ${businessContext || 'your business'}`,
                        optimalTime: '8:00 AM'
                    },
                    {
                        day: 'Tuesday', 
                        theme: 'Tips Tuesday',
                        content: `Educational content and industry insights for business owners`,
                        postIdea: `5 tips business owners need to know about ${businessContext || 'your services'}`,
                        optimalTime: '9:00 AM'
                    },
                    {
                        day: 'Wednesday',
                        theme: 'Wisdom Wednesday', 
                        content: `Expert advice and problem-solving for business owners`,
                        postIdea: `Industry secrets business owners should know about ${businessContext || 'your services'}`,
                        optimalTime: '11:00 AM'
                    },
                    {
                        day: 'Thursday',
                        theme: 'Throwback Thursday',
                        content: `Case studies and testimonials from business owners`,
                        postIdea: `Case study: Business owner success story with ${businessContext || 'your business'}`,
                        optimalTime: '2:00 PM'
                    },
                    {
                        day: 'Friday',
                        theme: 'Feature Friday',
                        content: `Service highlights and demos for business owners`,
                        postIdea: `Feature spotlight: How ${businessContext || 'your business'} helps business owners`,
                        optimalTime: '3:00 PM'
                    }
                ];

                return {
                    response: `Here's your weekly content calendar for ${businessContext || 'your business'}:`,
                    calendar: contentThemes
                };
            } else {
                return "I can help you with AI prompt generation, content calendars, and viral captions. What specific type of content would you like me to create?";
            }
        } catch (error) {
            console.error('Prompt request error:', error);
            return "I can help you with AI prompt generation, content calendars, and viral captions. What specific type of content would you like me to create?";
        }
    }

    async analyzeIntent(message, context) {
        const prompt = `
Analyze this message to determine the user's intent for business management:

Message: "${message}"
Context: ${JSON.stringify(context || {})}

Business Context:
- Molaison Agency: Insurance & Business Services
- Molaison AI: AI Tools & SEO Platform  
- Also builds custom solutions for clients

Categorize the intent as one of:
- email (email management, responses)
- calendar (scheduling, reservations, appointments)
- phone (making calls, client outreach)
- research (business intelligence, competitive analysis)
- social (social media management, content)
- client_management (client projects, custom builds)
- business_intelligence (business analysis, metrics)
- productivity (life coaching, goal setting, optimization)
- prompts (AI prompt generation, content creation)
- content (content calendar, viral captions)
- general (other requests)

Return JSON with:
{
  "category": "category_name",
  "confidence": 0.8,
  "action": "specific_action_to_take",
  "business": "agency|ai|both|client",
  "priority": "low|medium|high|urgent"
}`;

        try {
            // Check if OpenAI is configured
            if (!this.config.apis.openai.key || this.config.apis.openai.key === 'test_key_placeholder') {
                // Simple keyword-based intent analysis when OpenAI isn't available
                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('email')) return { category: 'email', confidence: 0.7, action: 'email_management', business: 'both', priority: 'medium' };
                if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule')) return { category: 'calendar', confidence: 0.7, action: 'calendar_management', business: 'both', priority: 'medium' };
                if (lowerMessage.includes('call') || lowerMessage.includes('phone')) return { category: 'phone', confidence: 0.7, action: 'phone_assistance', business: 'both', priority: 'medium' };
                if (lowerMessage.includes('research') || lowerMessage.includes('analyze')) return { category: 'research', confidence: 0.7, action: 'research_task', business: 'both', priority: 'medium' };
                if (lowerMessage.includes('social') || lowerMessage.includes('content')) return { category: 'social', confidence: 0.7, action: 'social_media', business: 'both', priority: 'medium' };
                if (lowerMessage.includes('client') || lowerMessage.includes('project')) return { category: 'client_management', confidence: 0.7, action: 'client_assistance', business: 'both', priority: 'medium' };
                if (lowerMessage.includes('prompt') || lowerMessage.includes('generate')) return { category: 'prompts', confidence: 0.7, action: 'prompt_generation', business: 'both', priority: 'medium' };
                if (lowerMessage.includes('productive') || lowerMessage.includes('goal')) return { category: 'productivity', confidence: 0.7, action: 'productivity_coaching', business: 'both', priority: 'medium' };
                return { category: 'general', confidence: 0.6, action: 'general_assistance', business: 'both', priority: 'medium' };
            }

            const response = await axios.post(`${this.config.apis.openai.baseUrl}/chat/completions`, {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.apis.openai.key}`,
                    'Content-Type': 'application/json'
                }
            });

            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            console.error('Intent analysis error:', error);
            return {
                category: 'general',
                confidence: 0.5,
                action: 'general_assistance',
                business: 'both',
                priority: 'medium'
            };
        }
    }

    async handleGeneralRequest(message, context) {
        // Check if OpenAI is configured
        if (!this.config.apis.openai.key || this.config.apis.openai.key === 'test_key_placeholder') {
            return `I understand you need assistance with: "${message}". As your executive assistant for Molaison Agency and Molaison AI, I'm ready to help with business management, client projects, and various tasks. However, advanced AI features require API configuration. Please let me know what specific assistance you need!`;
        }

        const prompt = `
You are an AI Executive Assistant for Christina Molaison, who runs:

1. **Molaison Agency**: Insurance and business services company
2. **Molaison AI**: AI tools and SEO platform company
3. **Custom Client Projects**: Builds solutions for other businesses

Your role is to be professional, efficient, and helpful. Provide clear, actionable responses.

User request: "${message}"
Context: ${JSON.stringify(context || {})}

Respond as a professional executive assistant would, offering specific help and next steps.`;

        try {
            const response = await axios.post(`${this.config.apis.openai.baseUrl}/chat/completions`, {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.apis.openai.key}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('General request error:', error);
            return "I understand you need assistance. Let me help you with that. Could you provide more specific details about what you'd like me to handle?";
        }
    }

    // Voice Processing with Whispr Flow integration
    async processVoiceInput(req, res) {
        try {
            const { audioData, format } = req.body;
            
            if (!this.config.apis.whispr.enabled) {
                return res.status(503).json({
                    success: false,
                    error: 'Voice processing not configured'
                });
            }
            
            // Process voice with Whispr Flow
            const transcription = await this.transcribeAudio(audioData, format);
            
            // Process the transcribed text as a regular chat message
            const chatResponse = await this.handleChatMessage({
                body: { message: transcription, context: { source: 'voice' } }
            }, { json: () => {} });
            
            res.json({
                success: true,
                transcription: transcription,
                response: chatResponse.response,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Voice processing error:', error);
            res.status(500).json({
                success: false,
                error: 'Voice processing failed'
            });
        }
    }

    async transcribeAudio(audioData, format) {
        // Placeholder for Whispr Flow integration
        // This would integrate with the actual Whispr Flow API
        return "Voice transcription would be processed here";
    }

    // Business Overview
    async getBusinessOverview(req, res) {
        try {
            const overview = {
                businesses: this.config.businesses,
                summary: {
                    totalClients: this.db.businessData.molaisonAgency.clients.length,
                    activeProjects: this.db.projects.filter(p => p.status === 'active').length,
                    aiCustomers: this.db.businessData.molaisonAI.customers.length,
                    pendingTasks: this.db.tasks.filter(t => t.status === 'pending').length
                },
                recentActivity: this.getRecentActivity()
            };
            
            res.json({
                success: true,
                overview: overview
            });
        } catch (error) {
            console.error('Business overview error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get business overview'
            });
        }
    }

    getRecentActivity() {
        // Mock recent activity - would pull from actual business data
        return [
            { type: 'email', action: 'New client inquiry - Molaison Agency', time: '2 hours ago' },
            { type: 'project', action: 'AI platform feature completed', time: '4 hours ago' },
            { type: 'appointment', action: 'Meeting scheduled with potential client', time: '6 hours ago' },
            { type: 'social', action: 'LinkedIn post published - thought leadership', time: '8 hours ago' }
        ];
    }

    logConversation(message, response, intent) {
        this.db.conversations.push({
            id: uuidv4(),
            message: message,
            response: response,
            intent: intent,
            timestamp: new Date(),
            business: intent.business || 'general'
        });
        
        // Keep only last 1000 conversations
        if (this.db.conversations.length > 1000) {
            this.db.conversations = this.db.conversations.slice(-1000);
        }
    }

    // Placeholder methods for assistant modules
    async getEmails(req, res) { res.json({ success: true, emails: [] }); }
    async respondToEmail(req, res) { res.json({ success: true, message: 'Email response sent' }); }
    async getCalendar(req, res) { res.json({ success: true, events: [] }); }
    async makeReservation(req, res) { res.json({ success: true, message: 'Reservation made' }); }
    async makePhoneCall(req, res) { res.json({ success: true, message: 'Call initiated' }); }
    async performResearch(req, res) { res.json({ success: true, results: [] }); }
    async createSocialPost(req, res) { res.json({ success: true, message: 'Post created' }); }
    async getSocialAnalytics(req, res) { res.json({ success: true, analytics: {} }); }
    async getClients(req, res) { res.json({ success: true, clients: [] }); }
    async createProject(req, res) { res.json({ success: true, message: 'Project created' }); }
    async getProjectStatus(req, res) { res.json({ success: true, status: 'active' }); }
    async getProductivityDashboard(req, res) { res.json({ success: true, dashboard: {} }); }
    async setGoal(req, res) { res.json({ success: true, message: 'Goal set' }); }
    async createBusinessTask(req, res) { res.json({ success: true, message: 'Task created' }); }

    // Configuration Management Methods
    async getConfigStatus(req, res) {
        try {
            const status = {
                openai: {
                    configured: !!(this.config.apis.openai.key && this.config.apis.openai.key !== 'test_key_placeholder'),
                    status: this.config.apis.openai.key && this.config.apis.openai.key !== 'test_key_placeholder' ? 'connected' : 'disconnected'
                },
                perplexity: {
                    configured: !!(this.config.apis.perplexity.key && this.config.apis.perplexity.key !== 'test_key_placeholder'),
                    status: this.config.apis.perplexity.key && this.config.apis.perplexity.key !== 'test_key_placeholder' ? 'connected' : 'disconnected'
                },
                twilio: {
                    configured: !!(this.config.apis.twilio.accountSid && this.config.apis.twilio.authToken),
                    status: this.config.apis.twilio.accountSid && this.config.apis.twilio.authToken ? 'connected' : 'disconnected'
                },
                gmail: {
                    configured: !!(this.config.apis.gmail.clientId && this.config.apis.gmail.clientSecret),
                    status: this.config.apis.gmail.clientId && this.config.apis.gmail.clientSecret ? 'connected' : 'disconnected'
                },
                whispr: {
                    configured: !!(this.config.apis.whispr.key && this.config.apis.whispr.enabled),
                    status: this.config.apis.whispr.key && this.config.apis.whispr.enabled ? 'connected' : 'disconnected'
                },
                mcp: {
                    configured: true, // MCP is always available
                    status: 'available'
                }
            };
            
            res.json({ success: true, status });
        } catch (error) {
            console.error('Config status error:', error);
            res.status(500).json({ success: false, error: 'Failed to get configuration status' });
        }
    }

    async updateOpenAIConfig(req, res) {
        try {
            const { api_key } = req.body;
            if (!api_key || api_key.length < 10) {
                return res.status(400).json({ success: false, error: 'Invalid API key' });
            }

            // Update environment and config
            await this.updateEnvFile('OPENAI_API_KEY', api_key);
            this.config.apis.openai.key = api_key;

            res.json({ success: true, message: 'OpenAI configuration updated. Restart required.' });
        } catch (error) {
            console.error('OpenAI config error:', error);
            res.status(500).json({ success: false, error: 'Failed to update OpenAI configuration' });
        }
    }

    async updatePerplexityConfig(req, res) {
        try {
            const { api_key } = req.body;
            await this.updateEnvFile('PERPLEXITY_API_KEY', api_key);
            this.config.apis.perplexity.key = api_key;
            res.json({ success: true, message: 'Perplexity configuration updated. Restart required.' });
        } catch (error) {
            console.error('Perplexity config error:', error);
            res.status(500).json({ success: false, error: 'Failed to update Perplexity configuration' });
        }
    }

    async updateTwilioConfig(req, res) {
        try {
            const { account_sid, auth_token, phone_number } = req.body;
            await this.updateEnvFile('TWILIO_ACCOUNT_SID', account_sid);
            await this.updateEnvFile('TWILIO_AUTH_TOKEN', auth_token);
            await this.updateEnvFile('TWILIO_PHONE_NUMBER', phone_number);
            
            this.config.apis.twilio.accountSid = account_sid;
            this.config.apis.twilio.authToken = auth_token;
            this.config.apis.twilio.phoneNumber = phone_number;
            
            res.json({ success: true, message: 'Twilio configuration updated. Restart required.' });
        } catch (error) {
            console.error('Twilio config error:', error);
            res.status(500).json({ success: false, error: 'Failed to update Twilio configuration' });
        }
    }

    async updateGmailConfig(req, res) {
        try {
            const { client_id, client_secret, refresh_token } = req.body;
            await this.updateEnvFile('GMAIL_CLIENT_ID', client_id);
            await this.updateEnvFile('GMAIL_CLIENT_SECRET', client_secret);
            if (refresh_token) await this.updateEnvFile('GMAIL_REFRESH_TOKEN', refresh_token);
            
            this.config.apis.gmail.clientId = client_id;
            this.config.apis.gmail.clientSecret = client_secret;
            this.config.apis.gmail.refreshToken = refresh_token;
            
            res.json({ success: true, message: 'Gmail configuration updated. Restart required.' });
        } catch (error) {
            console.error('Gmail config error:', error);
            res.status(500).json({ success: false, error: 'Failed to update Gmail configuration' });
        }
    }

    async updateWhisprConfig(req, res) {
        try {
            const { api_key, enabled } = req.body;
            await this.updateEnvFile('WHISPR_API_KEY', api_key);
            await this.updateEnvFile('WHISPR_ENABLED', enabled ? 'true' : 'false');
            
            this.config.apis.whispr.key = api_key;
            this.config.apis.whispr.enabled = enabled;
            
            res.json({ success: true, message: 'Whispr configuration updated. Restart required.' });
        } catch (error) {
            console.error('Whispr config error:', error);
            res.status(500).json({ success: false, error: 'Failed to update Whispr configuration' });
        }
    }

    async updateSocialConfig(req, res) {
        try {
            const { twitter_key, linkedin_id, facebook_token } = req.body;
            if (twitter_key) await this.updateEnvFile('TWITTER_API_KEY', twitter_key);
            if (linkedin_id) await this.updateEnvFile('LINKEDIN_CLIENT_ID', linkedin_id);
            if (facebook_token) await this.updateEnvFile('FACEBOOK_ACCESS_TOKEN', facebook_token);
            
            res.json({ success: true, message: 'Social media configuration updated. Restart required.' });
        } catch (error) {
            console.error('Social config error:', error);
            res.status(500).json({ success: false, error: 'Failed to update social media configuration' });
        }
    }

    async updateMCPConfig(req, res) {
        try {
            const { server_url, enabled } = req.body;
            await this.updateEnvFile('MCP_SERVER_URL', server_url || 'http://localhost:3001');
            await this.updateEnvFile('MCP_ENABLED', enabled ? 'true' : 'false');
            
            res.json({ success: true, message: 'MCP configuration updated. Restart required.' });
        } catch (error) {
            console.error('MCP config error:', error);
            res.status(500).json({ success: false, error: 'Failed to update MCP configuration' });
        }
    }

    async updateEnvFile(key, value) {
        try {
            const fs = require('fs');
            const path = require('path');
            const envPath = path.join(process.cwd(), '.env');
            
            let envContent = '';
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');
            }
            
            const lines = envContent.split('\n');
            let found = false;
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith(`${key}=`)) {
                    lines[i] = `${key}=${value}`;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                lines.push(`${key}=${value}`);
            }
            
            fs.writeFileSync(envPath, lines.join('\n'));
            
            // Update process.env
            process.env[key] = value;
            
        } catch (error) {
            console.error('Error updating .env file:', error);
            throw error;
        }
    }

    // Gmail OAuth Implementation
    async initiateGmailAuth(req, res) {
        try {
            const clientId = this.config.apis.gmail.clientId;
            if (!clientId) {
                return res.status(400).json({ error: 'Gmail client ID not configured' });
            }

            const scopes = [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.modify'
            ].join(' ');

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(req.protocol + '://' + req.get('host') + '/auth/gmail/callback')}&` +
                `response_type=code&` +
                `scope=${encodeURIComponent(scopes)}&` +
                `access_type=offline&` +
                `prompt=consent`;

            res.redirect(authUrl);
        } catch (error) {
            console.error('Gmail auth initiation error:', error);
            res.status(500).json({ error: 'Failed to initiate Gmail authentication' });
        }
    }

    async handleGmailCallback(req, res) {
        try {
            const { code, error } = req.query;
            
            if (error) {
                return res.status(400).json({ error: 'Gmail authentication was denied' });
            }

            if (!code) {
                return res.status(400).json({ error: 'No authorization code received' });
            }

            // Exchange code for tokens
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: this.config.apis.gmail.clientId,
                client_secret: this.config.apis.gmail.clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: req.protocol + '://' + req.get('host') + '/auth/gmail/callback'
            });

            const { access_token, refresh_token } = tokenResponse.data;

            // Store tokens securely
            await this.updateEnvFile('GMAIL_ACCESS_TOKEN', access_token);
            if (refresh_token) {
                await this.updateEnvFile('GMAIL_REFRESH_TOKEN', refresh_token);
            }

            // Update config
            this.config.apis.gmail.accessToken = access_token;
            this.config.apis.gmail.refreshToken = refresh_token;

            // Redirect back to config page with success
            res.redirect('/config?gmail=connected');
        } catch (error) {
            console.error('Gmail callback error:', error);
            res.status(500).json({ error: 'Failed to complete Gmail authentication' });
        }
    }

    // Enhanced Email Manager with actual Gmail integration
    async getEmails(req, res) {
        try {
            if (!this.config.apis.gmail.accessToken) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Gmail not authenticated',
                    authUrl: '/auth/gmail'
                });
            }

            const response = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    'Authorization': `Bearer ${this.config.apis.gmail.accessToken}`
                },
                params: {
                    maxResults: 10,
                    q: 'is:unread'
                }
            });

            const messages = response.data.messages || [];
            const emailDetails = [];

            // Get details for each message
            for (const message of messages.slice(0, 5)) {
                try {
                    const detailResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.apis.gmail.accessToken}`
                        }
                    });

                    const email = detailResponse.data;
                    const headers = email.payload.headers;
                    
                    emailDetails.push({
                        id: email.id,
                        threadId: email.threadId,
                        subject: headers.find(h => h.name === 'Subject')?.value || 'No Subject',
                        from: headers.find(h => h.name === 'From')?.value || 'Unknown Sender',
                        date: headers.find(h => h.name === 'Date')?.value || 'Unknown Date',
                        snippet: email.snippet
                    });
                } catch (error) {
                    console.error('Error fetching email details:', error);
                }
            }

            res.json({ 
                success: true, 
                emails: emailDetails,
                total: messages.length 
            });
        } catch (error) {
            console.error('Get emails error:', error);
            if (error.response?.status === 401) {
                res.status(401).json({ 
                    success: false, 
                    error: 'Gmail authentication expired',
                    authUrl: '/auth/gmail'
                });
            } else {
                res.status(500).json({ success: false, error: 'Failed to fetch emails' });
            }
        }
    }

    // AI Prompt Generator Methods
    async generatePrompts(req, res) {
        try {
            const { promptType, business, audience, contentGoal, style, context } = req.body;
            
            const billyGeneTemplates = {
                'high-end-image': [
                    `Create a cinematic, high-budget commercial style image of ${business}. Shot with professional lighting, shallow depth of field, and dramatic color grading. Include luxury brand aesthetics, premium materials, and sophisticated composition that conveys exclusivity and high value for ${audience}.`,
                    `Professional lifestyle photography showing ${audience} using ${business} in an aspirational setting. Clean, modern aesthetic with natural lighting. Show the transformation and elevated lifestyle this product enables. Include authentic human emotion and premium environment details.`,
                    `Split-screen comparison image showing 'before and after' or 'problem vs solution' for ${audience}. Left side shows frustration/difficulty, right side shows ease/success with ${business}. Professional photography with clear visual storytelling and emotional impact.`,
                    `Professional headshot/environment showing expertise and credibility around ${business}. Include certifications, awards, professional setting, and visual elements that establish authority for ${audience}. Warm, trustworthy lighting with confidence-inspiring composition.`,
                    `Dynamic collage showing multiple happy ${audience} members using ${business}. Include diverse demographics, genuine expressions, and results/outcomes. Professional montage style with consistent branding and positive energy throughout.`
                ],
                'viral-video': [
                    `Time-lapse video showing dramatic transformation using ${business}. Start with 'before' state, show process/journey, end with amazing 'after' results for ${audience}. Include uplifting music, smooth transitions, and emotional payoff that makes viewers want to share.`,
                    `Authentic behind-the-scenes footage showing how ${business} is created or delivered. Include 'wow' moments, expertise in action, and personality for ${audience}. Raw, genuine feel that builds trust and showcases craftsmanship or process excellence.`,
                    `Real ${audience} member testimonial in documentary-style format. Show their initial problem, how they found ${business} solution, and the amazing results. Include genuine emotion, specific details, and visual proof of transformation or success.`,
                    `Educational content that hooks viewers with "Did you know..." or "Here's what [industry] doesn't want ${audience} to know about [topic]". Share valuable insights while positioning ${business} as the solution. Include visual aids and clear explanations.`,
                    `Adapt current trending video format/challenge to showcase ${business}. Include popular music, trending effects, and format that ${audience} engages with, while naturally integrating your value proposition.`
                ],
                'billy-gene-ads': [
                    `Give me 10 different types of audiences that would be interested in trading me money in exchange for ${business}. In this case ${business} is ${context || 'your product/service'}.`,
                    `What are 10 problems that ${audience} specifically experience that ${business} can help solve, alleviate, or remedy.`,
                    `Write a Facebook ad to sell ${business} for ${audience} who is experiencing [insert chosen problem above]. Write from the perspective of the business owner in a ${style} tone. Use urgency-based incentives and clear call to action.`,
                    `What are 10 opinions that people argue about when it comes to ${business}. Create viral content around these controversial topics for ${audience}.`,
                    `Give me 10 tips about ${business} that ${audience} probably doesn't know but would appreciate. Make this educational and valuable content that positions you as an authority.`
                ]
            };

            const prompts = billyGeneTemplates[promptType] || billyGeneTemplates['high-end-image'];
            
            res.json({
                success: true,
                prompts: prompts,
                promptType: promptType,
                generatedFor: { business, audience, contentGoal, style },
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Prompt generation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate prompts'
            });
        }
    }

    async getPromptTemplates(req, res) {
        try {
            const templates = {
                'Audience Research': {
                    'Audience Discovery': 'Give me 10 different types of audiences that would be interested in trading me money in exchange for [INSERT PRODUCT OR SERVICE].',
                    'Demographics Analysis': 'Tell me the typical demographics and characteristics of a [CHOSEN SPECIFIC AUDIENCE]',
                    'Problem Identification': 'What are 10 problems that [INSERT SELECTED AUDIENCE] specifically experience that [INSERT SELECTED PRODUCT OR SERVICE] can help solve, alleviate, or remedy.'
                },
                'High-End Image Prompts': {
                    'Cinematic Brand Story': 'Create a cinematic, high-budget commercial style image of [PRODUCT/SERVICE]. Shot with professional lighting, shallow depth of field, and dramatic color grading.',
                    'Lifestyle Aspiration': 'Professional lifestyle photography showing [TARGET AUDIENCE] using [PRODUCT/SERVICE] in an aspirational setting. Clean, modern aesthetic with natural lighting.',
                    'Problem-Solution Visual': 'Split-screen comparison image showing \'before and after\' or \'problem vs solution\' for [SPECIFIC PROBLEM]. Professional photography with clear visual storytelling.',
                    'Authority Builder': 'Professional headshot/environment showing expertise and credibility around [INDUSTRY/SERVICE]. Include certifications, awards, professional setting.',
                    'Social Proof Showcase': 'Dynamic collage showing multiple happy customers/testimonials using [PRODUCT/SERVICE]. Include diverse demographics and genuine expressions.'
                },
                'Viral Video Concepts': {
                    'Transformation Journey': 'Time-lapse video showing dramatic transformation using [PRODUCT/SERVICE]. Start with \'before\' state, show process, end with amazing results.',
                    'Behind-the-Scenes Magic': 'Authentic behind-the-scenes footage showing how [PRODUCT/SERVICE] is created. Include \'wow\' moments and expertise in action.',
                    'Customer Success Story': 'Real customer testimonial in documentary-style format. Show initial problem, solution discovery, and amazing results.',
                    'Educational Hook': 'Educational content: "What [INDUSTRY] doesn\'t want you to know about [TOPIC]." Share insights while positioning as solution.',
                    'Trending Challenge': 'Adapt current trending video format to showcase [PRODUCT/SERVICE]. Include popular music and trending effects.'
                },
                'Viral Content Ideas': {
                    'Drama & Controversy': 'What are 10 opinions that people argue about when it comes to [INSERT PRODUCT/SERVICE].',
                    'Curiosity Generator': 'What are people wondering about before buying [INSERT PRODUCT/SERVICE].',
                    'Trending Topics': 'Give me 10 currently trending talking points about [INSERT PRODUCT/SERVICE]',
                    'Expert Tips': 'Give me 10 tips about [INSERT PRODUCT/SERVICE] that [SPECIFIC AUDIENCE] probably doesn\'t know but would appreciate.',
                    'Contrarian Take': '[INSERT UNPOPULAR OPINION], give me 10 reasons why that\'s wrong.'
                }
            };
            
            res.json({
                success: true,
                templates: templates,
                totalTemplates: Object.keys(templates).reduce((total, category) => total + Object.keys(templates[category]).length, 0)
            });
            
        } catch (error) {
            console.error('Template fetch error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get templates'
            });
        }
    }

    async generateContentCalendar(req, res) {
        try {
            const { business, audience, weeks = 1 } = req.body;
            
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const contentThemes = [
                {
                    day: 'Monday',
                    theme: 'Motivation Monday',
                    content: `Inspirational content and success stories for ${audience} using ${business}`,
                    postIdeas: [
                        `Success story: How ${audience} transformed their results with ${business}`,
                        `Monday motivation: Why ${audience} choose ${business} for success`,
                        `Weekly goal: What ${audience} can achieve this week with ${business}`
                    ],
                    optimalTime: '8:00 AM',
                    hashtags: ['#MotivationMonday', '#Success', '#Transformation']
                },
                {
                    day: 'Tuesday',
                    theme: 'Tips Tuesday',
                    content: `Educational content and industry insights for ${audience}`,
                    postIdeas: [
                        `5 tips ${audience} needs to know about ${business}`,
                        `Common mistakes ${audience} makes (and how to fix them)`,
                        `Expert advice: How ${business} solves ${audience} problems`
                    ],
                    optimalTime: '9:00 AM',
                    hashtags: ['#TipsTuesday', '#Education', '#Expert']
                },
                {
                    day: 'Wednesday',
                    theme: 'Wisdom Wednesday',
                    content: `Expert advice and problem-solving for ${audience}`,
                    postIdeas: [
                        `Industry secrets ${audience} should know about ${business}`,
                        `Q&A: Top questions ${audience} asks about ${business}`,
                        `Behind-the-scenes: How we help ${audience} succeed`
                    ],
                    optimalTime: '11:00 AM',
                    hashtags: ['#WisdomWednesday', '#Insights', '#QandA']
                },
                {
                    day: 'Thursday',
                    theme: 'Throwback Thursday',
                    content: `Case studies and testimonials from ${audience}`,
                    postIdeas: [
                        `Case study: ${audience} success story with ${business}`,
                        `Before & after: ${audience} transformation`,
                        `Testimonial Thursday: What ${audience} says about ${business}`
                    ],
                    optimalTime: '2:00 PM',
                    hashtags: ['#ThrowbackThursday', '#CaseStudy', '#Testimonial']
                },
                {
                    day: 'Friday',
                    theme: 'Feature Friday',
                    content: `Product/service highlights and demos for ${audience}`,
                    postIdeas: [
                        `Feature spotlight: How ${business} helps ${audience}`,
                        `Demo Friday: ${business} in action for ${audience}`,
                        `Weekend prep: How ${audience} can use ${business}`
                    ],
                    optimalTime: '3:00 PM',
                    hashtags: ['#FeatureFriday', '#Demo', '#ProductSpotlight']
                },
                {
                    day: 'Saturday',
                    theme: 'Success Saturday',
                    content: `Customer wins and social proof from ${audience}`,
                    postIdeas: [
                        `Success Saturday: ${audience} celebrating wins with ${business}`,
                        `Weekend wins: How ${business} helps ${audience} succeed`,
                        `Community spotlight: Amazing ${audience} using ${business}`
                    ],
                    optimalTime: '12:00 PM',
                    hashtags: ['#SuccessSaturday', '#CustomerWins', '#Community']
                },
                {
                    day: 'Sunday',
                    theme: 'Sunday Stories',
                    content: `Behind-the-scenes and personal touch for ${audience}`,
                    postIdeas: [
                        `Sunday story: Why we created ${business} for ${audience}`,
                        `Behind-the-scenes: Our mission to help ${audience}`,
                        `Sunday reflection: Impact we\'ve made for ${audience}`
                    ],
                    optimalTime: '1:00 PM',
                    hashtags: ['#SundayStories', '#BehindTheScenes', '#Mission']
                }
            ];

            const calendar = [];
            for (let week = 0; week < weeks; week++) {
                contentThemes.forEach(dayTheme => {
                    calendar.push({
                        ...dayTheme,
                        week: week + 1,
                        business: business,
                        audience: audience
                    });
                });
            }
            
            res.json({
                success: true,
                calendar: calendar,
                totalPosts: calendar.length,
                business: business,
                audience: audience,
                weeks: weeks
            });
            
        } catch (error) {
            console.error('Calendar generation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate content calendar'
            });
        }
    }

    async generateViralCaption(req, res) {
        try {
            const { business, audience, postType, hook } = req.body;
            
            const viralFormulas = {
                controversy: `🔥 Unpopular opinion about ${business}...\n\nMost ${audience} think [common belief], but here's why that's completely wrong:\n\n[3 reasons why]\n\nThat's exactly why ${business} works differently.\n\nAgree or disagree? 👇`,
                
                story: `I used to be just like every other ${audience}...\n\nStruggling with [problem] until I discovered something that changed everything.\n\n[Short transformation story]\n\nThat's when ${business} became a game-changer.\n\nCan you relate? Drop a 💯 if yes!`,
                
                curiosity: `Why do 90% of ${audience} fail at [goal]?\n\n(It's not what you think...)\n\nMost people blame [common excuse]\n\nBut the real reason is [insight]\n\nThat's exactly what ${business} solves.\n\nWant to know how? Link in bio 👆`,
                
                educational: `🧠 3 things about [topic] that ${audience} never consider:\n\n1️⃣ [Insight 1]\n2️⃣ [Insight 2] \n3️⃣ [Insight 3]\n\nThis is exactly why ${business} works when everything else fails.\n\nWhich one surprised you most? 🤔`,
                
                social_proof: `"I can't believe the results I got with ${business}!"\n\n- Real ${audience} member\n\n[Specific result/transformation]\n\nThis is exactly what happens when ${audience} finally try the right approach.\n\nReady for your transformation? 🚀`
            };
            
            const selectedFormula = viralFormulas[postType] || viralFormulas.story;
            
            // Generate optimal posting times based on audience
            const optimalTimes = {
                'business-owners': ['9:00 AM', '1:00 PM', '7:00 PM'],
                'consumers': ['8:00 AM', '12:00 PM', '6:00 PM'],
                'professionals': ['7:00 AM', '12:00 PM', '5:00 PM']
            };
            
            res.json({
                success: true,
                caption: selectedFormula,
                postType: postType,
                optimalTimes: optimalTimes,
                engagement_tips: [
                    'Post when your audience is most active',
                    'Use 3-5 relevant hashtags',
                    'Include a clear call-to-action',
                    'Respond to comments within 1 hour',
                    'Add engaging visual content'
                ],
                hashtag_suggestions: [
                    `#${business.replace(/\s+/g, '')}`,
                    `#${audience.replace(/\s+/g, '')}`,
                    '#Success',
                    '#Transformation',
                    '#Results'
                ]
            });
            
        } catch (error) {
            console.error('Viral caption error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate viral caption'
            });
        }
    }

    async getOptimalPostingTimes(req, res) {
        try {
            const { audience, platform, timezone = 'US/Central' } = req.query;
            
            const optimalTimes = {
                'Facebook': {
                    'business-owners': {
                        'Monday': ['9:00 AM', '3:00 PM'],
                        'Tuesday': ['9:00 AM', '3:00 PM'],
                        'Wednesday': ['9:00 AM', '3:00 PM'],
                        'Thursday': ['9:00 AM', '3:00 PM'],
                        'Friday': ['9:00 AM', '1:00 PM'],
                        'Saturday': ['12:00 PM', '2:00 PM'],
                        'Sunday': ['12:00 PM', '2:00 PM']
                    },
                    'consumers': {
                        'Monday': ['1:00 PM', '8:00 PM'],
                        'Tuesday': ['1:00 PM', '8:00 PM'],
                        'Wednesday': ['1:00 PM', '8:00 PM'],
                        'Thursday': ['1:00 PM', '8:00 PM'],
                        'Friday': ['1:00 PM', '8:00 PM'],
                        'Saturday': ['12:00 PM', '6:00 PM'],
                        'Sunday': ['12:00 PM', '6:00 PM']
                    }
                },
                'Instagram': {
                    'business-owners': {
                        'Monday': ['6:00 AM', '12:00 PM', '7:00 PM'],
                        'Tuesday': ['6:00 AM', '12:00 PM', '7:00 PM'],
                        'Wednesday': ['6:00 AM', '12:00 PM', '7:00 PM'],
                        'Thursday': ['6:00 AM', '12:00 PM', '7:00 PM'],
                        'Friday': ['6:00 AM', '12:00 PM', '5:00 PM'],
                        'Saturday': ['10:00 AM', '2:00 PM'],
                        'Sunday': ['10:00 AM', '2:00 PM']
                    }
                }
            };
            
            const platformTimes = optimalTimes[platform] || optimalTimes['Facebook'];
            const audienceTimes = platformTimes[audience] || platformTimes['business-owners'];
            
            res.json({
                success: true,
                platform: platform,
                audience: audience,
                timezone: timezone,
                optimal_times: audienceTimes,
                engagement_insights: {
                    peak_days: ['Tuesday', 'Wednesday', 'Thursday'],
                    avoid_times: ['Before 6 AM', 'After 10 PM'],
                    best_performers: ['Educational content on Tuesday', 'Behind-the-scenes on Friday', 'User-generated content on weekends']
                }
            });
            
        } catch (error) {
            console.error('Optimal times error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get optimal posting times'
            });
        }
    }
}

// Assistant Module Classes (Placeholders - would be fully implemented)
class EmailManager {
    constructor(gmailConfig) {
        this.config = gmailConfig;
    }
    
    async handleRequest(intent, message) {
        return `I'll help you manage your emails for both Molaison Agency and Molaison AI. What specific email task would you like me to handle?`;
    }
}

class CalendarAssistant {
    async handleRequest(intent, message) {
        return `I can help you schedule appointments, make reservations, and manage your calendar across both businesses. What would you like me to schedule?`;
    }
}

class PhoneAssistant {
    constructor(twilioConfig) {
        this.config = twilioConfig;
    }
    
    async handleRequest(intent, message) {
        return `I can make calls on your behalf for client outreach, follow-ups, or business development. Who would you like me to call?`;
    }
}

class ResearchAssistant {
    constructor(perplexityConfig) {
        this.config = perplexityConfig;
    }
    
    async handleRequest(intent, message) {
        return `I'll conduct comprehensive research using Perplexity AI. What topic or competitor would you like me to research?`;
    }
}

class LifeCoach {
    async handleRequest(intent, message) {
        return `As your productivity coach, I can help you optimize your time, set goals, and balance running both Molaison Agency and Molaison AI. What area would you like to focus on?`;
    }
}

class SocialMediaManager {
    async handleRequest(intent, message) {
        return `I'll manage social media for both your brands. Would you like me to create content, schedule posts, or analyze engagement?`;
    }
}

class WebScraper {
    async handleRequest(intent, message) {
        return `I can scrape data for competitive analysis, lead generation, or market research. What information do you need collected?`;
    }
}

class TaskManager {
    async handleRequest(intent, message) {
        return `I'll help you prioritize and track tasks across both businesses and client projects. What tasks need my attention?`;
    }
}

class ClientProjectManager {
    async handleRequest(intent, message) {
        return `I'll help manage your client projects and custom builds. What project updates or new client work do you need help with?`;
    }
}

class BusinessIntelligence {
    async handleRequest(intent, message, businessContext) {
        return `I'll analyze business performance for both Molaison Agency and Molaison AI. What metrics or insights do you need?`;
    }
}

// Initialize and start the server
const assistant = new MolaisonExecutiveAssistant();

const PORT = process.env.PORT || 3003;
assistant.app.listen(PORT, () => {
    console.log(`🏢 Molaison Executive Assistant running on port ${PORT}`);
    console.log('🎯 Managing Molaison Agency & Molaison AI operations');
    console.log('💼 Client project management enabled');
    console.log('🚀 Multi-business AI assistant ready!');
});

module.exports = assistant;
