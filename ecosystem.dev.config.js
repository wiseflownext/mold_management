module.exports = {
  apps: [{
    name: 'mold-api-dev',
    script: 'dist/src/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3002,
    },
    max_memory_restart: '400M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/mold-api-dev/error.log',
    out_file: '/var/log/mold-api-dev/out.log',
  }],
};
