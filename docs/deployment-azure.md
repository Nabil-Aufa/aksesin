\# Deployment AI Service Aksesin di Azure



Layanan AI Aksesin dideploy menggunakan Azure Container Apps pada region Korea Central.



\## Arsitektur

\- Frontend: Vercel

\- Database/Auth/Storage: Supabase

\- AI Service: Azure Container Apps

\- Container Registry: Docker Hub



\## Konfigurasi Azure Container Apps

\- Resource Group: Resource\_Group\_13-15

\- Container App: aksesin-ai

\- Workload Profile: Consumption

\- CPU: 0.5 vCPU

\- Memory: 1 GiB

\- Minimum Replicas: 0

\- Maximum Replicas: 1

\- Target Port: 8000



\## Image

`docker.io/naylathalita/aksesin-ai:latest`



\## Health Check

Endpoint:



`GET /kesehatan`



URL deployment:



`https://aksesin-ai.calmsand-b4064b40.koreacentral.azurecontainerapps.io/kesehatan`



Respons berhasil:



```json

{

&#x20; "status": "ok",

&#x20; "mode": "sementara",

&#x20; "versiModel": "sementara-v0"

}

