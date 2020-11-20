'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPostComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserPostComment.belongsTo(models.User)
      UserPostComment.belongsTo(models.UserPost)

      UserPostComment.hasMany(models.UserPostComment, {
        foreignKey : 'ParentCommentId',
        onDelete: 'CASCADE',
        as : 'children'
      })
    }
  };
  UserPostComment.init({
    UserId: DataTypes.INTEGER,
    UserPostId: DataTypes.INTEGER,
    ParentCommentId: DataTypes.INTEGER,
    content : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserPostComment',
  });
  return UserPostComment;
};