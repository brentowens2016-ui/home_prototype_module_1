# Dockerfile for Python orchestration
FROM python:3.11-slim
WORKDIR /app
COPY . ./
WORKDIR /app/python_wrapper
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
CMD ["python", "-m", "python_wrapper"]
