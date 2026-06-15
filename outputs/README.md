# Lands of Teutonia

Sitio estático listo para Netlify.

## Publicar en Netlify

Opcion rapida:

1. En Netlify, crea un nuevo sitio con "Deploy manually".
2. Arrastra la carpeta `outputs` completa al panel de subida.
3. Netlify publicara `index.html` y usara `netlify.toml` como configuracion.

Opcion comoda para futuros cambios:

1. Sube este proyecto a GitHub.
2. Conecta ese repositorio en Netlify.
3. Deja el build command vacio.
4. Usa `outputs` como publish directory.

Tambien hay un `netlify.toml` en la raiz del proyecto para que Netlify sepa publicar `outputs` si conectas el repositorio completo.

## Cambiar vídeos

Edita `script.js` y sustituye los valores de `videoQueue` por los IDs y duraciones aproximadas de tus vídeos de YouTube.

La sincronización se calcula con la hora global: todos los visitantes caen en el mismo vídeo y segundo de la cola.

## Chat

El chat ya tiene interfaz, nick, fecha y log de mensajes. Si `firebase-config.js` tiene una configuracion valida, usa Firebase Realtime Database en tiempo real. Si no, cae a un chat local de prueba.

Para mantenerlo gratis:

1. Crea un proyecto en Firebase con el plan Spark.
2. No lo actualices a Blaze.
3. Activa Authentication > Sign-in method > Anonymous.
4. Crea Realtime Database.
5. Publica las reglas de `firebase-rules.json`.
6. Copia la configuracion web del proyecto en `firebase-config.js`.

Segun la pagina oficial de precios de Firebase, Spark no requiere metodo de pago y Realtime Database incluye 100 conexiones simultaneas, 1 GB almacenado y 10 GB descargados al mes. Si no se cambia a Blaze, no deberia generarse coste; al llegar al limite, Firebase limita el servicio.
