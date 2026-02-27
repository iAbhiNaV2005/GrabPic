# GrabPic 

**Find yourself in group photos using AI-powered facial recognition.**

GrabPic is a serverless photo sharing app where users create albums of group trip photos, share a link, and visitors upload a selfie to instantly find all photos they appear in.

##  Features

- **Album Creation** — Create albums with unique shareable links
- **Drag & Drop Upload** — Upload group photos with progress tracking
- **AI Face Detection** — Automatic 128-dimension face embedding extraction
- **Selfie Search** — Upload a selfie or use camera to find your photos
- **Confidence Scoring** — Ranked results with match confidence percentages
- **Photo Lightbox** — Full-size view with click-to-zoom
- **Responsive Design** — Dark glassmorphic UI with animations
- **Near-Zero Cost** — Fully serverless, pay-per-use architecture

## 🏗️ Architecture

```
Frontend (Next.js) → API Gateway → Lambda (Python) → DynamoDB/S3
                                         ↓
                              S3 Trigger → face_recognition → DynamoDB
```

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16, Tailwind CSS, Framer Motion |
| Backend | AWS Lambda (Python 3.10) |
| Database | DynamoDB (serverless) |
| Storage | AWS S3 |
| AI Engine | face_recognition (dlib), numpy |
| API | AWS API Gateway (REST) |
| Infra | AWS SAM (CloudFormation) |

##  Project Structure

```
GrabPic/
├── backend/
│   ├── lambdas/
│   │   ├── create_album/handler.py
│   │   ├── get_album/handler.py
│   │   ├── presigned_url/handler.py
│   │   ├── process_photo/handler.py    # Face detection (container)
│   │   └── search_faces/handler.py     # Selfie matching (container)
│   ├── shared/
│   │   ├── config.py
│   │   ├── db.py
│   │   └── response.py
│   ├── template.yaml                   # SAM/CloudFormation
│   ├── Dockerfile.process
│   ├── Dockerfile.search
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.js                 # Landing page
│       │   ├── create/page.js          # Create album
│       │   └── album/[albumId]/
│       │       ├── page.js             # Selfie search
│       │       └── upload/page.js      # Photo upload
│       ├── components/
│       │   ├── Navbar.js, Footer.js
│       │   ├── PhotoUploader.js        # Drag & drop
│       │   ├── SelfieCapture.js        # Camera + upload
│       │   ├── PhotoGrid.js            # Results + lightbox
│       │   └── ...
│       └── lib/api.js                  # API client
├── DEPLOYMENT.md
└── README.md
```

## 🚀 Quick Start

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The frontend runs with mock API responses by default. Set `NEXT_PUBLIC_API_URL` in `.env.local` to connect to a real backend.

### Backend Deployment

```bash
cd backend
sam build
sam deploy --guided
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

