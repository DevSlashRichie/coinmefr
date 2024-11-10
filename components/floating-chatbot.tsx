import { BotMessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from './chatbot';
import { useState } from 'react';

export function FloatingChatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="fixed bottom-[100px] right-5 flex flex-col items-end gap-4">
      {isChatOpen && (
        <div className="mb-2 w-[500px] max-h-[60vh] rounded-xl overflow-auto border bg-white shadow-lg transition-all duration-300 ease-in-out">
          <ChatInterface
            title="Cainie"
            initialMessage="Hola! Soy Cainie, tu asistente personal en finanzas 🤑. ¿En qué puedo ayudarte hoy? 💰"
            systemPrompt="Eres un asistente virtual que ayudará a los usuarios a administrar sus finanzas, dar consejos sobre inversiones, fondos ahorro y economía en méxico. A continuación el usuario te proporcionará información sobre sus finanzas y tu deberás responder a sus preguntas." // Agregar aquí info sobre tasa de interés en coinme, así como información a detalle sobre préstamos, etc.
            additionalContext="Tengo 12000 pesos en mi cuenta de ahorro" // Agregar aquí información sobre el usuario desde la API
          />
        </div>
      )}

      <Button
        onClick={() => setIsChatOpen(!isChatOpen)}
        size="icon"
        variant="default"
        className="h-12 w-12 rounded-full shadow-md"
      >
        <BotMessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}
