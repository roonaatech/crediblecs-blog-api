module.exports = {
  apps: [
    {
      name: 'crediblecs-api',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_testing: {
        NODE_ENV: 'testing',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001, // Or your preferred production port
      },
      // Logs configuration
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      combine_logs: true,
      // Restart policy
      max_memory_restart: '150M',
      wait_ready: true,
      autorestart: true,
      watch: false // Disable direct watch in production for better performance
    }
  ]
};
