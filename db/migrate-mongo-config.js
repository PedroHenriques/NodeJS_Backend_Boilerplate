// In this file you can configure migrate-mongo

module.exports = {
  mongodb: {
    url: process.env.DB_MIGRATION_CONNECT_URL || '',
    databaseName: process.env.MONGO_DB_NAME,
    options: {
      useNewUrlParser: true,
    }
  },
  migrationsDir: "/src/db/migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog"
};
