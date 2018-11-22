const collectionName = 'users';
const indexName = 'usersEmailUnique';

module.exports = {
  up(db) {
    return(
      db.createIndex(
        collectionName,
        { email: 1 },
        { unique: true, name: indexName }
      )
    );
  },

  down(db) {
    return(db.collection(collectionName).dropIndex(indexName));
  }
};
