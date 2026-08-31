/**
 * Terminal engine — simulador de shell Linux para el laboratorio.
 *
 * No es un shell real: interpreta un subconjunto seguro de comandos y
 * devuelve outputs realistas. La "red" del laboratorio (hosts, puertos, API
 * del drone) y el "filesystem" son objetos en memoria. Cero tráfico saliente.
 *
 * El objetivo es pedagógico: que el estudiante practique la sintaxis de
 * ip / ss / nmap / curl / tcpdump / dig / nc contra un entorno predecible,
 * antes de usar las herramientas reales en una VM.
 */

export interface TerminalLine {
  id: string
  prompt?: string
  command?: string
  output?: string
  comment?: string
  isError?: boolean
}

const PROMPT = 'student@drone-lab:~$'

/* ------------------------------------------------------------------ */
/* Laboratorio virtual                                                 */
/* ------------------------------------------------------------------ */

interface VirtualHost {
  ip: string
  hostname: string
  mac: string
  ports: { port: number; proto: 'tcp' | 'udp'; service: string; version: string }[]
  os: string
}

const LAB_HOSTS: VirtualHost[] = [
  {
    ip: '10.10.10.1',
    hostname: 'router-lab',
    mac: '08:00:27:a8:4c:1f',
    ports: [
      { port: 22, proto: 'tcp', service: 'ssh', version: 'OpenSSH 9.2' },
      { port: 53, proto: 'udp', service: 'dns', version: 'dnsmasq 2.89' },
    ],
    os: 'Linux (OpenWrt)',
  },
  {
    ip: '10.10.10.10',
    hostname: 'drone-lab',
    mac: 'b8:27:eb:11:22:33',
    ports: [
      { port: 22, proto: 'tcp', service: 'ssh', version: 'OpenSSH 9.2' },
      { port: 80, proto: 'tcp', service: 'http', version: 'drone-api 1.4' },
      { port: 8554, proto: 'tcp', service: 'rtsp', version: 'rtsp-server 0.6' },
      { port: 14550, proto: 'udp', service: 'mavlink', version: 'MAVLink v2.0' },
      { port: 14551, proto: 'udp', service: 'mavlink', version: 'MAVLink v2.0 (gcs)' },
    ],
    os: 'Linux (Raspberry Pi OS)',
  },
  {
    ip: '10.10.10.20',
    hostname: 'gcs-lab',
    mac: '00:1b:44:55:66:77',
    ports: [
      { port: 22, proto: 'tcp', service: 'ssh', version: 'OpenSSH 9.2' },
      { port: 14550, proto: 'udp', service: 'mavlink-listener', version: 'QGC 4.3' },
    ],
    os: 'Linux (Ubuntu 22.04)',
  },
]

const HOST_BY_IP = (ip: string) => LAB_HOSTS.find((h) => h.ip === ip)
const HOST_BY_NAME = (name: string) =>
  LAB_HOSTS.find((h) => h.hostname === name || h.hostname === name.replace('.local', ''))

/* ------------------------------------------------------------------ */
/* API simulada del drone                                              */
/* ------------------------------------------------------------------ */

function droneApiResponse(path: string): { status: number; body: string } {
  const droneStatus = {
    battery: 82,
    altitude: 13.4,
    gps: true,
    mode: 'LOITER',
    armed: false,
    heading: 247,
    satellites: 14,
  }
  switch (path) {
    case '/api/drone/status':
      return { status: 200, body: JSON.stringify(droneStatus, null, 2) }
    case '/api/drone/telemetry':
      return {
        status: 200,
        body: JSON.stringify(
          {
            timestamp: '2024-11-03T10:24:18Z',
            position: { lat: 4.7110, lon: -74.0721, alt: 13.4 },
            velocity: { x: 0.1, y: -0.05, z: 0.0 },
            attitude: { roll: -0.8, pitch: 1.2, yaw: 247.0 },
            battery: { voltage: 11.8, current: 2.4, remaining: 82 },
          },
          null,
          2,
        ),
      }
    case '/api/drone/config':
      return {
        status: 200,
        body: JSON.stringify(
          {
            system_id: 1,
            component_id: 1,
            flight_controller: 'PX4 1.14',
            mavlink_version: 2,
            wifi_ssid: 'Drone-Lab-7F2A',
            telemetry_port: 14550,
            // Flag expuesta por info disclosure — es el objetivo del lab 00
            secret_flag: 'DRLAB{welcome_to_the_lab}',
          },
          null,
          2,
        ),
      }
    case '/api/drone/logs':
      return {
        status: 200,
        body: JSON.stringify(
          [
            { ts: '2024-11-03T10:20:31Z', event: 'BOOT' },
            { ts: '2024-11-03T10:20:32Z', event: 'MAVLINK_LISTEN 14550' },
            { ts: '2024-11-03T10:21:00Z', event: 'GPS_LOCK', sats: 14 },
            { ts: '2024-11-03T10:24:00Z', event: 'MODE_LOITER' },
          ],
          null,
          2,
        ),
      }
    case '/':
      return {
        status: 200,
        body: 'Drone API v1.4. Endpoints: /api/drone/{status,telemetry,config,logs}',
      }
    default:
      return { status: 404, body: '{"error":"not found"}' }
  }
}

/* ------------------------------------------------------------------ */
/* Interpretador                                                       */
/* ------------------------------------------------------------------ */

export interface ExecResult {
  output?: string
  isError?: boolean
  clear?: boolean
}

export function execCommand(raw: string): ExecResult {
  const cmd = raw.trim()
  if (!cmd) return {}

  // Permitir comentarios
  if (cmd.startsWith('#')) return { output: '' }

  const [bin, ...args] = cmd.split(/\s+/)
  const flagArgs = args.filter((a) => a.startsWith('-'))
  const posArgs = args.filter((a) => !a.startsWith('-'))

  switch (bin) {
    case 'help':
      return {
        output: `Comandos disponibles en el laboratorio:

  NAVEGACIÓN       ls, pwd, cd, cat, whoami, clear
  RED              ip (addr/route/neigh), ss, ping, dig, nc, curl
  ESCANEO          nmap (-sn, -sV, -p-)
  CAPTURA          tcpdump (-i, -nn, host, port, -w, -r)
  UTIL             echo, grep, jq, strings, xxd, history

Los comandos operan contra la red virtual del laboratorio 10.10.10.0/24.
Escribe 'ls /' o 'ip addr' para empezar.`,
      }

    case 'clear':
      return { clear: true }

    case 'whoami':
      return { output: 'student' }

    case 'hostname':
      return { output: 'gcs-lab' }

    case 'pwd':
      return { output: '/home/student' }

    case 'echo':
      return { output: posArgs.join(' ') }

    case 'ls': {
      const target = posArgs[0] ?? '.'
      if (target === '/' || target === '/')
        return {
          output: 'bin   dev  home  lib32  mnt  proc  run   srv  tmp  var\nboot  etc  lib   media  opt  root  sbin  sys  usr',
        }
      if (target === '/etc' || target === '/etc/')
        return {
          output: 'hostname  hosts  passwd  shadow  systemd  mavlink  ssh',
        }
      return { output: 'Desktop  Documents  downloads  labs  pcap  README.md' }
    }

    case 'cat': {
      const f = posArgs[0]
      if (!f) return { output: '', isError: true }
      if (f === '/etc/hostname') return { output: 'gcs-lab' }
      if (f === '/etc/hosts')
        return {
          output: '127.0.0.1 localhost\n10.10.10.10 drone-lab.local drone-lab\n10.10.10.1 router-lab.local',
        }
      if (f === 'README.md')
        return {
          output: '# DroneSec Lab\n\nTu laboratorio virtual para drone cybersecurity.\nEmpieza con `ip addr` y `nmap -sn 10.10.10.0/24`.',
        }
      return { output: `cat: ${f}: No such file or directory`, isError: true }
    }

    case 'ip': {
      const sub = posArgs[0] ?? 'addr'
      if (sub === 'addr' || sub === 'a')
        return {
          output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel
    inet 10.10.10.20/24 brd 10.10.10.255 scope global eth0
3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel
    inet 192.168.1.42/24 brd 192.168.1.255 scope global wlan0`,
        }
      if (sub === 'route' || sub === 'r')
        return {
          output: `default via 10.10.10.1 dev eth0 proto dhcp metric 100
10.10.10.0/24 dev eth0 proto kernel scope link src 10.10.10.20
192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.42`,
        }
      if (sub === 'neigh' || sub === 'n')
        return {
          output: `10.10.10.1 dev eth0 lladdr 08:00:27:a8:4c:1f REACHABLE
10.10.10.10 dev eth0 lladdr b8:27:eb:11:22:33 REACHABLE`,
        }
      if (sub === '-br' || (flagArgs.includes('-br') && sub === 'addr'))
        return {
          output: `lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             10.10.10.20/24
wlan0            UP             192.168.1.42/24`,
        }
      return { output: `Usage: ip { addr | route | neigh }` , isError: true }
    }

    case 'ss': {
      // ss -tulpn
      return {
        output: `Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port  Process
udp   UNCONN 0      0          0.0.0.0:14550      0.0.0.0:*      users:(("QGroundControl",pid=1234,fd=12))
tcp   LISTEN 0      128        0.0.0.0:22         0.0.0.0:*      users:(("sshd",pid=540,fd=3))`,
      }
    }

    case 'ping': {
      const target = posArgs[0]
      if (!target) return { output: 'ping: usage: ping [-c count] host', isError: true }
      const host = HOST_BY_IP(target) ?? HOST_BY_NAME(target)
      if (!host) return { output: `ping: ${target}: Name or service not known`, isError: true }
      const countFlag = args.find((a) => a.startsWith('-c'))
      const count = countFlag ? parseInt(countFlag.split('=')[1] ?? args[args.indexOf(countFlag) + 1] ?? '4', 10) : 4
      const lines: string[] = []
      lines.push(`PING ${host.ip} (${host.ip}) 56(84) bytes of data.`)
      for (let i = 1; i <= count; i++) {
        const t = (1.8 + Math.random() * 0.6).toFixed(2)
        lines.push(`64 bytes from ${host.ip}: icmp_seq=${i} ttl=64 time=${t} ms`)
      }
      lines.push(`--- ${host.ip} ping statistics ---`)
      lines.push(`${count} packets transmitted, ${count} received, 0% packet loss`)
      return { output: lines.join('\n') }
    }

    case 'dig': {
      const target = posArgs.find((p) => !p.startsWith('@'))
      if (!target) return { output: 'dig: usage: dig [@server] name', isError: true }
      const host = HOST_BY_NAME(target) ?? HOST_BY_IP(target)
      if (!host) return { output: `dig: ${target}: not found`, isError: true }
      if (flagArgs.includes('+short')) return { output: host.ip }
      return {
        output: `; <<>> DiG 9.18 <<>> ${target}
;; ANSWER SECTION:
${target}.    600    IN    A    ${host.ip}`,
      }
    }

    case 'nmap': {
      const target = posArgs[posArgs.length - 1]
      if (!target) return { output: 'nmap: usage: nmap [options] target', isError: true }
      // -sn: ping sweep sobre una red
      if (flagArgs.some((f) => f.includes('sn') || f.includes('sP'))) {
        if (target.includes('/')) {
          const lines = [
            `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}`,
            `Nmap scan report for router-lab (10.10.10.1)`,
            `Host is up (0.0021s latency).`,
            `Nmap scan report for drone-lab (10.10.10.10)`,
            `Host is up (0.0019s latency).`,
            `Nmap scan report for gcs-lab (10.10.10.20)`,
            `Host is up (0.0008s latency).`,
            ``,
            `Nmap done: 256 IP addresses (3 hosts up) scanned in 2.31 seconds`,
          ]
          return { output: lines.join('\n') }
        }
        const host = HOST_BY_IP(target) ?? HOST_BY_NAME(target)
        if (!host) return { output: `Nmap done: 0 hosts up`, isError: true }
        return {
          output: `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}\nNmap scan report for ${host.hostname} (${host.ip})\nHost is up (0.0019s latency).\nNmap done: 1 IP address (1 host up) scanned in 0.12 seconds`,
        }
      }
      // -sV / -sC / -p- : escaneo de puertos
      const host = HOST_BY_IP(target) ?? HOST_BY_NAME(target)
      if (!host) return { output: `Failed to resolve "${target}".`, isError: true }
      const allPorts = flagArgs.includes('-p-')
      const ports = allPorts ? host.ports : host.ports
      const lines = [
        `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}`,
        `Nmap scan report for ${host.hostname} (${host.ip})`,
        `Host is up (0.0019s latency).`,
        ``,
        `PORT      STATE    SERVICE    VERSION`,
        ...ports.map(
          (p) =>
            `${String(p.port).padEnd(9)}${p.proto === 'udp' ? 'open|filtered' : 'open'}${' '.repeat(Math.max(0, 10 - (p.proto === 'udp' ? 'open|filtered'.length : 'open'.length)))}${p.service.padEnd(10)}${p.version}`,
        ),
        ``,
        `Service Info: OS: ${host.os}`,
        ``,
        `Nmap done: 1 IP address (1 host up) scanned in 1.42 seconds`,
      ]
      return { output: lines.join('\n') }
    }

    case 'nc': {
      // nc -zv host port  |  nc -u host port
      const isUdp = flagArgs.includes('-u')
      const target = posArgs[0]
      const port = parseInt(posArgs[1] ?? '0', 10)
      const host = HOST_BY_IP(target) ?? HOST_BY_NAME(target)
      if (!host || !port) return { output: 'nc: usage: nc [-u] [-zv] host port', isError: true }
      const open = host.ports.some((p) => p.port === port && p.proto === (isUdp ? 'udp' : 'tcp'))
      if (flagArgs.includes('-z') || flagArgs.includes('-zv')) {
        return open
          ? { output: `Connection to ${host.ip} ${port} port [${isUdp ? 'udp' : 'tcp'}/${open ? 'succeeded' : 'failed'}] succeeded!` }
          : { output: `nc: connect to ${host.ip} port ${port} (${isUdp ? 'udp' : 'tcp'}) failed: Connection refused`, isError: true }
      }
      if (isUdp && port === 14550) {
        return {
          output: `Received MAVLink HEARTBEAT from ${host.ip}:
  sysid=1 compid=1 msgid=0 (HEARTBEAT) seq=142
  type=2 (quadrotor) autopilot=3 (PX4) base_mode=217 system_status=3`,
        }
      }
      return { output: '' }
    }

    case 'curl': {
      const url = posArgs[0] ?? ''
      const m = url.match(/^https?:\/\/([^/]+)(\/.*)?$/)
      if (!m) return { output: `curl: try 'curl http://10.10.10.10/api/drone/status'`, isError: true }
      const [, hostPart, pathPart] = m
      const host = HOST_BY_IP(hostPart) ?? HOST_BY_NAME(hostPart)
      if (!host) return { output: `curl: ${hostPart}: could not resolve host`, isError: true }
      const path = pathPart ?? '/'
      const { status, body } = droneApiResponse(path)
      const silent = flagArgs.includes('-s')
      const headers = flagArgs.includes('-i')
      const out: string[] = []
      if (headers) {
        out.push(`HTTP/1.1 ${status} ${status === 200 ? 'OK' : 'Not Found'}`)
        out.push(`Server: drone-api/1.4`)
        out.push(`Content-Type: application/json`)
        out.push(`Content-Length: ${body.length}`)
        out.push('')
      }
      out.push(silent ? body : body)
      if (flagArgs.includes('-o') && flagArgs.includes('-w')) {
        const wIdx = flagArgs.indexOf('-w')
        return { output: status === 200 ? '200' : String(status) }
      }
      return { output: out.join('\n') }
    }

    case 'tcpdump': {
      const iface = flagArgs.find((f) => f.startsWith('-i')) ? posArgs[0] : 'eth0'
      const hostFilter = args.find((a) => a === 'host') ? args[args.indexOf('host') + 1] : null
      const portFilter = args.find((a) => a === 'port') ? args[args.indexOf('port') + 1] : null
      if (flagArgs.includes('-w')) {
        const file = posArgs[posArgs.length - 1]
        return { output: `tcpdump: listening on ${iface}, link-type EN10MB (Ethernet), capture size 262144 bytes\n^C\n8 packets captured\n16 packets received by filter\n0 packets dropped by kernel\nsaved to ${file}` }
      }
      const lines = [
        `tcpdump: verbose output suppressed, use -v[v]... for full protocol decode`,
        `listening on ${iface}, link-type EN10MB (Ethernet), capture size 262144 bytes`,
        `10:24:14.231204 IP drone-lab.14550 > gcs-lab.14550: UDP, length 31`,
        `10:24:14.291510 IP drone-lab.14550 > gcs-lab.14550: UDP, length 42`,
        `10:24:14.351823 IP gcs-lab.54321 > drone-lab.80: Flags [S], seq 421337, win 64240, length 0`,
        `10:24:14.351945 IP drone-lab.80 > gcs-lab.54321: Flags [S.], seq 998877, ack 421338, win 64240, length 0`,
        `10:24:14.352001 IP gcs-lab.54321 > drone-lab.80: Flags [.], ack 1, win 64240, length 0`,
        `10:24:15.231402 IP drone-lab.14550 > gcs-lab.14550: UDP, length 31`,
        `^C`,
        `8 packets captured`,
        `0 packets dropped by kernel`,
      ]
      const filtered = hostFilter
        ? lines.filter((l) => l.includes(hostFilter) || l.includes('listening') || l.includes('captured') || l.includes('dropped') || l.startsWith('^C'))
        : lines
      return { output: filtered.join('\n') }
    }

    case 'strings':
    case 'xxd':
    case 'hexdump': {
      const f = posArgs[0]
      if (!f) return { output: `${bin}: missing file`, isError: true }
      if (f.includes('firmware') || f.endsWith('.bin'))
        return {
          output:
            bin === 'xxd' || bin === 'hexdump'
              ? `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 6010 4000 0000 0000  ..>.....@.....
00000020: 4000 0000 0000 0000 9001 0000 0000 0000  @...............`
              : `DRONE_FW_v2.3.1
PX4_ROOTFS
/etc/passwd
root:$6$abc...:0:0:root:/root:/bin/bash
admin:admin123
DRONE_LAB_SECRET`,
        }
      return { output: `${bin}: ${f}: No such file`, isError: true }
    }

    case 'history':
      return { output: '(usa las flechas ↑↓ del terminal integrado para navegar el historial)' }

    case 'grep':
    case 'awk':
    case 'sed':
    case 'jq':
      return { output: `${bin}: en el laboratorio integrado, usa pipelines con la salida anterior. Ej: curl -s http://10.10.10.10/api/drone/status | jq .` }

    case 'exit':
    case 'quit':
      return { output: ' Usa el botón de cierre del terminal. (No cierra nada real.)' }

    default:
      return {
        output: `bash: ${bin}: command not found\nEscribe 'help' para ver los comandos disponibles.`,
        isError: true,
      }
  }
}

export { PROMPT, LAB_HOSTS }
