# Security Implementation Guide

## Security Philosophy
Terminal++ implements a defense-in-depth security model with multiple layers of protection, zero-trust architecture, and comprehensive threat detection.

## 1. Container Security

### 1.1 Rootless Containers
```dockerfile
# Base security-hardened image
FROM ubuntu:22.04

# Create non-root user
RUN groupadd -g 1000 terminalpp && \
    useradd -u 1000 -g terminalpp -s /bin/bash -m terminalpp

# Remove unnecessary packages
RUN apt-get update && \
    apt-get remove -y --purge \
        wget curl netcat telnet ssh && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set up secure filesystem
RUN chmod 700 /home/terminalpp && \
    chown -R terminalpp:terminalpp /home/terminalpp

USER terminalpp
WORKDIR /home/terminalpp
```

### 1.2 Resource Limits
```typescript
interface SecurityLimits {
  // CPU limits
  cpu_quota: number;      // 100000 = 1 CPU core
  cpu_period: number;     // 100000 microseconds
  
  // Memory limits
  memory_limit: string;   // "2G"
  memory_swap: string;    // "2G" (no additional swap)
  
  // Process limits
  max_processes: number;  // 100
  max_open_files: number; // 1024
  
  // Network limits
  network_mode: 'restricted';
  allowed_ports: number[];
  
  // Filesystem limits
  disk_quota: string;     // "10G"
  read_only_paths: string[];
  tmpfs_mounts: TmpfsMount[];
}

class ContainerSecurity {
  async createSecureContainer(
    image: string, 
    limits: SecurityLimits
  ): Promise<Container> {
    
    const containerConfig = {
      // Security options
      SecurityOpt: [
        'no-new-privileges:true',
        'seccomp:./seccomp-profile.json',
        'apparmor:docker-default'
      ],
      
      // Resource limits
      HostConfig: {
        // CPU limits
        CpuQuota: limits.cpu_quota,
        CpuPeriod: limits.cpu_period,
        
        // Memory limits
        Memory: this.parseMemory(limits.memory_limit),
        MemorySwap: this.parseMemory(limits.memory_swap),
        
        // Process limits
        PidsLimit: limits.max_processes,
        Ulimits: [
          { Name: 'nofile', Soft: limits.max_open_files, Hard: limits.max_open_files }
        ],
        
        // Network isolation
        NetworkMode: 'sandbox_network',
        
        // Filesystem security
        ReadonlyRootfs: false,
        ReadonlyPaths: limits.read_only_paths,
        Tmpfs: this.createTmpfsMounts(limits.tmpfs_mounts),
        
        // Capabilities (drop all, add only necessary)
        CapDrop: ['ALL'],
        CapAdd: ['CHOWN', 'SETGID', 'SETUID']
      }
    };
    
    return await this.docker.createContainer(containerConfig);
  }
}
```

### 1.3 Seccomp Profile
```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": [
        "read", "write", "open", "close", "stat", "fstat", "lstat",
        "poll", "lseek", "mmap", "mprotect", "munmap", "brk",
        "rt_sigaction", "rt_sigprocmask", "rt_sigreturn", "ioctl",
        "access", "pipe", "select", "sched_yield", "mremap",
        "msync", "mincore", "madvise", "shmget", "shmat", "shmctl",
        "dup", "dup2", "pause", "nanosleep", "getitimer", "alarm",
        "setitimer", "getpid", "sendfile", "socket", "connect",
        "accept", "sendto", "recvfrom", "sendmsg", "recvmsg",
        "shutdown", "bind", "listen", "getsockname", "getpeername",
        "socketpair", "setsockopt", "getsockopt", "clone", "fork",
        "vfork", "execve", "exit", "wait4", "kill", "uname",
        "semget", "semop", "semctl", "shmdt", "msgget", "msgsnd",
        "msgrcv", "msgctl", "fcntl", "flock", "fsync", "fdatasync",
        "truncate", "ftruncate", "getdents", "getcwd", "chdir",
        "fchdir", "rename", "mkdir", "rmdir", "creat", "link",
        "unlink", "symlink", "readlink", "chmod", "fchmod",
        "chown", "fchown", "lchown", "umask", "gettimeofday",
        "getrlimit", "getrusage", "sysinfo", "times", "ptrace",
        "getuid", "syslog", "getgid", "setuid", "setgid",
        "geteuid", "getegid", "setpgid", "getppid", "getpgrp",
        "setsid", "setreuid", "setregid", "getgroups", "setgroups",
        "setresuid", "getresuid", "setresgid", "getresgid",
        "getpgid", "setfsuid", "setfsgid", "getsid", "capget",
        "capset", "rt_sigpending", "rt_sigtimedwait", "rt_sigqueueinfo",
        "rt_sigsuspend", "sigaltstack", "utime", "mknod", "uselib",
        "personality", "ustat", "statfs", "fstatfs", "sysfs",
        "getpriority", "setpriority", "sched_setparam", "sched_getparam",
        "sched_setscheduler", "sched_getscheduler", "sched_get_priority_max",
        "sched_get_priority_min", "sched_rr_get_interval", "mlock",
        "munlock", "mlockall", "munlockall", "vhangup", "modify_ldt",
        "pivot_root", "prctl", "arch_prctl", "adjtimex", "setrlimit",
        "chroot", "sync", "acct", "settimeofday", "mount", "umount2",
        "swapon", "swapoff", "reboot", "sethostname", "setdomainname",
        "iopl", "ioperm", "create_module", "init_module", "delete_module",
        "get_kernel_syms", "query_module", "quotactl", "nfsservctl",
        "getpmsg", "putpmsg", "afs_syscall", "tuxcall", "security",
        "gettid", "readahead", "setxattr", "lsetxattr", "fsetxattr",
        "getxattr", "lgetxattr", "fgetxattr", "listxattr", "llistxattr",
        "flistxattr", "removexattr", "lremovexattr", "fremovexattr",
        "tkill", "time", "futex", "sched_setaffinity", "sched_getaffinity",
        "set_thread_area", "io_setup", "io_destroy", "io_getevents",
        "io_submit", "io_cancel", "get_thread_area", "lookup_dcookie",
        "epoll_create", "epoll_ctl_old", "epoll_wait_old", "remap_file_pages",
        "getdents64", "set_tid_address", "restart_syscall", "semtimedop",
        "fadvise64", "timer_create", "timer_settime", "timer_gettime",
        "timer_getoverrun", "timer_delete", "clock_settime", "clock_gettime",
        "clock_getres", "clock_nanosleep", "exit_group", "epoll_wait",
        "epoll_ctl", "tgkill", "utimes", "vserver", "mbind", "set_mempolicy",
        "get_mempolicy", "mq_open", "mq_unlink", "mq_timedsend",
        "mq_timedreceive", "mq_notify", "mq_getsetattr", "kexec_load",
        "waitid", "add_key", "request_key", "keyctl", "ioprio_set",
        "ioprio_get", "inotify_init", "inotify_add_watch", "inotify_rm_watch",
        "migrate_pages", "openat", "mkdirat", "mknodat", "fchownat",
        "futimesat", "newfstatat", "unlinkat", "renameat", "linkat",
        "symlinkat", "readlinkat", "fchmodat", "faccessat", "pselect6",
        "ppoll", "unshare", "set_robust_list", "get_robust_list",
        "splice", "tee", "sync_file_range", "vmsplice", "move_pages",
        "utimensat", "epoll_pwait", "signalfd", "timerfd_create",
        "eventfd", "fallocate", "timerfd_settime", "timerfd_gettime",
        "accept4", "signalfd4", "eventfd2", "epoll_create1", "dup3",
        "pipe2", "inotify_init1", "preadv", "pwritev", "rt_tgsigqueueinfo",
        "perf_event_open", "recvmmsg", "fanotify_init", "fanotify_mark",
        "prlimit64", "name_to_handle_at", "open_by_handle_at",
        "clock_adjtime", "syncfs", "sendmmsg", "setns", "getcpu",
        "process_vm_readv", "process_vm_writev", "kcmp", "finit_module"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

## 2. Network Security

### 2.1 Network Isolation
```typescript
class NetworkSecurity {
  async createSandboxNetwork(): Promise<NetworkConfig> {
    // Create isolated bridge network
    const network = await this.docker.createNetwork({
      Name: 'sandbox_network',
      Driver: 'bridge',
      Options: {
        'com.docker.network.bridge.enable_icc': 'false',
        'com.docker.network.bridge.enable_ip_masquerade': 'false',
        'com.docker.network.driver.mtu': '1500'
      },
      IPAM: {
        Config: [{
          Subnet: '172.20.0.0/16',
          Gateway: '172.20.0.1'
        }]
      }
    });
    
    // Apply firewall rules
    await this.applyFirewallRules(network.Id);
    
    return network;
  }
  
  private async applyFirewallRules(networkId: string): Promise<void> {
    const rules = [
      // Block inter-container communication
      'iptables -I DOCKER-USER -i br-' + networkId + ' -o br-' + networkId + ' -j DROP',
      
      // Allow only specific outbound ports
      'iptables -I DOCKER-USER -i br-' + networkId + ' -p tcp --dport 80 -j ACCEPT',
      'iptables -I DOCKER-USER -i br-' + networkId + ' -p tcp --dport 443 -j ACCEPT',
      'iptables -I DOCKER-USER -i br-' + networkId + ' -p tcp --dport 53 -j ACCEPT',
      'iptables -I DOCKER-USER -i br-' + networkId + ' -p udp --dport 53 -j ACCEPT',
      
      // Block everything else
      'iptables -I DOCKER-USER -i br-' + networkId + ' -j DROP'
    ];
    
    for (const rule of rules) {
      await this.exec(rule);
    }
  }
}
```

### 2.2 TLS/SSL Configuration
```typescript
interface TLSConfig {
  cert_path: string;
  key_path: string;
  ca_path?: string;
  min_version: '1.2' | '1.3';
  cipher_suites: string[];
  require_client_cert: boolean;
}

class TLSManager {
  private readonly tlsConfig: TLSConfig = {
    cert_path: '/certs/server.crt',
    key_path: '/certs/server.key',
    min_version: '1.3',
    cipher_suites: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256'
    ],
    require_client_cert: false
  };
  
  async setupTLS(app: Express): Promise<void> {
    const options: https.ServerOptions = {
      cert: await fs.readFile(this.tlsConfig.cert_path),
      key: await fs.readFile(this.tlsConfig.key_path),
      minVersion: this.tlsConfig.min_version,
      ciphers: this.tlsConfig.cipher_suites.join(':')
    };
    
    if (this.tlsConfig.require_client_cert) {
      options.requestCert = true;
      options.rejectUnauthorized = true;
      options.ca = await fs.readFile(this.tlsConfig.ca_path!);
    }
    
    const server = https.createServer(options, app);
    server.listen(443);
  }
}
```

## 3. Authentication & Authorization

### 3.1 JWT Security
```typescript
interface JWTConfig {
  secret: string;
  algorithm: 'HS256' | 'RS256';
  issuer: string;
  audience: string;
  expiry: string;
  refresh_expiry: string;
}

class AuthSecurity {
  private readonly jwtConfig: JWTConfig;
  
  constructor() {
    this.jwtConfig = {
      secret: process.env.JWT_SECRET!,
      algorithm: 'HS256',
      issuer: 'terminalpp.dev',
      audience: 'terminalpp-users',
      expiry: '1h',
      refresh_expiry: '7d'
    };
  }
  
  async generateTokens(user: User): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      iss: this.jwtConfig.issuer,
      aud: this.jwtConfig.audience
    };
    
    const accessToken = jwt.sign(payload, this.jwtConfig.secret, {
      algorithm: this.jwtConfig.algorithm,
      expiresIn: this.jwtConfig.expiry
    });
    
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      this.jwtConfig.secret,
      { 
        algorithm: this.jwtConfig.algorithm,
        expiresIn: this.jwtConfig.refresh_expiry 
      }
    );
    
    // Store refresh token hash in database
    await this.storeRefreshToken(user.id, refreshToken);
    
    return { accessToken, refreshToken };
  }
  
  async validateToken(token: string): Promise<TokenValidation> {
    try {
      const decoded = jwt.verify(token, this.jwtConfig.secret) as any;
      
      // Additional validation
      if (decoded.iss !== this.jwtConfig.issuer) {
        throw new Error('Invalid issuer');
      }
      
      if (decoded.aud !== this.jwtConfig.audience) {
        throw new Error('Invalid audience');
      }
      
      return { valid: true, payload: decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}
```

### 3.2 Role-Based Access Control (RBAC)
```typescript
enum Permission {
  SANDBOX_CREATE = 'sandbox:create',
  SANDBOX_READ = 'sandbox:read',
  SANDBOX_UPDATE = 'sandbox:update',
  SANDBOX_DELETE = 'sandbox:delete',
  SANDBOX_EXECUTE = 'sandbox:execute',
  
  FILE_READ = 'file:read',
  FILE_WRITE = 'file:write',
  FILE_DELETE = 'file:delete',
  
  COLLAB_INVITE = 'collab:invite',
  COLLAB_MANAGE = 'collab:manage',
  
  ADMIN_USER_MANAGE = 'admin:user:manage',
  ADMIN_SYSTEM_CONFIG = 'admin:system:config'
}

interface Role {
  name: string;
  permissions: Permission[];
  resource_limits?: ResourceLimits;
}

const ROLES: Record<string, Role> = {
  free: {
    name: 'Free User',
    permissions: [
      Permission.SANDBOX_CREATE,
      Permission.SANDBOX_READ,
      Permission.SANDBOX_UPDATE,
      Permission.SANDBOX_DELETE,
      Permission.SANDBOX_EXECUTE,
      Permission.FILE_READ,
      Permission.FILE_WRITE,
      Permission.FILE_DELETE
    ],
    resource_limits: {
      max_sandboxes: 1,
      max_storage_gb: 1,
      max_cpu_hours: 10,
      max_collaborators: 0
    }
  },
  
  premium: {
    name: 'Premium User',
    permissions: [
      ...ROLES.free.permissions,
      Permission.COLLAB_INVITE,
      Permission.COLLAB_MANAGE
    ],
    resource_limits: {
      max_sandboxes: 10,
      max_storage_gb: 100,
      max_cpu_hours: 1000,
      max_collaborators: 10
    }
  },
  
  admin: {
    name: 'Administrator',
    permissions: Object.values(Permission),
    resource_limits: {
      max_sandboxes: -1, // unlimited
      max_storage_gb: -1,
      max_cpu_hours: -1,
      max_collaborators: -1
    }
  }
};

class AccessControl {
  async checkPermission(
    user: User,
    permission: Permission,
    resource?: any
  ): Promise<boolean> {
    
    const userRole = ROLES[user.role];
    if (!userRole) return false;
    
    // Check if user has the permission
    if (!userRole.permissions.includes(permission)) {
      return false;
    }
    
    // Check resource-specific permissions
    if (resource) {
      return await this.checkResourceAccess(user, permission, resource);
    }
    
    return true;
  }
  
  private async checkResourceAccess(
    user: User,
    permission: Permission,
    resource: any
  ): Promise<boolean> {
    
    // Sandbox access control
    if (resource.type === 'sandbox') {
      const sandbox = resource as Sandbox;
      
      // Owner has full access
      if (sandbox.user_id === user.id) return true;
      
      // Check collaborator permissions
      const collaboration = await this.getCollaboration(sandbox.id, user.id);
      if (collaboration) {
        return this.checkCollaboratorPermission(collaboration.role, permission);
      }
      
      return false;
    }
    
    return true;
  }
}
```

## 4. Data Protection

### 4.1 Encryption at Rest
```typescript
class EncryptionManager {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivation = 'pbkdf2';
  
  async encryptData(data: string, userKey: string): Promise<EncryptedData> {
    // Generate salt and IV
    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    // Derive key using PBKDF2
    const derivedKey = crypto.pbkdf2Sync(userKey, salt, 100000, 32, 'sha256');
    
    // Encrypt data
    const cipher = crypto.createCipher(this.algorithm, derivedKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm
    };
  }
  
  async decryptData(
    encryptedData: EncryptedData,
    userKey: string
  ): Promise<string> {
    
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    // Derive the same key
    const derivedKey = crypto.pbkdf2Sync(userKey, salt, 100000, 32, 'sha256');
    
    // Decrypt
    const decipher = crypto.createDecipher(this.algorithm, derivedKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 4.2 Secrets Management
```typescript
class SecretsVault {
  private vault: VaultClient;
  
  constructor() {
    this.vault = new VaultClient({
      endpoint: process.env.VAULT_ENDPOINT!,
      token: process.env.VAULT_TOKEN!
    });
  }
  
  async storeSecret(
    sandboxId: string,
    name: string,
    value: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    
    const path = `secret/sandbox/${sandboxId}/${name}`;
    
    await this.vault.write(path, {
      value: value,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    });
  }
  
  async retrieveSecret(
    sandboxId: string,
    name: string
  ): Promise<string | null> {
    
    const path = `secret/sandbox/${sandboxId}/${name}`;
    
    try {
      const result = await this.vault.read(path);
      return result.data.value;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  async rotateSecret(
    sandboxId: string,
    name: string,
    newValue: string
  ): Promise<void> {
    
    // Archive old version
    const oldValue = await this.retrieveSecret(sandboxId, name);
    if (oldValue) {
      await this.archiveSecret(sandboxId, name, oldValue);
    }
    
    // Store new version
    await this.storeSecret(sandboxId, name, newValue, {
      rotated_at: new Date().toISOString()
    });
  }
}
```

## 5. Audit & Monitoring

### 5.1 Security Logging
```typescript
interface SecurityEvent {
  id: string;
  timestamp: Date;
  event_type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  sandbox_id?: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  risk_score: number;
}

enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGIN_SUSPICIOUS = 'login_suspicious',
  
  COMMAND_BLOCKED = 'command_blocked',
  COMMAND_SUSPICIOUS = 'command_suspicious',
  
  FILE_ACCESS_DENIED = 'file_access_denied',
  FILE_SUSPICIOUS_OPERATION = 'file_suspicious_operation',
  
  NETWORK_BLOCKED = 'network_blocked',
  NETWORK_SUSPICIOUS = 'network_suspicious',
  
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  CONTAINER_BREAKOUT_ATTEMPT = 'container_breakout_attempt'
}

class SecurityLogger {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Store in security log database
    await this.db.securityLogs.create(event);
    
    // Send to SIEM if high severity
    if (['high', 'critical'].includes(event.severity)) {
      await this.sendToSIEM(event);
    }
    
    // Trigger alerts for critical events
    if (event.severity === 'critical') {
      await this.triggerAlert(event);
    }
    
    // Update risk scoring
    await this.updateUserRiskScore(event.user_id, event.risk_score);
  }
  
  private async detectAnomalies(userId: string): Promise<void> {
    const recentEvents = await this.getRecentEvents(userId, 24); // 24 hours
    
    // Detect unusual patterns
    const patterns = [
      this.detectUnusualLoginTimes(recentEvents),
      this.detectUnusualLocations(recentEvents),
      this.detectSuspiciousCommands(recentEvents),
      this.detectRapidFireRequests(recentEvents)
    ];
    
    const anomalies = await Promise.all(patterns);
    
    for (const anomaly of anomalies.filter(Boolean)) {
      await this.logSecurityEvent({
        id: uuid(),
        timestamp: new Date(),
        event_type: SecurityEventType.LOGIN_SUSPICIOUS,
        severity: 'medium',
        user_id: userId,
        ip_address: anomaly.ip_address,
        user_agent: anomaly.user_agent,
        details: anomaly.details,
        risk_score: anomaly.risk_score
      });
    }
  }
}
```

### 5.2 Intrusion Detection
```typescript
class IntrusionDetection {
  private patterns = {
    // SQL injection patterns
    sql_injection: [
      /union.*select/i,
      /drop.*table/i,
      /exec.*sp_/i,
      /'.*or.*'.*=/i
    ],
    
    // Command injection patterns
    command_injection: [
      /;\s*rm\s+-rf/,
      /\|\s*nc\s+/,
      /`.*`/,
      /\$\(.*\)/
    ],
    
    // Path traversal patterns
    path_traversal: [
      /\.\.[\/\\]/,
      /%2e%2e[\/\\]/,
      /\.\.%2f/,
      /\.\.%5c/
    ],
    
    // Container escape attempts
    container_escape: [
      /\/proc\/self\/root/,
      /\/host\//,
      /docker\.sock/,
      /runc/,
      /nsenter/
    ]
  };
  
  async analyzeCommand(
    command: string,
    context: ExecutionContext
  ): Promise<ThreatAnalysis> {
    
    const threats = [];
    let riskScore = 0;
    
    // Check against known patterns
    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(command)) {
          threats.push({
            category,
            pattern: pattern.toString(),
            severity: this.getPatternSeverity(category)
          });
          riskScore += this.getPatternRiskScore(category);
        }
      }
    }
    
    // Behavioral analysis
    const behaviorScore = await this.analyzeBehavior(command, context);
    riskScore += behaviorScore;
    
    // AI-based analysis
    const aiScore = await this.aiThreatAnalysis(command, context);
    riskScore += aiScore;
    
    return {
      command,
      threats,
      risk_score: Math.min(riskScore, 1.0),
      safe: riskScore < 0.3,
      recommendations: this.generateRecommendations(threats)
    };
  }
  
  private async aiThreatAnalysis(
    command: string,
    context: ExecutionContext
  ): Promise<number> {
    
    const prompt = `
    Analyze this command for security threats:
    Command: ${command}
    Context: ${JSON.stringify(context)}
    
    Return a risk score between 0.0 and 1.0, where:
    0.0 = completely safe
    0.3 = low risk
    0.6 = medium risk
    1.0 = high risk/dangerous
    
    Consider: command injection, privilege escalation, 
    data exfiltration, system damage potential.
    `;
    
    const response = await this.aiModel.analyze(prompt);
    return parseFloat(response.risk_score);
  }
}
```

## 6. Security Monitoring Dashboard

### 6.1 Real-time Monitoring
```typescript
class SecurityDashboard {
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const [
      activeThreats,
      riskUsers,
      suspiciousCommands,
      networkAnomalies,
      systemHealth
    ] = await Promise.all([
      this.getActiveThreats(),
      this.getHighRiskUsers(),
      this.getSuspiciousCommands(),
      this.getNetworkAnomalies(),
      this.getSystemHealth()
    ]);
    
    return {
      active_threats: activeThreats,
      high_risk_users: riskUsers,
      suspicious_commands: suspiciousCommands,
      network_anomalies: networkAnomalies,
      system_health: systemHealth,
      overall_risk_level: this.calculateOverallRisk(
        activeThreats,
        riskUsers,
        suspiciousCommands
      )
    };
  }
  
  async setupRealTimeAlerts(): Promise<void> {
    // WebSocket connection for real-time updates
    this.ws.on('security_event', async (event: SecurityEvent) => {
      // Broadcast to admin dashboard
      this.broadcastToAdmins('security_alert', event);
      
      // Auto-response for critical events
      if (event.severity === 'critical') {
        await this.executeAutoResponse(event);
      }
    });
  }
  
  private async executeAutoResponse(event: SecurityEvent): Promise<void> {
    switch (event.event_type) {
      case SecurityEventType.CONTAINER_BREAKOUT_ATTEMPT:
        await this.quarantineSandbox(event.sandbox_id!);
        break;
        
      case SecurityEventType.PRIVILEGE_ESCALATION:
        await this.killSuspiciousProcesses(event.sandbox_id!);
        break;
        
      case SecurityEventType.LOGIN_SUSPICIOUS:
        await this.requireMFA(event.user_id!);
        break;
    }
  }
}
```

## 7. Compliance & Regulations

### 7.1 GDPR Compliance
```typescript
class GDPRCompliance {
  async handleDataSubjectRequest(
    request: DataSubjectRequest
  ): Promise<void> {
    
    switch (request.type) {
      case 'access':
        await this.exportUserData(request.user_id);
        break;
        
      case 'rectification':
        await this.updateUserData(request.user_id, request.data);
        break;
        
      case 'erasure':
        await this.deleteUserData(request.user_id);
        break;
        
      case 'portability':
        await this.exportPortableData(request.user_id);
        break;
    }
  }
  
  private async deleteUserData(userId: string): Promise<void> {
    // Soft delete user account
    await this.db.users.update(userId, { 
      deleted_at: new Date(),
      email: `deleted_${userId}@example.com`,
      username: `deleted_${userId}`
    });
    
    // Anonymize audit logs
    await this.db.auditLogs.update(
      { user_id: userId },
      { user_id: 'anonymous' }
    );
    
    // Delete personal data from sandboxes
    await this.cleanupPersonalData(userId);
  }
}
```

### 7.2 SOC 2 Compliance
```typescript
class SOC2Compliance {
  async generateComplianceReport(): Promise<ComplianceReport> {
    return {
      controls: {
        CC1: await this.assessControlEnvironment(),
        CC2: await this.assessCommunication(),
        CC3: await this.assessRiskAssessment(),
        CC4: await this.assessMonitoring(),
        CC5: await this.assessControlActivities(),
        CC6: await this.assessLogicalAccess(),
        CC7: await this.assessSystemOperations(),
        CC8: await this.assessChangeManagement(),
        CC9: await this.assessRiskMitigation()
      },
      evidence: await this.collectEvidence(),
      recommendations: await this.generateRecommendations()
    };
  }
}
```

This comprehensive security guide covers all major aspects of securing the Terminal++ system. The implementation follows industry best practices and provides multiple layers of defense against various threat vectors.