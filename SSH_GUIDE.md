# SSH vs GUI: Accessing Your Oracle Cloud VM

## Short Answer: **You Can Do EVERYTHING via SSH!** ✅

You **don't need a GUI** for any of this. Everything can be done through SSH terminal commands.

## How SSH Works for VM Management

**SSH (Secure Shell)** is a text-based terminal connection to your VM. It's the **standard** and **recommended** way to manage Linux servers.

```
Your Computer          Internet          Oracle VM
┌──────────┐          ┌─────┐          ┌─────────┐
│ Terminal │  SSH     │     │          │ Ubuntu  │
│   or     │ ───────► │  ☁  │ ───────► │ Linux   │
│   CMD    │          │     │          │ Server  │
└──────────┘          └─────┘          └─────────┘
```

**What you'll use:**
- **Windows**: Command Prompt, PowerShell, or Windows Terminal
- **Mac**: Terminal app (built-in)
- **Linux**: Terminal (built-in)

No GUI needed! Just type commands.

## Transferring Large Files via SSH

### Method 1: SCP (Secure Copy Protocol) - **Recommended**

SCP is built into SSH. It's designed specifically for file transfers and works perfectly for large files.

**Example: Upload a 100 MB database file**

```bash
# From your local machine terminal
scp -i your-key.pem large-database.sql ubuntu@YOUR_VM_IP:/opt/monitor-layout/

# This works for files of ANY size:
# - 10 MB ✅
# - 100 MB ✅
# - 1 GB ✅
# - 10 GB ✅
```

**How it works:**
1. Opens secure SSH connection
2. Transfers file encrypted
3. Shows progress bar
4. Completes when done

**Example output:**
```
large-database.sql    100%  150MB  25.3MB/s   00:06
```

### Method 2: Direct Database Export to VM

Instead of downloading then uploading, you can pipe directly:

```bash
# Export from Turso directly to VM (no local file needed)
turso db shell YOUR_DB_NAME .dump | ssh -i key.pem ubuntu@VM_IP 'cat > /opt/monitor-layout/turso-export.sql'
```

This sends the data **directly** from Turso to your VM without saving locally!

### Method 3: rsync (For Very Large Files)

rsync is better for huge files because it can resume if interrupted:

```bash
# Install rsync (usually pre-installed)
rsync -avz -e "ssh -i your-key.pem" large-file.sql ubuntu@VM_IP:/opt/monitor-layout/

# Benefits:
# ✅ Can resume if interrupted
# ✅ Shows detailed progress
# ✅ Faster for large files
# ✅ Can sync directories
```

## File Size Limits: Is There a Limit?

**NO practical limit via SSH!**

| Method | File Size Limit | Notes |
|--------|----------------|-------|
| **SCP** | No limit | Can transfer gigabytes |
| **rsync** | No limit | Better for huge files |
| **Direct pipe** | No limit | No local storage needed |

**Your database is probably small:**
- Small app: 1-10 MB
- Medium app: 10-100 MB
- Large app: 100 MB - 1 GB

Even a 1 GB database transfer via SCP takes only a few minutes on a good connection.

## Complete Migration: ALL via SSH

Let me show you the **complete migration process** using ONLY SSH:

### Step 1: Connect to VM

```bash
# Open terminal/command prompt
# Type this command:
ssh -i path/to/your-key.pem ubuntu@YOUR_VM_IP

# You're now inside the VM! Your prompt changes to:
ubuntu@instance-name:~$
```

### Step 2: Run Setup Script

```bash
# Inside the VM terminal:
curl -O https://raw.githubusercontent.com/YOUR_REPO/main/scripts/vm-setup.sh
bash vm-setup.sh

# The script installs everything automatically
# You just watch it run
```

### Step 3: Upload Your Code (Option A: via Git)

```bash
# Still inside VM via SSH:
cd /opt/monitor-layout
git clone https://github.com/YOUR_REPO.git .

# All your code is now on the VM!
```

### Step 4: Upload Your Code (Option B: via SCP from local)

```bash
# Open a NEW terminal on your local machine (don't close SSH connection)
# From your project folder:
scp -i key.pem -r /path/to/your/project/* ubuntu@VM_IP:/opt/monitor-layout/

# This uploads ALL your project files
```

### Step 5: Upload Database (from local machine)

```bash
# On your local machine terminal:
# First export from Turso
turso db shell YOUR_DB_NAME .dump > database-export.sql

# Then upload to VM
scp -i key.pem database-export.sql ubuntu@VM_IP:/opt/monitor-layout/

# Done! Database file is now on VM
```

### Step 6: Import Database (back in VM SSH terminal)

```bash
# Switch back to your VM SSH connection
cd /opt/monitor-layout
sqlite3 data/monitor-layout.db < database-export.sql

# Database imported! ✅
```

### Step 7: Build and Start App

```bash
# Still in VM SSH terminal:
npm install
npm run build
pm2 start ecosystem.config.js

# App is now running! ✅
```

### Step 8: Check Everything Works

```bash
# Still in VM SSH:
pm2 status
pm2 logs monitor-layout

# Or check from your browser:
# http://YOUR_VM_IP
```

## Do You Need a GUI? No!

**GUI options exist but are NOT necessary:**

### Option 1: Pure SSH (Recommended) ⭐
- ✅ Fast
- ✅ Secure
- ✅ Professional
- ✅ Works everywhere
- ✅ Lightweight

### Option 2: VS Code Remote SSH (Optional)
If you want a GUI-like experience:

```bash
# Install "Remote - SSH" extension in VS Code
# Connect to VM via SSH
# Now you have a GUI file browser + terminal
```

### Option 3: FileZilla/WinSCP (Optional)
GUI file transfer tools:
- FileZilla: Free, cross-platform
- WinSCP: Windows only

But honestly, **SCP is faster and simpler.**

### Option 4: Web-based Terminal (Optional)
Oracle Cloud Console has a built-in web terminal:
- No SSH key needed
- Works in browser
- Useful for quick checks

But SSH is still better for real work.

## SSH Command Cheat Sheet

### Connecting to VM
```bash
# Basic connection
ssh -i your-key.pem ubuntu@VM_IP

# If key permissions are wrong:
chmod 600 your-key.pem
ssh -i your-key.pem ubuntu@VM_IP
```

### Uploading Files
```bash
# Upload single file
scp -i key.pem local-file.txt ubuntu@VM_IP:/remote/path/

# Upload entire directory
scp -i key.pem -r local-folder/ ubuntu@VM_IP:/remote/path/

# Upload with progress (use -v for verbose)
scp -v -i key.pem large-file.sql ubuntu@VM_IP:/opt/monitor-layout/
```

### Downloading Files
```bash
# Download from VM to local
scp -i key.pem ubuntu@VM_IP:/remote/file.txt /local/path/

# Download entire directory
scp -i key.pem -r ubuntu@VM_IP:/remote/folder/ /local/path/
```

### Managing Multiple Terminal Windows
```bash
# Terminal 1: Keep SSH connection open to VM
ssh -i key.pem ubuntu@VM_IP

# Terminal 2: Use for SCP transfers from local machine
scp -i key.pem file.txt ubuntu@VM_IP:/path/

# Terminal 3: Maybe another SSH connection for monitoring
ssh -i key.pem ubuntu@VM_IP
pm2 logs monitor-layout
```

## File Transfer Speed Examples

**Typical transfer speeds:**

| File Size | Connection Speed | Transfer Time |
|-----------|-----------------|---------------|
| 10 MB | Fast | 2-5 seconds |
| 100 MB | Fast | 10-30 seconds |
| 1 GB | Fast | 1-3 minutes |
| 10 GB | Fast | 10-30 minutes |

**Your database is probably:**
- 1-50 MB: Transfer in seconds ✅
- Even 1 GB: Transfer in 1-3 minutes ✅

## SSH is Actually EASIER Than GUI

**Why SSH is better:**

1. **Faster**: Type commands vs clicking through menus
2. **Repeatable**: Save commands in a script, run again
3. **Professional**: Industry standard for server management
4. **Lightweight**: No overhead, works on any connection
5. **Automatable**: Can script everything
6. **Universal**: Works the same on Windows/Mac/Linux

## Common Questions

### Q: "I'm not comfortable with terminal commands"

**A:** The migration guide provides **exact commands** to copy/paste:
```bash
# You literally just copy this:
scp -i key.pem database.sql ubuntu@VM_IP:/opt/monitor-layout/

# Paste it in your terminal
# Press Enter
# Done!
```

No need to understand every detail. Just follow step-by-step.

### Q: "What if I make a mistake?"

**A:** SSH is safe:
- ✅ You can't accidentally delete critical system files (need sudo)
- ✅ Can always exit and reconnect
- ✅ Worst case: Delete VM and start over (it's free!)
- ✅ Migration guide has rollback instructions

### Q: "Can I see what's on the VM without SSH?"

**A:** Yes, through SSH commands:
```bash
# List files
ls -lah

# View file contents
cat filename.txt

# Navigate directories
cd /opt/monitor-layout
ls

# Check disk space
df -h

# View logs
tail -f /opt/monitor-layout/logs/out.log
```

It's all visible via terminal!

### Q: "Do I need to keep terminal open?"

**A:** No!
```bash
# Once app is running with PM2:
pm2 start monitor-layout

# You can close SSH terminal
# App keeps running in background! ✅

# Reconnect anytime to check:
ssh -i key.pem ubuntu@VM_IP
pm2 status
```

## Visual Guide: SSH File Transfer

```
┌─────────────────────────────────────────────────┐
│ Your Local Computer                             │
│                                                 │
│  ┌──────────────┐                              │
│  │ Terminal     │                              │
│  │              │                              │
│  │ $ scp -i key.pem database.sql ubuntu@VM... │
│  │ database.sql    100%  50MB  10.5MB/s       │
│  │ ✅ Upload complete!                         │
│  └──────────────┘                              │
└─────────────────────────────────────────────────┘
                      │
                      │ SSH/SCP
                      │ (Encrypted, Secure)
                      ▼
┌─────────────────────────────────────────────────┐
│ Oracle Cloud VM                                 │
│                                                 │
│  /opt/monitor-layout/                          │
│  ├── database.sql          ← File arrives here │
│  ├── data/                                     │
│  ├── logs/                                     │
│  └── scripts/                                  │
└─────────────────────────────────────────────────┘
```

## Example: Complete Migration Session

Here's what a **real migration looks like** (all in terminal):

```bash
# === ON YOUR LOCAL MACHINE ===

# 1. Export database from Turso
$ turso db shell my-database .dump > export.sql
✅ Exported 50 MB

# 2. Upload to VM
$ scp -i oracle-key.pem export.sql ubuntu@132.145.x.x:/opt/monitor-layout/
export.sql    100%  50MB  12.5MB/s   00:04
✅ Upload complete!

# 3. Connect to VM
$ ssh -i oracle-key.pem ubuntu@132.145.x.x

# === NOW INSIDE VM VIA SSH ===

ubuntu@instance:~$ cd /opt/monitor-layout

ubuntu@instance:/opt/monitor-layout$ ls
export.sql  data/  logs/  package.json  ...
✅ File is here!

ubuntu@instance:/opt/monitor-layout$ pm2 stop monitor-layout
✅ App stopped

ubuntu@instance:/opt/monitor-layout$ sqlite3 data/monitor-layout.db < export.sql
✅ Database imported

ubuntu@instance:/opt/monitor-layout$ sqlite3 data/monitor-layout.db "SELECT COUNT(*) FROM user;"
42
✅ 42 users imported!

ubuntu@instance:/opt/monitor-layout$ pm2 start monitor-layout
✅ App started

ubuntu@instance:/opt/monitor-layout$ pm2 logs
✅ App running perfectly!

# Done! All via SSH terminal! 🎉
```

**Time taken: ~5-10 minutes**

## Summary: SSH is ALL You Need

✅ **Connect to VM**: via SSH
✅ **Upload files**: via SCP (built into SSH)
✅ **Manage app**: via SSH commands
✅ **Transfer database**: via SCP (no size limits)
✅ **Monitor app**: via SSH
✅ **Run commands**: via SSH

**NO GUI NEEDED!**

The migration guide already includes all the exact commands you need. Just copy, paste, and press Enter. 🚀

---

**Does this clear up your concerns? SSH can handle everything, including large file transfers!**
