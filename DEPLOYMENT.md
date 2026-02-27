# GrabPic — Deployment Guide

## Prerequisites

- AWS CLI configured (`aws configure`)
- AWS SAM CLI installed (`pip install aws-sam-cli`)
- Docker installed and running (needed for `process_photo` + `search_faces` Lambda container builds)
- Node.js 18+ and npm
- An AWS account with permissions for: Lambda, API Gateway, DynamoDB, S3, IAM, ECR

---

## Step 1: Deploy Backend (SAM)

### 1.1 Build

```bash
cd backend
sam build
```

> SAM will automatically detect the Dockerfiles for `process_photo` and `search_faces` and build container images.

### 1.2 Deploy

```bash
sam deploy --guided
```

Follow the prompts:
- **Stack Name**: `grabpic`
- **Region**: `us-east-1` (or your preferred region)
- **Confirm changes**: `Y`
- **Allow SAM to create IAM roles**: `Y`
- **Save config to samconfig.toml**: `Y`

> **First deploy takes 5-10 minutes** (Docker image build + push to ECR).

### 1.3 Note the Outputs

After deployment, SAM will print:

```
CloudFormation outputs:
  ApiUrl = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod
  PhotosBucketName = grabpic-photos-123456789
  AlbumsTableName = GrabPic-Albums
  PhotosTableName = GrabPic-Photos
```

**Save the `ApiUrl`** — you'll need it for the frontend.

---

## Step 2: Deploy Frontend

### 2.1 Configure API URL

```bash
cd frontend
```

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod
```

### 2.2 Build for Production

```bash
npm run build
```

### 2.3 Deploy Options

**Option A — Vercel (Recommended, Free)**

```bash
npx -y vercel@latest --prod
```

Set the environment variable `NEXT_PUBLIC_API_URL` in Vercel project settings.

**Option B — AWS Amplify**

Push to a Git repository, connect to Amplify, set `NEXT_PUBLIC_API_URL` as env var.

**Option C — S3 + CloudFront (Static Export)**

```bash
# Add to next.config.mjs: output: 'export'
npm run build
aws s3 sync out/ s3://your-frontend-bucket --delete
```

---

## Step 3: Verify Deployment

1. Open the frontend URL
2. Create a new album
3. Upload 2-3 group photos
4. Wait ~30 seconds for face processing
5. Open the album share link in an incognito tab
6. Upload a selfie and verify matching works

---

## S3 Event Trigger Note

The SAM template configures S3 event notifications to trigger `process_photo` on:
- `s3:ObjectCreated:*` with suffix filters for `.jpg`, `.jpeg`, `.png`

> **Known limitation**: SAM S3 suffix filter only applies the LAST suffix rule. If you encounter issues, configure the S3 trigger manually in the AWS Console to trigger on all `ObjectCreated` events under the album prefix.

To manually configure (if needed):

1. Go to S3 → Your bucket → Properties → Event notifications
2. Create notification:
   - Event type: `s3:ObjectCreated:*`
   - Destination: Lambda function → `grabpic-process-photo`

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `S3_BUCKET` | Auto (from SAM) | S3 bucket name |
| `ALBUMS_TABLE` | `GrabPic-Albums` | DynamoDB albums table |
| `PHOTOS_TABLE` | `GrabPic-Photos` | DynamoDB photos table |
| `FACE_MATCH_THRESHOLD` | `0.6` | Euclidean distance threshold |
| `MAX_FILE_SIZE_MB` | `10` | Max upload size |
| `PRESIGNED_URL_EXPIRY` | `300` | Presigned URL TTL (seconds) |
| `ALLOWED_ORIGIN` | `*` | CORS origin |
| `LOG_LEVEL` | `INFO` | Logging level |

---

## Cleanup

To delete all AWS resources:

```bash
sam delete --stack-name grabpic
```

Then manually empty and delete the S3 bucket if needed.

---

## Cost Analysis

| Service | Free Tier | Estimated Monthly Cost |
|---------|-----------|----------------------|
| **Lambda** | 1M requests/month, 400K GB-seconds | $0.00 (portfolio usage) |
| **API Gateway** | 1M calls/month (12 months) | $0.00 |
| **DynamoDB** | 25 GB storage, 25 WCU/RCU | $0.00 (On-Demand PAY_PER_REQUEST) |
| **S3** | 5 GB storage, 20K GET, 2K PUT | ~$0.01-$0.10 |
| **ECR** | 500 MB storage (free tier) | $0.00 |
| **Total** | — | **~$0.01-$0.50/month** |

> For a portfolio demo with <100 photos and occasional usage, monthly cost rounds to **effectively zero**.

---

## Limitations & Future Improvements

### Current Limitations
- No user authentication (anyone with the link can access the album)
- Face processing cold start: ~10-15 seconds for container Lambda
- No real-time processing status (requires page refresh)
- Single-region deployment

### Future Improvements
- **WebSocket** for real-time processing status
- **Cognito** for user authentication
- **CloudFront** CDN for photo delivery
- **Step Functions** for batch photo processing pipeline
- **SNS** notifications when processing completes
- **Thumbnail generation** for faster photo grid loading
- **Face clustering** to group similar faces across albums
- **Download all matches** as ZIP
