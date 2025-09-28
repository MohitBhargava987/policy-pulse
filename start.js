const { fork } = require('child_process');
const pidusage = require('pidusage');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

let child = null;

function spawnServer() {
    child = fork(serverPath, { env: process.env, stdio: 'inherit' });
    console.log('Spawned server with PID', child.pid);

    // Monitor Child's CPU every 5 seconds
    const interval = setInterval(async () => {
        try {
            const stats = await pidusage(child.pid);
            const cpu_usage = stats.cpu; // percent
            console.log('Child CPU', cpu_usage);
            if (cpu_usage > 70) {
                console.log(`CPU usage ${cpu_usage}% > 70% - restarting child`);
                child.kill('SIGTERM');
            }
        } catch (err) {
            console.error('CPU usage error', err.message);
        }
    }, 5000);

    child.on('exit', (code, signal) => {
        console.log('Child exited, code', code, 'signal', signal);
        clearInterval(interval);
        // Here Respawn after short Delay
        setTimeout(spawnServer, 1500);
    });
}

spawnServer();
