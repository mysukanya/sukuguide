import { Subject, Note, StudyTask, Quiz, StudySession, AuditLog } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-netsec',
    name: 'Network Security & Protocols',
    code: 'SEC-301',
    description: 'TCP/IP internals, packet analysis, firewalls, TLS handshake and intrusion detection systems.',
    color: '#10b981',
    targetHours: 40,
    completedHours: 26,
    createdAt: '2025-09-01T08:00:00Z',
    topics: [
      {
        id: 'top-tcp-handshake',
        subjectId: 'sub-netsec',
        title: 'TCP 3-Way Handshake & Flag Analysis',
        difficulty: 'beginner',
        masteryLevel: 'mastered',
        notesCount: 2,
        completed: true,
        lastStudied: '2025-10-24T14:30:00Z'
      },
      {
        id: 'top-tls13',
        subjectId: 'sub-netsec',
        title: 'TLS 1.3 Handshake & Forward Secrecy',
        difficulty: 'intermediate',
        masteryLevel: 'proficient',
        notesCount: 1,
        completed: true,
        lastStudied: '2025-10-25T11:00:00Z'
      },
      {
        id: 'top-bpf-wireshark',
        subjectId: 'sub-netsec',
        title: 'Berkeley Packet Filters & Wireshark Dissectors',
        difficulty: 'intermediate',
        masteryLevel: 'learning',
        notesCount: 1,
        completed: false,
        lastStudied: '2025-10-22T09:15:00Z'
      },
      {
        id: 'top-bgp-hijacking',
        subjectId: 'sub-netsec',
        title: 'BGP Routing Security & RPKI Validation',
        difficulty: 'advanced',
        masteryLevel: 'novice',
        notesCount: 0,
        completed: false
      }
    ]
  },
  {
    id: 'sub-linux',
    name: 'Linux Kernel & System Internals',
    code: 'SYS-402',
    description: 'Process scheduling, virtual memory, cgroups, namespaces, eBPF and privileged system calls.',
    color: '#06b6d4',
    targetHours: 50,
    completedHours: 31,
    createdAt: '2025-09-05T10:00:00Z',
    topics: [
      {
        id: 'top-cgroups',
        subjectId: 'sub-linux',
        title: 'Control Groups (cgroups v2) & Namespaces',
        difficulty: 'intermediate',
        masteryLevel: 'proficient',
        notesCount: 2,
        completed: true,
        lastStudied: '2025-10-25T16:45:00Z'
      },
      {
        id: 'top-ebpf-tracing',
        subjectId: 'sub-linux',
        title: 'eBPF Program Loading & Kernel Probes (kprobes)',
        difficulty: 'advanced',
        masteryLevel: 'learning',
        notesCount: 1,
        completed: false,
        lastStudied: '2025-10-23T19:00:00Z'
      },
      {
        id: 'top-sys-calls',
        subjectId: 'sub-linux',
        title: 'Seccomp-BPF Syscall Filtering',
        difficulty: 'advanced',
        masteryLevel: 'novice',
        notesCount: 1,
        completed: false
      }
    ]
  },
  {
    id: 'sub-crypto',
    name: 'Applied Cryptography & PKI',
    code: 'CRY-202',
    description: 'Symmetric/Asymmetric primitives, Elliptic Curves, RSA padding schemes, and Post-Quantum signatures.',
    color: '#f59e0b',
    targetHours: 35,
    completedHours: 19,
    createdAt: '2025-09-12T12:00:00Z',
    topics: [
      {
        id: 'top-ecc',
        subjectId: 'sub-crypto',
        title: 'Elliptic Curve Diffie-Hellman (ECDH & X25519)',
        difficulty: 'intermediate',
        masteryLevel: 'proficient',
        notesCount: 1,
        completed: true,
        lastStudied: '2025-10-21T18:00:00Z'
      },
      {
        id: 'top-padding-oracle',
        subjectId: 'sub-crypto',
        title: 'CBC Padding Oracle Attacks & Timing Vulnerabilities',
        difficulty: 'advanced',
        masteryLevel: 'learning',
        notesCount: 1,
        completed: false,
        lastStudied: '2025-10-24T20:10:00Z'
      }
    ]
  },
  {
    id: 'sub-webapp',
    name: 'Web Application Security',
    code: 'APP-501',
    description: 'OWASP Top 10, SSRF, JWT vulnerabilities, SQLi exploitation, and CORS/CSP misconfigurations.',
    color: '#8b5cf6',
    targetHours: 45,
    completedHours: 38,
    createdAt: '2025-09-15T15:00:00Z',
    topics: [
      {
        id: 'top-ssrf',
        subjectId: 'sub-webapp',
        title: 'Server-Side Request Forgery (SSRF) & Cloud Metadata',
        difficulty: 'intermediate',
        masteryLevel: 'mastered',
        notesCount: 2,
        completed: true,
        lastStudied: '2025-10-26T08:30:00Z'
      },
      {
        id: 'top-jwt',
        subjectId: 'sub-webapp',
        title: 'JWT Algorithm Confusion (RS256 vs HS256) & Key Injection',
        difficulty: 'intermediate',
        masteryLevel: 'proficient',
        notesCount: 1,
        completed: true,
        lastStudied: '2025-10-25T13:20:00Z'
      }
    ]
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    subjectId: 'sub-netsec',
    topicId: 'top-tcp-handshake',
    title: 'TCP 3-Way Handshake Deep Dive & SYN Flooding Mitigation',
    contentMarkdown: `### 1. Protocol Dynamics

The transmission control protocol ensures reliable, ordered packet delivery over untrusted networks.

\`\`\`
Client                            Server
  |               SYN               |
  | ------------------------------> | [LISTEN -> SYN_RCVD]
  |                                 |
  |             SYN-ACK             |
  | <------------------------------ |
  |                                 |
  |               ACK               |
  | ------------------------------> | [ESTABLISHED]
\`\`\`

#### Sequence Number Math
- **Initial Client ISN**: $ISN_c$
- **Initial Server ISN**: $ISN_s$
- **ACK response value**: Expected Next Byte = $ISN + 1$

---

### 2. SYN Flood Mechanics & SYN Cookies
In a classical SYN Flood, an attacker transmits an onslaught of SYN packets with forged source IPs. The server creates half-open socket structures in the backlog queue until memory is exhausted.

#### Mitigation: SYN Cookies (\`syncookies=1\`)
When the socket queue fills up, the server encodes the connection state inside its own $ISN_s$:
\`\`\`bash
# Check current Linux SYN cookie setting
sysctl net.ipv4.tcp_syncookies

# Enable via sysctl
sudo sysctl -w net.ipv4.tcp_syncookies=1
\`\`\`

> **Security Note:** SYN cookies disable advanced TCP extensions like TCP Timestamps and Large Window scales unless encoded via timestamp options.`,
    tags: ['networking', 'tcp', 'ddos', 'firewalls'],
    isPinned: true,
    createdAt: '2025-10-20T10:15:00Z',
    updatedAt: '2025-10-24T14:30:00Z'
  },
  {
    id: 'note-2',
    subjectId: 'sub-linux',
    topicId: 'top-cgroups',
    title: 'Linux Namespaces vs cgroups v2 Architecture',
    contentMarkdown: `### Isolation vs Resource Limitation

Modern container engines (Docker, Podman, containerd) rely on two distinct kernel primitives:

1. **Namespaces**: Controls **what a process can see**.
2. **Control Groups (cgroups)**: Controls **how much a process can use**.

---

### The 7 Essential Linux Namespaces

| Namespace | Flag | Isolates |
| :--- | :--- | :--- |
| **PID** | \`CLONE_NEWPID\` | Process IDs (PID 1 inside container) |
| **NET** | \`CLONE_NEWNET\` | Virtual routing tables, interfaces, iptables |
| **MNT** | \`CLONE_NEWNS\` | Mount points and filesystem views |
| **IPC** | \`CLONE_NEWIPC\` | System V IPC & POSIX message queues |
| **UTS** | \`CLONE_NEWUTS\` | Hostname and NIS domain name |
| **USER** | \`CLONE_NEWUSER\`| UID/GID mappings (rootless containers) |
| **CGROUP**| \`CLONE_NEWCGROUP\`| cgroup hierarchy view |

### cgroups v2 Unified Hierarchy
In v2, all controllers are unified under a single tree mounted at \`/sys/fs/cgroup\`:
\`\`\`bash
# Inspect process cgroup association
cat /proc/self/cgroup

# Limit memory to 256MB for a unit
echo "268435456" > /sys/fs/cgroup/study_jail/memory.max
\`\`\``,
    tags: ['linux', 'kernel', 'containers', 'cgroups'],
    isPinned: true,
    createdAt: '2025-10-22T16:00:00Z',
    updatedAt: '2025-10-25T16:45:00Z'
  },
  {
    id: 'note-3',
    subjectId: 'sub-webapp',
    topicId: 'top-ssrf',
    title: 'SSRF Attack Vectors against Cloud Metadata Services',
    contentMarkdown: `### Anatomy of Cloud Metadata SSRF

Server-Side Request Forgery permits an adversary to induce the server-side application to forge HTTP requests to arbitrary domains or loopback interfaces.

#### AWS IMDSv1 vs IMDSv2
- **IMDSv1 Endpoint:** \`http://169.254.169.254/latest/meta-data/\`
  - Vulnerable directly to basic GET SSRF:
  \`\`\`http
  GET /fetch-avatar?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/EC2-Role HTTP/1.1
  Host: target.internal
  \`\`\`
- **IMDSv2 Defense:** Requires session token via \`PUT\` header with TTL hop-limit constraint:
  \`\`\`bash
  # Step 1: Token request (Cannot be issued by blind GET SSRF)
  TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
  # Step 2: Metadata request with token header
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/
  \`\`\`

#### Hardening Checklist
- [x] Configure AWS IMDSv2 mandatory mode (\`HttpTokens=required\`).
- [x] Enforce egress firewall rules blocking subnet \`169.254.0.0/16\` on web worker pods.
- [x] Use DNS resolver validation with resolved IP checking to prevent DNS Rebinding.`,
    tags: ['websec', 'ssrf', 'aws', 'owasp'],
    isPinned: false,
    createdAt: '2025-10-25T09:00:00Z',
    updatedAt: '2025-10-26T08:30:00Z'
  }
];

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    subjectId: 'sub-netsec',
    title: 'Analyze Wireshark PCAP capture for TLS 1.3 key exchange',
    dueDate: '2025-10-27T18:00:00Z',
    priority: 'high',
    status: 'in_progress',
    estimatedMinutes: 60
  },
  {
    id: 'task-2',
    subjectId: 'sub-linux',
    title: 'Write test program invoking clone3() with user namespace UID remapping',
    dueDate: '2025-10-28T20:00:00Z',
    priority: 'critical',
    status: 'pending',
    estimatedMinutes: 90
  },
  {
    id: 'task-3',
    subjectId: 'sub-crypto',
    title: 'Derive shared secret in Python using cryptography.hazmat X25519',
    dueDate: '2025-10-29T15:00:00Z',
    priority: 'medium',
    status: 'pending',
    estimatedMinutes: 45
  },
  {
    id: 'task-4',
    subjectId: 'sub-webapp',
    title: 'Complete PortSwigger Web Security Academy Lab on SSRF with DNS rebinding',
    dueDate: '2025-10-26T22:00:00Z',
    priority: 'high',
    status: 'completed',
    estimatedMinutes: 75
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-netsec-1',
    subjectId: 'sub-netsec',
    title: 'Packet Analysis & Protocol Defenses Lab',
    description: 'Test your understanding of TCP sequence numbers, SYN flood mitigation, and packet dissection.',
    difficulty: 'medium',
    bestScore: 85,
    attemptsCount: 2,
    lastAttemptAt: '2025-10-24T19:30:00Z',
    questions: [
      {
        id: 'q1',
        question: 'During a TCP handshake, if the client sends SYN with sequence number 1000, what sequence number will the client use for its ACK in the 3rd step?',
        options: ['1000', '1001', '1002', 'Server ISN + 1'],
        correctIndex: 1,
        explanation: 'The client SYN consumes 1 sequence number. Thus, the client ACK packet will have Seq = 1001 and Ack = Server ISN + 1.',
        category: 'TCP Protocols'
      },
      {
        id: 'q2',
        question: 'How do TCP SYN Cookies protect a server against connection table resource exhaustion?',
        options: [
          'They drop all incoming SYN packets exceeding 1000 requests/second',
          'They encode the connection state in the server ISN without allocating memory until the client sends ACK',
          'They automatically issue an RST packet to unauthenticated IP addresses',
          'They authenticate packets using hardware HSM signatures'
        ],
        correctIndex: 1,
        explanation: 'SYN cookies encode timestamp, MSS, and a cryptographic hash of client IP/port into the server initial sequence number, eliminating state allocation until the final ACK.',
        category: 'Firewalls & DoS'
      },
      {
        id: 'q3',
        question: 'Which Berkeley Packet Filter (BPF) string captures only TCP packets with the SYN flag set and ACK flag unset?',
        codeSnippet: 'tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn',
        options: [
          'tcp port 80 and syn',
          'tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn',
          'ip proto tcp and flags == 0x02',
          'tcp.flags.syn == 1 && tcp.flags.ack == 0'
        ],
        correctIndex: 1,
        explanation: 'tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn inspects the flag byte, masks both SYN and ACK bits, and validates that solely SYN is set.',
        category: 'Packet Analysis'
      }
    ]
  },
  {
    id: 'quiz-linux-1',
    subjectId: 'sub-linux',
    title: 'Kernel Subsystems & Container Isolation Test',
    description: 'Evaluate core comprehension of cgroups v2, namespace cloning flags, and seccomp filters.',
    difficulty: 'hard',
    attemptsCount: 0,
    questions: [
      {
        id: 'q4',
        question: 'Which Linux namespace provides isolated IP routing tables, iptables rule sets, and virtual ethernet pairs?',
        options: ['CLONE_NEWPID', 'CLONE_NEWNS', 'CLONE_NEWNET', 'CLONE_NEWIPC'],
        correctIndex: 2,
        explanation: 'Network namespaces (CLONE_NEWNET) isolate network devices, IPv4/IPv6 protocol stacks, port binding ranges, and iptables tables.',
        category: 'Namespaces'
      },
      {
        id: 'q5',
        question: 'Under cgroups v2, what primary file specifies the hard upper ceiling of memory before the kernel OOM killer intervenes?',
        options: ['memory.limit_in_bytes', 'memory.max', 'memory.high', 'memory.pressure'],
        correctIndex: 1,
        explanation: 'In cgroups v2, memory.max sets the hard ceiling. If exceeded and reclaim fails, OOM-killer activates. (memory.limit_in_bytes was used in v1).',
        category: 'cgroups v2'
      }
    ]
  }
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'sub-netsec',
    subjectName: 'Network Security & Protocols',
    durationMinutes: 45,
    type: 'reading',
    completedAt: '2025-10-25T14:45:00Z'
  },
  {
    id: 'sess-2',
    subjectId: 'sub-linux',
    subjectName: 'Linux Kernel & System Internals',
    durationMinutes: 60,
    type: 'deep_focus',
    completedAt: '2025-10-25T17:00:00Z'
  },
  {
    id: 'sess-3',
    subjectId: 'sub-webapp',
    subjectName: 'Web Application Security',
    durationMinutes: 30,
    type: 'quiz_lab',
    completedAt: '2025-10-26T09:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'SESSION_INITIALIZED',
    target: 'sukuguide_kernel_v2.4',
    timestamp: '2025-10-26T08:00:00Z',
    status: 'SUCCESS'
  },
  {
    id: 'log-2',
    action: 'NOTE_SYNCED',
    target: 'SSRF Attack Vectors against Cloud Metadata Services',
    timestamp: '2025-10-26T08:30:12Z',
    status: 'SUCCESS'
  },
  {
    id: 'log-3',
    action: 'LAB_ATTEMPT_RECORDED',
    target: 'PortSwigger Web Security Lab 4',
    timestamp: '2025-10-26T09:00:44Z',
    status: 'INFO'
  },
  {
    id: 'log-4',
    action: 'SECURITY_SCAN',
    target: 'RLS policies checked on table: profiles',
    timestamp: '2025-10-26T10:15:00Z',
    status: 'SUCCESS'
  }
];
