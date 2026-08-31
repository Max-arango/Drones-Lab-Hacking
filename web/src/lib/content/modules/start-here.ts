import type { ContentModule } from '../types'

/**
 * Module 00 — START HERE
 * Introduction to Drone Cybersecurity, UAV architecture, attack surfaces,
 * ethics, environment setup, and the student's first mission.
 */
export const startHereModule: ContentModule = {
  id: '00-start-here',
  number: '00',
  title: 'Start Here',
  subtitle: 'Drone Cybersecurity desde cero',
  slug: 'start-here',
  group: 'foundation',
  difficulty: 'beginner',
  estimatedTime: '2–3 h',
  prerequisites: [],
  description:
    'Punto de entrada a la plataforma. Entiende qué es un drone desde la perspectiva informática, cuáles son sus superficies de ataque, cómo se modela el riesgo, las reglas éticas del laboratorio y cómo preparar tu entorno antes de tocar nada.',
  icon: 'Rocket',
  status: 'available',
  outcomes: [
    'Definir un UAV como un sistema embebido distribuido y conectado',
    'Identificar las 6 capas de la arquitectura drone → API',
    'Construir un threat model básico con STRIDE',
    'Aplicar las reglas del laboratorio (scope ético y legal)',
    'Disponer de un terminal Linux funcional para los labs',
  ],
  tools: ['bash', 'ip', 'ping', 'curl', 'whoami'],
  lessons: [
    {
      id: 'what-is-a-drone',
      moduleId: '00-start-here',
      title: '¿Qué es un drone (para un hacker)?',
      slug: 'what-is-a-drone',
      duration: '12 min',
      difficulty: 'beginner',
      summary:
        'Un drone no es un juguete volador: es un sistema embebido distribuido, conectado por radio, con un flight controller, un companion computer, enlaces de telemetría y APIs. Esta lección cambia tu modelo mental.',
      objectives: [
        'Describir un UAV como sistema de computación',
        'Distinguir flight controller, companion computer y GCS',
        'Reconocer que un drone tiene IP, puertos, sockets y APIs',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Cuando la mayoría de la gente piensa en un drone, imagina un cuadricóptero con una cámara. Para nosotros, un drone es **un sistema embebido distribuido que vuela**.\n\nEso significa que debajo del plástico hay varios ordenadores hablando entre sí por red: un *flight controller* que estabiliza la aeronave en tiempo real, un *companion computer* que ejecuta Linux, un módulo de radio que envía telemetría al suelo, y a menudo una aplicación móvil o una API en la nube que recibe órdenes.\n\nSi un dispositivo tiene **IP, puertos, sockets, protocolos y firmware**, es objetivo de ciberseguridad. Un drone tiene todo eso, y además vuela.',
        },
        {
          id: 'definition',
          type: 'callout',
          variant: 'info',
          title: 'Definición operativa',
          content:
            'Un **UAV (Unmanned Aerial Vehicle)** es una aeronave sin tripulación cuyo control se reparte entre un sistema de vuelo autónomo (flight controller), un ordenador de acompañamiento (companion computer), una estación de control en tierra (GCS) y, frecuentemente, servicios en la nube. Desde el punto de vista ofensivo, cada uno de esos elementos es un host en una red.',
        },
        {
          id: 'layers',
          type: 'layered-architecture',
          title: 'Las 6 capas de un sistema drone',
          layers: [
            {
              name: 'Drone / UAV',
              role: 'La aeronave física: motores, ESC, frame, batería.',
              examples: 'Cuadricóptero, fixed-wing, VTOL',
              attackSurface: 'Acceso físico, sabotaje, GPS spoofing',
            },
            {
              name: 'Flight Controller',
              role: 'MCU en tiempo real que estabiliza y controla el vuelo.',
              examples: 'PX4, ArduPilot, Betaflight',
              attackSurface: 'Firmware, sensores, failsafe, CLI serial',
            },
            {
              name: 'Companion Computer',
              role: 'Ordenador Linux a bordo que ejecuta lógica de misión.',
              examples: 'Raspberry Pi, Jetson, BeagleBone',
              attackSurface: 'SSH, servicios, GPIO, USB, filesystem',
            },
            {
              name: 'Communication Link',
              role: 'Radio / Wi-Fi / 4G que une el drone con el suelo.',
              examples: 'SiK 915 MHz, Wi-Fi, LTE, LoRa',
              attackSurface: 'Intercepción, jamming, replay, inyección',
            },
            {
              name: 'Ground Control Station',
              role: 'Software en tierra que pilota y monitorea.',
              examples: 'QGroundControl, Mission Planner',
              attackSurface: 'API local, MAVLink, logs, updates',
            },
            {
              name: 'Application / API / Cloud',
              role: 'Servicios en la nube, app móvil, telemetría remota.',
              examples: 'REST, MQTT, WebSocket, mobile SDK',
              attackSurface: 'Auth, IDOR, SSRF, tokens, API keys',
            },
          ],
        },
        {
          id: 'key-idea',
          type: 'callout',
          variant: 'tip',
          title: 'La idea clave',
          content:
            'Cada capa expone **una superficie de ataque distinta**. La vulnerabilidad no siempre está donde esperas: un drone con el flight controller robusto puede caer por una API REST sin autenticación en el companion computer. Por eso esta plataforma enseña capa por capa.',
        },
        {
          id: 'summary',
          type: 'text',
          content:
            'En las siguientes lecciones veremos qué es exactamente la *drone cybersecurity*, cómo se modelan las amenazas contra un UAV, y cuáles son las reglas éticas innegociables del laboratorio.',
        },
      ],
      quiz: {
        id: 'q-what-is-a-drone',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question:
              '¿Cuál de los siguientes elementos NO es típicamente un host atacable en un sistema drone?',
            options: [
              'El companion computer (Linux)',
              'La estación de control en tierra (GCS)',
              'El frame de fibra de carbono',
              'La API en la nube',
            ],
            correctIndex: 2,
            explanation:
              'El frame es hardware pasivo. Los demás son sistemas con IP/puertos/protocolos y por tanto superficie de ataque.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué es un companion computer?',
            options: [
              'El MCU que estabiliza el vuelo',
              'Un ordenador Linux a bordo que ejecuta lógica de misión',
              'La app móvil del piloto',
              'El servidor de la nube del fabricante',
            ],
            correctIndex: 1,
            explanation:
              'El companion computer (Raspberry Pi, Jetson…) corre Linux y suele exponer SSH, APIs y servicios de telemetría.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question:
              'Un drone con un flight controller seguro es automáticamente seguro de extremo a extremo.',
            answer: false,
            explanation:
              'Falso. La seguridad de extremo a extremo depende de TODAS las capas; una API sin auth en el companion computer compromete todo el sistema.',
          },
        ],
      },
    },
    {
      id: 'what-is-drone-sec',
      moduleId: '00-start-here',
      title: '¿Qué es Drone Cybersecurity?',
      slug: 'what-is-drone-sec',
      duration: '10 min',
      difficulty: 'beginner',
      summary:
        'Drone Cybersecurity es la disciplina que aplica seguridad ofensiva y defensiva a sistemas UAV. Aquí enmarcamos el campo, sus amenazas reales y por qué importa.',
      objectives: [
        'Definir drone cybersecurity',
        'Listar categorías de amenazas contra UAV',
        'Entender el impacto de un incidente de seguridad en un drone',
      ],
      sections: [
        {
          id: 'def',
          type: 'text',
          content:
            '**Drone Cybersecurity** es el conjunto de prácticas para proteger la confidencialidad, integridad y disponibilidad de un sistema UAV y de los datos que genera, así como la disciplina ofensiva que las evalúa.\n\nNo es un subcampo exótico: combina **seguridad de redes**, **sistemas embebidos**, **radio frecuencia**, **API security** y **firmware analysis**. Lo que lo hace distinto es que el activo protegido *vuela* y puede causar daño físico si se compromete.',
        },
        {
          id: 'threats',
          type: 'table',
          caption: 'Categorías de amenazas contra UAV',
          headers: ['Categoría', 'Ejemplo', 'Impacto'],
          rows: [
            ['Intercepción de radio', 'Capturar telemetría MAVLink sin cifrar', 'Pérdida de confidencialidad'],
            ['Replay / inyección', 'Reenviar un comando TAKEOFF capturado', 'Pérdida de control'],
            ['Jamming', 'Saturar 2.4 GHz con ruido', 'Pérdida de enlace, failsafe'],
            ['GPS spoofing', 'Falsar señales GNSS', 'Desvío de ruta'],
            ['Compromiso de GCS', 'Malware en el portátil del piloto', 'Secuestro total'],
            ['API abuse', 'IDOR en /api/drone/{id}/config', 'Modificación remota'],
            ['Firmware tampering', 'Backdoor en una actualización', 'Persistencia'],
            ['Physical access', 'USB/SD card extraída del companion', 'Extracción de datos'],
          ],
        },
        {
          id: 'impact',
          type: 'callout',
          variant: 'danger',
          title: 'Por qué importa más que un servidor normal',
          content:
            'Comprometer un servidor web puede causar pérdida de datos. Comprometer un drone puede causar **pérdida de control en vuelo**, con consecuencias físicas: caída sobre personas, interrupción de servicios críticos, vigilancia no autorizada o uso del drone como arma física. Por eso el modelado de amenazas y los failsafes son parte de la seguridad, no solo del diseño.',
        },
        {
          id: 'discipline',
          type: 'text',
          content:
            'Esta plataforma cubre tanto el lado **ofensivo** (reconocimiento, captura, análisis de protocolos, fuzzing, explotación en laboratorio) como el **defensivo** (hardening, detección, respuesta a incidentes, forense). La filosofía es: *si sabes cómo se ataca, sabes cómo se defiende.*',
        },
        {
          id: 'legal',
          type: 'callout',
          variant: 'legal',
          title: 'Alcance legal y ético',
          content:
            'En muchos países interferir con drones ajenos, capturar sus comunicaciones o acceder a sus sistemas sin autorización es **delito** (ej. EE.UU.: 18 U.S.C. § 1039, CFAA; UE: leyes nacionales de comunicaciones). Esta plataforma solo autoriza prácticas contra tu propio hardware, laboratorios simulados y targets explícitamente diseñados para entrenamiento. El resto es teoría conceptual.',
        },
      ],
      quiz: {
        id: 'q-drone-sec',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué distingue a la drone cybersecurity de la seguridad web tradicional?',
            options: [
              'Usa los mismos protocolos, sin diferencia',
              'El activo protegido es físico y puede causar daño material',
              'No aplica el modelado de amenazas',
              'Nunca involucra redes',
            ],
            correctIndex: 1,
            explanation:
              'Un drone comprometido puede caer, desviarse o causar daño físico. Eso cambia el modelo de riesgo.',
          },
          {
            id: 'q2',
            type: 'scenario',
            question:
              'Encuentras un drone aterrizado en tu jardín. ¿Qué acción es éticamente aceptable dentro del alcance de esta plataforma?',
            options: [
              'Extraerle la SD card y analizar el firmware',
              'Escuchar su Wi-Fi con aircrack-ng',
              'Ninguna: no es tuyo ni tienes autorización explícita',
              'Hacer nmap a su IP',
            ],
            correctIndex: 2,
            explanation:
              'Sin autorización explícita del propietario, cualquier acceso es fuera de alcance. La plataforma exige scope explícito.',
          },
        ],
      },
    },
    {
      id: 'attack-surfaces',
      moduleId: '00-start-here',
      title: 'Superficies de ataque y threat model',
      slug: 'attack-surfaces',
      duration: '15 min',
      difficulty: 'beginner',
      summary:
        'Aplicamos STRIDE a un sistema drone y construimos un threat model visual. Aprende a razonar sobre activos, vectores y límites de confianza antes de tocar herramientas.',
      objectives: [
        'Aplicar STRIDE a un sistema UAV',
        'Identificar activos, vectores y límites de confianza',
        'Construir un threat model básico',
      ],
      sections: [
        {
          id: 'stride-intro',
          type: 'text',
          content:
            '**STRIDE** es un mnemotécnico de Microsoft para clasificar amenazas: **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**enial of service, **E**levation of privilege. Lo aplicamos componente por componente del drone.',
        },
        {
          id: 'stride-table',
          type: 'table',
          caption: 'STRIDE aplicado a componentes drone',
          headers: ['Componente', 'Amenaza típica', 'Categoría STRIDE'],
          rows: [
            ['Radio link', 'Capturar telemetría sin cifrar', 'Information disclosure'],
            ['Radio link', 'Reinyectar comando de vuelo', 'Tampering'],
            ['Radio link', 'Jamming del enlace', 'Denial of service'],
            ['Companion SSH', 'Brute force de credenciales', 'Elevation of privilege'],
            ['GCS', 'Malware en el portátil del piloto', 'Tampering + EoP'],
            ['API cloud', 'IDOR en /drone/{id}/logs', 'Information disclosure'],
            ['Firmware', 'Backdoor en update', 'Tampering'],
            ['GPS', 'Spoofing de señal GNSS', 'Spoofing'],
            ['Telemetría', 'Negar que se envió una orden', 'Repudiation'],
          ],
        },
        {
          id: 'assets',
          type: 'steps',
          title: 'Activos a proteger',
          steps: [
            {
              title: 'Control de la aeronave',
              content: 'El activo más crítico. Si se pierde, hay riesgo físico inmediato.',
            },
            {
              title: 'Telemetría y posición',
              content: 'GPS, ruta, batería. Su exposición filtra operaciones y ubicaciones.',
            },
            {
              title: 'Video / sensor data',
              content: 'Streams RTSP, imágenes. Frecuentemente sin cifrar.',
            },
            {
              title: 'Credenciales y claves',
              content: 'Tokens API, claves WiFi, certificados. En firmware y companion.',
            },
            {
              title: 'Integridad del firmware',
              content: 'Si se modifica, todo el sistema es sospechoso de raíz.',
            },
          ],
        },
        {
          id: 'trust-boundaries',
          type: 'diagram',
          title: 'Límites de confianza',
          ascii: `   ┌─────────────┐        Trust Boundary 1        ┌──────────────┐
   │   Internet  │ ◀────── API / Cloud ─────────▶ │  Drone Cloud │
   └──────┬──────┘                                 └──────┬───────┘
          │                                               │
   ┌──────▼──────┐        Trust Boundary 2        ┌──────▼───────┐
   │  App móvil  │ ◀──── Wi-Fi / LTE ────────────▶ │     GCS      │
   └─────────────┘                                 └──────┬───────┘
                                                          │ Radio (Trust Boundary 3)
                                                   ┌──────▼───────┐
                                                   │     Drone    │
                                                   │  FC + Comp.  │
                                                   └──────────────┘`,
          description:
            'Cada flecha cruza un límite de confianza. En cada cruce debes preguntarte: ¿está autenticado? ¿está cifrado? ¿hay integridad (MAC/HMAC)? ¿hay rate limiting?',
        },
        {
          id: 'exercise',
          type: 'callout',
          variant: 'tip',
          title: 'Ejercicio mental',
          content:
            'Antes de seguir: coge papel (mental) y para tu drone imaginario responde — (1) ¿qué activo es más valioso? (2) ¿qué límite de confianza es más débil? (3) ¿qué categoría STRIDE no has cubierto? Ese razonamiento es el 80% del trabajo ofensivo serio.',
        },
      ],
      quiz: {
        id: 'q-attack-surfaces',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Capturar telemetría MAVLink sin cifrar corresponde a qué categoría STRIDE?',
            options: ['Tampering', 'Information disclosure', 'Spoofing', 'Repudiation'],
            correctIndex: 1,
            explanation: 'Se revela información (posición, batería, modo) sin alterar nada.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'Reinyectar un comando TAKEOFF previamente capturado es:',
            options: ['Spoofing', 'Repudiation', 'Tampering', 'Denial of service'],
            correctIndex: 2,
            explanation: 'Se altera el estado del sistema inyectando datos manipulados (replay).',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'El activo más crítico en un sistema drone suele ser el video stream.',
            answer: false,
            explanation: 'Lo más crítico es el control de la aeronave (pérdida = riesgo físico).',
          },
        ],
      },
    },
    {
      id: 'lab-rules',
      moduleId: '00-start-here',
      title: 'Reglas del laboratorio y ética',
      slug: 'lab-rules',
      duration: '8 min',
      difficulty: 'beginner',
      summary:
        'Las reglas innegociables. Qué puedes y qué NO puedes hacer con esta plataforma, y por qué el scope aislado protege tanto al objetivo como a ti.',
      objectives: [
        'Memorizar las reglas del laboratorio',
        'Reconocer targets válidos vs prohibidos',
        'Entender el modelo de laboratorio aislado',
      ],
      sections: [
        {
          id: 'rule',
          type: 'callout',
          variant: 'legal',
          title: 'Regla fundamental',
          content:
            'Toda práctica ofensiva en esta plataforma se realiza EXCLUSIVAMENTE contra: drones virtuales, simuladores, firmware deliberadamente vulnerable, máquinas virtuales, containers, redes de laboratorio aisladas, o hardware propio con autorización explícita. Cualquier otra cosa está fuera de alcance y puede ser ilegal.',
        },
        {
          id: 'targets',
          type: 'table',
          caption: 'Targets válidos en el laboratorio',
          headers: ['Target', 'Válido', 'Notas'],
          rows: [
            ['drone-lab.local', '✅', 'Host virtual del laboratorio'],
            ['192.168.56.0/24', '✅', 'Red host-only de VirtualBox'],
            ['10.10.10.0/24', '✅', 'Red de laboratorio aislada'],
            ['localhost / 127.0.0.1', '✅', 'Servicios locales del estudiante'],
            ['Docker containers', '✅', 'Servicios vulnerables controlados'],
            ['dronevecina.local', '❌', 'Nunca, sin autorización explícita'],
            ['Drones reales en el parque', '❌', 'Ilegal en la mayoría de jurisdicciones'],
            ['Redes Wi-Fi ajenas', '❌', 'Fuera de alcance'],
          ],
        },
        {
          id: 'safe',
          type: 'callout',
          variant: 'success',
          title: 'Cómo se garantiza el aislamiento',
          content:
            'El laboratorio de esta plataforma es **100% simulado en el navegador**: el terminal, los paquetes, el drone y la API son simulaciones que NO generan tráfico real hacia fuera. Puedes experimentar libremente. Cuando una técnica sea conceptualmente aplicable al mundo real, se explicará teóricamente y se practicarán variantes seguras contra el simulador.',
        },
        {
          id: 'mindset',
          type: 'text',
          content:
            'El objetivo no es aprender a atacar drones reales. Es **entender cómo se rompen los sistemas UAV para construirlos y defenderlos mejor**. Esa distinción es lo que separa a un profesional de un delincuente.',
        },
      ],
      quiz: {
        id: 'q-lab-rules',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Cuál de los siguientes es un target válido para los labs?',
            options: ['192.168.56.0/24', 'Un drone real del vecino', 'scanme.nmap.org', 'La red Wi-Fi de un café'],
            correctIndex: 0,
            explanation: 'Solo redes de laboratorio aisladas y hardware propio autorizado.',
          },
          {
            id: 'q2',
            type: 'true-false',
            question:
              'El laboratorio de esta plataforma genera tráfico real hacia drones simulados externos.',
            answer: false,
            explanation: 'Todo es simulado en el navegador. Cero tráfico saliente hacia drones.',
          },
        ],
      },
    },
    {
      id: 'environment-setup',
      moduleId: '00-start-here',
      title: 'Preparar tu entorno',
      slug: 'environment-setup',
      duration: '10 min',
      difficulty: 'beginner',
      summary:
        'Qué necesitas para seguir la plataforma. Spoiler: casi nada. Un navegador moderno y, opcionalmente, una VM Linux para los labs externos.',
      objectives: [
        'Saber qué hace falta para seguir el curso',
        'Conocer las herramientas externas recomendadas',
        'Probar el terminal integrado',
      ],
      sections: [
        {
          id: 'minimum',
          type: 'text',
          content:
            'Esta plataforma es **autosuficiente para FASE I**: el terminal, los visualizadores de paquetes y los simuladores corren en tu navegador. No necesitas instalar nada para empezar.\n\nPara fases avanzadas (Wi-Fi real, firmware analysis con binwalk/Ghidra, fuzzing con honggfuzz) recomendamos una VM Linux (Kali, Parrot o Ubuntu) que puedes aislar en VirtualBox con una red host-only `192.168.56.0/24`.',
        },
        {
          id: 'recommended',
          type: 'table',
          caption: 'Stack recomendado para labs externos (fases avanzadas)',
          headers: ['Herramienta', 'Para qué', 'Instalación típica'],
          rows: [
            ['Wireshark', 'Captura y análisis de paquetes', 'apt install wireshark'],
            ['tcpdump', 'Captura en CLI', 'apt install tcpdump'],
            ['nmap', 'Descubrimiento y enumeración', 'apt install nmap'],
            ['aircrack-ng', 'Análisis Wi-Fi 802.11', 'apt install aircrack-ng'],
            ['binwalk', 'Análisis de firmware', 'pip install binwalk'],
            ['Ghidra', 'Ingeniería inversa de binarios', 'descarga oficial NSA'],
            ['mitmproxy', 'Proxy HTTP/HTTPS', 'pip install mitmproxy'],
            ['Burp Suite', 'Web/API security', 'edición comunitaria'],
          ],
        },
        {
          id: 'terminal-test',
          type: 'interactive-terminal',
          title: 'Prueba el terminal del laboratorio',
          description:
            'Este terminal reconoce un subconjunto seguro de comandos. Pruébalo: escribe `help` para ver qué entiende.',
          preset: 'whoami',
        },
        {
          id: 'next',
          type: 'callout',
          variant: 'tip',
          title: '¿Listo?',
          content:
            'Si el terminal respondió a `whoami`, tu entorno está listo. La siguiente lección es tu primera misión: usar el terminal para encontrar el drone virtual del laboratorio.',
        },
      ],
      quiz: {
        id: 'q-env',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué necesitas para completar FASE I de esta plataforma?',
            options: [
              'Una VM Kali con 8 GB de RAM',
              'Un drone real',
              'Solo un navegador moderno',
              'Una tarjeta Wi-Fi monitor mode',
            ],
            correctIndex: 2,
            explanation: 'FASE I es 100% en el navegador. El resto es para fases avanzadas.',
          },
        ],
      },
    },
    {
      id: 'first-mission',
      moduleId: '00-start-here',
      title: 'Tu primera misión',
      slug: 'first-mission',
      duration: '15 min',
      difficulty: 'beginner',
      summary:
        'Misión práctica de calentamiento. Usas el terminal para descubrir la red del laboratorio y obtener tu primera flag. Sin teoría, solo acción guiada.',
      objectives: [
        'Usar el terminal para enumerar la red virtual',
        'Identificar el drone simulado',
        'Capturar tu primera flag',
      ],
      sections: [
        {
          id: 'briefing',
          type: 'callout',
          variant: 'info',
          title: 'Briefing',
          content:
            'Acabas de llegar al laboratorio. Hay un drone virtual escondido en la red `10.10.10.0/24`. Tu misión: encontrarlo, identificar su servicio de telemetría y recuperar la flag que expone.',
        },
        {
          id: 'step1',
          type: 'steps',
          title: 'Procedimiento',
          steps: [
            {
              title: '1. Verifica tu identidad',
              content: 'Averigua quién eres en el laboratorio.',
              code: 'whoami',
            },
            {
              title: '2. Inspecciona tus interfaces',
              content: 'Mira qué red ves.',
              code: 'ip addr',
            },
            {
              title: '3. Escanea la red del laboratorio',
              content: 'Busca hosts vivos en 10.10.10.0/24.',
              code: 'nmap -sn 10.10.10.0/24',
            },
            {
              title: '4. Enumera puertos del drone',
              content: 'Una vez localizado, mira qué puertos abre.',
              code: 'nmap -sV 10.10.10.10',
            },
            {
              title: '5. Consulta la API del drone',
              content: 'El drone expone una API HTTP. Investígala.',
              code: 'curl http://10.10.10.10/api/drone/status',
            },
            {
              title: '6. Encuentra la flag',
              content:
                'Algunos endpoints del drone devuelven datos sensibles. Explora /api/drone/telemetry y /api/drone/config hasta encontrar la flag.',
            },
          ],
        },
        {
          id: 'terminal',
          type: 'interactive-terminal',
          title: 'Terminal de misión',
          description: 'Ejecuta los comandos anteriores aquí. El simulador responde como el laboratorio real respondería.',
        },
        {
          id: 'flag',
          type: 'flag-challenge',
          labId: 'lab-00-first-mission',
          title: 'Flag de la misión',
          prompt:
            'Tras explorar la API del drone, encuentra la flag con formato DRLAB{...} y envíala aquí.',
          expectedFlag: 'DRLAB{welcome_to_the_lab}',
          hint: 'curl http://10.10.10.10/api/drone/config — la flag está en la configuración del drone virtual.',
          points: 150,
        },
        {
          id: 'debrief',
          type: 'callout',
          variant: 'success',
          title: 'Debriefing',
          content:
            'Acabas de ejecutar el ciclo básico ofensivo: **reconocimiento → enumeración → explotación (de info expuesta) → captura de flag**. Las próximas lecciones profundizan en cada paso con rigor técnico. Bienvenido al laboratorio.',
        },
      ],
    },
  ],
  labs: [
    {
      id: 'lab-00-first-mission',
      moduleId: '00-start-here',
      number: '00',
      title: 'Find the Drone',
      difficulty: 'beginner',
      category: 'network',
      objective: 'Descubrir el drone virtual del laboratorio y capturar su primera flag.',
      context:
        'Acabas de llegar al laboratorio. La red es 10.10.10.0/24. Hay un drone virtual escondido.',
      target: '10.10.10.0/24',
      recon: [
        'whoami — tu identidad en el lab',
        'ip addr — tu interfaz',
        'nmap -sn 10.10.10.0/24 — descubrir hosts',
      ],
      clues: [
        'El drone responde en 10.10.10.10',
        'Tiene un puerto HTTP abierto',
        'Expone una API REST',
      ],
      tools: ['nmap', 'curl'],
      hints: [
        'El endpoint /api/drone/status muestra el estado',
        'El endpoint /api/drone/config expone la flag',
      ],
      tasks: [
        'Identificar la IP del drone',
        'Enumerar sus puertos',
        'Consultar /api/drone/status',
        'Encontrar la flag en /api/drone/config',
      ],
      flag: 'DRLAB{welcome_to_the_lab}',
      flagPrompt: 'Envía la flag con formato DRLAB{...}',
      solution: [
        'nmap -sn 10.10.10.0/24 → host vivo 10.10.10.10',
        'nmap -sV 10.10.10.10 → puerto 80 (HTTP) abierto',
        'curl http://10.10.10.10/api/drone/status → estado del drone',
        'curl http://10.10.10.10/api/drone/config → flag expuesta por info disclosure',
      ],
      mitigation: [
        'No exponer /api/drone/config sin autenticación',
        'Aplicar RBAC: la configuración solo para roles admin',
        'Filtrar el flag en logs y respuestas de producción',
      ],
    },
  ],
}
