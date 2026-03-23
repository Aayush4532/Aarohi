package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Chat struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BookID   primitive.ObjectID `bson:"book_id" json:"book_id" index:"true"`
	UserID   primitive.ObjectID `bson:"user_id" json:"user_id"`
	FullName string             `bson:"full_name" json:"full_name"`
	Profile  string             `bson:"profile_url" json:"profile_url"`

	Message string `bson:"message" json:"message"`
	Image   string `bson:"image_url,omitempty" json:"image_url,omitempty"`

	CreatedAt time.Time `bson:"created_at" json:"created_at" index:"-1"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}
