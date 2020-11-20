'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserPostLikes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {
          model : 'Users',
          key : 'id'
        },
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE'
      },
      UserPostId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {
          model : 'UserPosts',
          key : 'id'
        },
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('UserPostLikes', {
      type : 'unique',
      name : 'unique_like_constraint',
      fields : ['UserId', 'UserPostId']
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserPostLikes');
  }
};