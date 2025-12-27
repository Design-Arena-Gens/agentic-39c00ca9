export async function generateAIResponse(message: string, history: { role: string; content: string }[]): Promise<string> {
  try {
    // Use free HuggingFace Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          past_user_inputs: history.filter(h => h.role === 'user').map(h => h.content).slice(-5),
          generated_responses: history.filter(h => h.role === 'assistant').map(h => h.content).slice(-5),
          text: message,
        },
        options: {
          wait_for_model: true,
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.generated_text) {
        return data.generated_text;
      }
    }
  } catch (error) {
    console.log('HuggingFace API failed, using fallback');
  }

  // Fallback: Use a simple rule-based response
  return generateFallbackResponse(message, history);
}

function generateFallbackResponse(message: string, history: { role: string; content: string }[]): string {
  const msg = message.toLowerCase().trim();

  // Greetings
  if (msg.match(/^(hi|hello|hey|greetings|good morning|good evening)/)) {
    const greetings = [
      "Hello! How can I help you today?",
      "Hi there! What can I do for you?",
      "Hey! Great to chat with you. What's on your mind?",
      "Greetings! How may I assist you?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you
  if (msg.match(/(how are you|how're you|how r u)/)) {
    return "I'm doing great, thank you for asking! I'm here to help you with anything you need. What can I do for you today?";
  }

  // Name questions
  if (msg.match(/(what is your name|what's your name|who are you)/)) {
    return "I'm an AI assistant created to help answer your questions and have meaningful conversations. You can ask me anything!";
  }

  // Help requests
  if (msg.match(/(help|assist|support)/)) {
    return "I'm here to help! You can ask me questions, have a conversation, or discuss any topic you're interested in. What would you like to talk about?";
  }

  // Thank you
  if (msg.match(/(thank you|thanks|thx)/)) {
    return "You're welcome! Feel free to ask if you need anything else.";
  }

  // Goodbye
  if (msg.match(/^(bye|goodbye|see you|farewell)/)) {
    return "Goodbye! It was nice chatting with you. Come back anytime!";
  }

  // Questions about capabilities
  if (msg.match(/(what can you do|your capabilities|can you help)/)) {
    return "I can chat with you about various topics, answer questions, provide information, and have meaningful conversations. Just ask me anything!";
  }

  // Math questions
  const mathMatch = msg.match(/(\d+)\s*[\+\-\*\/]\s*(\d+)/);
  if (mathMatch) {
    try {
      const result = eval(mathMatch[0]);
      return `The answer is ${result}.`;
    } catch (e) {
      // Continue to default response
    }
  }

  // Weather (acknowledge but can't provide real data)
  if (msg.match(/weather/)) {
    return "I don't have access to real-time weather data, but I'd be happy to chat about weather patterns or climate in general!";
  }

  // Time/Date
  if (msg.match(/(what time|current time|what date|today's date)/)) {
    const now = new Date();
    return `The current time is ${now.toLocaleTimeString()} and today's date is ${now.toLocaleDateString()}.`;
  }

  // Jokes
  if (msg.match(/(tell me a joke|make me laugh|joke)/)) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the programmer quit his job? Because he didn't get arrays!",
      "What do you call a bear with no teeth? A gummy bear!",
      "Why do programmers prefer dark mode? Because light attracts bugs!"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Context-aware responses based on history
  if (history.length > 0) {
    const lastMessage = history[history.length - 1];
    if (lastMessage.role === 'user' && lastMessage.content.toLowerCase().includes('tell me more')) {
      return "I'd be happy to provide more information! Could you be more specific about what aspect you'd like to know more about?";
    }
  }

  // Default intelligent responses based on message characteristics
  if (msg.includes('?')) {
    return "That's an interesting question! While I may not have all the specific details, I'm here to help explore that topic with you. Could you provide more context?";
  }

  if (msg.split(' ').length > 20) {
    return "Thank you for sharing that detailed message! I understand you're discussing something important. How can I help you with this?";
  }

  // Generic fallback responses
  const responses = [
    "That's interesting! Tell me more about that.",
    "I see what you mean. Can you elaborate on that?",
    "That's a good point! What else would you like to discuss?",
    "I understand. How can I help you with that?",
    "Interesting perspective! What made you think of that?",
    "I appreciate you sharing that. What would you like to know?",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
