const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const groq = new Groq({
    apiKey: (process.env.GROQ_API_KEY || '').trim()
});

const systemPrompt = `
You are the Maven Assistant, a helpful and professional AI guide for the Maven Online Examination System.
Maven is a platform where:
- Teachers can create exams with text-based or multiple-choice questions, set durations, and manage study materials (PDFs/videos).
- Students can take exams, view results, and access study materials.
- There is a strict integrity policy: switching tabs or minimizing the window during an exam triggers warnings. After 3 warnings, the exam is automatically submitted.
- Performance metrics (scores, averages) are available for both students and teachers.
- The platform supports Dark and Light modes.

Your goal is to answer user queries about Maven's features, how to use the platform, and its policies. 
Keep your responses concise, friendly, and helpful. 
If a user asks about something unrelated to Maven, politely redirect them to ask about Maven features.

Knowledge nuances:
- Exams: Create via Dashboard (Teachers), Start via Dashboard (Students).
- Results: View in 'My Results' (Students), 'Exam Analysis' (Teachers).
- Materials: Study guides, PDFs, and video links.
- Integrity: 3 warning limit for tab switching.
- Account: Update profile (name, email, password) in the Profile section.
- Theme: Toggle in the top header.
`;

exports.getChatResponse = async (req, res) => {
    try {
        const { message, history } = req.body;
        console.log('Chatbot request received:', { message, historyLength: history?.length });

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: 'user', content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            stream: false,
        });

        const botResponse = chatCompletion.choices[0].message.content;

        res.status(200).json({
            response: botResponse
        });
    } catch (error) {
        console.error('Groq API Error:', error);
        res.status(500).json({
            error: 'Failed to get response from AI assistant',
            message: error.message
        });
    }
};

