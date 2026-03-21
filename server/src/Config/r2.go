package config

import (
	"context"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var R2Client *s3.Client

func InitR2() {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("auto"),
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				os.Getenv("R2_ACCESS_KEY"),
				os.Getenv("R2_SECRET_KEY"),
				"",
			),
		),
	)
	if err != nil {
		panic("Failed to load R2 config: " + err.Error())
	}

	R2Client = s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(os.Getenv("R2_ENDPOINT"))
		o.UsePathStyle = true
	})
}