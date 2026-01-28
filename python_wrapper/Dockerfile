FROM python:3.11-slim
WORKDIR /app/python_wrapper
COPY requirements.txt .
COPY . .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
CMD ["python", "-m", "python_wrapper"]


