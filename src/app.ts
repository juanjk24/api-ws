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
      const hours = req.body.hours;
      //const mediaUrl = req.body.mediaUrl //para enviar un archivo media (imagen, video, pdf)

      //Dividir la hora y minutos
      let horaMinutos = hours.split(":")
      let hora = Number(horaMinutos[0])
      let minutos = Number(horaMinutos[1])

      //convertir a formato 12 horas
      let sufijo = hora >= 12 ? "PM": "AM"

      //verificar si es medio dia o medianoche
      hora = hora > 12 ? hora - 12 : hora
      hora = hora === 0 ? 12 : hora

      //nueva hora con formato 12 horas
      let nuevaHora = `${hora}:${minutos < 10 ? "0": ""}${minutos} ${sufijo}`

      console.log(phone, message, date, nuevaHora);
      
      // Definir la fecha de vencimiento
      //const fechaVencimiento = new Date(date);
      // Calcular dos horas antes de la fecha de vencimiento
      //const dosHorasAntes = fechaVencimiento.getTime() - 2 * 60 * 60 * 1000; // 2 horas en milisegundos
      //tiempo restante en Timestamp (milisegundos)
      //const tiempoRestante = dosHorasAntes - Date.now();

      setTimeout(async () => {
        await bot.sendMessage(`57${phone}`, `Querido conductor, se le informa que se le ha asignado un formulario Pre-operacional hasta la fecha: ${date} con un plazo maximo hasta: ${nuevaHora}`, {
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
