package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Passage struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BookID      primitive.ObjectID `bson:"book_id" json:"book_id"`
	Content     string             `bson:"content" json:"content"`

	PageNumber  int                `bson:"page_number,omitempty" json:"page_number,omitempty"`
	Chapter     string             `bson:"chapter,omitempty" json:"chapter,omitempty"`

	Language    string             `bson:"language,omitempty" json:"language,omitempty"`

	// daily passage scheduling
	PublishDate time.Time          `bson:"publish_date,omitempty" json:"publish_date,omitempty"`

	// engagement
	Likes       int                `bson:"likes" json:"likes"`
	Saves       int                `bson:"saves" json:"saves"`
	Shares      int                `bson:"shares" json:"shares"`

	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}