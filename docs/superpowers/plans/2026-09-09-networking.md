# Plan aprobado: tarjeta digital con perfiles
Arquitectura: src/main.jsx controla perfil público y editor; src/contact.js genera vCard y valida destinos; src/cloud.js integra Firebase; src/style.css contiene diseño responsive. firestore.rules protege escritura. Ejecución inline.
1. Crear modelo y helpers con pruebas de escape vCard y protocolos peligrosos; ejecutar npm test.
2. Construir perfil público con selector horizontal, contacto, compartir y QR; IDs estables por perfil.
3. Construir editor con fotos comprimidas, campos y enlaces, orden y creación de perfiles; persistir borrador local.
4. Integrar acceso Google, publicación explícita y lectura Firestore; documentar configuración y reglas.
5. Ejecutar npm run build y comprobar flujos y tamaños móviles en navegador; corregir defectos observados.
