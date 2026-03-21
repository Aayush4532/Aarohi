package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RatedBook struct {
	BookID primitive.ObjectID `bson:"book_id"`
	Rating int                `bson:"rating" validate:"min=1,max=5"`
}

type CurrentlyReading struct {
	BookID      primitive.ObjectID `bson:"book_id"`
	CurrentPage int                `bson:"current_page"`
	Complete    int                `bson:"complete"`
	Notes       []string           `bson:"notes"`
}

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty"`
	Name     string             `bson:"name"`
	Email    string             `bson:"email"`
	Password string             `bson:"password"`
	Age      int                `bson:"age"`
	Profile  string             `bson:"profile"`
	Role     string             `bson:"role"`

	ReadDates      []time.Time `bson:"read_dates"`
	Streak         int         `bson:"streak"`
	LongestStreak  int         `bson:"longest_streak"`
	LastActiveDate time.Time   `bson:"last_active_date"`
	TotalPagesRead int         `bson:"total_pages_read"`
	TotalBooksRead int         `bson:"total_books_read"`

	RatedBooks       []RatedBook          `bson:"rated_books"`
	CurrentlyReading []CurrentlyReading   `bson:"currently_reading"`
	ReadBooks        []primitive.ObjectID `bson:"read_books"`

	CreatedAt time.Time `bson:"created_at"`
	UpdatedAt time.Time `bson:"updated_at"`
}
