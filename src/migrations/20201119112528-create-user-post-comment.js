'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserPostComments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        references : {
          model : 'Users',
          key : 'id'
        },
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE',
        allowNull: false,
      },
      UserPostId: {
        type: Sequelize.INTEGER,
        references : {
          model : 'UserPosts',
          key : 'id'
        },
        allowNull: false,
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE'
      },
      ParentCommentId: {
        type: Sequelize.INTEGER,
        references : {
          model : 'UserPostComments',
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserPostComments');
  }
};