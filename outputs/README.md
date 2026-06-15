# Lands of Teutonia

Sitio estatico listo para Netlify. Esta carpeta `outputs` contiene la web final que debe publicarse.

## Publicar en Netlify

Opcion rapida:

1. En Netlify, crea un nuevo sitio con "Deploy manually".
2. Arrastra la carpeta `outputs` completa al panel de subida.
3. Netlify publicara `index.html`.

Opcion comoda para futuros cambios:

1. Sube el proyecto completo a GitHub.
2. Conecta ese repositorio en Netlify.
3. Deja el build command vacio.
4. Usa `outputs` como publish directory.

## Contenido principal

- Contador del Hype hasta el siguiente jueves a las 22:00, hora de Madrid.
- Reproductor de YouTube sincronizado por hora global.
- Titulos dinamicos para los videos del bucle.
- Chat del hype en estado provisional.
- Fondo de fantasia con efecto sutil de hoguera y ascuas.
- Pantalla de contrasena.

## Cambiar videos

Edita `script.js` y sustituye los valores de `videoQueue` por los IDs, titulos y duraciones aproximadas de tus videos de YouTube.

La sincronizacion se calcula con una referencia de hora global para que todos los visitantes caigan en el mismo video y segundo de la cola.

## Chat

El chat ya tiene interfaz, nick, fecha y log de mensajes. Si `firebase-config.js` tiene una configuracion valida, usa Firebase Realtime Database en tiempo real. Si no, cae a un chat local de prueba.

Para mantener Firebase gratis:

1. Crea un proyecto en Firebase con el plan Spark.
2. No lo actualices a Blaze.
3. Activa Authentication > Sign-in method > Anonymous.
4. Crea Realtime Database.
5. Publica las reglas de `firebase-rules.json`.
6. Copia la configuracion web del proyecto en `firebase-config.js`.
