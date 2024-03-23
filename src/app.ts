import {
  createBot,
  createFlow,
  MemoryDB,
  createProvider,
  addKeyword,
} from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";

//aqui se pueden agregar diversos mensajes automaticos
const flowBienvenida = addKeyword("hola").addAnswer(
  "¡Hola! Este es un mensaje Automatico"
);

const main = async () => {
  //iniciamos el servidor
  const provider = createProvider(BaileysProvider);
  provider.initHttpServer(3002);

  provider.http?.server.post(
    "/send-message",
    handleCtx(async (bot, req, res) => {
      const phone = req.body.phone;
      const message = req.body.message;
      const date = req.body.date;
      //const mediaUrl = req.body.mediaUrl

      // Definir la fecha de vencimiento
      const fechaVencimiento = new Date(date); // 10pm del día 22/03/2024

      // Calcular dos horas antes de la fecha de vencimiento
      const dosHorasAntes = fechaVencimiento.getTime() - 2 * 60 * 60 * 1000; // 2 horas en milisegundos

      //tiempo restante en Timestamp (milisegundos)
      const tiempoRestante = dosHorasAntes - Date.now();

      setTimeout(async () => {
        await bot.sendMessage(`57${phone}`, message, {
          //media: mediaUrl
        });
      }, tiempoRestante);

      res.end("Mensaje enviado");
    })
  );

  await createBot({
    flow: createFlow([flowBienvenida]),
    database: new MemoryDB(),
    provider,
  });
};

main();
