const collectionName = 'users';

module.exports = {
  up(db) {
    return(
      db.createCollection(
        collectionName,
        {
          validationLevel: 'strict',
          validationAction: 'error',
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: [
                'email', 'name', 'password', 'updatedAt', 'createdAt'
              ],
              properties: {
                email: { bsonType: 'string' },
                name: { bsonType: 'string' },
                password: { bsonType: 'string' },
                updatedAt: { bsonType: 'string' },
                createdAt: { bsonType: 'string' },
              },
            },
          },
        }
      )
    );
  },

  down(db) {
    return(db.dropCollection(collectionName));
  }
};
