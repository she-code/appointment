"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Appointment, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 2,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 2,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
          isEmail: true,
          isUnique: (value, next) => {
            User.findAll({
              where: { email: value },
              attributes: ["id"],
            })
              .then((user) => {
                if (user.length != 0)
                  next(new Error("Email address already in use!"));
                next();
              })
              .catch((onError) => console.log(onError));
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
          len: 8,
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
