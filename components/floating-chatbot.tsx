import { BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "./chatbot";
import { useState } from "react";

const createSystemMessage = (data: Record<string, unknown>) => {
  const message = [
    "Eres un asistente virtual experto en finanzas personales, inversiones y economía en México. El usuario compartirá preguntas sobre sus finanzas, y tienes acceso a un archivo JSON con datos financieros específicos para personalizar tu respuesta.",
    "SALUDA POR LO MENOS UNA VEZ AL USUARIO POR SU NOMBRE",
    "Además, en base a los datos proporcionados, debes recomendar los productos de inversión o préstamos de CoinME según lo más adecuado para el usuario.",
    "Cuando recomiendes inversiones o préstamos, ten en cuenta lo siguiente:",
    " 1. **Inversiones CoinME**: Tienes tres opciones según el plazo y rendimiento: ",
    "    - 20 días, rendimiento de 10.1%",
    "    - 90 días, rendimiento de 10.48%",
    "    - 160 días, rendimiento de 10.53%",
    " 2. **Préstamos CoinME**: Los préstamos están disponibles con diferentes características. A continuación, te indico los detalles de los préstamos disponibles. ",
    " - Para los préstamos, si el usuario tiene un balance pendiente o está considerando un préstamo, proporciona información sobre el pago mensual, el plazo y el saldo pendiente.",
    "Responde de manera profesional y amigable, proporcionando solo información precisa y relevante sobre finanzas en México.",
    "Evita frases de cierre o comentarios adicionales que no sean necesarios.",
    "NO PUEDES EJECTUAR FUNCIONES, NO LE OFREZCAS AYUDA PARA REALIZAR LAS OPERACIONES, DILE QUE LAS PUEDE REALIZAR DESDE SU DASHBOARD.",
    "SOLO TIENES 150 TOKENS PARA RESPONDER.",
    "",
    "LOS DATOS:",
    JSON.stringify(data, null, 2),
  ];

  return message.join("\n");
};

export function FloatingChatbot({ data }: { data: Record<string, unknown> }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end gap-4">
      {isChatOpen && (
        <div className="mb-2 w-[500px] max-h-[60vh] rounded-xl overflow-auto border bg-white shadow-lg transition-all duration-300 ease-in-out">
          <ChatInterface
            title="CoinBot"
            initialMessage="Hola! Soy CoinBot, tu asistente personal en finanzas 🤑. ¿En qué puedo ayudarte hoy? 💰"
            systemPrompt="Eres un asistente virtual que ayudará a los usuarios a administrar sus finanzas, dar consejos sobre inversiones, fondos ahorro y economía en méxico. A continuación el usuario te proporcionará información sobre sus finanzas y tu deberás responder a sus preguntas." // Agregar aquí info sobre tasa de interés en coinme, así como información a detalle sobre préstamos, etc.
            additionalContext={createSystemMessage(data) ?? ""}
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
