package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database;

func ConnectDB () error {
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URI"));
	ctx, cancel := context.WithTimeout(context.Background(), 10 * time.Second);
	defer cancel();

	client, err := mongo.Connect(ctx, clientOptions);
	if err != nil {
		return err;
	}

	DB = client.Database("Aarohi");
	log.Print("Mongo db connected successfully");
	
	return nil;
}