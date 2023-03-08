"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Appointment.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }
    static async getAllApointments(userId) {
      return this.findAll({ where: { userId } });
    }
    static deleteAppointment(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
    static getCurrentDateAppointments(currentUser, START, currentDate) {
      return this.findAll({
        where: {
          [Op.and]: [
            {
              userId: currentUser,
            },
            {
              createdAt: {
                [Op.between]: [START.toISOString(), currentDate.toISOString()],
              },
            },
          ],
        },
      });
    }

    updateAppointment(title, description) {
      return this.update({ title, description }, { new: true });
    }

    static async getAppointmentByUser(id, userId) {
      return this.findOne({ id, userId });
    }
  }
  Appointment.init(
    {
      title: {
        type: DataTypes.STRING,
        required: true,
        validate: {
          notEmpty: true,
          len: 2,
        },
      },
      description: DataTypes.STRING,
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      from: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      to: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Appointment",
    }
  );
  return Appointment;
};
