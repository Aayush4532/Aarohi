package controllers

import (
	config "aarohi/src/Config"
	models "aarohi/src/Models"
	utils "aarohi/src/Utils"
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SendChat(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(16 << 20)
	if err != nil {
		http.Error(w, "File size too large (Max 16MB)", http.StatusBadRequest)
		return
	}

	BookIDStr := r.PathValue("id")
	BookID, err := primitive.ObjectIDFromHex(BookIDStr)
	if err != nil {
		http.Error(w, "Invalid Forum/Book ID", http.StatusBadRequest)
		return
	}

	userIdValue, ok := r.Context().Value("id").(string)
	if !ok || userIdValue == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIdValue)

	ctx, cancel := context.WithTimeout(context.Background(), 11*time.Second)
	defer cancel()

	var currentUser models.User
	err = config.DB.Collection("users").FindOne(ctx, bson.M{"_id": userID}).Decode(&currentUser)
	if err != nil {
		http.Error(w, "User not found", http.StatusInternalServerError)
		return
	}

	var imageURL string
	file, header, err := r.FormFile("image")
	if err == nil {
		defer file.Close()
		uniqueImageID := primitive.NewObjectID().Hex()
		imageURL, err = utils.UploadPhoto(header, uniqueImageID, "chat")
		if err != nil {
			http.Error(w, "Image upload failed: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	message := r.FormValue("message")

	if message == "" && imageURL == "" {
		http.Error(w, "Message or Image is required", http.StatusBadRequest)
		return
	}

	newChat := models.Chat{
		ID:        primitive.NewObjectID(),
		BookID:    BookID,
		UserID:    userID,
		FullName:  currentUser.Name,
		Profile:   currentUser.Profile,
		Message:   message,
		Image:     imageURL,
		CreatedAt: time.Now(),
	}

	_, err = config.DB.Collection("chats").InsertOne(ctx, newChat)
	if err != nil {
		http.Error(w, "Failed to save message", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newChat)
}

func GetChats(w http.ResponseWriter, r *http.Request) {
    BookIDStr := r.PathValue("id")
    BookID, err := primitive.ObjectIDFromHex(BookIDStr)
    if err != nil {
        http.Error(w, "Invalid Book ID", http.StatusBadRequest)
        return
    }

    ctx, cancel := context.WithTimeout(r.Context(), 11*time.Second)
    defer cancel()

    findOptions := options.Find()
    findOptions.SetSort(bson.D{{Key: "created_at", Value: -1}})
    findOptions.SetLimit(50) 

    filter := bson.M{"book_id": BookID}
    cursor, err := config.DB.Collection("chats").Find(ctx, filter, findOptions)
    if err != nil {
        http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
        return
    }
    defer cursor.Close(ctx)

    chats := []models.Chat{} 
    if err = cursor.All(ctx, &chats); err != nil {
        http.Error(w, "Failed to parse messages", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(chats)
}

func DeleteChat(w http.ResponseWriter, r *http.Request) {
    ChatIDStr := r.PathValue("id")
    ChatID, err := primitive.ObjectIDFromHex(ChatIDStr)
    if err != nil {
        http.Error(w, "Invalid Chat ID", http.StatusBadRequest)
        return
    }

    userIdValue, ok := r.Context().Value("id").(string)
    if !ok || userIdValue == "" {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    userID, _ := primitive.ObjectIDFromHex(userIdValue)

    ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
    defer cancel()

    var chat models.Chat
    err = config.DB.Collection("chats").FindOne(ctx, bson.M{"_id": ChatID}).Decode(&chat)
    if err != nil {
        http.Error(w, "Message not found", http.StatusNotFound)
        return
    }

    if chat.UserID != userID {
        http.Error(w, "You can only delete your own messages", http.StatusForbidden)
        return
    }

    if chat.Image != "" {
        parts := strings.Split(chat.Image, "/")
        if len(parts) > 1 {
            filename := parts[len(parts)-1]
            utils.DeleteFromR2("chat", filename) 
        }
    }

    _, err = config.DB.Collection("chats").DeleteOne(ctx, bson.M{"_id": ChatID})
    if err != nil {
        http.Error(w, "Failed to delete from database", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}
