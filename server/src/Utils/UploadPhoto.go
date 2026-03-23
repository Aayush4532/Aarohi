package utils

import (
	config "aarohi/src/Config"
	"bytes"
	"context"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "golang.org/x/image/webp"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/disintegration/imaging"
)

const (
	MaxProfileSize = 2 << 20
	MaxBookSize    = 5 << 20
	MaxChatSize    = 16 << 20
	ProfileWidth   = 500
	ProfileHeight  = 500
	BookMaxWidth   = 1000
)

func UploadPhoto(fileHeader *multipart.FileHeader, id string, photoType string) (string, error) {

	if fileHeader == nil {
		return "", errors.New("file missing")
	}

	switch photoType {
	case "profile":
		if fileHeader.Size > MaxProfileSize {
			return "", errors.New("profile image too large (max 2MB)")
		}
	case "book":
		if fileHeader.Size > MaxBookSize {
			return "", errors.New("book cover too large (max 5MB)")
		}
	case "chat":
		if fileHeader.Size > MaxChatSize {
			return "", errors.New("chat image too large (max 16MB)")
		}
	default:
		return "", errors.New("invalid photo type")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		return "", err
	}

	contentType := http.DetectContentType(buffer)

	if !strings.HasPrefix(contentType, "image/") {
		return "", errors.New("file must be a valid image")
	}

	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		return "", err
	}

	img, _, err := image.Decode(file)
	if err != nil {
		return "", errors.New("invalid image content")
	}

	var processed *bytes.Buffer
	var folder, filename, finalContentType string

	switch photoType {

	case "profile":

		processed, err = processProfile(img)
		if err != nil {
			return "", err
		}

		folder = "profiles"
		filename = id + ".jpg"
		finalContentType = "image/jpeg"

	case "book":
		if contentType != "image/png" {
			return "", errors.New("book cover must be PNG format")
		}

		processed, err = processBook(img)
		if err != nil {
			return "", err
		}

		folder = "books"
		filename = id + ".png"
		finalContentType = "image/png"

	case "chat":
		if contentType != "image/png" && contentType != "image/jpeg" && contentType != "image/gif" && contentType != "image/jpg" && contentType != "image/webp" {
			return "", errors.New("chat image must be PNG, JPEG, GIF, JPG, or WEBP format")
		}

		buf := new(bytes.Buffer)
		err = jpeg.Encode(buf, img, &jpeg.Options{
			Quality: 75,
		})
		if err != nil {
			return "", err
		}
		processed = buf

		folder = "chat"
		filename = id + ".jpg"
		finalContentType = "image/jpeg"
	}

	return uploadToR2(folder, filename, finalContentType, processed)
}

func processProfile(img image.Image) (*bytes.Buffer, error) {
	img = imaging.Fill(img, ProfileWidth, ProfileHeight, imaging.Center, imaging.Lanczos)

	buf := new(bytes.Buffer)

	err := jpeg.Encode(buf, img, &jpeg.Options{
		Quality: 75,
	})
	if err != nil {
		return nil, err
	}

	return buf, nil
}

func processBook(img image.Image) (*bytes.Buffer, error) {

	img = imaging.Resize(img, BookMaxWidth, 0, imaging.Lanczos)

	buf := new(bytes.Buffer)

	err := png.Encode(buf, img)
	if err != nil {
		return nil, err
	}

	return buf, nil
}

func uploadToR2(folder, filename, contentType string, body io.Reader) (string, error) {
	timestamp := time.Now().Unix();
	ext := filepath.Ext(filename);
	nameOnly := strings.TrimSuffix(filename, ext);
	newFilename := fmt.Sprintf("%s_%d%s", nameOnly, timestamp, ext);
	key := fmt.Sprintf("%s/%s", folder, newFilename)
	_, err := config.R2Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(os.Getenv("R2_BUCKET")),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/%s",
		os.Getenv("R2_PUBLIC_BASE"),
		key,
	)

	return url, nil
}

func DeleteFromR2(folder string, filename string) error {

	key := fmt.Sprintf("%s/%s", folder, filename)

	_, err := config.R2Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(os.Getenv("R2_BUCKET")),
		Key:    aws.String(key),
	})

	if err != nil {
		return err
	}

	return nil
}
