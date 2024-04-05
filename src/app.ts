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
//EVENTS.WELCOME => se activa el flujo cuando el usuario envia cualquier palabra
const flowBienvenida = addKeyword([/* EVENTS.WELCOME, */ "hola", "opciones"])
  .addAnswer(
    "¡Hola! Bienvenido al chatBot de SURATRANS. ¿En que puedo ayudarte el dia de hoy?"
  )
  .addAnswer(
    "Por favor, elige una opción:\n1. Ver el enlace de Suratrans\n2. Opción 2\n3. Opción 3",
    { capture: true },
    (ctx, { fallBack, flowDynamic }) => {
      const opcion = Number(ctx.body);

      if (isNaN(opcion) || opcion < 1 || opcion > 3) {
        return fallBack();
      } else {
        switch (opcion) {
          case 1:
            return flowDynamic(
              `Tu opción: ${opcion}\nLink de suratrans: https://suratrans.jnixsoft.com/`
            );
          case 2:
            return flowDynamic(`Tu opcioón: ${opcion}`);
          case 3:
            return flowDynamic(`Tu opcioón: ${opcion}`);
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
      //const date = req.body.date;
      //const hours = req.body.hours;
      //const mediaUrl = req.body.mediaUrl //para enviar un archivo media (imagen, video, pdf)

      //obtener el primer numero del telefono para saber si es de Colombia o Ecuador
      const firsNumber = phone.toString()[0]
      const prefijoTel = firsNumber == "3" ? "57" : "593"

      console.log(`prefijo: ${prefijoTel}, telefono: ${phone}, mensaje: ${message}`);
      
      // Definir la fecha de vencimiento
      //const fechaVencimiento = new Date(date);
      // Calcular dos horas antes de la fecha de vencimiento
      //const dosHorasAntes = fechaVencimiento.getTime() - 2 * 60 * 60 * 1000; // 2 horas en milisegundos
      //tiempo restante en Timestamp (milisegundos)
      //const tiempoRestante = dosHorasAntes - Date.now();

      setTimeout(async () => {
        await bot.sendMessage(`${prefijoTel}${phone}`, message, {
          //media: mediaUrl
          
        });
      }, 1); //para enviar un mensaje 2 horas antes de la fecha limite cambiar el "1" por tiempoRestante

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
