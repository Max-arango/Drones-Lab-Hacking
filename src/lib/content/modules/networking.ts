import type { ContentModule } from '../types'

/**
 * Module 02 — Networking desde cero.
 * Versión inicial (FASE I): lecciones de packets/encapsulamiento, TCP/UDP,
 * y la animación de una petición atravesando Laptop → Router → Drone.
 */
export const networkingModule: ContentModule = {
  id: '02-networking',
  number: '02',
  title: 'Networking desde cero',
  subtitle: 'Cómo viajan los bits entre el drone y el suelo',
  slug: 'networking',
  group: 'foundation',
  difficulty: 'beginner',
  estimatedTime: '4 h',
  prerequisites: ['00-start-here'],
  description:
    'Redes sin humo: packets, frames, headers, MAC, IP, puertos, sockets, TCP/UDP, ARP, DHCP, DNS. Con una animación interactiva de una petición Laptop → Router → Drone.',
  icon: 'Network',
  status: 'available',
  outcomes: [
    'Explicar encapsulamiento capa por capa',
    'Distinguir TCP de UDP y cuándo importa en drones',
    'Leer un handshake TCP y una tabla ARP',
    'Trazar el camino de un paquete con animación interactiva',
  ],
  tools: ['ip', 'ping', 'dig'],
  lessons: [
    {
      id: 'packets-and-layers',
      moduleId: '02-networking',
      title: 'Paquetes, frames y capas',
      slug: 'packets-layers',
      duration: '18 min',
      difficulty: 'beginner',
      summary:
        'Qué es un paquete, qué es un frame, cómo se encapsulan los datos capa por capa (Ethernet → IP → TCP/UDP → Payload) y por qué esa cebolla es la base de todo análisis de tráfico.',
      objectives: [
        'Definir paquete, frame, segmento, datagrama',
        'Explicar encapsulamiento',
        'Reconocer headers vs payload',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Cuando tu app móvil manda `TAKEOFF` al drone, esa orden no vuela entera por el aire. Se **encapsula**: se envuelve en sucesivas capas de metadata, como una muñeca rusa, hasta convertirse en ondas de radio o pulsos eléctricos.\n\nEntender esa cebolla es **la habilidad más importante** de este curso. Sin ella, Wireshark es ruido; con ella, ves la anatomía de cada comunicación.',
        },
        {
          id: 'terms',
          type: 'table',
          caption: 'Vocabulario por capa',
          headers: ['Término', 'Capa', 'Qué contiene'],
          rows: [
            ['Frame', 'Enlace (L2)', 'Header Ethernet + payload (MAC origen/destino)'],
            ['Packet', 'Red (L3)', 'Header IP + payload (IP origen/destino)'],
            ['Segment / Datagram', 'Transporte (L4)', 'Header TCP/UDP + payload (puertos)'],
            ['Payload', 'Aplicación (L7)', 'Los datos reales (MAVLink, HTTP, JSON)'],
          ],
        },
        {
          id: 'packet-viz',
          type: 'packet',
          title: 'Un paquete MAVLink diseccionado',
          description:
            'Cada bloque es una capa. En el laboratorio real podrás hacer click en cada una para ver sus campos.',
          layers: [
            {
              name: 'Ethernet',
              color: 'ethernet',
              fields: [
                { label: 'dst MAC', value: '08:00:27:a8:4c:1f', note: 'MAC del router' },
                { label: 'src MAC', value: 'b8:27:eb:11:22:33', note: 'MAC del companion' },
                { label: 'ethertype', value: '0x0800', note: 'IPv4' },
              ],
              description: 'Capa de enlace: entrega local entre nodos directamente conectados.',
            },
            {
              name: 'IPv4',
              color: 'ip',
              fields: [
                { label: 'src IP', value: '10.10.10.10', note: 'drone' },
                { label: 'dst IP', value: '10.10.10.20', note: 'GCS' },
                { label: 'protocol', value: '17 (UDP)', note: 'MAVLink usa UDP' },
                { label: 'TTL', value: '64', note: 'saltos máximos' },
              ],
              description: 'Capa de red: routing entre redes, direcciones IP lógicas.',
            },
            {
              name: 'UDP',
              color: 'udp',
              fields: [
                { label: 'src port', value: '14550', note: 'MAVLink telemetry' },
                { label: 'dst port', value: '14550', note: 'GCS escucha aquí' },
                { label: 'length', value: '31' },
              ],
              description: 'Capa de transporte: multiplexación por puertos, sin conexión.',
            },
            {
              name: 'MAVLink',
              color: 'mavlink',
              fields: [
                { label: 'msgid', value: '0 (HEARTBEAT)', note: 'mensaje de presencia' },
                { label: 'sysid', value: '1', note: 'drone #1' },
                { label: 'compid', value: '1', note: 'autopilot' },
                { label: 'seq', value: '142', note: 'secuencia' },
              ],
              description: 'Capa de aplicación: el comando real que entiende el flight controller.',
            },
          ],
        },
        {
          id: 'encap',
          type: 'diagram',
          title: 'Encapsulamiento',
          ascii: `  App层   [   MAVLink HEARTBEAT payload   ]
              ↓ add UDP header
  L4层    [ UDP |   MAVLink HEARTBEAT payload   ]
              ↓ add IP header
  L3层    [ IP | UDP |   MAVLink HEARTBEAT payload   ]
              ↓ add Ethernet header + FCS
  L2层    [ ETH | IP | UDP |   MAVLink HEARTBEAT payload   | FCS ]
              ↓
              bits en el cable / ondas en el aire`,
          description:
            'Al enviar, cada capa añade su header. Al recibir, cada capa quita el suyo y pasa el resto arriba. Como una cebolla que se pelá en cada salto.',
        },
        {
          id: 'why',
          type: 'callout',
          variant: 'tip',
          title: 'Por qué importa para hackear',
          content:
            'Cada capa es un punto de observación Y de ataque. En L2 puedes hacer ARP spoofing; en L3, IP spoofing y routing attacks; en L4, port scan y UDP flood; en L7, inyección de comandos MAVLink. Sin saber las capas, no sabes dónde estás atacando.',
        },
      ],
      quiz: {
        id: 'q-packets',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿En qué capa opera un frame Ethernet?',
            options: ['L3 Red', 'L2 Enlace', 'L4 Transporte', 'L7 Aplicación'],
            correctIndex: 1,
            explanation: 'Los frames son L2: entrega local por MAC.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué contiene el payload de un paquete que lleva MAVLink sobre UDP sobre IP?',
            options: [
              'Solo el header IP',
              'El header Ethernet',
              'El mensaje MAVLink (HEARTBEAT, etc.)',
              'El número de puerto',
            ],
            correctIndex: 2,
            explanation: 'El payload es L7: el mensaje MAVLink real. Los headers son metadata.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'Encapsulamiento significa que cada capa añade su propio header al enviar.',
            answer: true,
            explanation: 'Correcto. Y lo quita al recibir, capa por capa.',
          },
        ],
      },
    },
    {
      id: 'tcp-udp',
      moduleId: '02-networking',
      title: 'TCP vs UDP (y por qué los drones aman UDP)',
      slug: 'tcp-udp',
      duration: '20 min',
      difficulty: 'beginner',
      summary:
        'TCP orientado a conexión, confiable. UDP sin conexión, rápido. Los drones usan UDP para telemetría porque la latencia mata, y TCP para APIs. Aquí entiendes la diferencia de verdad.',
      objectives: [
        'Diferenciar TCP y UDP',
        'Explicar el 3-way handshake',
        'Justificar por qué MAVLink usa UDP',
      ],
      sections: [
        {
          id: 'compare',
          type: 'table',
          caption: 'TCP vs UDP',
          headers: ['Aspecto', 'TCP', 'UDP'],
          rows: [
            ['Conexión', 'Sí (3-way handshake)', 'No'],
            ['Fiabilidad', 'Confiable, retransmite', 'Best effort, puede perderse'],
            ['Orden', 'Garantizado', 'No garantizado'],
            ['Overhead', 'Alto (20+ bytes header)', 'Bajo (8 bytes header)'],
            ['Use case drone', 'API HTTP, SSH, RTSP control', 'Telemetría MAVLink, video'],
          ],
        },
        {
          id: 'handshake',
          type: 'diagram',
          title: 'TCP 3-way handshake',
          ascii: `  Cliente                        Servidor
     │                                │
     │ ───── SYN (seq=x) ──────────▶  │   "quiero hablar"
     │                                │
     │ ◀── SYN-ACK (seq=y, ack=x+1) ─  │   "vale, yo también"
     │                                │
     │ ───── ACK (ack=y+1) ────────▶  │   "confirmo, empezamos"
     │                                │
     │ ═════ datos bidireccionales ═══ │
     │                                │`,
          description:
            'TCP establece conexión antes de enviar datos. Ese handshake es visible en Wireshark y es la base para distinguir "new connection" vs "ongoing".',
        },
        {
          id: 'udp-flow',
          type: 'diagram',
          title: 'UDP: dispara y olvida',
          ascii: `  Cliente                        Servidor
     │                                │
     │ ───── datagrama 1 ──────────▶  │
     │ ───── datagrama 2 ──────────▶  │   sin handshake
     │ ───── datagrama 3 ──────────▶  │   sin confirmación
     │           (se pierde ✗)        │
     │ ───── datagrama 4 ──────────▶  │
     │                                │`,
          description:
            'UDP envía datagramas sin establecer conexión. Si se pierden, no se retransmiten. Perfecto para telemetría: más vale un paquete nuevo que un paquete viejo retransmitido.',
        },
        {
          id: 'why-drone',
          type: 'callout',
          variant: 'info',
          title: 'Por qué MAVLink usa UDP',
          content:
            'La telemetría de un drone cambia constantemente (posición, actitud). Un paquete viejo retransmitido es **información obsoleta**: peor que no tenerlo. UDP permite que cada paquete nuevo reemplace al perdido. La latencia baja también es crítica para control en tiempo real. Por eso MAVLink, por defecto, va por UDP.\n\nLa contrapartida: UDP no tiene handshake, así que **cualquiera puede inyectar paquetes**. De ahí la importancia de autenticar mensajes (firmas) en MAVLink v2 con extensiones de seguridad.',
        },
        {
          id: 'tcp-uses',
          type: 'text',
          content:
            'No todo es UDP en un drone. **TCP** se usa cuando importa la integridad sobre la latencia:\n\n- **API REST** (HTTP/HTTPS) — necesitas la respuesta completa\n- **SSH** al companion computer — sesión interactiva confiable\n- **RTSP control channel** — señalización del stream\n- **MAVLink sobre TCP** — algunas GCS lo permiten para links con pérdidas\n\nConocer qué protocolo usa cada servicio te dice qué esperar en una captura y qué ataques son viables.',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description: 'Usa `ss -tulpn` para ver qué puertos TCP y UDP escucha el companion. ¿Cuál es telemetría (UDP 14550) y cuál API (TCP 80)?',
        },
      ],
      quiz: {
        id: 'q-tcp-udp',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Cuál es la principal razón por la que MAVLink usa UDP?',
            options: [
              'Porque es más seguro',
              'Porque la latencia baja y los paquetes viejos no sirven',
              'Porque TCP no soporta drones',
              'Porque UDP encripta automáticamente',
            ],
            correctIndex: 1,
            explanation: 'La telemetría en tiempo real prefiere perder un paquete que retransmitir uno obsoleto.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Cuántos paquetes tiene el TCP 3-way handshake?',
            options: ['2', '3', '4', '5'],
            correctIndex: 1,
            explanation: 'SYN, SYN-ACK, ACK: tres paquetes.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'UDP permite a cualquiera inyectar paquetes sin establecer conexión previa.',
            answer: true,
            explanation: 'Verdadero. Por eso la auth de mensajes (firmas) es crítica en MAVLink.',
          },
        ],
      },
    },
    {
      id: 'mac-ip-ports',
      moduleId: '02-networking',
      title: 'MAC, IP, puertos y sockets',
      slug: 'mac-ip-ports',
      duration: '15 min',
      difficulty: 'beginner',
      summary:
        'Cuatro conceptos que la gente confunde: MAC (quién en la red local), IP (quién en Internet), puerto (qué servicio), socket (la combinación). Con animación de Laptop → Router → Drone.',
      objectives: [
        'Distinguir MAC, IP, puerto y socket',
        'Trazar cómo cambian las direcciones en cada salto',
        'Entender ARP',
      ],
      sections: [
        {
          id: 'defs',
          type: 'table',
          caption: 'Las cuatro direcciones',
          headers: ['Concepto', 'Capa', 'Ejemplo', 'Ambito'],
          rows: [
            ['MAC', 'L2', 'b8:27:eb:11:22:33', 'Local (un segmento de red)'],
            ['IP', 'L3', '10.10.10.10', 'Global (entre redes)'],
            ['Puerto', 'L4', '14550', 'Multiplexación de servicios'],
            ['Socket', 'L4', '10.10.10.10:14550', 'Endpoint concreto de comunicación'],
          ],
        },
        {
          id: 'flow',
          type: 'diagram',
          title: 'Una petición Laptop → Router → Drone',
          ascii: `  ┌─────────┐                      ┌─────────┐                      ┌─────────┐
  │ Laptop  │                      │ Router  │                      │  Drone  │
  │ .20     │                      │  .1     │                      │ .10     │
  └────┬────┘                      └────┬────┘                      └────┬────┘
       │                                 │                                 │
       │  ETH dst=router MAC             │  ETH dst=drone MAC              │
       │  IP  src=10.10.10.20            │  IP  src=10.10.10.20            │
       │      dst=10.10.10.10            │      dst=10.10.10.10            │
       │  UDP sport=54321 dport=14550    │  UDP sport=54321 dport=14550    │
       │ ──────────────────────────────▶ │ ──────────────────────────────▶ │
       │                                 │                                 │
       │   (la IP origen/destino NO cambia; la MAC sí en cada salto L2)  │`,
          description:
            'La **IP es global**: identifica origen y destino de extremo a extremo. La **MAC es local**: cambia en cada salto porque identifica "el próximo en la cadena".',
        },
        {
          id: 'arp',
          type: 'text',
          content:
            '**ARP** (Address Resolution Protocol) es el puente entre L3 (IP) y L2 (MAC). Cuando el laptop quiere hablar con `10.10.10.10` pero solo conoce la IP, hace una pregunta broadcast: *"¿Quién es 10.10.10.10? Dime tu MAC"*. El drone responde y el laptop guarda la pareja en su caché ARP.\n\n`ip neigh` te muestra esa caché. Es oro en reconocimiento: te dice qué hosts han hablado recientemente.',
        },
        {
          id: 'arp-cmd',
          type: 'terminal',
          caption: 'Caché ARP',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ip neigh' },
            {
              output: `10.10.10.1 dev eth0 lladdr 08:00:27:a8:4c:1f REACHABLE
10.10.10.10 dev eth0 lladdr b8:27:eb:11:22:33 REACHABLE
10.10.10.30 dev eth0 lladdr 00:1b:44:11:22:33 STALE`,
            },
          ],
        },
        {
          id: 'socket',
          type: 'callout',
          variant: 'info',
          title: 'Socket = el endpoint real',
          content:
            'Un **socket** es la tupla concreta `(IP, puerto, protocolo)`. Cuando el drone escucha telemetría en `10.10.10.10:14550/udp`, eso es un socket. La conexión entre dos sockets (origen y destino) forma un "flow". En Wireshark, Follow Stream sigue exactamente un flow entre dos sockets.',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description: 'Prueba `ip addr`, `ip neigh`, `ss -tulpn`. Identifica MAC, IP y puertos de tu companion virtual.',
        },
      ],
      quiz: {
        id: 'q-macip',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué dirección cambia en cada salto de un paquete?',
            options: ['IP origen', 'IP destino', 'MAC', 'Puerto destino'],
            correctIndex: 2,
            explanation: 'La MAC es local al enlace y cambia en cada router. La IP es de extremo a extremo.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'ARP sirve para:',
            options: [
              'Resolver un nombre DNS a IP',
              'Resolver una IP a una MAC',
              'Asignar una IP por DHCP',
              'Cifrar un enlace',
            ],
            correctIndex: 1,
            explanation: 'ARP mapea IP → MAC en una red local.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'Un socket es la combinación de IP, puerto y protocolo.',
            answer: true,
            explanation: 'Exacto. Es el endpoint concreto de comunicación.',
          },
        ],
      },
    },
    {
      id: 'tcp-handshake-deep',
      moduleId: '02-networking',
      title: 'TCP handshake y states en profundidad',
      slug: 'tcp-handshake-deep',
      duration: '18 min',
      difficulty: 'beginner',
      summary:
        'El 3-way handshake no es solo "SYN, SYN-ACK, ACK": cada paquete lleva números de secuencia, la conexión pasa por estados (LISTEN, SYN_SENT, ESTABLISHED, CLOSE_WAIT, TIME_WAIT) y el teardown con FIN/ACK también importa. Aprende a leer `ss -tan` y por qué TIME_WAIT puede llenar un servidor.',
      objectives: [
        'Describir SYN / SYN-ACK / ACK con sequence numbers',
        'Listar los estados de una conexión TCP y su significado',
        'Leer la salida de `ss -tan` y filtrar por estado',
        'Explicar el teardown con FIN/ACK y por qué existe TIME_WAIT',
      ],
      sections: [
        {
          id: 'thd-intro',
          type: 'text',
          content:
            'TCP es **orientado a conexión**: antes de mandar un solo byte de datos, cliente y servidor negocian. Esa negociación es el **3-way handshake**. Cada paquete lleva un *sequence number* (seq) y un *acknowledgment number* (ack) que permiten a ambas partes saber qué datos se han recibido y cuáles faltan.\n\nEl handshake no es una formalidad: cada paso mueve la conexión entre **estados** (`LISTEN`, `SYN_SENT`, `ESTABLISHED`, …). Saber leer esos estados te dice si un puerto está a medio abrir, si una conexión se está cerrando o si quedó colgada en `TIME_WAIT`.',
        },
        {
          id: 'thd-diagram',
          type: 'diagram',
          title: 'Handshake + teardown completo',
          ascii: `  Cliente                                   Servidor
     │                                          │
     │                  (servidor en LISTEN)     │
     │                                          │
     │ ─────── SYN (seq=1000, ISN) ──────────▶  │   SYN_SENT  → SYN_RCVD
     │                                          │
     │ ◀── SYN-ACK (seq=5000, ack=1001) ──────  │
     │                                          │
     │ ─────── ACK (ack=5001) ───────────────▶  │   ESTABLISHED ↔ ESTABLISHED
     │                                          │
     │ ═════════ datos (seq crece) ═════════════ │
     │                                          │
     │ ─────── FIN (seq=1500) ───────────────▶  │   FIN_WAIT_1 → CLOSE_WAIT
     │                                          │
     │ ◀────── ACK (ack=1501) ────────────────  │
     │                                          │
     │ ◀────── FIN (seq=5200) ────────────────  │   LAST_ACK
     │                                          │
     │ ─────── ACK (ack=5201) ───────────────▶  │   TIME_WAIT → CLOSED
     │                                          │`,
          description:
            'El ciclo completo: 3 paquetes para abrir, N para intercambiar datos, 4 para cerrar (FIN/ACK en cada dirección). Cada transición es un estado TCP visible con `ss -t`.',
        },
        {
          id: 'thd-states',
          type: 'table',
          caption: 'Estados TCP clave',
          headers: ['Estado', 'Quién', 'Qué significa'],
          rows: [
            ['LISTEN', 'Servidor', 'Esperando conexiones entrantes en un puerto'],
            ['SYN_SENT', 'Cliente', 'Envié SYN, espero SYN-ACK'],
            ['SYN_RCVD', 'Servidor', 'Recibí SYN, envié SYN-ACK, espero ACK final'],
            ['ESTABLISHED', 'Ambos', 'Conexión abierta, datos en vuelo'],
            ['FIN_WAIT_1/2', 'Cliente', 'Inicié el cierre, espero FIN del otro lado'],
            ['CLOSE_WAIT', 'Servidor', 'El otro cerró su lado; me falta mandar mi FIN'],
            ['TIME_WAIT', 'Cliente', 'Cerré; espero 2·MSL antes de liberar el socket'],
          ],
        },
        {
          id: 'thd-ss',
          type: 'terminal',
          caption: 'Ver conexiones y sus estados',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ss -tan state established' },
            {
              output: `Recv-Q Send-Q Local Address:Port   Peer Address:Port   Process
0      0      10.10.10.20:42321   10.10.10.10:8080
0      0      10.10.10.20:51234   10.10.10.10:22`,
            },
            { comment: '# filtra solo las ESTABLISHED' },
            { prompt: 'student@drone-lab:~$', command: 'ss -tan' },
            {
              output: `State      Recv-Q Send-Q Local Address:Port   Peer Address:Port
LISTEN     0      128    0.0.0.0:22           0.0.0.0:*
LISTEN     0      128    0.0.0.0:8080         0.0.0.0:*
ESTAB      0      0      10.10.10.20:42321    10.10.10.10:8080
TIME-WAIT  0      0      10.10.10.20:44500    10.10.10.10:8080`,
            },
          ],
        },
        {
          id: 'thd-timewait',
          type: 'callout',
          variant: 'info',
          title: '¿Por qué existe TIME_WAIT?',
          content:
            'Después de mandar el último ACK del cierre, el lado que **inicia el FIN** entra en `TIME_WAIT` y se queda ahí ~60–120 s (2·MSL). Sirve para dos cosas: (1) asegurarse de que el último ACK llegó al otro lado (si se pierde, el otro retransmite su FIN y reintentamos); (2) que paquetes viejos retrasados de esa conexión no se cuelen en una conexión nueva que reutilice el mismo par de puertos.\n\nEn un servidor muy cargado que abre y cierra miles de conexiones por segundo, `TIME_WAIT` puede agotar los puertos efímeros locales. Por eso existen opciones como `SO_REUSEADDR` y el tuning de `net.ipv4.tcp_tw_reuse`. En el drone no suele ser problema, pero al atacar con herramientas que abren muchas conexiones, lo verás.',
        },
        {
          id: 'thd-try',
          type: 'interactive-terminal',
          title: 'Practica',
          description:
            'Usa `ss -tan`, `ss -tan state established` y `ss -tan state time-wait` en el companion virtual. ¿Cuántas conexiones ESTABLISHED hay? ¿Y en TIME_WAIT?',
          preset: 'ss -tan',
        },
      ],
      quiz: {
        id: 'q-tcp-handshake-deep',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'En un 3-way handshake, ¿qué envía el servidor tras recibir el SYN del cliente?',
            options: ['Solo ACK', 'SYN-ACK', 'FIN', 'RST'],
            correctIndex: 1,
            explanation: 'SYN-ACK: confirma el SYN del cliente (ack) y propone su propio ISN (syn).',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué estado indica que la conexión está abierta y lista para datos?',
            options: ['LISTEN', 'SYN_SENT', 'ESTABLISHED', 'TIME_WAIT'],
            correctIndex: 2,
            explanation: 'ESTABLISHED: ambos lados completaron el handshake.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question:
              'TIME_WAIT existe, entre otras cosas, para que paquetes viejos retrasados no contaminen una conexión nueva.',
            answer: true,
            explanation: 'Correcto. Es la razón de esperar 2·MSL antes de liberar el socket.',
          },
        ],
      },
    },
    {
      id: 'arp-dhcp-dns',
      moduleId: '02-networking',
      title: 'ARP, DHCP y DNS',
      slug: 'arp-dhcp-dns',
      duration: '20 min',
      difficulty: 'beginner',
      summary:
        'Tres protocolos que sostienen toda red IP: ARP (IP → MAC en la LAN), DHCP (autoconfiguración de IP) y DNS (nombre → IP). Sin ellos, el drone no sabría a quién hablar, con qué IP, ni cómo resolver `drone-lab.local`. Cubrimos el intercambio DORA de DHCP, la resolución recursiva de DNS y la idea (defensiva) de ARP spoofing.',
      objectives: [
        'Explicar ARP request (broadcast) y reply (unicast)',
        'Describir el intercambio DORA de DHCP',
        'Trazar una resolución DNS recursiva',
        'Reconocer el riesgo de ARP spoofing (defensa)',
      ],
      sections: [
        {
          id: 'add-intro',
          type: 'text',
          content:
            'Antes de mandar un paquete a `10.10.10.10`, el laptop necesita tres cosas: **(1)** saber la MAC de ese IP (ARP), **(2)** tener él mismo una IP y una ruta (DHCP) y **(3)** si solo conoce el nombre `drone-lab.local`, resolverlo a una IP (DNS). Son protocolos de "infraestructura": normalmente invisibles pero esenciales. Y, como verás, también son superficie de ataque en un lab.',
        },
        {
          id: 'add-arp-diagram',
          type: 'diagram',
          title: 'Intercambio ARP',
          ascii: `  Laptop (.20)                     Drone (.10)
     │                                  │
     │ ── ARP Request (broadcast) ────▶ │   "¿Quién tiene 10.10.10.10?"
     │    dst MAC = ff:ff:ff:ff:ff:ff   │   todos en la LAN lo reciben
     │    src MAC = b8:27:eb:aa:bb:cc   │
     │                                  │
     │ ◀── ARP Reply (unicast) ──────── │   "Yo, mi MAC es b8:27:eb:11:22:33"
     │     dst MAC = b8:27:eb:aa:bb:cc  │   solo el asker lo recibe
     │     src MAC = b8:27:eb:11:22:33  │
     │                                  │
     │   (el laptop cachea IP→MAC)      │
     │   (ya puede mandar el frame IP)  │`,
          description:
            'ARP Request es **broadcast** (todos lo procesan); ARP Reply es **unicast** (solo el que preguntó). El resultado se cachea con un TTL de unos minutos.',
        },
        {
          id: 'add-compare',
          type: 'table',
          caption: 'ARP vs DHCP vs DNS',
          headers: ['Aspecto', 'ARP', 'DHCP', 'DNS'],
          rows: [
            ['Resuelve', 'IP → MAC', '(nada) → IP + gateway + DNS', 'Nombre → IP'],
            ['Capa', 'L2/L3', 'L2/L3/L7 (UDP 67/68)', 'L7 (UDP/TCP 53)'],
            ['Tipo', 'Broadcast + unicast', 'DORA (4 paquetes)', 'Query/Response, a veces recursivo'],
            ['En el drone', 'Para hablar con .10 o .1', 'Para recibir 10.10.10.10', 'Para resolver drone-lab.local'],
            ['Riesgo de spoofing', 'Sí (ARP spoofing)', 'Sí (rogue DHCP)', 'Sí (DNS hijack)'],
          ],
        },
        {
          id: 'add-dora',
          type: 'steps',
          title: 'DHCP: el intercambio DORA',
          steps: [
            {
              title: 'D — Discover',
              content:
                'El cliente (sin IP aún) manda un broadcast UDP al puerto 67. "¿Algún DHCP por aquí?"',
              code: 'src 0.0.0.0:68 → dst 255.255.255.255:67',
            },
            {
              title: 'O — Offer',
              content:
                'El servidor DHCP responde (también broadcast, porque el cliente aún no tiene IP) ofreciendo una IP, lease time, gateway y DNS.',
            },
            {
              title: 'R — Request',
              content:
                'El cliente confirma que acepta esa oferta (broadcast, para que otros DHCP sepan que ya no hace falta).',
            },
            {
              title: 'A — Acknowledge',
              content:
                'El servidor confirma. El cliente ya puede usar la IP. Renueva el lease a mitad del tiempo de alquiler.',
            },
          ],
        },
        {
          id: 'add-dns',
          type: 'text',
          content:
            '**DNS** traduce nombres (`drone-lab.local`) a IPs (`10.10.10.10`). Cuando tu app pide `drone-lab.local`, tu resolver suele preguntar a un servidor (un *resolver*), que a su vez puede preguntar a la raíz, al TLD y al autoritativo — es la **resolución recursiva**. En el lab, `drone-lab.local` se resuelve localmente (mDNS o un resolver de la LAN), pero la mecánica es la misma: query → respuesta con un registro A/AAAA.\n\n`dig drone-lab.local` te muestra toda esa conversación: query, respuesta, tiempo, servidor contactado.',
        },
        {
          id: 'add-term',
          type: 'terminal',
          caption: 'Caché ARP y resolución DNS',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ip neigh' },
            {
              output: `10.10.10.1 dev eth0 lladdr 08:00:27:a8:4c:1f REACHABLE
10.10.10.10 dev eth0 lladdr b8:27:eb:11:22:33 REACHABLE`,
            },
            { prompt: 'student@drone-lab:~$', command: 'dig +short drone-lab.local' },
            { output: '10.10.10.10' },
            { prompt: 'student@drone-lab:~$', command: 'dig drone-lab.local' },
            {
              output: `;; QUESTION SECTION:
;drone-lab.local.            IN  A

;; ANSWER SECTION:
drone-lab.local.    600 IN A   10.10.10.10

;; Query time: 3 msec
;; SERVER: 10.10.10.1#53(10.10.10.1)`,
            },
          ],
        },
        {
          id: 'add-ttl',
          type: 'callout',
          variant: 'tip',
          title: 'La caché ARP tiene TTL (y eso es bueno)',
          content:
            'Una entrada ARP no vive para siempre: caduca en segundos o minutos (configurable vía `gc_stale_time` en Linux, por defecto ~60 s). Esto significa que si spoofeas una MAC, tu entrada falsa **caducará** y la víctima volverá a preguntar. Por eso un ARP spoofing sostenido requiere **re-enviar** replies falsos continuamente. Como defensor, puedes vigilar entradas `STALE` o `PERMANENT` inesperadas en `ip neigh`.',
        },
        {
          id: 'add-spoof',
          type: 'callout',
          variant: 'danger',
          title: 'ARP spoofing (contexto defensivo)',
          content:
            'Si un atacante manda ARP replies falsos diciendo "la MAC del gateway .1 soy yo", las víctimas le mandan su tráfico y él lo reenvía (MITM). En el lab **solo se practica contra tus propias VMs dentro de 10.10.10.0/24**. Defensas: tablas ARP estáticas para el gateway, detección con `arpwatch`, segmentación por VLAN y, en redes reales, Dynamic ARP Inspection en el switch.',
        },
        {
          id: 'add-try',
          type: 'interactive-terminal',
          title: 'Practica',
          description:
            'Limpia la caché ARP (`ip neigh flush all`), vuelve a hacer ping a `10.10.10.10` y observa con `ip neigh` cómo se rellena. Luego resuelve `drone-lab.local` con `dig`.',
          preset: 'ip neigh',
        },
      ],
      quiz: {
        id: 'q-arp-dhcp-dns',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'El ARP Request se envía como:',
            options: ['Unicast al gateway', 'Broadcast a toda la LAN', 'Multicast al router', 'Anycast al DNS'],
            correctIndex: 1,
            explanation: 'Es broadcast (dst ff:ff:ff:ff:ff:ff) porque el asker aún no sabe quién tiene la IP.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Cuál es el orden correcto del intercambio DHCP?',
            options: [
              'Discover → Offer → Request → Ack',
              'Request → Offer → Discover → Ack',
              'Offer → Discover → Ack → Request',
              'Discover → Ack → Request → Offer',
            ],
            correctIndex: 0,
            explanation: 'DORA: Discover, Offer, Request, Acknowledge.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'DNS resuelve un nombre de host a una dirección IP.',
            answer: true,
            explanation: 'Sí. Devuelve registros A (IPv4) o AAAA (IPv6).',
          },
        ],
      },
    },
    {
      id: 'packet-journey-animation',
      moduleId: '02-networking',
      title: 'El viaje de un paquete: Laptop → Router → Drone',
      slug: 'packet-journey',
      duration: '18 min',
      difficulty: 'beginner',
      summary:
        'La lección central: seguimos un `POST /api/drone/status` desde que la app del laptop lo crea hasta que el drone lo recibe. Verás cómo la IP y los puertos no cambian en ningún salto, pero la MAC se reescribe en cada router. El "pasaporte" es la IP; la MAC es la "dirección local" del próximo salto.',
      objectives: [
        'Trazar un paquete HTTP a través de 3 nodos',
        'Identificar qué campos cambian en cada salto y cuáles no',
        'Relacionar el diagrama de topología con la encapsulación capa por capa',
      ],
      sections: [
        {
          id: 'pja-intro',
          type: 'text',
          content:
            'La app del companion en el laptop acaba de decidir enviar el estado del drone a la API. Construye un `POST /api/drone/status` con un JSON de telemetría. Esa orden, en bytes, va a viajar por la red hasta el drone en `10.10.10.10`. Vamos a seguirla salto a salto y a ver exactamente qué cambia en cada uno.',
        },
        {
          id: 'pja-topology',
          type: 'diagram',
          title: 'Topología y flujo del paquete',
          ascii: `  ┌──────────┐         ┌──────────┐         ┌──────────┐
  │  Laptop  │         │  Router  │         │  Drone   │
  │ .20      │         │   .1     │         │ .10      │
  │ MAC:aa   │         │ MAC:1f   │         │ MAC:33   │
  └────┬─────┘         └────┬─────┘         └────┬─────┘
       │  hop 1: ETH dst=router MAC   │  hop 2: ETH dst=drone MAC
       │        IP  src=.20 dst=.10   │        IP  src=.20 dst=.10  (¡igual!)
       │        TCP sport=54321 dport=80       TCP sport=54321 dport=80 (¡igual!)
       │ ───────────────────────────▶ │ ───────────────────────────▶
       │                              │
       │  (lo único que cambia entre hop 1 y hop 2: las MAC del frame Ethernet)`,
          description:
            'Tres nodos en 10.10.10.0/24. El paquete hace dos saltos L2 (Laptop→Router, Router→Drone). En cada salto el frame Ethernet se reescribe; el contenido IP/TCP/HTTP viaja intacto.',
        },
        {
          id: 'pja-steps',
          type: 'steps',
          title: 'Salto a salto',
          steps: [
            {
              title: '1. La app crea el payload (L7)',
              content:
                'El companion genera el JSON de telemetría y se lo pasa a la pila TCP. Aún no hay red: solo bytes de aplicación.',
              code: `POST /api/drone/status HTTP/1.1
Host: drone-lab.local
{"battery":87,"lat":40.4,"alt":120}`,
            },
            {
              title: '2. TCP encapsula (L4)',
              content:
                'TCP añade puertos (sport 54321 efímero, dport 80 del API), seq/ack y flags. Como la conexión ya está ESTABLISHED, va un segmento de datos con flag [P.].',
            },
            {
              title: '3. IP encapsula (L3)',
              content:
                'IP añade src=10.10.10.20, dst=10.10.10.10, TTL=64, protocol=6 (TCP). Esta cabecera NO va a cambiar en ningún salto.',
            },
            {
              title: '4. ARP al gateway (preparar L2)',
              content:
                'El laptop consulta su tabla de rutas: el destino .10 se alcanza vía el gateway .1. ARPA la MAC de .1 y prepara el frame Ethernet con esa MAC como destino.',
              code: 'ip neigh | grep 10.10.10.1',
            },
            {
              title: '5. Hop 1: Laptop → Router',
              content:
                'El frame Ethernet lleva dst MAC = MAC del router, src MAC = MAC del laptop. El router lo recibe, ve que la IP dst es .10 (no para él), decrementa TTL a 63 y decide por dónde reenviar.',
            },
            {
              title: '6. Hop 2: Router → Drone',
              content:
                'El router construye un frame NUEVO: dst MAC = MAC del drone, src MAC = MAC del router. La cabecera IP, TCP y el payload HTTP son los mismos. El drone recibe este frame.',
            },
            {
              title: '7. El drone procesa (de-encapsulación)',
              content:
                'El drone quita Ethernet, ve que la IP dst es la suya (.10), quita IP, ve que es TCP al puerto 80, lo entrega al servidor HTTP que escucha en el API. El handler de `/api/drone/status` recibe el JSON.',
            },
          ],
        },
        {
          id: 'pja-pkt-laptop',
          type: 'packet',
          title: 'Paquete en el cable Laptop → Router (hop 1)',
          description:
            'Así sale el frame del laptop. Fíjate en la MAC destino: es la del router, no la del drone.',
          layers: [
            {
              name: 'Ethernet',
              color: 'ethernet',
              fields: [
                { label: 'dst MAC', value: '08:00:27:a8:4c:1f', note: 'router .1' },
                { label: 'src MAC', value: 'b8:27:eb:aa:bb:cc', note: 'laptop .20' },
                { label: 'ethertype', value: '0x0800', note: 'IPv4' },
              ],
              description: 'Frame L2 para entregar al próximo salto (el router).',
            },
            {
              name: 'IPv4',
              color: 'ip',
              fields: [
                { label: 'src IP', value: '10.10.10.20', note: 'laptop' },
                { label: 'dst IP', value: '10.10.10.10', note: 'drone — no cambia nunca' },
                { label: 'TTL', value: '64', note: 'recién salido' },
                { label: 'protocol', value: '6 (TCP)' },
              ],
              description: 'Identidad de extremo a extremo. Viaja intacta.',
            },
            {
              name: 'TCP',
              color: 'tcp',
              fields: [
                { label: 'src port', value: '54321', note: 'efímero' },
                { label: 'dst port', value: '80', note: 'API HTTP del drone' },
                { label: 'flags', value: 'PSH, ACK', note: 'datos en conexión establecida' },
                { label: 'seq', value: '1001' },
              ],
              description: 'Segmento de datos sobre la conexión ya abierta.',
            },
            {
              name: 'HTTP',
              color: 'http',
              fields: [
                { label: 'method', value: 'POST' },
                { label: 'path', value: '/api/drone/status' },
                { label: 'host', value: 'drone-lab.local' },
                { label: 'body', value: '{"battery":87,"lat":40.4,"alt":120}' },
              ],
              description: 'El payload real: la llamada al API.',
            },
          ],
        },
        {
          id: 'pja-pkt-router',
          type: 'packet',
          title: 'Paquete en el cable Router → Drone (hop 2)',
          description:
            'El router reenvía. Solo cambia la capa Ethernet (MAC) y el TTL decrementa en 1. Todo lo demás es idéntico.',
          layers: [
            {
              name: 'Ethernet',
              color: 'ethernet',
              fields: [
                { label: 'dst MAC', value: 'b8:27:eb:11:22:33', note: 'drone .10 — CAMBIÓ' },
                { label: 'src MAC', value: '08:00:27:a8:4c:1f', note: 'router — CAMBIÓ' },
                { label: 'ethertype', value: '0x0800', note: 'IPv4' },
              ],
              description: 'Frame L2 nuevo: ahora entrega al drone.',
            },
            {
              name: 'IPv4',
              color: 'ip',
              fields: [
                { label: 'src IP', value: '10.10.10.20', note: 'igual' },
                { label: 'dst IP', value: '10.10.10.10', note: 'igual' },
                { label: 'TTL', value: '63', note: 'decrementado por el router' },
                { label: 'protocol', value: '6 (TCP)' },
              ],
              description: 'La identidad L3 no cambia: es de extremo a extremo.',
            },
            {
              name: 'TCP',
              color: 'tcp',
              fields: [
                { label: 'src port', value: '54321', note: 'igual' },
                { label: 'dst port', value: '80', note: 'igual' },
                { label: 'flags', value: 'PSH, ACK' },
                { label: 'seq', value: '1001' },
              ],
              description: 'El segmento TCP viaja intacto.',
            },
            {
              name: 'HTTP',
              color: 'http',
              fields: [
                { label: 'method', value: 'POST' },
                { label: 'path', value: '/api/drone/status' },
                { label: 'host', value: 'drone-lab.local' },
                { label: 'body', value: '{"battery":87,"lat":40.4,"alt":120}' },
              ],
              description: 'El payload HTTP llega tal cual al drone.',
            },
          ],
        },
        {
          id: 'pja-tip',
          type: 'callout',
          variant: 'tip',
          title: 'La IP es el pasaporte, la MAC es la dirección local',
          content:
            'Piensa en la IP como tu **pasaporte**: te identifica de origen a destino, no importa cuántas aduanas cruces. La MAC es como la **dirección del próximo tramo**: cambia en cada router, igual que cambias de tren en cada estación. Por eso un atacante que solo ve L2 (un switch, un AP) ve MACs; uno que ve L3 (un router, un firewall) ve IPs. Y por eso **spoofear la MAC** solo engaña a tu vecino inmediato, mientras que **spoofear la IP** (sin tocar la MAC) rompe el retorno.',
        },
        {
          id: 'pja-try',
          type: 'interactive-terminal',
          title: 'Practica',
          description:
            'Captura tu propio viaje de paquetes: haz `curl -X POST http://drone-lab.local/api/drone/status` y observa con `ip neigh` qué MAC se usó para llegar al drone.',
          preset: 'curl http://drone-lab.local/api/drone/status',
        },
      ],
      quiz: {
        id: 'q-packet-journey',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Entre el hop 1 (Laptop→Router) y el hop 2 (Router→Drone), ¿qué cambia?',
            options: [
              'La IP origen y destino',
              'Los puertos TCP',
              'Las MAC Ethernet (y el TTL)',
              'El método HTTP',
            ],
            correctIndex: 2,
            explanation:
              'Solo la cabecera Ethernet se reescribe (nuevas MAC) y el TTL decrementa. IP, TCP y payload viajan intactos.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Por qué decimos que "la IP es el pasaporte"?',
            options: [
              'Porque se cifra al cruzar el router',
              'Porque identifica origen y destino de extremo a extremo, sin importar los saltos',
              'Porque cambia en cada salto como un sello de aduana',
              'Porque solo la usa el primer router',
            ],
            correctIndex: 1,
            explanation: 'La IP es de extremo a extremo: no cambia entre hops. La MAC sí, en cada salto L2.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'El router decrementa el TTL del paquete IP al reenviarlo.',
            answer: true,
            explanation:
              'Sí. Cada router resta 1 al TTL; si llega a 0, el paquete se descarta (evita loops infinitos).',
          },
        ],
      },
    },
    {
      id: 'broadcast-multicast-nat',
      moduleId: '02-networking',
      title: 'Broadcast, multicast y NAT',
      slug: 'broadcast-multicast-nat',
      duration: '15 min',
      difficulty: 'beginner',
      summary:
        'Tres formas de "repartir" tráfico que no son uno-a-uno: broadcast (uno a todos), multicast (uno a muchos) y NAT/PAT (cómo el companion en 10.10.10.10 reacha Internet a través del router). Entender NAT es clave para ver por qué la topología interna del drone queda oculta al exterior.',
      objectives: [
        'Distinguir broadcast, multicast y unicast',
        'Explicar NAT/PAT y por qué oculta la topología interna',
        'Reconocer el subnet broadcast y el limited broadcast',
      ],
      sections: [
        {
          id: 'bmn-intro',
          type: 'text',
          content:
            'Hasta ahora todo era **unicast**: un origen, un destino. Pero las redes también mandan tráfico a "muchos": **broadcast** llega a todos los hosts de un segmento (es lo que hace ARP), **multicast** llega a un grupo suscrito (mDNS, routing protocols). Y cuando tu drone en una IP privada (10.10.10.10) quiere salir a Internet, **NAT** en el router reescribe su IP privada por una pública.',
        },
        {
          id: 'bmn-table',
          type: 'table',
          caption: 'Unicast vs Broadcast vs Multicast',
          headers: ['Tipo', 'Destinatarios', 'IP de destino', 'Ejemplo'],
          rows: [
            ['Unicast', 'Uno', 'IP concreta (10.10.10.10)', 'curl al API del drone'],
            ['Broadcast', 'Todos en la LAN', '255.255.255.255 o IP de subred', 'ARP, DHCP Discover'],
            ['Multicast', 'Un grupo suscrito', '224.0.0.0/4 (ej. 224.0.0.251 mDNS)', 'mDNS, OSPF, video IPTV'],
          ],
        },
        {
          id: 'bmn-diagram',
          type: 'diagram',
          title: 'NAT/PAT: el drone sale a Internet',
          ascii: `  ┌──────────┐        ┌──────────┐        ╔══════════╗
  │  Drone   │        │  Router  │        ║ Internet ║
  │ 10.10.10 │        │  .1      │        ║ 8.8.8.8  ║
  │   :10    │        │ pub:     │        ╚════╤═════╝
  │          │        │ 203.0.113│             │
  └────┬─────┘        └────┬─────┘             │
       │  src 10.10.10.10:54321               │
       │  dst 8.8.8.8:53                        │
       │ ───────────────────▶ │                │
       │                      │ NAT reescribe: │
       │                      │ src → 203.0.113.7:45001
       │                      │ ─────────────────────────▶ │
       │                      │                │
       │                      │ ◀─────────── respuesta ─── │
       │                      │ dst 203.0.113.7:45001       │
       │                      │ NAT revierte:               │
       │ ◀──── dst 10.10.10.10:54321 ──────── │
       │                      │                │`,
          description:
            'El router hace **SNAT** (Source NAT) al salir: cambia la IP privada del drone por la pública del router. PAT (Port Address Translation) además reescribe el puerto origen para multiplexar varias conexiones internas sobre una sola IP pública. A la vuelta, el router traduce de vuelta usando su tabla NAT.',
        },
        {
          id: 'bmn-nat-info',
          type: 'callout',
          variant: 'info',
          title: 'Por qué NAT oculta la topología del drone',
          content:
            'Desde Internet, el destino visible de los paquetes del drone es la IP **pública del router**, no `10.10.10.10`. La IP 10.10.10.10 está en un rango privado (RFC 1918) y **no es enrutable** en Internet. Esto significa que un observador externo no puede saber cuántos hosts hay detrás del router, ni sus IPs internas: solo ve la IP pública del router y un montón de puertos efímeros.\n\nPara un atacante esto es ruido: el drone está "escondido" detrás de NAT. Pero NAT **no es seguridad**: si el router reenvía un puerto (port forwarding) al drone, o si el drone abre una conexión saliente que un atacante puede predecir/hijackear, la protección se evapora. La defensa real sigue siendo un firewall con estado.',
        },
        {
          id: 'bmn-try',
          type: 'interactive-terminal',
          title: 'Practica',
          description:
            'Observa tu propia traducción: lanza `curl http://drone-lab.local/api/drone/status` y, mientras tanto, ejecuta `ss -tan state established`. ¿Ves la conexión al drone? ¿Y si haces `curl https://1.1.1.1`, cómo cambia el destino?',
          preset: 'ss -tan state established',
        },
      ],
      quiz: {
        id: 'q-broadcast-multicast-nat',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué IP de destino usa un paquete broadcast limitado a la LAN actual?',
            options: ['10.10.10.10', '224.0.0.1', '255.255.255.255', '127.0.0.1'],
            correctIndex: 2,
            explanation:
              '255.255.255.255 es el limited broadcast: llega a todos los hosts del segmento actual, no se enruta.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué hace NAT al salir un paquete del drone hacia Internet?',
            options: [
              'Cifra el payload',
              'Cambia la IP origen privada por la IP pública del router',
              'Incrementa el TTL infinitamente',
              'Convierte TCP en UDP',
            ],
            correctIndex: 1,
            explanation:
              'NAT hace SNAT: reescribe la IP origen (y PAT además el puerto) para que el paquete sea enrutable en Internet.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'NAT es una medida de seguridad suficiente para proteger el drone en Internet.',
            answer: false,
            explanation:
              'Falso. NAT oculta la topología pero no es un firewall. Un port forwarding o una conexión saliente manipulada lo evitan.',
          },
        ],
      },
    },
  ],
}
