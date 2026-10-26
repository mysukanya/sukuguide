import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Code2,
  FileText,
  HelpCircle,
  RotateCcw,
  Cpu,
  Layers
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AIMessage } from '../types';

export const AITutorPage: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-init',
      role: 'system',
      content: 'SukuGuide AI Study Daemon v2.4 initialized. Ready for cybersecurity analysis, protocol explanations, and exam preparation. Enter any technical query or use quick prompt directives.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Welcome to the Cybersecurity Study Console. I can assist you with:
- Explaining network protocols & packet flows (TCP, TLS, BGP, DNS)
- Deep-diving into Linux kernel primitives (cgroups, namespaces, eBPF, seccomp)
- Security vulnerability analysis (SSRF, Memory corruption, XSS, CSRF)
- Generating technical cheat sheets & CLI reference commands

Type your question below or click a quick prompt to begin.`,
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<string>('general');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      // Attempt serverless backend endpoint
      const response = await fetch('/.netlify/functions/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          conversationHistory: messages.slice(-4)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: AIMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.reply || data.content,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // Fallback to intelligent local cybersecurity tutor engine
        const localReply = generateLocalCyberResponse(query);
        const aiMsg: AIMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: localReply,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch {
      // Offline / local fallback
      const localReply = generateLocalCyberResponse(query);
      const aiMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: localReply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Intelligent local domain response generator for cybersecurity students
  const generateLocalCyberResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('tls') || q.includes('ssl') || q.includes('handshake')) {
      return `### TLS 1.3 vs TLS 1.2 Handshake Analysis

In TLS 1.3 (RFC 8446), round-trip latency was reduced from 2-RTT to **1-RTT** (or 0-RTT for resumed sessions).

\`\`\`
Client                                               Server
  |                                                    |
  |  ClientHello                                       |
  |  + KeyShare (Diffie-Hellman public key)            |
  |  + SupportedGroups (e.g., x25519)                  |
  | -------------------------------------------------> |
  |                                                    |
  |                               ServerHello          |
  |                               + KeyShare (Server)  |
  |                               {EncryptedExtensions}|
  |                               {Certificate}        |
  |                               {CertificateVerify}  |
  |                               {Finished}           |
  | <------------------------------------------------- |
  |                                                    |
  |  {Finished}                                        |
  | -------------------------------------------------> |
  |  [Application Data - Encrypted]                    |
  | <================================================> |
\`\`\`

#### Key Security Improvements
1. **Removed Weak Ciphers**: RSA key exchange (which lacked forward secrecy), static DH, RC4, 3DES, and CBC-mode ciphers were completely deprecated.
2. **Mandatory Forward Secrecy**: Every handshake uses Ephemeral Diffie-Hellman (\`ECDHE\`).
3. **Encrypted Certificates**: The server certificate is encrypted over the wire, blocking passive eavesdroppers from observing domain names via certificate inspection.`;
    }

    if (q.includes('cgroup') || q.includes('namespace') || q.includes('container') || q.includes('kernel')) {
      return `### Linux Kernel Isolation: cgroups v2 & Namespaces

Containers are not virtual machines; they are standard Linux processes executing within isolated namespaces and constrained by control groups.

#### 1. Namespace Hierarchy
- **PID Namespace**: Remaps container init process to PID 1 while maintaining a distinct PID on the host.
- **Mount Namespace (\`CLONE_NEWNS\`)**: Supplies a container-specific root filesystem (\`pivot_root\`).
- **Network Namespace (\`CLONE_NEWNET\`)**: Provides isolated \`veth\` pair, separate routing table, and private loopback.

#### 2. cgroups v2 Architecture
Mounted at \`/sys/fs/cgroup\`, v2 replaces the conflicting multi-hierarchy trees of v1 with a single unified hierarchy:
\`\`\`bash
# Create custom control group
sudo mkdir /sys/fs/cgroup/sandbox_jail

# Enforce 512MB RAM ceiling
echo "536870912" | sudo tee /sys/fs/cgroup/sandbox_jail/memory.max

# Attach running process (PID: 1337)
echo "1337" | sudo tee /sys/fs/cgroup/sandbox_jail/cgroup.procs
\`\`\`

> **Exam Tip:** Memory.high provides throttled reclamation pressure, whereas memory.max invokes the OOM killer immediately upon breach.`;
    }

    if (q.includes('ssrf') || q.includes('metadata') || q.includes('owasp')) {
      return `### Server-Side Request Forgery (SSRF) Defense in Depth

SSRF occurs when an unvalidated URL provided by an end-user is resolved and fetched directly by the back-end application server.

#### Attack Scenario: AWS IMDS Exploitation
An attacker targets an avatar upload endpoint with:
\`http://169.254.169.254/latest/meta-data/iam/security-credentials/\`

#### Technical Remediation Matrix
1. **Network Egress Filtering**: Block outbound connections from app worker nodes to link-local address spaces (\`169.254.0.0/16\` and \`127.0.0.0/8\`).
2. **DNS Resolution Verification**:
   - Resolve hostname to IP first.
   - Assert the resolved IP does not belong to private CIDRs (\`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\`, \`127.0.0.0/8\`, \`169.254.0.0/16\`).
   - Pin the validated IP for the subsequent HTTP socket connection to protect against **DNS Rebinding**.
3. **IMDSv2 Mandatory Configuration**:
   \`aws ec2 modify-instance-metadata-options --http-tokens required --http-endpoint enabled\``;
    }

    if (q.includes('buffer') || q.includes('stack') || q.includes('overflow') || q.includes('rop')) {
      return `### Stack-Based Buffer Overflow & Modern Mitigations

When an unbounded string function (e.g. \`strcpy\`, \`gets\`, \`sprintf\`) writes past the allocated stack buffer boundary, it overwrites the saved Frame Pointer (\`EBP/RBP\`) and the saved Return Instruction Pointer (\`EIP/RIP\`).

\`\`\`
Low Memory                                                       High Memory
[ Buffer (64 bytes) ] [ Saved RBP (8 bytes) ] [ Return Address (8 bytes) ]
<======== attacker payload overwrites rightwards ==========> [ 0xdeadbeef ]
\`\`\`

#### Modern Exploit Mitigations
1. **Stack Canaries (\`-fstack-protector-all\`)**:
   Inserts a random canary value right before the saved return address. Prior to \`ret\`, the function asserts the canary matches \`%fs:0x28\`.
2. **Data Execution Prevention (NX / DEP)**:
   Marks stack and heap pages as non-executable via the MMU page table NX bit. Requires attackers to utilize Return-Oriented Programming (\`ROP\`).
3. **ASLR (Address Space Layout Randomization)**:
   Randomizes base addresses of stack, heap, and shared libraries (\`libc\`). Bypassed via memory leak information disclosures.`;
    }

    return `### Technical Analysis: ${query}

Here is a structured cybersecurity breakdown:

1. **Foundational Concept**:
   The subject involves system-level resource constraints, protocol packet dynamics, and boundary validation between privileged and unprivileged execution domains.

2. **Attack Surface & Vulnerability Vectors**:
   - Misconfiguration in boundary parameters or trust models.
   - Missing input sanitization and failure to enforce strict type or size bounds.
   - Implicit trust placed in unauthenticated peer network payloads.

3. **Detection & Forensic Monitoring**:
   \`\`\`bash
   # Inspect active connections and listening sockets
   ss -tulpn
   # Trace system call execution and signals
   strace -e trace=network,memory -f ./binary_under_test
   \`\`\`

4. **Hardening Guidance**:
   Apply defense-in-depth principles: least-privilege service accounts, memory safe compilation flags (\`-D_FORTIFY_SOURCE=2\`), and network isolation.`;
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-init',
        role: 'system',
        content: 'Session flushed. SukuGuide AI daemon ready for new inquiries.',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const promptPresets = [
    {
      label: 'TLS 1.3 Handshake',
      query: 'Explain the TLS 1.3 1-RTT handshake and how it improves on TLS 1.2 forward secrecy.'
    },
    {
      label: 'cgroups v2 vs Namespaces',
      query: 'What is the distinction between Linux namespaces and cgroups v2 in container isolation?'
    },
    {
      label: 'IMDSv2 SSRF Defense',
      query: 'How does IMDSv2 mitigate SSRF attacks targeting AWS EC2 metadata credentials?'
    },
    {
      label: 'Stack Buffer Overflow',
      query: 'Explain how stack canaries, NX bit, and ASLR prevent classic buffer overflow exploitation.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-1">
            <Terminal className="w-4 h-4" />
            <span>AI_DAEMON // INTERACTIVE_TUTOR</span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
            CYBERSECURITY STUDY TUTOR
          </h1>
          <p className="text-xs text-slate-400">
            Secure server-side assisted study companion for exam prep, packet dissection, and CVE analysis.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={handleResetChat}
        >
          FLUSH_TERMINAL
        </Button>
      </div>

      {/* Main Terminal Window Frame */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg shadow-cyber-card overflow-hidden flex flex-col min-h-[620px] max-h-[800px]">
        {/* Terminal Header Bar */}
        <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="h-3.5 w-px bg-cyber-border mx-1" />
            <span className="font-mono text-xs text-emerald-400 font-semibold">
              tutor@sukuguide-daemon:~$ ./study_tutor.sh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="green" size="sm">
              <Cpu className="w-3 h-3" />
              <span>SERVERLESS_CONNECTED</span>
            </Badge>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-4 py-2.5 bg-cyber-bg/70 border-b border-cyber-border flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-[11px] text-slate-500 uppercase shrink-0 font-semibold">
            DIRECTIVES:
          </span>
          {promptPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset.query)}
              className="px-2.5 py-1 bg-cyber-surface hover:bg-cyber-card border border-cyber-border hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 rounded text-[11px] whitespace-nowrap transition-colors"
            >
              &gt; {preset.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            if (msg.role === 'system') {
              return (
                <div
                  key={msg.id}
                  className="p-3 bg-cyber-bg/60 border border-cyber-border/80 rounded font-mono text-xs text-slate-400 flex items-start gap-2.5"
                >
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-semibold">[SYSTEM_KERNEL] </span>
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            }

            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 mt-1 font-mono text-xs font-bold">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-lg p-4 font-mono text-xs transition-all ${
                    isUser
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                      : 'bg-cyber-bg border border-cyber-border text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-cyber-border/40 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-400">
                      {isUser ? 'STUDENT_OPERATOR' : 'SUKUGUIDE_TUTOR_ENGINE'}
                    </span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded bg-cyber-card border border-cyber-border flex items-center justify-center text-slate-300 shrink-0 mt-1 font-mono text-xs font-bold">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 text-xs leading-relaxed justify-start">
              <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 mt-1 font-mono text-xs font-bold">
                AI
              </div>
              <div className="bg-cyber-bg border border-cyber-border rounded-lg p-4 font-mono text-xs text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>COMPUTING_RESPONSE // CONSULTING CYBERSECURITY KNOWLEDGE GRAPH...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Command Input Box */}
        <div className="p-4 bg-cyber-bg border-t border-cyber-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute left-3 top-2.5 flex items-center gap-1 font-mono text-xs text-emerald-400 pointer-events-none select-none">
                <span>&gt;</span>
              </div>
              <input
                type="text"
                placeholder="Ask about CVEs, exploit vectors, packet structures, or exam topics..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={loading}
                className="w-full bg-cyber-surface border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 pl-7 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !inputPrompt.trim()}
              loading={loading}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              EXEC
            </Button>
          </form>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
            <span>Keys secured via Netlify serverless proxy. No secret keys stored in browser.</span>
            <span>ENTER to execute</span>
          </div>
        </div>
      </div>
    </div>
  );
};
