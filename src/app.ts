import {
  createBot,
  createFlow,
  MemoryDB,
  createProvider,
  addKeyword,
  /* EVENTS, */
} from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";

// Configura la zona horaria de Colombia
process.env.TZ = "America/Bogota";

//aqui se pueden agregar diversos mensajes automaticos
const flowBienvenida = addKeyword([/* EVENTS.WELCOME, */ "hola", "opciones"])
  .addAnswer(
    "¡Hola! Bienvenido al chatBot de SURATRANS. ¿En que puedo ayudarte el dia de hoy?"
  )
  .addAnswer(
    "Por favor, elige una opción:\n1. Opción 1\n2. Opción 2\n3. Opción 3",
    {capture: true},
    (ctx, { fallBack, flowDynamic }) => {
      const opcion = Number(ctx.body);

      if (isNaN(opcion) || opcion < 1 || opcion > 3) {
        return fallBack()
      } else {
        switch (opcion) {
          case 1:
            return flowDynamic(
              `Tu opción: ${opcion}\nlink de suratrans: https://suratrans.jnixsoft.com/`
            );
          case 2:
            return flowDynamic("opción 2");
          case 3:
            return flowDynamic("opcion 3");
        }
      }
    }
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
      const fechaVencimiento = new Date(date);

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
