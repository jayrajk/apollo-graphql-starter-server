import bcrypt from 'bcryptjs'

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
    },
    profileImage: {
      type: DataTypes.STRING,
    },
    contact: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },

  }, { underscored: true })

  User.findByLogin = async (email) => {
    let user = await User.findOne({
      where: { email: email }
    })

    if (!user) {
      user = await User.findOne({
        where: { email: email },
      });
    }
    return user
  }
  User.beforeCreate(async (user) => {
    user.password = await user.generatePasswordHash();
  })
  User.prototype.generatePasswordHash = async function () {
    const saltRounds = 10
    return await bcrypt.hash(this.password, saltRounds)
  }

  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  // User.associate = (models) => {
  //   User.hasMany(models.assetRequest, {
  //     // foreignKey: 'userId',
  //   })
  // }
  return User
}

export default user;