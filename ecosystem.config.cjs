module.exports = {
  apps: [
    {
      name: "portfolio",
      script: "node_modules/.bin/next",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        BACKUP_STATUS_FILE: "/opt/portfolio/backups/last_backup.json",
      },
    },
  ],
};
