import type { ContentModule } from '../types'

/**
 * Module 03 — How Drones Communicate.
 * Arquitectura drone ↔ GCS ↔ app ↔ cloud, separación control/data/telemetry/
 * video/management, y los protocolos de cada capa.
 */
export const droneArchitectureModule: ContentModule = {
  id: '03-drone-architecture',
  number: '03',
  title: 'How Drones Communicate',
  subtitle: 'Arquitectura de comunicaciones de un UAV',
  slug: 'drone-architecture',
  group: 'foundation',
  difficulty: 'intermediate',
  estimatedTime: '3 h',
  prerequisites: ['01-linux', '02-networking'],
  description:
    'El mapa completo: Drone ↔ GCS ↔ App ↔ Cloud. Separación de planos (control, data, telemetry, video, management) y los protocolos de cada uno: Wi-Fi, Bluetooth, radio, MAVLink, RTSP, HTTP, WebSocket, MQTT.',
  icon: 'Radio',
  status: 'available',
  outcomes: [
    'Dibujar la arquitectura drone → API de extremo a extremo',
    'Separar los 5 planos de comunicación',
    'Asignar el protocolo correcto a cada plano',
    'Identificar la superficie de ataque de cada enlace',
  ],
  tools: ['ip', 'ss', 'curl'],
  lessons: [
    {
      id: 'architecture-overview',
      moduleId: '03-drone-architecture',
      title: 'Arquitectura de extremo a extremo',
      slug: 'architecture-overview',
      duration: '20 min',
      difficulty: 'intermediate',
      summary:
        'El mapa del sistema: Drone, Companion, GCS, App, Cloud. Cómo se conectan, qué protocolo usa cada enlace y dónde están los límites de confianza.',
      objectives: [
        'Dibujar la arquitectura completa',
        'Identificar cada enlace y su protocolo',
        'Localizar límites de confianza',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Un sistema drone moderno no es un nodo, es **un grafo de comunicaciones**. El drone físico habla con un companion computer por serial; el companion habla con la GCS por radio/Wi-Fi; la GCS se sincroniza con una app móvil por Wi-Fi/LTE; la app habla con la nube por HTTPS.\n\nCada flecha de ese grafo es un protocolo distinto, con su propia superficie de ataque. Aprender a ver ese mapa de un vistazo es lo que separa al novato del pentester de UAVs.',
        },
        {
          id: 'arch',
          type: 'layered-architecture',
          title: 'Las 6 capas, esta vez como enlaces',
          layers: [
            {
              name: 'Drone / UAV',
              role: 'FC + sensores + ESC + motores. Vuela.',
              examples: 'Pixhawk, DJI Naza',
              attackSurface: 'Físico, GPS spoofing, sabotaje',
            },
            {
              name: 'Flight Controller',
              role: 'Controla estabilidad y modo de vuelo.',
              examples: 'PX4, ArduPilot, Betaflight',
              attackSurface: 'CLI serial, firmware, parámetros',
            },
            {
              name: 'Companion Computer',
              role: 'Linux a bordo. Misión, APIs, video.',
              examples: 'Raspberry Pi, Jetson',
              attackSurface: 'SSH, APIs, servicios, GPIO',
            },
            {
              name: 'Comm Link',
              role: 'Une drone y suelo.',
              examples: 'SiK 915 MHz, Wi-Fi, LTE',
              attackSurface: 'Intercepción, jamming, replay',
            },
            {
              name: 'Ground Control Station',
              role: 'Pilota y monitorea.',
              examples: 'QGroundControl, Mission Planner',
              attackSurface: 'API local, logs, malware host',
            },
            {
              name: 'App / API / Cloud',
              role: 'Servicios remotos, mobile SDK.',
              examples: 'REST, MQTT, WebSocket, mobile',
              attackSurface: 'Auth, IDOR, SSRF, tokens',
            },
          ],
        },
        {
          id: 'graph',
          type: 'diagram',
          title: 'Grafo de comunicaciones',
          ascii: `   ┌───────────┐  serial/UART   ┌─────────────┐  Wi-Fi/Radio  ┌──────────┐
   │  Flight   │ ◀────────────▶ │  Companion  │ ◀───────────▶ │   GCS    │
   │ Controller│   MAVLink      │   (Linux)   │   MAVLink     │  (QGC)   │
   └───────────┘                └──────┬──────┘  RTSP         └────┬─────┘
                                       │                            │
                                       │ Wi-Fi/LTE                  │ Wi-Fi/LTE
                                       ▼                            ▼
                                 ┌──────────┐                ┌───────────┐
                                 │  Mobile  │ ◀── HTTPS ───▶ │   Cloud   │
                                 │   App    │                │ API/MQTT  │
                                 └──────────┘                └───────────┘`,
          description:
            'Cada flecha es un protocolo distinto. Algunos son locales (serial dentro del drone), otros cruzan el aire (radio, Wi-Fi, LTE). Los que cruzan el aire son los más expuestos.',
        },
        {
          id: 'boundaries',
          type: 'callout',
          variant: 'warning',
          title: 'Límites de confianza',
          content:
            'Cada flecha que **cruza el aire** es un límite de confianza que el atacante puede espiar o inyectar. Las flechas internas (serial dentro del chasis) solo son atacables con acceso físico. Tu threat model empieza por las flechas inalámbricas.',
        },
        {
          id: 'recap',
          type: 'text',
          content:
            'En las próximas lecciones profundizamos en **cómo se separan los flujos** (control, data, telemetry, video, management) y qué protocolo vive en cada uno. Esa separación es la base del diseño seguro.',
        },
      ],
      quiz: {
        id: 'q-arch',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué enlace es típicamente el MÁS expuesto a un atacante externo?',
            options: [
              'Serial entre FC y companion (dentro del chasis)',
              'Radio/Wi-Fi entre companion y GCS',
              'I2C entre FC y brújula',
              'USB interno del companion',
            ],
            correctIndex: 1,
            explanation: 'Cualquier enlace inalámbrico cruza el aire y es espiable/inyectable.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué protocolo une típicamente el companion computer con el flight controller?',
            options: ['HTTP', 'MAVLink sobre serial/UART', 'MQTT', 'Bluetooth'],
            correctIndex: 1,
            explanation: 'MAVLink va por serial/UART dentro del chasis entre companion y FC.',
          },
        ],
      },
    },
    {
      id: 'planes',
      moduleId: '03-drone-architecture',
      title: 'Planos: control, data, telemetry, video, management',
      slug: 'planes',
      duration: '22 min',
      difficulty: 'intermediate',
      summary:
        'No todo el tráfico del drone es igual. Separar los 5 planos (control, data, telemetry, video, management) es clave para diseñar y auditar: cada plano tiene requisitos de seguridad distintos.',
      objectives: [
        'Distinguir los 5 planos',
        'Asignar protocolos a cada plano',
        'Razonar sobre requisitos de seguridad por plano',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'El tráfico de un sistema drone no es un mono río: son **5 ríos paralelos**, cada uno con su caudal, su criticidad y su protocolo. Mezclarlos (ej. comandos de control y telemetría por el mismo canal sin distinguir) es un error de diseño clásico que dificulta el hardening.',
        },
        {
          id: 'planes',
          type: 'protocol-map',
          title: 'Los 5 planos de comunicación',
          planes: [
            {
              name: 'Control Plane',
              description: 'Comandos que cambian el estado del drone: arm, takeoff, land, modo.',
              color: 'control',
              protocols: [
                { name: 'MAVLink COMMAND_LONG', desc: 'Comandos de vuelo' },
                { name: 'RC override', desc: 'Override manual' },
                { name: 'Mode change', desc: 'Cambio de modo de vuelo' },
              ],
            },
            {
              name: 'Data Plane',
              description: 'Datos de misión: fotos, sensores, cargas útiles.',
              color: 'data',
              protocols: [
                { name: 'HTTP/REST', desc: 'API del companion' },
                { name: 'MQTT', desc: 'Pub/sub de sensores' },
                { name: 'WebSocket', desc: 'Telemetría push a apps' },
              ],
            },
            {
              name: 'Telemetry Plane',
              description: 'Estado del drone en tiempo real: posición, actitud, batería.',
              color: 'telemetry',
              protocols: [
                { name: 'MAVLink HEARTBEAT', desc: 'Presencia' },
                { name: 'MAVLink ATTITUDE', desc: 'Orientación' },
                { name: 'MAVLink GPS_RAW_INT', desc: 'Posición' },
              ],
            },
            {
              name: 'Video Plane',
              description: 'Stream de video en vivo.',
              color: 'video',
              protocols: [
                { name: 'RTSP', desc: 'Control del stream' },
                { name: 'RTP', desc: 'Transporte de frames' },
                { name: 'H.264/H.265', desc: 'Codec' },
              ],
            },
            {
              name: 'Management Plane',
              description: 'Administración: SSH, updates, logs, configuración.',
              color: 'management',
              protocols: [
                { name: 'SSH', desc: 'Shell remota' },
                { name: 'HTTPS', desc: 'Updates y API admin' },
                { name: 'Syslog', desc: 'Logs centralizados' },
              ],
            },
          ],
        },
        {
          id: 'security-by-plane',
          type: 'table',
          caption: 'Requisitos de seguridad por plano',
          headers: ['Plano', 'Criticidad', 'Prioridad de defensa'],
          rows: [
            ['Control', 'Crítica', 'Integridad + auth (no inyectar comandos)'],
            ['Data', 'Alta', 'Confidencialidad + auth'],
            ['Telemetry', 'Media', 'Confidencialidad (filtra ubicación)'],
            ['Video', 'Media', 'Confidencialidad (filtra operaciones)'],
            ['Management', 'Crítica', 'Auth fuerte + cifrado + auditoría'],
          ],
        },
        {
          id: 'insight',
          type: 'callout',
          variant: 'tip',
          title: 'Insight ofensivo',
          content:
            'Como atacante, preguntas: "¿puedo inyectar en el control plane? ¿puedo leer el telemetry plane? ¿puedo acceder al management plane?". Como defensor: "¿está aislado el management plane del data plane? ¿hay auth en el control plane?". La separación de planos expone las preguntas correctas.',
        },
        {
          id: 'common-mistake',
          type: 'callout',
          variant: 'danger',
          title: 'Error de diseño frecuente',
          content:
            'Muchos drones baratos ponen TODO (control, telemetría, video, management) por el mismo canal Wi-Fi sin cifrar y sin auth. Eso convierte un solo punto débil en compromiso total. La separación de planos permite defensa en profundidad: aunque caiga el video, el control sigue protegido.',
        },
      ],
      quiz: {
        id: 'q-planes',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Un comando TAKEOFF pertenece a qué plano?',
            options: ['Data', 'Control', 'Telemetry', 'Video'],
            correctIndex: 1,
            explanation: 'Cambia el estado del drone: es control plane.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué plano expone típicamente SSH?',
            options: ['Management', 'Control', 'Video', 'Data'],
            correctIndex: 0,
            explanation: 'SSH es administración remota: management plane.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'Mezclar control y management en el mismo canal sin auth es una práctica de defensa en profundidad.',
            answer: false,
            explanation: 'Al contrario: rompe la separación y amplifica el impacto de una sola falla.',
          },
        ],
      },
    },
    {
      id: 'protocols',
      moduleId: '03-drone-architecture',
      title: 'Protocolos: Wi-Fi, BT, radio, MAVLink, RTSP, MQTT',
      slug: 'protocols',
      duration: '20 min',
      difficulty: 'intermediate',
      summary:
        'Repaso de los protocolos que aparecen en drones, qué capa ocupan, dónde brillan y dónde fallan. La referencia que usarás en cada lab.',
      objectives: [
        'Catalogar los protocolos clave de drones',
        'Asociar protocolo a plano y capa',
        'Identificar debilidades típicas de cada uno',
      ],
      sections: [
        {
          id: 'table',
          type: 'table',
          caption: 'Protocolos comunes en sistemas drone',
          headers: ['Protocolo', 'Capa/Plano', 'Uso típico', 'Debilidad típica'],
          rows: [
            ['Wi-Fi 802.11', 'L2, todos los planos', 'Drone↔App, drone↔GCS', 'WPA débil, deauth, PMF off'],
            ['Bluetooth', 'L2, management', 'Setup, mando', 'PIN débil, pairing spoof'],
            ['Radio SiK 915/433', 'L2, control+telem', 'Enlace largo alcance', 'Sin cifrar, replay'],
            ['MAVLink', 'L7, control+telem', 'Comandos y telemetría', 'Sin auth por defecto, CRC no es seguridad'],
            ['RTSP/RTP', 'L7, video', 'Stream de cámara', 'Sin auth, info disclosure'],
            ['HTTP/REST', 'L7, data+mgmt', 'API del companion', 'IDOR, SSRF, inyección'],
            ['WebSocket', 'L7, data', 'Push en tiempo real', 'Auth débil, origin bypass'],
            ['MQTT', 'L7, data', 'IoT pub/sub', 'Broker abierto, ACL ausente'],
            ['SSH', 'L7, management', 'Shell del companion', 'Credenciales débiles, key leak'],
          ],
        },
        {
          id: 'insight',
          type: 'callout',
          variant: 'info',
          title: 'MAVLink merece su propio módulo',
          content:
            'MAVLink es el protocolo más importante de este curso. Lo verás en el **Módulo 13** a fondo: estructura binaria, message IDs, system/component ID, CRC, y por qué CRC no es seguridad. Aquí solo lo situamos en el mapa.',
        },
        {
          id: 'recon',
          type: 'text',
          content:
            'En reconocimiento, una vez identificas los puertos abiertos del companion (`ss -tulpn`), asignas cada puerto a un protocolo y a un plano. Eso te da el **mapa de superficies** antes de tocar nada.\n\nEjemplo: ves 22/tcp (SSH, management), 80/tcp (HTTP API, data), 8554/tcp (RTSP, video), 14550/udp (MAVLink, telemetry+control). Cuatro planos, cuatro superficies. Empiezas por la más débil.',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description: 'Ejecuta `ss -tulpn` en el terminal e intenta clasificar cada puerto en su plano.',
        },
      ],
      quiz: {
        id: 'q-protocols',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué protocolo sirve típicamente el stream de video del drone?',
            options: ['SSH', 'RTSP', 'MQTT', 'MAVLink'],
            correctIndex: 1,
            explanation: 'RTSP controla el stream, RTP transporta los frames.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Por qué el CRC de MAVLink NO cuenta como medida de seguridad?',
            options: [
              'Porque es demasiado corto',
              'Porque detecta corrupción accidental, no manipulación maliciosa (no es MAC criptográfico)',
              'Porque MAVLink no tiene CRC',
              'Porque va por UDP',
            ],
            correctIndex: 1,
            explanation: 'CRC detecta ruido, no un atacante que puede recalcularlo. Necesitas HMAC/firma.',
          },
          {
            id: 'q3',
            type: 'identify-protocol',
            question: 'Ves 14550/udp abierto en el companion. ¿Qué protocolo es?',
            options: ['HTTP', 'SSH', 'MAVLink telemetry', 'RTSP'],
            correctIndex: 2,
            explanation: '14550/udp es el puerto estándar de telemetría MAVLink.',
          },
        ],
      },
    },
    {
      id: 'wifi-bluetooth-radio',
      moduleId: '03-drone-architecture',
      title: 'Wi-Fi, Bluetooth y radio links',
      slug: 'wifi-bluetooth-radio',
      duration: '20 min',
      difficulty: 'intermediate',
      summary:
        'Los tres enlaces inalámbricos más comunes en drones: Wi-Fi (802.11) como enlace general, Bluetooth para setup y mando, radio SiK (433/915 MHz) para largo alcance. Bandas, modos AP/station y por qué 2.4 GHz es un cuello de botella.',
      objectives: [
        'Diferenciar Wi-Fi AP mode vs station mode en drones',
        'Explicar el rol de Bluetooth y radio SiK',
        'Razonar sobre congestión y jamming en 2.4 GHz',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Un drone moderno usa **tres enlaces inalámbricos distintos**, cada uno pensado para un caso de uso. Wi-Fi (802.11) es el todoterreno: alto ancho de banda, corto alcance, suficiente para video y API. Bluetooth se reserva para setup inicial y mando RC: bajo consumo, manos libres. La radio SiK (433/915 MHz) es el enlace de largo alcance para BVLOS: menos bits, pero llega a kilómetros.\n\nLa elección de banda no es neutral: **2.4 GHz está saturada** porque Wi-Fi, Bluetooth, Zigbee y muchos RC la comparten. Eso tiene consecuencias directas de seguridad (jamming, interferencia) que veremos abajo.',
        },
        {
          id: 'bands-diagram',
          type: 'diagram',
          title: 'Bandas de frecuencia usadas en drones',
          ascii: `   Banda ISM      Frecuencia           Uso drone típico
   ─────────────────────────────────────────────────────────
   433 MHz         433.05–434.79 MHz    Radio SiK (EU, largo alcance)
   915 MHz         902–928 MHz          Radio SiK (US), LoRa
   2.4 GHz         2400–2483.5 MHz      Wi-Fi b/g/n, Bluetooth, RC, Zigbee
   5.8 GHz         5725–5875 MHz        Wi-Fi a/n/ac/ax, video FPV analógico

                   ◄── Baja frecuencia = mayor alcance, menos datos
                   ──► Alta frecuencia = más datos, menos alcance`,
          description:
            'Las bandas ISM son libres (sin licencia), por eso todos los drones operan en ellas. La contrapartida: están saturadas y son jammeables con hardware barato.',
        },
        {
          id: 'comparison',
          type: 'table',
          caption: 'Comparativa Wi-Fi vs Bluetooth vs radio SiK',
          headers: ['Tecnología', 'Rango típico', 'Ancho de banda', 'Seguridad', 'Uso drone'],
          rows: [
            ['Wi-Fi 802.11', '30–100 m', '54–1300 Mbps', 'WPA2/WPA3 (configurable)', 'Drone↔GCS, drone↔app, video'],
            ['Bluetooth (BR/EDR + BLE)', '10–100 m', '1–3 Mbps', 'PIN / SSP (pairing)', 'Setup inicial, mando RC'],
            ['Radio SiK (433/915 MHz)', '1–40 km', '<100 kbps', 'Ninguno por defecto', 'Control + telemetría BVLOS'],
          ],
        },
        {
          id: 'wifi-modes',
          type: 'text',
          content:
            'Wi-Fi en drones funciona en **dos modos**:\n\n- **AP mode (Access Point)**: el drone crea su propia red `Drone-XXXX` y la app/GCS se conecta como cliente. Típico de drones de consumo (DJI, Parrot): el drone es el gateway.\n- **Station mode**: el drone se une a una red existente (tu hotspot, una red de laboratorio). Más común en companions (Raspberry Pi + dronekit) y en flotas con infraestructura.\n\nEl modo AP expone el SSID a cualquiera en el aire: el primer paso del reconocimiento es un `iw dev wlan0 scan` desde fuera y ver qué `Drone-*` aparece.',
        },
        {
          id: 'congestion-warning',
          type: 'callout',
          variant: 'warning',
          title: '2.4 GHz está saturado (riesgo de jamming e interferencia)',
          content:
            'Wi-Fi b/g/n, Bluetooth, Zigbee y la mayoría de mandos RC comparten los mismos 83.5 MHz en 2.4 GHz. En entorno urbano o con varios drones volando a la vez, esa banda **se satura y se jammea con hardware trivial** (un Wi-Fi Pineapple, un SDR barato, o incluso otro drone legítimo cerca). Consecuencias: pérdida de enlace, fallback a RTL (return-to-launch) o, en el peor caso, un flyaway. Por eso los enlaces críticos de control suelen redundarse en 433/915 MHz o en 2.4 GHz FHSS (frequency hopping) dedicado.',
        },
        {
          id: 'iw-demo',
          type: 'interactive-terminal',
          title: 'Inspecciona las interfaces inalámbricas',
          description:
            'Ejecuta `iw dev` para ver las interfaces wlan del laboratorio y en qué modo están (AP / station). Después prueba `iw dev wlan0 scan` para enumerar SSIDs visibles — verás el drone simulado anunciándose.',
          preset: 'iw dev',
        },
      ],
      quiz: {
        id: 'q-wifi-bluetooth-radio',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question:
              'Un drone de consumo que crea su propia red `Drone-XXXX` y al que te conectas desde la app está operando Wi-Fi en qué modo?',
            options: ['Station mode', 'AP mode', 'Monitor mode', 'Mesh mode'],
            correctIndex: 1,
            explanation:
              'El drone actúa como Access Point: crea la red y los clientes (app/GCS) se asocian a él.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question:
              '¿Por qué se prefiere 433/915 MHz para el enlace de control de largo alcance frente a 2.4 GHz Wi-Fi?',
            options: [
              'Porque 433/915 MHz tiene más ancho de banda',
              'Porque 433/915 MHz llega más lejos y está menos saturado',
              'Porque 433/915 MHz tiene cifrado integrado',
              'Porque 2.4 GHz no es una banda ISM',
            ],
            correctIndex: 1,
            explanation:
              'Menor frecuencia = mejor propagación. Además 2.4 GHz está saturado por Wi-Fi/BT/RC.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question:
              'Bluetooth y Wi-Fi 2.4 GHz operan en la misma banda ISM, por lo que pueden interferir entre sí.',
            answer: true,
            explanation:
              'Ambos comparten 2400–2483.5 MHz. La coexistencia se logra con saltos de frecuencia (BT FHSS) y mecanismos de cooperación, no por separación espectral.',
          },
        ],
      },
    },
    {
      id: 'serial-can-usb',
      moduleId: '03-drone-architecture',
      title: 'Serial, CAN y USB dentro del drone',
      slug: 'serial-can-usb',
      duration: '15 min',
      difficulty: 'intermediate',
      summary:
        'Los buses internos del drone: UART/serial entre FC y companion (MAVLink v2 sobre /dev/ttyAMA0), CAN bus para ESC y sensores modernos (DroneCAN), USB para periféricos. Por qué estos buses solo son superficie de ataque con acceso físico.',
      objectives: [
        'Distinguir UART, CAN, USB e I2C/SPI dentro del drone',
        'Identificar el bus que lleva MAVLink al companion',
        'Razonar sobre el modelo de amenaza "físico" de buses internos',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Dentro del chasis del drone hay **buses locales** que conectan el flight controller con el companion, los ESC, los sensores y los periféricos. Estos buses no cruzan el aire: viven en cables (o trazas PCB). Para un atacante externo son invisibles; para un atacante con acceso físico al chasis son el siguiente paso tras abrir la carcasa.\n\nEl más icónico es el **UART entre FC y companion**: un par de cables TX/RX a 115200 baudios que lleva tramas MAVLink v2. Lo ves en el companion como `/dev/ttyAMA0` (o `/dev/ttyUSB0` si usas un adaptador USB-TTL).',
        },
        {
          id: 'topology',
          type: 'diagram',
          title: 'Topología de buses internos',
          ascii: `   ┌───────────────────────────────────────────────────────────┐
   │                   COMPANION (Linux)                        │
   │                                                           │
   │   /dev/ttyAMA0     /dev/ttyACM0       can0        usb1     │
   │       ▲                ▲                 ▲           ▲     │
   └───────┼────────────────┼─────────────────┼───────────┼─────┘
           │ UART (115200)  │ USB             │ CAN-H/L   │ USB
           │                │                 │           │
   ┌───────┴────────┐  ┌─────┴──────┐   ┌──────┴──────┐ ┌┴────────┐
   │  Flight Ctrl   │  │  GPS USB   │   │  ESC #1..#4 │ │ Cámara  │
   │  (Pixhawk)     │  │            │   │  (DroneCAN) │ │         │
   │  MAVLink v2    │  │            │   │             │ │         │
   └────────────────┘  └────────────┘   └─────────────┘ └─────────┘`,
          description:
            'Cuatro buses distintos, cuatro superficies. Solo el UART lleva MAVLink al companion; el CAN lleva comandos de motor; el USB es para periféricos arbitrarios.',
        },
        {
          id: 'buses',
          type: 'table',
          caption: 'Buses internos típicos de un drone',
          headers: ['Bus', 'Velocidad', 'Topología', 'Uso típico en drone'],
          rows: [
            ['UART/Serial', '9600–921600 baud', 'Punto a punto', 'FC ↔ companion (MAVLink v2)'],
            ['CAN bus (DroneCAN)', '1 Mbps', 'Bus multidrop', 'ESC, sensores modernos, redundante'],
            ['USB 2.0', '480 Mbps', 'Host-peripheral', 'Cámara, GPS, almacenamiento'],
            ['I2C', '100–400 kbps', 'Bus multidrop', 'Brújula, barómetro'],
            ['SPI', '>10 Mbps', 'Maestro-esclavo', 'IMU, flash, FPV OSD'],
          ],
        },
        {
          id: 'physical-access',
          type: 'callout',
          variant: 'info',
          title: 'Buses internos = amenaza de acceso físico',
          content:
            'UART, CAN, USB e I2C viven dentro del chasis. Un atacante remoto **no puede** leerlos directamente por red: necesita acceso físico para pinchar el cable o soldar un header. Eso los convierte en superficie de **post-explotación** (ya estás dentro del drone físico) más que en superficie de entrada. La excepción: si el companion expone un terminal serial por red (ser2net, un bridge TCP↔UART), el bus interno queda accesible remotamente. Verás ese patrón en algunos drones mal configurados: el UART del FC escuchando en 5760/tcp.',
        },
        {
          id: 'mavlink-uart',
          type: 'text',
          content:
            'MAVLink v2 viaja típicamente sobre UART a 115200 o 921600 baudios entre el FC y el companion. En el companion aparece como dispositivo serie: `/dev/ttyAMA0` (Raspberry Pi GPIO) o `/dev/ttyUSB0` (adaptador FTDI). Las tools de misión (`mavproxy.py`, `dronekit`) abren ese device y leen/escriben tramas binarias. La configuración del FC define **qué mensaje sale por qué puerto**: telemetría por TELEM1, comandos por TELEM2, etc. Conocer ese mapeo es clave cuando audites un firmware.',
        },
      ],
      quiz: {
        id: 'q-serial-can-usb',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question:
              'En un companion Raspberry Pi, ¿qué device corresponde típicamente al UART del FC con MAVLink?',
            options: ['/dev/sda1', '/dev/ttyAMA0', '/dev/video0', '/dev/dri/card0'],
            correctIndex: 1,
            explanation:
              'El UART del GPIO de la Raspberry Pi aparece como /dev/ttyAMA0 (o /dev/serial0 en Pi 3+).',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question:
              '¿Por qué los buses internos (UART, CAN, I2C) se consideran superficie de ataque secundaria para un atacante remoto?',
            options: [
              'Porque no transportan datos útiles',
              'Porque requieren acceso físico al chasis para pincharlos',
              'Porque están cifrados por hardware',
              'Porque no se pueden sniffar de ninguna forma',
            ],
            correctIndex: 1,
            explanation:
              'Son buses locales: sin acceso físico no se pueden leer ni inyectar. La excepción es si alguien los expone por red con un bridge TCP↔serial.',
          },
          {
            id: 'q3',
            type: 'multiple-choice',
            question: '¿Qué bus se usa típicamente para ESC y sensores modernos (DroneCAN)?',
            options: ['SPI', 'I2C', 'CAN bus', 'USB 2.0'],
            correctIndex: 2,
            explanation:
              'CAN bus (con DroneCAN encima) es el estándar para ESC y sensores modernos por su robustez y topología multidrop.',
          },
        ],
      },
    },
    {
      id: 'video-streaming-rtsp',
      moduleId: '03-drone-architecture',
      title: 'Video streaming: RTSP y RTP',
      slug: 'video-streaming-rtsp',
      duration: '18 min',
      difficulty: 'intermediate',
      summary:
        'Cómo viaja el video del drone al operador: RTSP (RFC 2326) controla la sesión, RTP transporta los frames H.264/H.265. Puerto típico 8554. Por qué casi todo el video drone va sin autenticar y qué riesgo de vigilancia implica.',
      objectives: [
        'Distinguir RTSP (control) de RTP (transporte)',
        'Identificar el flujo DESCRIBE → SETUP → PLAY',
        'Reconocer el riesgo de video sin autenticar',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'El video del drone sigue el patrón clásico de streaming IP: **RTSP controla la sesión, RTP transporta los frames**. RTSP (RFC 2326) es un protocolo text-based estilo HTTP que negocia codecs y puertos; RTP (RFC 3550) es el transporte binario, casi siempre sobre UDP, que lleva las NAL units del códec.\n\nEn drones típicamente encuentras un servidor RTSP en el companion que sirve `rtsp://drone:8554/live`. El códec suele ser **H.264** (más compatible) o **H.265/HEVC** (más eficiente). El bucle es estándar: DESCRIBE para obtener el SDP, SETUP para reservar puertos, PLAY para empezar a recibir frames.',
        },
        {
          id: 'flow',
          type: 'diagram',
          title: 'Flujo RTSP → RTP',
          ascii: `   Cliente (GCS / App)                 Drone (RTSP server :8554)
        │                                          │
        │  1. OPTIONS rtsp://drone:8554/live       │
        │ ────────────────────────────────────────▶│
        │  2. 200 OK  Public: DESCRIBE, SETUP,...  │
        │ ◀────────────────────────────────────────│
        │                                          │
        │  3. DESCRIBE rtsp://drone:8554/live      │
        │ ────────────────────────────────────────▶│
        │  4. 200 OK + SDP (a=rtpmap:96 H264/90000)│
        │ ◀────────────────────────────────────────│
        │                                          │
        │  5. SETUP trackID=0  transport=RTP/AVP   │
        │ ────────────────────────────────────────▶│
        │  6. 200 OK  Session: 12345678            │
        │ ◀────────────────────────────────────────│
        │                                          │
        │  7. PLAY                                 │
        │ ────────────────────────────────────────▶│
        │                                          │
        │  8. RTP/UDP (H.264 NAL units)            │
        │ ◀────────── ─────── ─────── ─────── ──── │
        │                                          │
        │  9. TEARDOWN                            │
        │ ────────────────────────────────────────▶│`,
          description:
            'RTSP negocia la sesión por TCP 8554; RTP manda los frames por UDP en puertos par/impar negociados en SETUP. El SDP del paso 4 anuncia el códec.',
        },
        {
          id: 'describe-demo',
          type: 'terminal',
          caption: 'curl para hacer un DESCRIBE RTSP y leer el SDP',
          lines: [
            {
              prompt: 'lab@droneSec:~$',
              command: 'curl -v rtsp://10.10.10.10:8554/live',
              output: `*   Trying 10.10.10.10:8554...
* Connected to 10.10.10.10 (10.10.10.10) port 8554.
> OPTIONS rtsp://10.10.10.10:8554/live RTSP/1.0
> CSeq: 1
> User-Agent: DroneSec/1.0
>
< RTSP/1.0 200 OK
< CSeq: 1
< Public: OPTIONS, DESCRIBE, SETUP, PLAY, TEARDOWN
<
> DESCRIBE rtsp://10.10.10.10:8554/live RTSP/1.0
> CSeq: 2
> Accept: application/sdp
>
< RTSP/1.0 200 OK
< CSeq: 2
< Content-Type: application/sdp
< Content-Length: 153
<
v=0
o=- 0 0 IN IP4 10.10.10.10
s=Drone Live Stream
c=IN IP4 0.0.0.0
t=0 0
m=video 0 RTP/AVP 96
a=rtpmap:96 H264/90000
a=control:trackID=0`,
              comment: 'Sin credenciales. El stream está abierto.',
            },
          ],
        },
        {
          id: 'danger',
          type: 'callout',
          variant: 'danger',
          title: 'Video sin autenticar = riesgo de vigilancia',
          content:
            'Casi ningún servidor RTSP de drone pide credenciales. Si el puerto 8554/tcp está abierto (y muchas veces lo está en la interfaz de red del drone), cualquier host en la misma red puede hacer DESCRIBE + PLAY y ver **exactamente lo que ve la cámara del drone en tiempo real**. Eso es un problema de vigilancia directa: un atacante conoce la ruta, los objetivos visuales y la operación. Peor si el drone lleva cámara térmica o de alta resolución. Mitigación: binding a interfaz específica, firewall por IP, autenticación RTSP (Basic/Digest) o encapsular el stream en un túnel cifrado.',
        },
        {
          id: 'probe',
          type: 'interactive-terminal',
          title: 'Inspecciona el stream con ffprobe',
          description:
            'Prueba `ffprobe rtsp://10.10.10.10:8554/live` para ver códec, resolución y framerate del stream del drone virtual. Es el equivalente a `curl -v` pero orientado a metadatos de media.',
          preset: 'ffprobe rtsp://10.10.10.10:8554/live',
        },
      ],
      quiz: {
        id: 'q-video-streaming-rtsp',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué protocolo transporta los frames de video y cuál controla la sesión?',
            options: [
              'RTP transporta, RTSP controla',
              'RTSP transporta, RTP controla',
              'RTCP transporta, RTSP controla',
              'HTTP transporta, RTP controla',
            ],
            correctIndex: 0,
            explanation:
              'RTSP negocia la sesión (DESCRIBE/SETUP/PLAY); RTP lleva los frames (típicamente UDP).',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué puerto TCP usa típicamente un servidor RTSP de drone?',
            options: ['80', '554', '8554', '14550'],
            correctIndex: 2,
            explanation:
              '8554/tcp es el puerto por defecto habitual en servidores RTSP de drones (mediamtx, rtsp-simple-server). El estándar RTSP también permite 554, pero en drones es más raro.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question:
              'Un servidor RTSP sin autenticación en la red del drone permite a cualquier host de esa red ver el stream de video.',
            answer: true,
            explanation:
              'Si el puerto está abierto y no hay auth, basta con DESCRIBE + PLAY para ver la cámara en vivo.',
          },
        ],
      },
    },
    {
      id: 'http-websocket-mqtt-cloud',
      moduleId: '03-drone-architecture',
      title: 'HTTP, WebSocket y MQTT en la nube drone',
      slug: 'http-websocket-mqtt-cloud',
      duration: '20 min',
      difficulty: 'intermediate',
      summary:
        'La capa cloud del sistema drone: REST API sobre HTTP, WebSocket para push en tiempo real a apps, MQTT pub/sub para telemetría IoT. Cómo la nube agrega múltiples drones y por qué un broker MQTT con ACL abierto es la vulnerabilidad clásica de flota.',
      objectives: [
        'Diferenciar REST, WebSocket y MQTT por patrón de uso',
        'Asignar cada protocolo a su plano',
        'Identificar la vulnerabilidad clásica del broker MQTT abierto',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Cuando el drone se conecta a la nube (por LTE o por Wi-Fi con uplink), entran tres protocolos web/IoT:\n\n- **HTTP/REST** para operaciones CRUD (consultar estado, enviar misión, listar vuelos). Request-response, sin estado, fácil de cachear y auditar.\n- **WebSocket** para push en tiempo real (telemetría a la app móvil del operador). Conexión persistente, bidireccional, baja latencia.\n- **MQTT** para telemetría de flota IoT. Pub/sub con broker, topics jerárquicos, QoS 0/1/2. Un solo broker gestiona miles de drones publicando y cientos de apps suscritas.\n\nLa nube agrega N drones: cada drone es un cliente MQTT que publica en `drone/{id}/telemetry`, y la API REST expone endpoints como `/api/drones/{id}/status` que consultan la base de datos alimentada por el broker.',
        },
        {
          id: 'planes',
          type: 'protocol-map',
          title: 'Planos cloud de un sistema drone',
          planes: [
            {
              name: 'Data Plane',
              description:
                'API REST para consultas y comandos, WebSocket para push a apps, MQTT para telemetría IoT.',
              color: 'data',
              protocols: [
                { name: 'HTTP/REST', desc: 'GET/POST/PUT/DELETE /api/drones/...' },
                { name: 'WebSocket (WSS)', desc: 'Push de telemetría a la app móvil' },
                { name: 'MQTT', desc: 'Pub/sub de telemetría y comandos de flota' },
              ],
            },
            {
              name: 'Management Plane',
              description:
                'Administración: despliegues, configuración, logs, acceso al companion.',
              color: 'management',
              protocols: [
                { name: 'HTTPS (admin)', desc: 'Panel de administración y APIs internas' },
                { name: 'SSH', desc: 'Shell remota al companion' },
              ],
            },
          ],
        },
        {
          id: 'comparison',
          type: 'table',
          caption: 'HTTP vs WebSocket vs MQTT en la nube drone',
          headers: ['Protocolo', 'Patrón', 'Dirección', 'Latencia', 'Uso típico'],
          rows: [
            ['HTTP/REST', 'Request-response', 'Cliente → Servidor', 'Alta (handshake por request)', 'API CRUD: listar drones, consultar estado'],
            ['WebSocket', 'Bidireccional persistente', 'Ambos', 'Baja (conexión viva)', 'Push de telemetría a app móvil en tiempo real'],
            ['MQTT', 'Pub/sub vía broker', 'Ambos (pubs + subs)', 'Muy baja', 'Telemetría IoT, multi-drone, comandos de flota'],
          ],
        },
        {
          id: 'rest-example',
          type: 'code',
          lang: 'http',
          file: 'api-drone-status.http',
          caption: 'Request y response REST típicos del API de un drone',
          code: `### Request
GET /api/drones/01/status HTTP/1.1
Host: cloud.dronedemo.io
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json

### Response
HTTP/1.1 200 OK
Content-Type: application/json

{
  "drone_id": "01",
  "online": true,
  "mode": "AUTO",
  "armed": true,
  "battery_pct": 73,
  "position": {
    "lat": 40.4168,
    "lon": -3.7038,
    "alt_m": 45.2
  },
  "mission_id": "m-2024-0918-3",
  "last_heartbeat": "2024-09-18T10:42:17Z"
}`,
        },
        {
          id: 'mqtt-tip',
          type: 'callout',
          variant: 'tip',
          title: 'Broker MQTT con ACL abierto = vulnerabilidad clásica de flota',
          content:
            'El hallazgo típico en drones comerciales con nube: el broker MQTT escucha en 1883/tcp (o 8883 TLS) sin `allow_anonymous false` o sin ACL, de modo que **cualquiera que conozca la IP puede suscribirse a `#` (wildcard total) y leer la telemetría de toda la flota**, o publicar en `drone/{id}/cmd` e inyectar comandos. Es la versión IoT de un Redis abierto. En labs verás este patrón a propósito: lo primero que pruebas tras descubrir 1883/tcp es `mosquitto_sub -h host -t \'#\' -v`.',
        },
        {
          id: 'curl-api',
          type: 'interactive-terminal',
          title: 'Practica contra el API del drone',
          description:
            'Ejecuta `curl http://10.10.10.10/api/v1/drone/status` contra el drone virtual del laboratorio. Después prueba `/api/v1/drone/config` y `/api/v1/drone/telemetry` para enumerar lo que expone.',
          preset: 'curl http://10.10.10.10/api/v1/drone/status',
        },
      ],
      quiz: {
        id: 'q-http-ws-mqtt',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question:
              '¿Qué protocolo es más adecuado para recibir telemetría push en una app móvil en tiempo real?',
            options: [
              'HTTP/REST (polling cada 5 s)',
              'WebSocket',
              'ICMP',
              'ARP',
            ],
            correctIndex: 1,
            explanation:
              'WebSocket mantiene una conexión bidireccional persistente: el servidor empuja eventos sin que el cliente tenga que pedirlos.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question:
              '¿Cuál es la vulnerabilidad clásica de un broker MQTT en una flota drone?',
            options: [
              'No soporta QoS 2',
              'Está abierto sin auth/ACL: cualquiera se suscribe a # y lee o publica comandos',
              'Solo funciona en 2.4 GHz',
              'No es compatible con TLS',
            ],
            correctIndex: 1,
            explanation:
              'Un broker abierto (allow_anonymous true + sin ACL) expone toda la flota: lectura con `mosquitto_sub -t \'#\'` e inyección publicando en topics de comando.',
          },
          {
            id: 'q3',
            type: 'scenario',
            question:
              'Descubres 1883/tcp abierto en la IP del broker cloud de un drone. ¿Cuál es el primer paso ofensivo conceptual?',
            options: [
              'Lanzar un exploit remoto de 0-day',
              'Suscribirse a `#` con mosquitto_sub y observar qué topics hay',
              'Hacer un DoS al broker',
              'Reiniciar el broker por SNMP',
            ],
            correctIndex: 1,
            explanation:
              'Enumerar primero: `mosquitto_sub -h host -t \'#\' -v` revela la jerarquía de topics (telemetría, comandos, configuración) sin necesidad de exploit.',
          },
        ],
      },
    },
  ],
}
