import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Send, Loader } from 'lucide-react';
import { translateToProductName, chatAssistant, semanticProductSearch } from '../../services/gemini';
import { buildProductContext } from '../../constants/productSynonyms';

export default function VoiceAssistant({ 
  products, 
  cartItems, 
  onAddToCart, 
  onProductsFound,
  language,
  translations 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState('voice');
  
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        if (event.results[current].isFinal) {
          handleVoiceCommand(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('[Voice] Recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setChatHistory(prev => [...prev, {
            role: 'assistant',
            message: language === 'te' 
              ? 'క్షమించండి, నేను వినలేకపోయాను. మళ్లీ ప్రయత్నించండి.' 
              : 'Sorry, I couldn\'t hear that. Please try again.'
          }]);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceCommand = async (text) => {
    setIsProcessing(true);
    setChatHistory(prev => [...prev, { role: 'user', message: text }]);

    try {
      const productContext = buildProductContext(products);
      
      const matchedProducts = await translateToProductName(text, productContext);
      
      if (matchedProducts && matchedProducts.length > 0) {
        const highConfidence = matchedProducts.filter(m => m.confidence > 0.7);
        
        if (highConfidence.length > 0) {
          const product = products.find(p => p.id === highConfidence[0].productId);
          
          if (product) {
            const quantity = highConfidence[0].quantity || 1;
            onAddToCart(product, quantity);
            
            setChatHistory(prev => [...prev, {
              role: 'assistant',
              message: language === 'te'
                ? `✓ ${product.name} (${quantity} ${highConfidence[0].unit || 'piece'}) కార్ట్‌కి జోడించబడింది`
                : `✓ Added ${product.name} (${quantity} ${highConfidence[0].unit || 'piece'}) to cart`
            }]);
          }
        } else {
          const foundProducts = products.filter(p => 
            matchedProducts.some(m => m.productId === p.id)
          );
          
          if (foundProducts.length > 0) {
            onProductsFound(foundProducts);
            setChatHistory(prev => [...prev, {
              role: 'assistant',
              message: language === 'te'
                ? `${foundProducts.length} ఉత్పత్తులు దొరికాయి`
                : `Found ${foundProducts.length} products`
            }]);
          }
        }
      } else {
        const searchResults = await semanticProductSearch(text, products);
        
        if (searchResults.length > 0) {
          onProductsFound(searchResults);
          setChatHistory(prev => [...prev, {
            role: 'assistant',
            message: language === 'te'
              ? `${searchResults.length} ఉత్పత్తులు దొరికాయి`
              : `Found ${searchResults.length} products matching your search`
          }]);
        } else {
          const response = await chatAssistant(
            text,
            chatHistory,
            products,
            cartItems
          );
          setChatHistory(prev => [...prev, {
            role: 'assistant',
            message: response
          }]);
        }
      }
    } catch (error) {
      console.error('[Voice] Processing error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        message: language === 'te'
          ? 'క్షమించండి, సమస్య వచ్చింది. మళ్లీ ప్రయత్నించండి.'
          : 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    await handleVoiceCommand(inputMessage);
    setInputMessage('');
  };

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (isOpen && isListening) {
      stopListening();
    }
  };

  const supportsVoice = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleAssistant}
          className="voice-assistant-fab"
          aria-label={language === 'te' ? 'వాయిస్ అసిస్టెంట్' : 'Voice Assistant'}
        >
          <Mic size={24} />
        </button>
      )}

      {isOpen && (
        <div className="voice-assistant-panel">
          <div className="voice-assistant-header">
            <div className="voice-assistant-title">
              <Mic size={20} />
              <span>{language === 'te' ? 'షాపింగ్ అసిస్టెంట్' : 'Shopping Assistant'}</span>
            </div>
            <button onClick={toggleAssistant} className="voice-assistant-close">
              <X size={20} />
            </button>
          </div>

          <div className="voice-assistant-chat">
            {chatHistory.length === 0 && (
              <div className="voice-assistant-welcome">
                <Mic size={48} style={{ opacity: 0.3 }} />
                <p>
                  {language === 'te'
                    ? 'నేను మీ షాపింగ్‌కు సహాయం చేస్తాను. మాట్లాడండి లేదా టైప్ చేయండి!'
                    : 'I\'m here to help you shop. Speak or type!'}
                </p>
              </div>
            )}
            
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`voice-assistant-message ${chat.role === 'user' ? 'user' : 'assistant'}`}
              >
                {chat.message}
              </div>
            ))}

            {isProcessing && (
              <div className="voice-assistant-message assistant">
                <Loader size={16} className="spinning" />
                <span>{language === 'te' ? 'ఆలోచిస్తున్నాను...' : 'Thinking...'}</span>
              </div>
            )}

            {isListening && transcript && (
              <div className="voice-assistant-transcript">
                {transcript}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="voice-assistant-input">
            {supportsVoice && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`voice-assistant-mic-btn ${isListening ? 'listening' : ''}`}
                disabled={isProcessing}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={language === 'te' ? 'టైప్ చేయండి...' : 'Type here...'}
              disabled={isProcessing || isListening}
              className="voice-assistant-text-input"
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing || isListening}
              className="voice-assistant-send-btn"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
