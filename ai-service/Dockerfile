FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/opt/huggingface

WORKDIR /app

COPY requirements.txt requirements-model.txt ./
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt -r requirements-model.txt

RUN python -c "\
from transformers import AutoModel, OwlViTForObjectDetection, OwlViTProcessor; \
AutoModel.from_pretrained('facebook/dinov2-base'); \
OwlViTProcessor.from_pretrained('google/owlvit-base-patch32'); \
OwlViTForObjectDetection.from_pretrained('google/owlvit-base-patch32')"

ENV HF_HUB_OFFLINE=1

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
