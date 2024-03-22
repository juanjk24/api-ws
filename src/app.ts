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
  const provider = createProvider(BaileysProvider);
  provider.initHttpServer(3002);

  provider.http?.server.post(
    "/send-message",
    handleCtx(async (bot, req, res) => {
      const phone = req.body.phone;
      const message = req.body.message;
      const time = req.body.time;
      //const mediaUrl = req.body.mediaUrl

      setTimeout(async () => {
        await bot.sendMessage(`57${phone}`, message, {
          //media: mediaUrl
        });
      }, time);

      res.end("esto es del servidor");
    })
  );

  await createBot({
    flow: createFlow([flowBienvenida]),
    database: new MemoryDB(),
    provider,
  });
};

main();
