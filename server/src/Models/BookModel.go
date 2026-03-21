package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Review struct {
	ID       primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID   primitive.ObjectID `json:"user_id" bson:"user_id"`
	FullName string             `json:"full_name" bson:"full_name"`
	Profile  string             `json:"profile" bson:"profile"`

	Rating    int       `json:"rating" bson:"rating"`
	Review    string    `json:"review" bson:"review"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time `json:"updated_at" bson:"updated_at"`
}

type Book struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title"`
	Author      string             `json:"author" bson:"author"`
	ISBN        string             `json:"isbn" bson:"isbn"`
	Description string             `json:"description" bson:"description"`
	PageCount   int                `json:"page_count" bson:"page_count"`
	Categories  []string           `json:"categories" bson:"categories"`
	Thumbnail   string             `json:"thumbnail" bson:"thumbnail"`
	TotalRating float64            `json:"total_rating" bson:"total_rating"`
	TotalReview int                `json:"total_review" bson:"total_review"`
	Reviews     []Review           `json:"reviews" bson:"reviews"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}
