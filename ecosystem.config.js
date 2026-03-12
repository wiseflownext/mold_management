module.exports = {
  apps: [{
    name: 'mold-api',
    script: 'dist/src/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    max_memory_restart: '400M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/mold-api/error.log',
    out_file: '/var/log/mold-api/out.log',
  }],
};
