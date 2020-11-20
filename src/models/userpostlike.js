'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPostLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserPostLike.belongsTo(models.User)
      UserPostLike.belongsTo(models.UserPost)
    }
  };
  UserPostLike.init({
    UserId: DataTypes.INTEGER,
    UserPostId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserPostLike',
  });
  return UserPostLike;
};