import type { ContentModule } from '../types'

/**
 * Module 01 — Linux para Drone Security.
 * Versión inicial (FASE I): lecciones fundamentales. Se amplía con subagents
 * en paralelo (filesystem, processes, networking commands, etc.).
 */
export const linuxModule: ContentModule = {
  id: '01-linux',
  number: '01',
  title: 'Linux para Drone Security',
  subtitle: 'El sistema operativo del companion computer',
  slug: 'linux',
  group: 'foundation',
  difficulty: 'beginner',
  estimatedTime: '4–5 h',
  prerequisites: ['00-start-here'],
  description:
    'Linux desde cero orientado a drones: filesystem, procesos, permisos, sockets, interfaces y las herramientas de red que usarás en cada lab (ip, ss, ping, nc, curl, tcpdump, dig).',
  icon: 'Terminal',
  status: 'available',
  outcomes: [
    'Moverte por un sistema Linux con soltura',
    'Inspeccionar interfaces, rutas y sockets',
    'Diagnosticar servicios del companion computer',
    'Usar la cadena de herramientas de red básica',
  ],
  tools: ['ip', 'ss', 'ping', 'netcat', 'curl', 'dig', 'jq'],
  lessons: [
    {
      id: 'filesystem-basics',
      moduleId: '01-linux',
      title: 'Filesystem y permisos',
      slug: 'filesystem',
      duration: '20 min',
      difficulty: 'beginner',
      summary:
        'El filesystem de Linux es un árbol único. Aprendes a moverte, leer permisos y entender por qué el companion computer expone /etc, /var/log y /opt como puntos sensibles.',
      objectives: [
        'Navegar el árbol de directorios',
        'Leer y modificar permisos (rwx)',
        'Reconocer directorios sensibles del companion computer',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'En Linux todo es un archivo (o casi). El filesystem es un **árbol único que nace en `/`**. No hay letras de unidad como en Windows; todo cuelga de la raíz.\n\nEn un companion computer típico (Raspberry Pi con PX4/ArduPilot) encontrarás:\n\n- `/etc/` — configuración (credenciales, services)\n- `/var/log/` — logs de vuelo y telemetría\n- `/opt/` — software de misión (ROS, MAVROS)\n- `/home/pi/` — datos del usuario\n- `/dev/` — dispositivos (radio serial, GPS)\n- `/proc/` y `/sys/` — estado del kernel en vivo',
        },
        {
          id: 'dirs',
          type: 'terminal',
          caption: 'Inspección del filesystem del companion',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'pwd' },
            { output: '/home/student' },
            { prompt: 'student@drone-lab:~$', command: 'ls -la /etc | head' },
            {
              output: `total 980
drwxr-xr-x 140 root root 12288 Nov  3 10:21 .
drwxr-xr-x  18 root root  4096 Oct 12 09:00 ..
-rw-r--r--   1 root root  3028 Nov  3 10:21 group
-rw-r--r--   1 root root   842 Nov  3 10:21 hostname
-rw-r--r--   1 root root   213 Nov  3 10:21 hosts
drwxr-xr-x   2 root root  4096 Nov  3 10:21 systemd`,
            },
            { prompt: 'student@drone-lab:~$', command: 'cat /etc/hostname' },
            { output: 'drone-companion-01' },
          ],
        },
        {
          id: 'perms',
          type: 'text',
          content:
            'Cada archivo tiene **permisos** en tres bloques: propietario, grupo y otros. Cada bloque tiene `r` (read), `w` (write), `x` (execute).\n\n`-rw-r--r--` significa: archivo regular, el propietario puede leer/escribir, el grupo y otros solo leer.\n\nPara un pentester, los permisos importan: si `/etc/shadow` es legible por tu usuario, puedes crackear hashes. Si un binario setuid pertenece a root, es un camino de escalada.',
        },
        {
          id: 'perms-cmd',
          type: 'terminal',
          caption: 'Permisos y所有权',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ls -l /etc/shadow' },
            { output: '-rw-r----- 1 root shadow 1234 Nov 3 10:21 /etc/shadow' },
            { prompt: 'student@drone-lab:~$', command: 'find / -perm -4000 2>/dev/null' },
            {
              output: `/usr/bin/sudo
/usr/bin/passwd
/usr/bin/mount
/usr/bin/su`,
            },
          ],
        },
        {
          id: 'sensitive',
          type: 'callout',
          variant: 'warning',
          title: 'Directorios sensibles en un companion computer',
          content:
            'Cuando enumeres un companion comprometido (con autorización), mira siempre: `/etc/` (credenciales, services), `/var/log/` (flight logs, auth.log), `/boot/` (kernel/firmware), `/opt/` (misión), `~/.ssh/` (claves), `/etc/systemd/system/` (persistencia).',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description: 'Explora el filesystem del laboratorio. Prueba `ls /`, `ls /etc`, `cat /etc/hostname`, `whoami`.',
        },
      ],
      quiz: {
        id: 'q-fs',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué significa el permiso `-rw-r--r--`?',
            options: [
              'Solo root puede leer; otros pueden ejecutar',
              'Propietario lee/escribe; grupo y otros solo leen',
              'Todos pueden leer y escribir',
              'Nadie puede ejecutar el archivo',
            ],
            correctIndex: 1,
            explanation: 'Tres bloques rwx: propietario rw-, grupo r--, otros r--.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué directorio de un companion computer suele contener flight logs?',
            options: ['/tmp', '/var/log', '/boot', '/srv'],
            correctIndex: 1,
            explanation: '/var/log acumula logs del sistema y de servicios de misión.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'Un binario setuid (permiso 4000) ejecutándose como root puede ser vector de escalada de privilegios.',
            answer: true,
            explanation: 'Si el binario tiene bugs, se ejecuta con los privilegios del propietario (root).',
          },
        ],
      },
    },
    {
      id: 'processes-services',
      moduleId: '01-linux',
      title: 'Procesos y servicios',
      slug: 'processes',
      duration: '18 min',
      difficulty: 'beginner',
      summary:
        'Procesos, systemd, logs y la cadena de servicios que hacen volar al drone. Aprende a ver qué corre, qué escucha y qué se rompe.',
      objectives: [
        'Listar e inspeccionar procesos',
        'Entender systemd y los servicios del companion',
        'Leer logs del sistema',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Un **proceso** es un programa en ejecución. El companion computer de un drone corre docenas a la vez: el daemon de MAVLink, el streamer de video, el servicio de la API, SSH, el flight controller bridge.\n\nSaber verlos, identificarlos y leer sus logs es fundamental para reconocimiento defensivo y ofensivo.',
        },
        {
          id: 'ps',
          type: 'terminal',
          caption: 'Procesos en ejecución',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ps aux --sort=-%mem | head -8' },
            {
              output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.5 168424 11524 ?        Ss   10:20   0:02 /sbin/init splash
root       412  0.3  0.8  51264 17520 ?        Ss   10:20   0:05 /lib/systemd/systemd-journald
root       520  0.2  1.1 198340 23440 ?        Ss   10:20   0:03 /usr/sbin/mavlink-router
pi         631  0.1  2.4 825140 51200 ?        Ssl  10:20   0:08 /opt/mission/bridge --config /etc/mav
pi         644  0.0  1.2 412300 25600 ?        Ssl  10:21   0:01 /usr/bin/rtsp-server -p 8554`,
            },
            { prompt: 'student@drone-lab:~$', command: 'top -bn1 | head -5' },
            {
              output: `top - 10:24:12 up  4 min,  1 user,  load average: 0.21, 0.18, 0.09
Tasks: 112 total,   1 running, 111 sleeping,   0 stopped,   0 zombie
%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.4 id,  0.2 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :    972.0 total,    412.3 free,    280.1 used,    279.6 buff/cache`,
            },
          ],
        },
        {
          id: 'systemd',
          type: 'text',
          content:
            '**systemd** es el init moderno de Linux: gestiona servicios (units). En un companion computer, MAVLink router, API REST, RTSP server y bridges suelen ser units.\n\nComandos clave: `systemctl status <unit>`, `systemctl list-units --type=service`, `journalctl -u <unit>`.',
        },
        {
          id: 'systemd-cmd',
          type: 'terminal',
          caption: 'systemd y logs',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'systemctl status mavlink-router' },
            {
              output: `● mavlink-router.service - MAVLink Router
     Loaded: loaded (/lib/systemd/system/mavlink-router.service; enabled)
     Active: active (running) since Mon 2024-11-03 10:20:31 UTC; 4min ago
   Main PID: 520 (mavlink-router)
      Tasks: 3 (limit: 4915)
     Memory: 4.2M
        CPU: 280ms`,
            },
            { prompt: 'student@drone-lab:~$', command: 'journalctl -u mavlink-router -n 5 --no-pager' },
            {
              output: `Nov 03 10:20:31 drone-companion-01 systemd[1]: Started MAVLink Router.
Nov 03 10:20:31 drone-companion-01 mavlink-router[520]: Connecting tcp:127.0.0.1:5760
Nov 03 10:20:31 drone-companion-01 mavlink-router[520]: Listening udp:0.0.0.0:14550`,
            },
          ],
        },
        {
          id: 'tip',
          type: 'callout',
          variant: 'tip',
          title: 'Recon defensivo',
          content:
            'En un companion comprometido (con autorización), `systemctl list-unit-files --state=enabled` revela qué se arranca al boot. Servicios raros o con nombres typos son sospechosos de persistencia.',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description: 'Prueba `ps aux`, `systemctl status mavlink-router`, `journalctl -u mavlink-router -n 3`.',
        },
      ],
      quiz: {
        id: 'q-proc',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué comando muestra los logs de un servicio systemd concreto?',
            options: ['dmesg | grep service', 'journalctl -u <unit>', 'cat /var/log/services', 'tail /etc/log'],
            correctIndex: 1,
            explanation: 'journalctl -u <unit> filtra logs de una unit concreta de systemd.',
          },
          {
            id: 'q2',
            type: 'true-false',
            question: 'systemctl list-unit-files --state=enabled muestra servicios que arrancan al boot.',
            answer: true,
            explanation: 'Exacto. Útil para detectar persistencia en un forense.',
          },
        ],
      },
    },
    {
      id: 'network-tools',
      moduleId: '01-linux',
      title: 'Herramientas de red esenciales',
      slug: 'network-tools',
      duration: '25 min',
      difficulty: 'beginner',
      summary:
        'ip, ss, ping, nc, curl, dig y tcpdump. Las herramientas que usarás en CADA lab. Cada una con concepto → comando → ejemplo → salida → explicación.',
      objectives: [
        'Dominar ip y ss para inspeccionar la pila de red',
        'Usar ping, nc y curl para probar conectividad',
        'Hacer consultas DNS con dig',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Estas herramientas son el **abc del pentester de sistemas embebidos**. Antes de Wireshark, antes de nmap, siempre: `ip addr`, `ss -tulpn`, `ping`. Sin eso, no sabes ni dónde estás parado.',
        },
        {
          id: 'ip',
          type: 'code',
          lang: 'bash',
          caption: 'ip — interfaces, rutas y vecinos',
          code: `# Interfaces y direcciones
ip addr

# Tabla de rutas
ip route

# Caché ARP (vecinos en L2)
ip neigh

# Estadísticas de interfaces
ip -s link`,
        },
        {
          id: 'ip-out',
          type: 'terminal',
          caption: 'Salida típica de ip addr en un companion',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ip -br addr' },
            {
              output: `lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             10.10.10.20/24 metric 100
wlan0            UP             192.168.1.42/24 metric 600`,
            },
            { prompt: 'student@drone-lab:~$', command: 'ip route' },
            {
              output: `default via 10.10.10.1 dev eth0 proto dhcp metric 100
10.10.10.0/24 dev eth0 proto kernel scope link src 10.10.10.20
192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.42`,
            },
          ],
        },
        {
          id: 'ss',
          type: 'terminal',
          caption: 'ss — sockets en escucha',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ss -tulpn' },
            {
              output: `Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port  Process
udp   UNCONN 0      0          0.0.0.0:14550      0.0.0.0:*      users:(("mavlink-router",pid=520,fd=7))
udp   UNCONN 0      0          0.0.0.0:14551      0.0.0.0:*      users:(("mavlink-router",pid=520,fd=8))
tcp   LISTEN 0      128        0.0.0.0:80         0.0.0.0:*      users:(("drone-api",pid=631,fd=10))
tcp   LISTEN 0      128        0.0.0.0:22         0.0.0.0:*      users:(("sshd",pid=540,fd=3))
tcp   LISTEN 0      128        0.0.0.0:8554       0.0.0.0:*      users:(("rtsp-server",pid=644,fd=4))`,
            },
          ],
        },
        {
          id: 'ss-explain',
          type: 'callout',
          variant: 'info',
          title: 'Cómo leer ss -tulpn',
          content:
            '`-t` TCP, `-u` UDP, `-l` listening, `-p` muestra proceso (necesita root), `-n` numérico. La salida te dice **qué proceso escucha en qué puerto**: MAVLink en 14550/udp, API en 80/tcp, SSH en 22/tcp, RTSP en 8554/tcp. Esa es la superficie del companion.',
        },
        {
          id: 'ping-nc',
          type: 'terminal',
          caption: 'ping y netcat',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ping -c 3 10.10.10.10' },
            {
              output: `PING 10.10.10.10 (10.10.10.10) 56(84) bytes of data.
64 bytes from 10.10.10.10: icmp_seq=1 ttl=64 time=2.31 ms
64 bytes from 10.10.10.10: icmp_seq=2 ttl=64 time=1.98 ms
64 bytes from 10.10.10.10: icmp_seq=3 ttl=64 time=2.05 ms
--- 10.10.10.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`,
            },
            { prompt: 'student@drone-lab:~$', command: 'nc -zv 10.10.10.10 80' },
            { output: 'Connection to 10.10.10.10 80 port [tcp/http] succeeded!' },
          ],
        },
        {
          id: 'curl',
          type: 'terminal',
          caption: 'curl — la API del drone',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'curl -s http://10.10.10.10/api/drone/status | jq .' },
            {
              output: `{
  "battery": 82,
  "altitude": 13.4,
  "gps": true,
  "mode": "LOITER",
  "armed": false
}`,
            },
            { prompt: 'student@drone-lab:~$', command: 'curl -s -o /dev/null -w "%{http_code}\\n" http://10.10.10.10/api/drone/status' },
            { output: '200' },
          ],
        },
        {
          id: 'dig',
          type: 'terminal',
          caption: 'dig — DNS',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'dig +short drone-lab.local' },
            { output: '10.10.10.10' },
          ],
        },
        {
          id: 'practice',
          type: 'interactive-terminal',
          title: 'Practica el kit completo',
          description: 'Prueba: `ip addr`, `ss -tulpn`, `ping 10.10.10.10`, `curl http://10.10.10.10/api/drone/status`.',
        },
      ],
      quiz: {
        id: 'q-net-tools',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué flag de ss muestra el proceso que escucha en cada puerto?',
            options: ['-n', '-l', '-p', '-t'],
            correctIndex: 2,
            explanation: '-p muestra el proceso (requiere privilegios).',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué puerto usa típicamente MAVLink por UDP?',
            options: ['80', '22', '14550', '8554'],
            correctIndex: 2,
            explanation: '14550/udp es el puerto estándar de telemetría MAVLink.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question: 'curl -s -o /dev/null -w "%{http_code}" devuelve solo el código HTTP de estado.',
            answer: true,
            explanation: 'Útil para scripting: descarta el body y emite solo el status code.',
          },
        ],
      },
    },
    {
      id: 'users-groups-permissions',
      moduleId: '01-linux',
      title: 'Usuarios, grupos y permisos',
      slug: 'users-groups-permissions',
      duration: '20 min',
      difficulty: 'beginner',
      summary:
        'El modelo de identidad de Linux: /etc/passwd, /etc/shadow, sudo vs su, chmod numérico y simbólico, chown y los bits especiales (setuid, setgid, sticky). Por qué esto define el hardening del companion computer.',
      objectives: [
        'Leer /etc/passwd y /etc/shadow y entender sus campos',
        'Distinguir sudo de su y gestionar usuarios con useradd/usermod',
        'Aplicar chmod en notación numérica y simbólica, y chown',
        'Reconocer setuid/setgid/sticky bit como vectores de escalada',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'En Linux, **cada proceso corre con la identidad de un usuario y un grupo**. El kernel decide qué puede hacer (abrir un fichero, enlazar a un puerto <1024, matar un proceso) comparando el UID/GID del proceso con los permisos del archivo o recurso.\n\nLa base de datos de identidades vive en dos archivos:\n\n- `/etc/passwd` — lista de usuarios con 7 campos: `nombre:x:UID:GID:GECOS:home:shell`. El segundo campo (`x`) era el hash antiguamente; hoy es solo un marcador.\n- `/etc/shadow` — solo legible por root. Contiene el hash real y la política de caducidad. Si un atacante lo lee, puede crackearlo offline con john/hashcat.\n\nEn un companion computer los usuarios típicos son `root`, `pi` (Raspberry Pi OS) o `ubuntu` (Ubuntu Server), y a veces usuarios de servicio como `mavlink` o `_apt`. Cada uno define una superficie de privilegios.',
        },
        {
          id: 'legal-tip',
          type: 'callout',
          variant: 'legal',
          title: 'Scope: solo en laboratorio',
          content:
            'Crackear hashes de /etc/shadow, reutilizar credenciales o escalar privilegios fuera de un sistema **que controles o donde tengas autorización explícita** es delito en la mayoría de jurisdicciones (CFAA en EE.UU., código penal español, etc.). En esta plataforma todo se practica contra el laboratorio aislado (10.10.10.0/24, drone-lab.local).',
        },
        {
          id: 'passwd-shadow',
          type: 'terminal',
          caption: 'Estructura de /etc/passwd y /etc/shadow',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'grep "^pi:" /etc/passwd' },
            { output: 'pi:x:1000:1000:,,,:/home/pi:/bin/bash' },
            { prompt: 'student@drone-lab:~$', command: 'sudo grep "^pi:" /etc/shadow' },
            { output: 'pi:$6$rounds=5000$ saltsalt$<hash-largo>:19000:0:99999:7:::' },
            { prompt: 'student@drone-lab:~$', command: 'sudo wc -l /etc/shadow' },
            { output: '14 /etc/shadow' },
            { comment: '# $6$ = SHA-512. $y$ = yescrypt (moderno). $1$ = MD5 (obsoleto).' },
          ],
        },
        {
          id: 'chmod-table',
          type: 'table',
          caption: 'chmod: notación numérica vs simbólica',
          headers: ['Objetivo', 'Numérico', 'Simbólico', 'Efecto'],
          rows: [
            ['Script ejecutable solo para el dueño', '700', 'u=rwx,go=', 'Solo el dueño ejecuta'],
            ['Config legible por todos', '644', 'u=rw,go=r', 'Estándar de /etc'],
            ['Log privado de root', '600', 'u=rw,go=', 'Estándar de /etc/shadow'],
            ['Directorio compartido de grupo', '775', 'ug=rwx,o=rx', 'Grupo puede escribir'],
            ['Setuid en binario', '4755', 'u=rwxs,go=rx', 'Se ejecuta como dueño'],
            ['Setgid en directorio', '2775', 'ug=rwxs,o=rx', 'Hereda grupo en nuevos ficheros'],
            ['Sticky bit en /tmp', '1777', 'ug=rwx,o=rwt', 'Solo el dueño borra sus ficheros'],
          ],
        },
        {
          id: 'commands',
          type: 'terminal',
          caption: 'Gestión de usuarios y permisos en el companion',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'sudo useradd -m -s /bin/bash -G sudo,dialout mavlink' },
            { comment: '# Crea el usuario mavlink con home, bash y grupos sudo+dialout' },
            { prompt: 'student@drone-lab:~$', command: 'sudo usermod -aG video pi' },
            { comment: '# Añade pi al grupo video sin sacarlo de los demás' },
            { prompt: 'student@drone-lab:~$', command: 'sudo passwd mavlink' },
            { output: 'New password: \nRetype new password: \npasswd: password updated successfully' },
            { prompt: 'student@drone-lab:~$', command: 'sudo -u mavlink whoami' },
            { output: 'mavlink' },
            { prompt: 'student@drone-lab:~$', command: 'su - pi' },
            { output: 'Password: \n$ whoami\npi' },
            { prompt: 'student@drone-lab:~$', command: 'chmod 644 /opt/mission/config.yaml && ls -l /opt/mission/config.yaml' },
            { output: '-rw-r--r-- 1 pi pi 412 Nov 3 11:02 /opt/mission/config.yaml' },
            { prompt: 'student@drone-lab:~$', command: 'sudo chown mavlink:mavlink /opt/mission/config.yaml && ls -l /opt/mission/config.yaml' },
            { output: '-rw-r--r-- 1 mavlink mavlink 412 Nov 3 11:02 /opt/mission/config.yaml' },
            { prompt: 'student@drone-lab:~$', command: 'find / -perm -4000 -type f 2>/dev/null' },
            {
              output: `/usr/bin/sudo
/usr/bin/passwd
/usr/bin/mount
/usr/bin/su
/usr/bin/gpasswd`,
            },
          ],
        },
        {
          id: 'special-bits',
          type: 'callout',
          variant: 'warning',
          title: 'setuid, setgid, sticky bit — vectores clásicos',
          content:
            'Un binario con setuid (bit `4`, mostrado como `s` en `ls -l`) se ejecuta con los privilegios del **propietario**, no del usuario que lo lanza. Por eso `/usr/bin/sudo` y `/usr/bin/passwd` funcionan: son de root y setuid-root. Si uno de esos binarios tiene un bug (buffer overflow, path injection, ...), es una **escalada de privilegios directa a root**. Durante un forense, `find / -perm -4000 -type f` enumera todos los candidatos; compáralos contra el inventario conocido del sistema.',
        },
        {
          id: 'hardening',
          type: 'callout',
          variant: 'tip',
          title: 'Hardening mínimo del companion computer',
          content:
            'Para reducir superficie: (1) elimina usuarios innecesarios y asigna shell `/usr/sbin/nologin` a los de servicio, (2) deshabilita login directo de root (`PermitRootLogin no` en SSH), (3) restringe sudo a los comandos necesarios con `/etc/sudoers.d/`, (4) audita binarios setuid con `find / -perm -4000` periódicamente, (5) rota claves SSH y deshabilita password auth.',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description: 'Prueba `id`, `whoami`, `groups`, `ls -l /etc/shadow`, `find / -perm -4000 2>/dev/null`, `sudo -l`.',
        },
      ],
      quiz: {
        id: 'q-users-groups',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué significan los campos de /etc/passwd `pi:x:1000:1000:...`?',
            options: [
              'nombre:hash:UID:GID',
              'nombre:marcador:UID:GID (el hash está en /etc/shadow)',
              'nombre:shell:UID:GID',
              'nombre:permisos:UID:GID',
            ],
            correctIndex: 1,
            explanation:
              'El campo `x` es solo un marcador; el hash real vive en /etc/shadow (legible solo por root).',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'Un binario con permiso `-rwsr-xr-x` (setuid) se ejecuta con los privilegios de…',
            options: [
              'El usuario que lo lanza',
              'El grupo del usuario que lo lanza',
              'El propietario del binario (a menudo root)',
              'El usuario nobody',
            ],
            correctIndex: 2,
            explanation:
              'setuid hace que el proceso adquiera el EUID del propietario del archivo. Por eso sudo y passwd funcionan.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question:
              'chmod 1777 en /tmp hace que cualquier usuario pueda borrar cualquier fichero del directorio.',
            answer: false,
            explanation:
              'El sticky bit (1) hace lo contrario: solo el propietario del fichero (o root) puede borrarlo, aunque el directorio sea escribible por todos.',
          },
        ],
      },
    },
    {
      id: 'sockets-interfaces-routing',
      moduleId: '01-linux',
      title: 'Sockets, interfaces y routing',
      slug: 'sockets-interfaces-routing',
      duration: '22 min',
      difficulty: 'beginner',
      summary:
        'Qué es un socket, cómo se inspeccionan interfaces, vecinos ARP y la tabla de rutas. Entender por qué un drone necesita una ruta estática hacia la GCS para que la telemetría no se vaya por la interfaz equivocada.',
      objectives: [
        'Definir qué es un socket y sus 5 elementos',
        'Leer ip addr, ip route e ip neigh',
        'Interpretar la tabla de rutas y la puerta de enlace por defecto',
        'Justificar una ruta estática drone → GCS',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'Un **socket** es el extremo de una comunicación en Linux. Tiene cinco campos que lo identifican unívocamente:\n\n- **Protocolo** (TCP o UDP)\n- **IP local** + **puerto local**\n- **IP remota** + **puerto remoto**\n\nCuando `mavlink-router` escucha en `0.0.0.0:14550/udp`, está creando un socket con IP local `0.0.0.0` (todas las interfaces) y puerto `14550`. Cuando la GCS se conecta, el kernel completa la tupla con la IP y puerto del cliente.\n\nEl comando `ss` lista estos sockets y `ip` gestiona las tres capas que los conectan con el cable: **interfaces** (L2), **vecinos** (ARP/NDP, L2→L3) y **rutas** (L3).',
        },
        {
          id: 'diagram',
          type: 'diagram',
          title: 'Socket → interfaz → ruta → gateway',
          ascii: `   ┌─────────────────────┐
   │  mavlink-router     │  (proceso)
   │  socket 0.0.0.0:14550/udp
   └──────────┬──────────┘
              │ bind/listen
   ┌──────────▼──────────┐
   │  Tabla de sockets    │  ss -ulpn
   └──────────┬──────────┘
              │ paquete entra por...
   ┌──────────▼──────────┐
   │  eth0 10.10.10.20   │  ip addr
   │  wlan0 192.168.1.42 │
   └──────────┬──────────┘
              │ a qué red pertenece?
   ┌──────────▼──────────┐
   │  Tabla de rutas      │  ip route
   │  default via 10.10.10.1
   └──────────┬──────────┘
              │ MAC del next hop?
   ┌──────────▼──────────┐
   │  Caché ARP/NDP       │  ip neigh
   │  10.10.10.1 lladdr aa:bb:...
   └─────────────────────┘`,
          description:
            'Cada paquete sigue este camino a la inversa: el proceso lo entrega al socket, el kernel mira la tabla de rutas para elegir la interfaz y el next hop, y consulta ARP para obtener la MAC del next hop antes de enviar el frame.',
        },
        {
          id: 'ip-deep',
          type: 'terminal',
          caption: 'ip addr / route / neigh en el companion',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ip -br addr' },
            {
              output: `lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             10.10.10.20/24 metric 100
wlan0            UP             192.168.1.42/24 metric 600`,
            },
            { prompt: 'student@drone-lab:~$', command: 'ip route' },
            {
              output: `default via 10.10.10.1 dev eth0 proto dhcp metric 100
10.10.10.0/24 dev eth0 proto kernel scope link src 10.10.10.20
192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.42`,
            },
            { prompt: 'student@drone-lab:~$', command: 'ip neigh' },
            {
              output: `10.10.10.1 dev eth0 lladdr aa:bb:cc:dd:ee:01 REACHABLE
10.10.10.10 dev eth0 lladdr aa:bb:cc:dd:ee:0a STALE
192.168.1.1 dev wlan0 lladdr 11:22:33:44:55:66 DELAY`,
            },
            { comment: '# REACHABLE = confirmado. STALE = expiró, se revalida. INCOMPLETE = no responde.' },
          ],
        },
        {
          id: 'route-reading',
          type: 'text',
          content:
            'La tabla de rutas se lee **de más específica a menos específica**. Si el drone quiere hablar con `10.10.10.10`, mira la tabla:\n\n- `10.10.10.0/24 dev eth0` → coincide (24 bits), envía por eth0 con src `10.10.10.20`.\n- No llega a la ruta `default`.\n\nPara hablar con `8.8.8.8`, ninguna ruta específica coincide, así que se usa `default via 10.10.10.1 dev eth0`. Esa IP `10.10.10.1` es el **default gateway**: el next hop al que se le entrega el paquete L3 dentro de un frame L2 dirigido a su MAC (que está en la caché ARP).\n\nSi hay varias rutas `default` (una por eth0, otra por wlan0), gana la de **menor métrica**. Por eso en el companion eth0 (metric 100) tiene preferencia sobre wlan0 (metric 600).',
        },
        {
          id: 'static-route',
          type: 'callout',
          variant: 'info',
          title: 'Por qué un drone necesita una ruta estática a la GCS',
          content:
            'En un companion con dos interfaces (eth0 cableada hacia la GCS en `10.10.10.0/24` y wlan0 hacia Internet en `192.168.1.0/24`), si la GCS está en `10.10.10.5` pero el drone aprendió su IP por DHCP en wlan0, el kernel podría intentar enviar los paquetes por la interfaz equivocada. Una **ruta estática explícita** `ip route add 10.10.10.0/24 dev eth0` o, mejor, una métrica correcta, garantiza que la telemetría MAVLink vaya por el enlace dedicado y no por Internet. Esto es crítico para latencia y para no exponer telemetría a la red pública.',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description:
            'Prueba `ip addr`, `ip route`, `ip neigh`, `ss -tulpn`. Observa cómo cambia la caché ARP tras `ping 10.10.10.10`.',
        },
      ],
      quiz: {
        id: 'q-sockets-routing',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué cinco elementos identifican unívocamente un socket TCP/UDP?',
            options: [
              'IP origen, IP destino, puerto origen',
              'Protocolo, IP local, puerto local, IP remota, puerto remoto',
              'Hostname, puerto, protocolo, interfaz, MAC',
              'UID, GID, puerto, protocolo, interfaz',
            ],
            correctIndex: 1,
            explanation: 'La 5-tupla (proto + 4 campos) identifica unívocamente cada conexión.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'En `default via 10.10.10.1 dev eth0`, ¿qué es 10.10.10.1?',
            options: [
              'La IP del drone',
              'El default gateway (next hop)',
              'La IP de la GCS',
              'La IP de broadcast',
            ],
            correctIndex: 1,
            explanation: 'Es el next hop al que se entregan los paquetes sin ruta específica.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question:
              'Si dos rutas default existen con métricas 100 y 600, el kernel reparte el tráfico 50/50.',
            answer: false,
            explanation:
              'No. El kernel elige la de menor métrica. Solo hace balanceo si están configuradas explícitamente con multipath (ip route add ... nexthop).',
          },
        ],
      },
    },
    {
      id: 'ssh-and-systemd',
      moduleId: '01-linux',
      title: 'SSH, systemd y logs',
      slug: 'ssh-and-systemd',
      duration: '20 min',
      difficulty: 'beginner',
      summary:
        'SSH como puerta de entrada al companion, configuración de sshd, autenticación por clave vs password, systemd para gestionar servicios y journalctl para leer logs. Cómo detectar persistencia y credenciales por defecto.',
      objectives: [
        'Configurar /etc/ssh/sshd_config para acceso por clave',
        'Usar systemctl status/start/enable y journalctl -u / --since',
        'Leer la estructura de /var/log',
        'Detectar persistencia vía units enabled sospechosas',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'SSH es **el** vector de gestión de un companion computer. Si está expuesto y mal configurado, es también el primer vector de compromiso. systemd, por su parte, es el init que gestiona cada servicio del drone (mavlink-router, drone-api, rtsp-server, sshd). Sus logs viven en el journal (binario) y en /var/log (texto).\n\nEsta lección cubre los tres componentes juntos porque en un forense ofensivo o defensivo siempre se miran al mismo tiempo: ¿quién entró por SSH?, ¿qué servicios se arrancan al boot?, ¿qué dejaron en los logs?',
        },
        {
          id: 'default-creds',
          type: 'callout',
          variant: 'warning',
          title: 'Credenciales por defecto: pi:raspberry, ubuntu:ubuntu',
          content:
            'Raspberry Pi OS viene con `pi:raspberry`. Ubuntu cloud images con `ubuntu:ubuntu`. Muchos companion computers vuelan así en producción. El primer paso de cualquier hardening es **cambiarlas o deshabilitar el login por password**. En un pentest de un drone propio (con autorización), probar `pi:raspberry` por SSH suele ser el primer check. Si funciona, ya tienes shell.',
        },
        {
          id: 'sshd-config',
          type: 'terminal',
          caption: 'Inspección y hardening de sshd',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'sudo grep -E "^(Port|PermitRootLogin|PasswordAuthentication|PubkeyAuthentication|AllowUsers)" /etc/ssh/sshd_config' },
            {
              output: `Port 22
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
AllowUsers pi student`,
            },
            { prompt: 'student@drone-lab:~$', command: 'sudo sshd -t' },
            { comment: '# Sin salida = configuración válida. Con errores, los imprime.' },
            { prompt: 'student@drone-lab:~$', command: 'sudo systemctl restart ssh' },
            { prompt: 'student@drone-lab:~$', command: 'sudo systemctl status ssh' },
            {
              output: `● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)
     Active: active (running) since Mon 2024-11-03 11:14:02 UTC; 6s ago
   Main PID: 1843 (sshd)
      Tasks: 1 (limit: 4915)
     Memory: 4.1M`,
            },
          ],
        },
        {
          id: 'key-auth',
          type: 'steps',
          title: 'Configurar acceso SSH por clave (recomendado)',
          steps: [
            {
              title: '1. Generar par de claves en tu máquina',
              content: 'Crea un par ed25519 (más corto y seguro que RSA).',
              code: 'ssh-keygen -t ed25519 -C "student@drone-lab"',
            },
            {
              title: '2. Copiar la clave pública al companion',
              content:
                'ssh-copy-id instala ~/.ssh/id_ed25519.pub en ~/.ssh/authorized_keys del destino.',
              code: 'ssh-copy-id pi@10.10.10.20',
            },
            {
              title: '3. Verificar login sin password',
              content:
                'Si funciona, ya no necesitas password. La clave privada firma el challenge del servidor.',
              code: 'ssh -i ~/.ssh/id_ed25519 pi@10.10.10.20',
            },
            {
              title: '4. Deshabilitar password auth',
              content:
                'En /etc/ssh/sshd_config pon `PasswordAuthentication no` y reinicia sshd. A partir de aquí solo claves.',
              code: 'sudo systemctl restart ssh',
            },
            {
              title: '5. (Opcional) Restringir usuarios',
              content:
                'Añade `AllowUsers pi student` para que solo esos usuarios puedan entrar por SSH.',
            },
          ],
        },
        {
          id: 'systemd-journal',
          type: 'terminal',
          caption: 'systemctl y journalctl en acción',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'systemctl list-units --type=service --state=running' },
            {
              output: `  UNIT                LOAD   ACTIVE SUB     DESCRIPTION
● mavlink-router.svc loaded active running MAVLink Router
● drone-api.service   loaded active running Drone REST API
● rtsp-server.service loaded active running RTSP Video Server
● ssh.service         loaded active running OpenBSD Secure Shell server
● systemd-journald    loaded active running Journal Service`,
            },
            { prompt: 'student@drone-lab:~$', command: 'sudo journalctl -u drone-api --since "10 min ago" --no-pager | tail -6' },
            {
              output: `Nov 03 11:15:02 drone-companion-01 drone-api[631]: GET /api/drone/status 200 3ms
Nov 03 11:15:08 drone-companion-01 drone-api[631]: GET /api/drone/status 200 2ms
Nov 03 11:16:01 drone-companion-01 drone-api[631]: POST /api/drone/arm 401 - invalid token
Nov 03 11:16:02 drone-companion-01 drone-api[631]: POST /api/drone/arm 401 - invalid token
Nov 03 11:16:04 drone-companion-01 drone-api[631]: POST /api/drone/arm 401 - invalid token
Nov 03 11:17:10 drone-companion-01 drone-api[631]: GET /api/drone/status 200 2ms`,
            },
            { comment: '# Tres 401 seguidos en /arm: posible brute force de token. Bandera para IR.' },
          ],
        },
        {
          id: 'var-log',
          type: 'terminal',
          caption: 'Estructura de /var/log',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'ls /var/log | head' },
            {
              output: `alternatives.log
auth.log
boot.log
dpkg.log
kern.log
syslog
daemon.log`,
            },
            { prompt: 'student@drone-lab:~$', command: 'sudo tail -4 /var/log/auth.log' },
            {
              output: `Nov 03 11:16:01 drone-companion-01 sshd[1923]: Failed password for invalid user admin from 10.10.10.5 port 51022 ssh2
Nov 03 11:16:02 drone-companion-01 sshd[1923]: Failed password for invalid user admin from 10.10.10.5 port 51024 ssh2
Nov 03 11:17:11 drone-companion-01 sshd[1923]: Accepted publickey for pi from 10.10.10.5 port 51040 ssh2
Nov 03 11:17:11 drone-companion-01 systemd[1]: session-3.scope: Started Session 3 of user pi.`,
            },
            { comment: '# Brute force fallido seguido de login exitoso por clave. Patrón clásico.' },
          ],
        },
        {
          id: 'persistence',
          type: 'callout',
          variant: 'danger',
          title: 'Detectar persistencia vía units enabled',
          content:
            'Tras un compromiso, un atacante suele crear un service para arrancar su payload al boot. Detecta con:\n\n- `systemctl list-unit-files --state=enabled` (todo lo que arranca al boot)\n- `find /etc/systemd/system -name "*.service" -mtime -7` (creados/modificados últimamente)\n- `journalctl --since "7 days ago" | grep -i started`\n\nServicios con nombres con typos (`mavlink-router.service` legit vs `mavlnk-router.service` impostor), rutas a /tmp, o `User=root` sin justificación son banderas rojas inmediatas.',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description:
            'Prueba `systemctl status ssh`, `sudo journalctl -u drone-api -n 10`, `ls /var/log`, `sudo tail /var/log/auth.log`.',
        },
      ],
      quiz: {
        id: 'q-ssh-systemd',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué directiva de sshd_config deshabilita el login por password?',
            options: [
              'PermitRootLogin no',
              'PasswordAuthentication no',
              'PubkeyAuthentication yes',
              'AllowUsers pi',
            ],
            correctIndex: 1,
            explanation:
              'PasswordAuthentication no fuerza autenticación por clave (u otro método no-password).',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: '¿Qué comando lista los servicios que arrancan al boot?',
            options: [
              'systemctl list-units --type=service --state=running',
              'systemctl list-unit-files --state=enabled',
              'journalctl --list',
              'ps aux | grep enabled',
            ],
            correctIndex: 1,
            explanation:
              'list-unit-files --state=enabled muestra las units marcadas para arrancar en boot, estén o no corriendo.',
          },
          {
            id: 'q3',
            type: 'true-false',
            question:
              'journalctl --since "10 min ago" -u drone-api muestra logs de la unit drone-api de los últimos 10 minutos.',
            answer: true,
            explanation: 'Exacto. journalctl filtra por unit y por tiempo, ideal para IR y forense.',
          },
        ],
      },
    },
    {
      id: 'text-processing-pipeline',
      moduleId: '01-linux',
      title: 'Procesamiento de texto: grep, awk, sed, jq',
      slug: 'text-processing-pipeline',
      duration: '18 min',
      difficulty: 'beginner',
      summary:
        'La cadena grep → awk → sed → jq para extraer información de logs y respuestas de API del drone. Cuando curl te escupe 200 líneas de JSON o auth.log tiene 5000 líneas, estos cuatro comandos son el cinturón de utilidades.',
      objectives: [
        'Filtrar con grep usando patrones y flags',
        'Extraer columnas con awk',
        'Sustituir texto con sed',
        'Procesar JSON de la API del drone con jq',
      ],
      sections: [
        {
          id: 'intro',
          type: 'text',
          content:
            'En el día a día del pentester de drones, la mitad del trabajo es **procesar texto**: logs de autenticación, salidas de nmap, respuestas JSON de la API del drone, dumps de telemetría. Estos cuatro comandos forman la cadena estándar:\n\n- **grep** — filtrar líneas por patrón\n- **awk** — extraer y procesar columnas\n- **sed** — editar texto en streaming (sustituir, borrar, insertar)\n- **jq** — parsear JSON (es a JSON lo que awk a CSV)\n\nSe combinan con pipes (`|`): la salida de uno es la entrada del siguiente.',
        },
        {
          id: 'core',
          type: 'code',
          lang: 'bash',
          caption: 'Patrones esenciales de grep, awk, sed, jq',
          file: 'text-processing.sh',
          code: `# grep: filtrar líneas
grep "Failed password" /var/log/auth.log
grep -i "error" /var/log/syslog          # case-insensitive
grep -v "DEBUG" app.log                   # invertir (sin match)
grep -E "401|403|500" access.log          # regex extendido
grep -c "Accepted" /var/log/auth.log      # contar matches

# awk: columnas
awk '{print $1, $7}' access.log            # columnas 1 y 7
awk -F: '{print $1, $3}' /etc/passwd       # delimitador :
awk '$9 == "401" {print $7}' access.log    # filtra y proyecta

# sed: sustitución y borrado
sed 's/old/new/g' file.txt                 # reemplazo global
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' sshd_config   # in-place
sed '/^#/d' sshd_config                    # borrar comentarios
sed -n '10,20p' file.txt                   # imprimir líneas 10-20

# jq: JSON
curl -s http://10.10.10.10/api/drone/status | jq .
curl -s http://10.10.10.10/api/drone/status | jq '.battery'
curl -s http://10.10.10.10/api/drones | jq '.[] | {id, mode, battery}'
curl -s http://10.10.10.10/api/drone/status | jq 'keys'   # claves`,
        },
        {
          id: 'demo',
          type: 'terminal',
          caption: 'Análisis de logs y API del drone',
          lines: [
            { prompt: 'student@drone-lab:~$', command: 'grep "Failed password" /var/log/auth.log | awk \'{print $(NF-3)}\' | sort | uniq -c | sort -rn | head' },
            {
              output: `   42 10.10.10.5
   17 192.168.1.99
    3 10.10.10.1`,
            },
            { comment: '# Top IPs con intentos fallidos. Pivot para IR.' },
            { prompt: 'student@drone-lab:~$', command: 'curl -s http://10.10.10.10/api/drones | jq \'.[] | {id, mode, battery}\'' },
            {
              output: `{
  "id": "drone-01",
  "mode": "LOITER",
  "battery": 82
}
{
  "id": "drone-02",
  "mode": "STABILIZE",
  "battery": 47
}`,
            },
            { prompt: 'student@drone-lab:~$', command: 'curl -s http://10.10.10.10/api/drones | jq \'[.[] | select(.battery < 50)] | length\'' },
            { output: '1' },
            { comment: '# Cuántos drones tienen batería < 50%.' },
            { prompt: 'student@drone-lab:~$', command: 'sed -n "1,3p" /etc/ssh/sshd_config' },
            {
              output: `# Package generated configuration file
# See the sshd_config(5) manpage for details
# This sshd was compiled with PATH=/usr/bin:/bin:/usr/sbin:/sbin`,
            },
          ],
        },
        {
          id: 'pipeline-tip',
          type: 'callout',
          variant: 'tip',
          title: 'Pipeline típico de forense',
          content:
            'Un patrón que verás una y otra vez: `grep → awk → sort → uniq -c → sort -rn | head`. Es la receta para "dime el top 10 de lo que sea": IPs que fallaron login, endpoints más golpeados, mensajes de error más frecuentes. Memorízala.',
        },
        {
          id: 'try',
          type: 'interactive-terminal',
          title: 'Practica',
          description:
            'Prueba `grep pi /etc/passwd`, `awk -F: \'{print $1}\' /etc/passwd | head`, `curl -s http://10.10.10.10/api/drone/status | jq .`.',
        },
      ],
      quiz: {
        id: 'q-text-proc',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '¿Qué flag de grep habilita expresiones regulares extendidas (|, +, ?)?',
            options: ['-i', '-v', '-E', '-c'],
            correctIndex: 2,
            explanation:
              '-E usa ERE (extended regex). Equivale a egrep. Sin -E, | se trataría como literal.',
          },
          {
            id: 'q2',
            type: 'multiple-choice',
            question: 'En `awk -F: \'{print $1, $3}\' /etc/passwd`, ¿qué hace -F:?',
            options: [
              'Filtra líneas con ":"',
              'Fija ":" como separador de campos',
              'Fuerza modo "fast"',
              'Formatea salida en "fixed"',
            ],
            correctIndex: 1,
            explanation:
              '-F establece el separador de campos (FS). Por defecto es whitespace; con ":" permite separar los campos de /etc/passwd.',
          },
          {
            id: 'q3',
            type: 'multiple-choice',
            question: '¿Qué hace `jq \'.drones[] | {id, battery}\'`?',
            options: [
              'Crea un array drones[] con id y battery',
              'Itera el array drones y emite un objeto {id, battery} por cada elemento',
              'Filtra drones que tengan id y battery',
              'Borra id y battery de cada drone',
            ],
            correctIndex: 1,
            explanation:
              '.drones[] recorre el array; {id, battery} construye un objeto con solo esas claves para cada elemento.',
          },
        ],
      },
    },
  ],
}
