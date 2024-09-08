'use strict';

const { query } = require('express');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if the 'userId' column already exists in the 'Todos' table
      const [results] = await queryInterface.sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name='Todos' AND column_name='userId';"
      );
  
      if (results.length === 0) {
        // 'userId' column does not exist, so add it
        await queryInterface.addColumn('Todos', 'userId', {
          type: Sequelize.DataTypes.INTEGER,
        });
  
        // Add the constraint if needed
        await queryInterface.addConstraint('Todos', {
          fields: ['userId'],
          type: 'foreign key',
          references: {
            table: 'Users',
            field: 'id',
          },
        });
      }
    } catch (error) {
      console.error('Error during migration:', error);
      throw error; // Rethrow the error to stop the migration
    }
  },
  
  

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Todos','userId')
    
  }
};
