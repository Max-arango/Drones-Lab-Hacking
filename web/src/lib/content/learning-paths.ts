import type { LearningPath } from './types'

export const learningPaths: LearningPath[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    level: 'beginner',
    description:
      'De cero a tu primer análisis de tráfico drone. Linux, networking, arquitectura y captura básica.',
    icon: 'Sprout',
    steps: [
      { moduleId: '00-start-here', label: 'Start Here' },
      { moduleId: '01-linux', label: 'Linux para Drone Security' },
      { moduleId: '02-networking', label: 'Networking desde cero' },
      { moduleId: '03-drone-architecture', label: 'How Drones Communicate' },
      { moduleId: '04-packets', label: 'Packets' },
      { moduleId: '05-wireshark', label: 'Wireshark' },
    ],
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    level: 'intermediate',
    description:
      'Enumeración activa, APIs, paquetes a fondo y el primer contacto con MAVLink y el companion computer.',
    icon: 'TrendingUp',
    steps: [
      { moduleId: '06-tcpdump', label: 'tcpdump' },
      { moduleId: '07-wifi', label: 'Wi-Fi Security' },
      { moduleId: '08-discovery', label: 'Drone Discovery' },
      { moduleId: '09-endpoints', label: 'Endpoints' },
      { moduleId: '10-api-security', label: 'API Security' },
      { moduleId: '11-request-capture', label: 'Request Capture' },
      { moduleId: '12-request-replay', label: 'Request Replay' },
      { moduleId: '13-mavlink', label: 'MAVLink / Telemetry' },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    level: 'advanced',
    description:
      'Firmware, ingeniería inversa, fuzzing y forense. El territorio del investigador de UAVs.',
    icon: 'Flame',
    steps: [
      { moduleId: '14-drone-simulator', label: 'Drone Simulator' },
      { moduleId: '16-companion-computer', label: 'Companion Computer' },
      { moduleId: '17-firmware', label: 'Firmware Analysis' },
      { moduleId: '18-reverse-engineering', label: 'Reverse Engineering' },
      { moduleId: '19-fuzzing', label: 'Fuzzing' },
      { moduleId: '20-forensics', label: 'Drone Forensics' },
    ],
  },
  {
    id: 'red-team',
    name: 'Red Team',
    level: 'expert',
    description:
      'Ruta ofensiva: ataque lab por lab, desde descubrimiento hasta explotación de protocolos.',
    icon: 'Swords',
    steps: [
      { moduleId: '15-attack-labs', label: 'Attack Labs' },
      { moduleId: '07-wifi', label: 'Wi-Fi Security' },
      { moduleId: '10-api-security', label: 'API Security' },
      { moduleId: '13-mavlink', label: 'MAVLink / Telemetry' },
      { moduleId: '19-fuzzing', label: 'Fuzzing' },
    ],
  },
  {
    id: 'blue-team',
    name: 'Blue Team',
    level: 'advanced',
    description:
      'Ruta defensiva: detección, hardening, respuesta a incidentes y forense de UAVs.',
    icon: 'ShieldCheck',
    steps: [
      { moduleId: '22-defensive', label: 'Defensive Security' },
      { moduleId: '23-incident-response', label: 'Incident Response' },
      { moduleId: '20-forensics', label: 'Drone Forensics' },
      { moduleId: '21-threat-modeling', label: 'Threat Modeling' },
      { moduleId: '17-firmware', label: 'Firmware Analysis' },
    ],
  },
  {
    id: 'researcher',
    name: 'Researcher',
    level: 'expert',
    description:
      'Investigación de protocolos y vulnerabilidades nuevas en sistemas UAV.',
    icon: 'FlaskConical',
    steps: [
      { moduleId: '13-mavlink', label: 'MAVLink / Telemetry' },
      { moduleId: '18-reverse-engineering', label: 'Reverse Engineering' },
      { moduleId: '19-fuzzing', label: 'Fuzzing' },
      { moduleId: '21-threat-modeling', label: 'Threat Modeling' },
    ],
  },
]
