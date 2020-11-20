'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserPost.belongsTo(models.User)
      UserPost.hasMany(models.UserPostLike)
      UserPost.hasMany(models.UserPostComment)
    }
  };
  UserPost.init({
    UserId: DataTypes.INTEGER,
    content: DataTypes.STRING,
    title : DataTypes.STRING,
    isModerationEnabled : DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserPost',
  });
  return UserPost;
};