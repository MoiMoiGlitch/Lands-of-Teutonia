# Lands of Teutonia

Pagina web estatica para la partida de DnD **Lands of Teutonia**. Esta pensada como punto de encuentro para el grupo: una pantalla de hype antes de la sesion, ambiente musical sincronizado y espacio preparado para futuras secciones de campana.

## Que incluye

- Pantalla de acceso con contrasena para evitar visitas casuales.
- Barra lateral acoplable con el emblema de Lands of Teutonia.
- Apartado principal **Contador del Hype**.
- Cuenta regresiva grande hasta la proxima partida.
- Calculo automatico de la siguiente sesion: todos los jueves a las 22:00, hora de Madrid.
- Etiqueta dinamica superior con formato tipo `PROXIMA PARTIDA . JUEVES 18 DE JUNIO 22:00`.
- Reproductor de YouTube sincronizado por hora global.
- Bucle de varios videos con titulo visible encima del reproductor.
- Medicion/caché local de duraciones de YouTube para mejorar la sincronizacion del bucle.
- Chat provisional **Chat del hype (work in progress)**, actualmente local si no se conecta Firebase.
- Fondo atmosferico con imagen de fantasia y efecto sutil de hoguera con ascuas desenfocadas.
- Preparacion para Netlify.

## Estructura

- `outputs/index.html`: pagina principal.
- `outputs/styles.css`: estilos visuales, responsive, barra lateral, contador, chat y efecto de ascuas.
- `outputs/script.js`: logica de contrasena, contador, videos sincronizados, chat y animacion.
- `outputs/assets/`: imagenes usadas por la web.
- `outputs/firebase-config.js`: punto de configuracion para Firebase si se activa chat real.
- `outputs/firebase-rules.json`: reglas sugeridas para Firebase Realtime Database.
- `netlify.toml`: configuracion para que Netlify publique la carpeta `outputs`.

## Despliegue en Netlify

Este repositorio esta preparado para Netlify.

- Build command: dejar vacio.
- Publish directory: `outputs`.

El archivo `netlify.toml` de la raiz ya indica a Netlify que publique `outputs`. Si el repositorio esta conectado a GitHub, cada push a `main` puede desplegar automaticamente la pagina.

## Flujo recomendado para cambios

1. Editar los archivos dentro de `outputs`.
2. Probar la pagina en local.
3. Hacer commit de los cambios.
4. Subirlos a GitHub.
5. Netlify desplegara la version nueva si el repo esta conectado.

## Videos sincronizados

La lista de videos esta en `outputs/script.js`, dentro de `videoQueue`.

Cada entrada tiene:

- `id`: ID del video de YouTube.
- `title`: texto que aparece encima del reproductor.
- `duration`: duracion provisional en segundos.

La pagina usa la hora global como referencia para que dos personas que entren al mismo tiempo vean el mismo video en el mismo punto del bucle. Tambien intenta leer las duraciones reales de YouTube con un reproductor oculto y guardarlas localmente para mejorar la precision.

## Chat

El chat esta integrado debajo del reproductor, dentro de la seccion de ambiente sincronizado. Ahora mismo funciona como chat local de prueba si no hay Firebase configurado.

Si en el futuro se quiere activar chat real entre usuarios:

1. Crear un proyecto Firebase en plan Spark.
2. Activar Authentication con inicio anonimo.
3. Crear Realtime Database.
4. Publicar las reglas de `outputs/firebase-rules.json`.
5. Pegar la configuracion web del proyecto en `outputs/firebase-config.js`.

Si no se configura Firebase, la web sigue funcionando con el chat local provisional.

## Seguridad

La contrasena esta implementada en el frontend, porque la pagina es estatica. Sirve como barrera sencilla para visitantes normales, pero no como seguridad fuerte de servidor. Para una proteccion real habria que usar Netlify Identity, Cloudflare Access u otra capa de autenticacion externa.

## Estado actual

La pagina esta lista para publicarse en Netlify como sitio estatico. Quedan como posibles mejoras futuras:

- Activar chat real.
- Anadir secciones de Cronicas, Personajes y Mapa.
- Ajustar duraciones manuales de los videos si algun enlace de YouTube no deja leer metadatos.
