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
      return this.findAll({
        where: { userId },
        //  order: [["createdAt", "DESC"]],
        order: [["from", "ASC"]],
      });
    }
    static async createAppointment({
      userId,
      date,
      title,
      description,
      from,
      to,
    }) {
      return this.create({
        userId,
        title,
        description,
        date,
        from,
        to,
      });
    }
    static deleteAppointment(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
    static async getCurrentDateAppointments(currentUser, START, currentDate) {
      return this.findAll({
        where: {
          [Op.and]: [
            {
              userId: currentUser,
            },
            {
              date: {
                [Op.eq]: currentDate,
              },
            },
          ],
        },
        raw: true,
      });
    }

    static async getPastAppointments(userId, currentDate) {
      return this.findAll({
        where: {
          userId,
          date: {
            [Op.lt]: currentDate,
          },
        },
      });
    }

    static async getUpcoimngAppoitments(userId, currentDate) {
      return this.findAll({
        where: {
          userId,
          date: {
            [Op.gt]: currentDate,
          },
        },
      });
    }
    updateAppointment(title, description) {
      return this.update({ title, description }, { new: true });
    }

    static async getAppointmentByUser(id, userId) {
      return this.findOne({ where: { id, userId } });
    }

    static async getAppointmentDetails(userId, id) {
      return this.findOne({ where: { userId, id } });
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
