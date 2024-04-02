const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Post = sequelize.define(
    'Post',
    {
      post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      postname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Post Name is Required',
          },
          len: {
            args: [3,],
            msg: 'Post name must have at least 3 characters',
          },
        },
      },
      postdescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'Post description is Required',
            }
        }
      },
    },
    {
      modelName: 'Post',
      freezeTableName: true,
      timestamps: false,
      hooks: {

      },
    }
  );
  
  // Associations
  Post.associate = (models) => {

  };

  // Methods

  return Post;
};