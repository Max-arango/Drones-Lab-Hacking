# DroneSec Lab — Worklog

Proyecto: Plataforma educativa interactiva de Drone Cybersecurity.
Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + Zustand + Prisma(SQLite).

Restricción clave: solo la ruta `/` es visible. Toda la navegación es SPA por estado (Zustand nav-store) con sync a `location.hash`.

Fases:
- FASE I (actual): foundation — layout, sidebar, dashboard, content engine, search, progress, módulos 00/01/02/03.
- FASE II-VI: posteriores.

Decisiones de arquitectura:
- Contenido = datos TS tipados (no componentes hardcodeados). Renderer genérico.
- Progreso = Zustand + persist localStorage (single-user lab, sin auth).
- Tema: dark terminal por defecto, primario esmeralda, acento ámbar, sin azul/índigo.
- Terminal simulada client-side con FS virtual + red de lab virtual.
- Módulos 04-27 como stubs "Coming soon" con outline visible.

---
Task ID: 1
Agent: main
Task: Foundation — tema, globals.css, ThemeProvider, nav-store, progress-store, content types

Work Log:
- (en progreso)

---
Task ID: 4-a
Agent: general-purpose (Linux module enrichment)
Task: Add 4 new lessons to Module 01 Linux (users-groups-permissions, sockets-interfaces-routing, ssh-and-systemd, text-processing-pipeline)

Work Log:
- Leí worklog.md, types.ts, linux.ts existente y start-here.ts como referencia de estilo.
- Verifiqué baseline de lint (0 errores) antes de tocar nada.
- Diseñé 4 lecciones siguiendo la pedagogía THEORY → VISUALIZATION → DEMO → LAB → EXERCISE → CHALLENGE → EXPLANATION → DEFENSE, en español, con targets de laboratorio (10.10.10.0/24, drone-lab.local).
- Edité linux.ts insertando las 4 lecciones nuevas justo después de `network-tools`, manteniendo intactas las 3 lecciones previas y toda la metadata del módulo (id, number, title, outcomes, tools, etc.).
- Cada lección incluye los campos requeridos (id, moduleId='01-linux', title, slug, duration, difficulty, summary, objectives, sections, quiz) y cada section tiene id único y type válido según types.ts.
- Tipos de sección usados: text, code, terminal, callout (legal/warning/tip/info/danger), table, steps, diagram (ASCII), interactive-terminal.
- Cada quiz tiene 3 preguntas (mix multiple-choice + true-false) con explanation.
- Ejecuté `bun run lint` → 0 errores nuevos. `bunx tsc --noEmit` tampoco reporta errores en linux.ts (los únicos errores TS son preexistentes en archivos examples/ y skills/ no relacionados).

Stage Summary:
- Lecciones en linuxModule.lessons: antes 3 (filesystem-basics, processes-services, network-tools), ahora 7 (+ users-groups-permissions, sockets-interfaces-routing, ssh-and-systemd, text-processing-pipeline).
- Decisión pedagógica: cada lección nueva cierra con un callout defensivo (hardening, persistencia IR, scope legal, pipeline de forense) y un interactive-terminal para que el estudiante practique comandos reales en el lab simulado.
- Tiempo total estimado del módulo pasa de ~63 min a ~123 min (se mantiene la cifra '4–5 h' del top-level porque incluye labs y exploración libre).
- No se modificó nada de la metadata del módulo ni de las lecciones existentes. Cumplimiento ético: todos los ejemplos usan targets de laboratorio (10.10.10.0/24, drone-lab.local, localhost); cero automatización ofensiva real.

---
Task ID: 4-c
Agent: general-purpose (Drone Architecture module enrichment)
Task: Add 4 new lessons to Module 03 (wifi-bluetooth-radio, serial-can-usb, video-streaming-rtsp, http-websocket-mqtt-cloud)

Work Log:
- Leí worklog.md, types.ts, drone-architecture.ts existente y start-here.ts como referencia de estilo.
- Verifiqué baseline de lint (0 errores) antes de tocar nada.
- Diseñé 4 lecciones siguiendo la pedagogía THEORY → VISUALIZATION → DEMO → EXERCISE, en español, con specs reales citados (IEEE 802.11, MAVLink v2, RTSP RFC 2326, RTP RFC 3550, MQTT).
- Edité drone-architecture.ts insertando las 4 lecciones nuevas justo después de `protocols`, manteniendo intactas las 3 lecciones previas (architecture-overview, planes, protocols) y toda la metadata del módulo (id, number, title, outcomes, tools, etc.).
- Cada lección incluye los campos requeridos (id, moduleId='03-drone-architecture', title, slug, duration, difficulty: 'intermediate', summary, objectives, sections, quiz) y cada section tiene id único y type válido según types.ts.
- Tipos de sección usados: text, table, diagram (ASCII), callout (warning/info/danger/tip), terminal, code, interactive-terminal, protocol-map.
- Cada quiz tiene 3 preguntas (mix multiple-choice + true-false + scenario/identify-protocol) con explanation.
- Lección 1 (wifi-bluetooth-radio): diagrama ASCII de bandas ISM, tabla comparativa Wi-Fi/BT/SiK, callout warning sobre congestión 2.4 GHz, interactive-terminal con `iw dev`.
- Lección 2 (serial-can-usb): diagrama ASCII de topología interna de buses, tabla UART/CAN/USB/I2C/SPI, callout info sobre amenaza física, detalle de MAVLink v2 sobre /dev/ttyAMA0.
- Lección 3 (video-streaming-rtsp): diagrama ASCII del flujo OPTIONS→DESCRIBE→SETUP→PLAY→RTP, terminal con `curl -v rtsp://` mostrando SDP H.264/90000, callout danger sobre vigilancia, interactive-terminal con `ffprobe`.
- Lección 4 (http-websocket-mqtt-cloud): protocol-map con Data Plane (HTTP/WS/MQTT) + Management Plane (HTTPS/SSH), tabla comparativa, code REST request/response JSON, callout tip sobre broker MQTT con ACL abierto, interactive-terminal con curl al API.
- Ejecuté `bun run lint` → 0 errores nuevos. `bunx tsc --noEmit` tampoco reporta errores en drone-architecture.ts (los únicos errores TS son preexistentes en archivos examples/ y skills/ no relacionados).

Stage Summary:
- Lecciones en droneArchitectureModule.lessons: antes 3 (architecture-overview, planes, protocols), ahora 7 (+ wifi-bluetooth-radio, serial-can-usb, video-streaming-rtsp, http-websocket-mqtt-cloud).
- Tiempo total estimado del módulo pasa de ~62 min a ~115 min de lecciones (se mantiene la cifra '3 h' del top-level porque incluye labs y exploración libre).
- Cobertura de protocolos amplificada: Wi-Fi 802.11 (AP/station), Bluetooth BR/EDR+BLE, radio SiK 433/915 MHz, UART/MAVLink v2, CAN bus/DroneCAN, USB 2.0, I2C/SPI, RTSP RFC 2326 + RTP RFC 3550 + SDP H.264, HTTP/REST, WebSocket, MQTT (broker/ACL/QoS).
- No se modificó nada de la metadata del módulo ni de las lecciones existentes. Cumplimiento ético: todos los ejemplos usan targets de laboratorio (10.10.10.0/24, 10.10.10.10, cloud.dronedemo.io conceptual); cero automatización ofensiva real.

---
Task ID: 4-b
Agent: general-purpose (Networking module enrichment)
Task: Add 4 new lessons to Module 02 Networking (tcp-handshake-deep, arp-dhcp-dns, packet-journey-animation, broadcast-multicast-nat)

Work Log:
- Leí worklog.md, types.ts, modules/networking.ts (3 lecciones existentes) y modules/start-here.ts (referencia de patrones: packet/steps/interactive-terminal con preset).
- Diseñé 4 lecciones nuevas siguiendo exactamente las uniones de LessonSection: text, table, diagram (ascii), steps, packet (layers con color ethernet|ip|tcp|http y fields label/value/note), terminal (lines con prompt/command/output/comment), callout (variant info|tip|danger), interactive-terminal (con preset).
- Inserté las 4 lecciones en el array `lessons` DESPUÉS de `mac-ip-ports`, sin tocar metadatos del módulo ni lecciones previas. IDs de sección prefijados (thd-, add-, pja-, bmn-) para evitar colisiones.
- Contenido en español, comandos en inglés, targets de lab solo 10.10.10.0/24 y drone-lab.local. Flujo pedagógico teoría → visualización → demo → ejercicio.
- `tcp-handshake-deep`: SYN/SYN-ACK/ACK con seq/ack, diagrama ASCII de handshake+teardown, tabla de estados TCP, terminal `ss -tan`, callout info sobre TIME_WAIT, quiz 3Q.
- `arp-dhcp-dns`: diagrama ARP request(broadcast)/reply(unicast), tabla comparativa ARP/DHCP/DNS, steps DORA, terminal ip neigh + dig, callout tip (ARP cache TTL) + callout danger (ARP spoofing defensivo), quiz 3Q.
- `packet-journey-animation` (centerpiece): diagrama topología 3 nodos, steps 7-hop (L7→L4→L3→ARP→hop1→hop2→de-encap), 2 packet sections mostrando MAC cambiando e IP/TCP/HTTP intactos entre hop1 y hop2, callout tip "IP es pasaporte, MAC es dirección local", quiz 3Q.
- `broadcast-multicast-nat`: tabla unicast/broadcast/multicast, diagrama NAT/PAT drone→router→Internet, callout info (NAT oculta topología pero no es seguridad), quiz 3Q.
- Verifiqué: `bun run lint` limpio (sin errores). `tsc --noEmit` — sin errores en src/lib/content (los únicos errores TS son pre-existentes en examples/ y skills/, ajenos a esta tarea).

Stage Summary:
- networkingModule.lessons pasó de 3 a 7 lecciones (+4): tcp-handshake-deep, arp-dhcp-dns, packet-journey-animation, broadcast-multicast-nat.
- Todos los section types usados cumplen el contrato de types.ts (BaseSection.id único, packet.layers con color válido, diagram.ascii, steps.steps con title/content/code?, etc.).
- Cada lección trae diagram, terminal/interactive-terminal y quiz de 3 preguntas. La lección packet-journey-animation es la pieza interactiva central con 2 packet sections contrastando hop1 vs hop2.
- Sin regresiones: lint limpio, tipos OK en content engine. Listo para que el renderer genérico muestre las 7 lecciones.

---
Task ID: 5-13 (final integration & verification)
Agent: main
Task: Layout shell, sidebar, dashboard, search, terminal, packet visualizer, Agent Browser verification

Work Log:
- Construido AppShell (sidebar + header + main scroll + footer sticky) con SPA hash-routing via Zustand nav-store
- AppSidebar custom: 27 módulos agrupados en 9 secciones colapsables + quick nav (Dashboard/Learning Path/Toolbox/Glossary/Attack Labs) + footer con score y progreso
- AppHeader con search trigger (Ctrl+K), theme toggle, breadcrumbs por vista
- DashboardView: hero con progreso global, quick launch (6 accesos), grid de módulos disponibles, actividad reciente, terminal embebido, learning paths, banner de scope ético
- GlobalSearch (cmdk CommandDialog): indexa lecciones + módulos + labs + tools + glosario
- SimulatedTerminal: motor en src/lib/terminal/engine.ts con FS virtual + red de lab (10.10.10.0/24: router/drone/gcs) + API simulada del drone (/api/drone/{status,telemetry,config,logs}); comandos soportados: help, whoami, ls, cat, ip (addr/route/neigh), ss, ping, dig, nmap (-sn/-sV/-p-), nc, curl, tcpdump, strings, xxd, hexdump
- PacketVisualizer: capas clickables (Ethernet/IPv4/UDP/TCP/MAVLink/HTTP/Payload) con panel de detalle de campos
- LessonRenderer genérico: despacha 12 tipos de sección (text, code, terminal, callout, packet, table, steps, diagram, interactive-terminal, protocol-map, layered-architecture, flag-challenge, divider)
- Quiz component: multiple-choice / true-false / scenario / identify-protocol, con feedback y registro de progreso
- FlagChallenge: input + validación + hint + registro en progress-store (+150 pts)
- Vistas: ModuleView, LessonView (con prev/next), LabView, ToolView, ToolboxView, GlossaryView, LearningPathView
- Progress store Zustand + persist localStorage (completedLessons, completedLabs, flags, score, activity log)

Verificación con Agent Browser (todas superadas):
- Página carga HTTP 200, sin errores de consola, sin hydration mismatch
- Sidebar: 27 módulos en 9 grupos, navegación por estado + hash URL (botón atrás funciona)
- Terminal interactivo: whoami→student, nmap -sn→3 hosts, curl API→JSON del drone ✓
- Packet visualizer: clic en capa MAVLink actualiza panel de detalle ✓
- Quiz: radio buttons + botón "Comprobar respuestas" se habilita al responder ✓
- Flag challenge: DRLAB{welcome_to_the_lab} → "Flag capturada +150 pts" ✓
- Búsqueda Ctrl+K: "paquetes" → 7 resultados relevantes跨 módulos ✓
- Progreso persiste en localStorage (score:150, flags, activity) ✓
- Responsive móvil 390x844: hamburger menu → drawer sidebar ✓
- Footer sticky en bottom del viewport (flex h-screen + main overflow-y-auto) ✓

Stage Summary:
- FASE I completa y verificada end-to-end en navegador.
- 4 módulos fully available (00 Start Here, 01 Linux, 02 Networking, 03 Drone Architecture) con 6-7 lecciones cada uno = 26 lecciones con quizzes, terminales interactivos y packet visualizers.
- 23 módulos stub "coming soon" con outline visible (FASE II-VI).
- 22 herramientas en Toolbox, 29 términos en Glossary, 6 learning paths.
- 1 lab funcional (Find the Drone) con flag verificable.
- Stack: Next.js 16 + TS + Tailwind 4 + shadcn/ui + Zustand. Sin azul/índigo (tema esmeralda/ámbar terminal). Sin dependencias innecesarias añadidas.
- `bun run lint` → 0 errores. Dev server estable en puerto 3000.
